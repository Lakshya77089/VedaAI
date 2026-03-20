const { z } = require('zod')
const Assignment = require('../models/assignmentModel')
const redisClient = require('../config/redis')
const { addAIJob } = require('../queues/aiQueue')

const createAssignmentSchema = z.object({
  name: z.string().min(1, 'name is required').max(200),
  subject: z.string().min(1, 'subject is required').max(100),
  className: z.string().min(1, 'className is required').max(50),
  dueDate: z.string().min(1, 'dueDate is required').refine((d) => !isNaN(Date.parse(d)), { message: 'dueDate must be a valid date' }),
  schoolName: z.string().max(200).optional(),
  additionalInstructions: z.string().max(1000).optional(),
  additionalInfo: z.string().max(2000).optional(),
})

const CACHE_TTL = 3600

// Fallback cache when Redis is unavailable/slow.
// Keeps repeated GET /assignments calls fast.
const memoryCache = new Map()

function escapeRegex(str) {
  // Escape user input so it can't change the regex meaning.
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get all assignments with pagination and search
 * @param {Object} queryParams - page, limit, search
 */
async function handleGetAllAssignments(queryParams) {
  const page = Math.max(1, parseInt(queryParams.page) || 1)
  const limit = Math.min(50, parseInt(queryParams.limit) || 10)
  const search = (queryParams.search || '').trim()
  const status = (queryParams.status || 'all').toString()
  const skip = (page - 1) * limit

  const cacheKey = `assignments:page:${page}:limit:${limit}:search:${search}:status:${status}`
  const now = Date.now()

  // 1) Memory cache (fast path)
  const cachedMem = memoryCache.get(cacheKey)
  if (cachedMem && cachedMem.expiresAt > now) {
    return { ...cachedMem.value, fromMemoryCache: true }
  }

  // 2) Redis cache (only if the client is ready)
  const redisReady = redisClient?.status === 'ready'
  if (redisReady) {
    const cached = await redisClient.get(cacheKey).catch(() => null)
    if (cached) {
      const parsed = JSON.parse(cached)
      memoryCache.set(cacheKey, { expiresAt: now + CACHE_TTL * 1000, value: parsed })
      return { ...parsed, fromCache: true }
    }
  }

  // Use a prefix regex so MongoDB can use an index on `name` (instead of scanning the whole collection).
  // Note: this changes semantics from "contains" to "startsWith".
  const query = {}
  if (search) {
    query.name = { $regex: `^${escapeRegex(search)}`, $options: 'i' }
  }
  if (status && status !== 'all') {
    query.status = status
  }
  const [assignments, total] = await Promise.all([
    Assignment.find(query)
      .select('name subject className dueDate status createdAt')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Assignment.countDocuments(query),
  ])

  const result = {
    data: {
      assignments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  }

  // 3) Populate memory cache so next request is fast even if Redis is down.
  memoryCache.set(cacheKey, { expiresAt: now + CACHE_TTL * 1000, value: result })

  // 4) Populate Redis cache when available.
  if (redisReady) {
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: CACHE_TTL }).catch(() => {})
  }
  return result
}

/**
 * Create a new assignment and queue AI job
 * @param {Object} data - Assignment data
 * @param {Object} io - Socket.io instance
 */
async function handleCreateAssignment(data, io) {
  const validation = createAssignmentSchema.safeParse(data)
  if (!validation.success) {
    const err = new Error(validation.error.errors[0].message)
    err.statusCode = 400
    throw err
  }

  const { name, schoolName, subject, className, dueDate, additionalInstructions, additionalInfo } = validation.data
  const { questionConfig } = data

  let parsedConfig
  try {
    parsedConfig = typeof questionConfig === 'string' ? JSON.parse(questionConfig) : questionConfig
  } catch {
    const err = new Error('Invalid questionConfig JSON')
    err.statusCode = 400
    throw err
  }

  if (!Array.isArray(parsedConfig) || parsedConfig.length === 0) {
    const err = new Error('questionConfig must be a non-empty array')
    err.statusCode = 400
    throw err
  }

  const assignment = await Assignment.create({
    name,
    schoolName: schoolName || '',
    subject,
    className,
    dueDate: new Date(dueDate),
    additionalInstructions: additionalInstructions || '',
    additionalInfo: additionalInfo || '',
    questionConfig: parsedConfig,
    status: 'pending',
  })

  await addAIJob(assignment._id.toString(), io)

  if (io) {
    io.emit('generation:queued', { assignmentId: assignment._id.toString() })
  }

  // Don't block the response on cache invalidation.
  void handleClearAssignmentsCache()

  return assignment
}

/**
 * Get assignment by ID
 * @param {String} id 
 */
async function handleGetAssignmentById(id) {
  const assignment = await Assignment.findById(id)
  if (!assignment) {
    const err = new Error('Assignment not found')
    err.statusCode = 404
    throw err
  }
  return assignment
}

/**
 * Delete assignment
 * @param {String} id 
 */
async function handleDeleteAssignment(id) {
  const assignment = await Assignment.findById(id)
  if (!assignment) {
    const err = new Error('Assignment not found')
    err.statusCode = 404
    throw err
  }

  await Assignment.findByIdAndDelete(id)
  // Don't block the response on cache invalidation.
  void handleClearAssignmentsCache()

  return { message: 'Assignment deleted' }
}

/**
 * Regenerate assignment
 * @param {String} id 
 * @param {Object} io - Socket.io instance
 */
async function handleRegenerateAssignment(id, io) {
  const assignment = await Assignment.findById(id)
  if (!assignment) {
    const err = new Error('Assignment not found')
    err.statusCode = 404
    throw err
  }

  await Assignment.findByIdAndUpdate(id, {
    $set: { status: 'pending', errorMessage: '' },
    $unset: { generatedContent: 1 },
  })

  await addAIJob(id, io)

  if (io) {
    io.to(`assignment:${id}`).emit('generation:queued', {
      assignmentId: id,
    })
  }

  // Status changes, so clear caches in the background.
  void handleClearAssignmentsCache()

  return { message: 'Regeneration queued' }
}

/**
 * Clear assignment lists from cache
 */
async function handleClearAssignmentsCache() {
  try {
    // Clear in-memory cache quickly.
    for (const key of memoryCache.keys()) {
      if (key.startsWith('assignments:')) memoryCache.delete(key)
    }

    if (!redisClient) return

    // Avoid `KEYS` (O(N) and blocks Redis). Use cursor-based `SCAN` instead.
    let cursor = '0'
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', 'assignments:*', 'COUNT', 1000)
      if (Array.isArray(keys) && keys.length > 0) {
        await redisClient.del(keys)
      }
      cursor = nextCursor
    } while (cursor !== '0')
  } catch {
    // Cache invalidation should never fail the main request.
  }
}

/**
 * Duplicate an existing assignment
 * @param {String} id - Source assignment ID
 * @param {Object} io - Socket.io instance
 */
async function handleDuplicateAssignment(id, io) {
  const source = await Assignment.findById(id)
  if (!source) {
    const err = new Error('Assignment not found')
    err.statusCode = 404
    throw err
  }

  // Clone with new name and fresh due date (7 days from now)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)

  const clone = await Assignment.create({
    name: `${source.name} (Copy)`,
    schoolName: source.schoolName || '',
    subject: source.subject,
    className: source.className,
    dueDate,
    additionalInstructions: source.additionalInstructions || '',
    additionalInfo: source.additionalInfo || '',
    questionConfig: source.questionConfig,
    status: 'pending',
  })

  await addAIJob(clone._id.toString(), io)

  if (io) {
    io.emit('generation:queued', { assignmentId: clone._id.toString() })
  }

  void handleClearAssignmentsCache()

  return clone
}

module.exports = {
  handleGetAllAssignments,
  handleCreateAssignment,
  handleGetAssignmentById,
  handleDeleteAssignment,
  handleRegenerateAssignment,
  handleDuplicateAssignment,
  handleClearAssignmentsCache,
}
