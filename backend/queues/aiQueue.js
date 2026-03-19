const { Queue } = require('bullmq')
const Redis = require('ioredis')
const { processAssignment } = require('../workers/aiWorker')

const useRedis = process.env.USE_REDIS === 'true'

let connection = null
let aiGenerationQueue = null

if (useRedis) {
  connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })

  aiGenerationQueue = new Queue('ai-generation', { 
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  })
}

/**
 * Adds an AI job to the queue if Redis is enabled.
 * Otherwise, runs the logic immediately in the background using `setImmediate`.
 */
async function addAIJob(assignmentId, io) {
  if (useRedis && aiGenerationQueue) {
    await aiGenerationQueue.add(
      'generate',
      { assignmentId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    )
  } else {
    // Execute locally in background so we don't block the API response.
    // We use setImmediate so it starts after the current event loop turn.
    setImmediate(() => {
      processAssignment(assignmentId, io).catch((err) => {
        console.error('Local background job failed:', err.message)
      })
    })
  }
}

module.exports = { aiGenerationQueue, addAIJob }
