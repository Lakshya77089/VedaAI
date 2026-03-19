const { Worker } = require('bullmq')
const Redis = require('ioredis')
const Assignment = require('../models/assignmentModel')
const Notification = require('../models/notificationModel')
const { handleGenerateAssessment } = require('../services/aiService')

let connection = null
if (process.env.USE_REDIS === 'true') {
  connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })
}

/**
 * Common logic to perform the actual AI generation and update the assignment.
 * Extracted so it can be called either by the Worker (Redis mode) or directly (Non-Redis mode).
 */
async function processAssignment(assignmentId, io) {
  try {
    if (io) {
      io.to(`assignment:${assignmentId}`).emit('generation:processing', { assignmentId })
      io.to('dashboard').emit('generation:processing', { assignmentId })
    }
    
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' })

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`)

    const generatedContent = await handleGenerateAssessment(assignment)

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'complete',
      generatedContent,
      errorMessage: undefined,
    })

    const notification = await Notification.create({
      title: 'Assignment Ready',
      message: `Your assignment "${assignment.name}" has been generated successfully.`,
      type: 'success',
      assignmentId,
    })

    if (io) {
      io.emit('notification:new', notification)

      io.to(`assignment:${assignmentId}`).emit('generation:complete', {
        assignmentId,
        generatedContent,
      })
      io.to('dashboard').emit('generation:complete', {
        assignmentId,
        generatedContent,
      })
    }
  } catch (err) {
    console.error(`AI Job error for ${assignmentId}:`, err.message)
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'error',
      errorMessage: err.message,
    })
    
    if (io) {
      io.to(`assignment:${assignmentId}`).emit('generation:error', {
        assignmentId,
        error: err.message,
      })
      io.to('dashboard').emit('generation:error', {
        assignmentId,
        error: err.message,
      })
    }
    throw err
  }
}

function initWorker(io) {
  if (process.env.USE_REDIS !== 'true') {
    console.log('Redis is disabled (USE_REDIS=false) — skipping worker initialization.')
    return null
  }

  const worker = new Worker(
    'ai-generation',
    async (job) => {
      const { assignmentId } = job.data
      await processAssignment(assignmentId, io)
    },
    { connection }
  )

  worker.on('error', (err) => {
    console.error('Worker error:', err.message)
  })

  console.log('AI generation worker started (Redis mode enabled)')
  return worker
}

module.exports = { initWorker, processAssignment }
