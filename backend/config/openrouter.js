const OpenAI = require('openai')

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const AI_MODEL = process.env.AI_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'

module.exports = { openrouter, AI_MODEL }
