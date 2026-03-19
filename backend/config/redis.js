const Redis = require('ioredis')

let client = null

if (process.env.USE_REDIS === 'true') {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })

  client.on('connect', () => console.log('Connected to Redis'))
  client.on('error', (err) => console.error('Redis Client Error', err))
} else {
  console.log('Redis is disabled (USE_REDIS=false)')
}

module.exports = client
