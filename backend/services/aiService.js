const { openrouter, AI_MODEL } = require('../config/openrouter')
const { buildAssessmentPrompt } = require('../prompts/assessmentPrompt')

async function handleGenerateAssessment(assignment) {
  const userPrompt = buildAssessmentPrompt(assignment)

  const response = await openrouter.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert examination paper generator. You always respond with valid JSON only. Never include markdown formatting, code fences, or any text outside the JSON object.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  })

  const rawContent = response.choices[0]?.message?.content?.trim()
  if (!rawContent) {
    throw new Error('Empty response from AI model')
  }

  // some models wrap output in ``` despite instructions
  let jsonStr = rawContent
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(`AI response was not valid JSON: ${jsonStr.slice(0, 200)}`)
  }

  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('AI response missing sections array')
  }

  const sections = parsed.sections.map((section, si) => ({
    id: section.id || `section-${String.fromCharCode(97 + si)}`,
    title: section.title || `Section ${String.fromCharCode(65 + si)}`,
    instruction: section.instruction || 'Attempt all questions.',
    questions: (section.questions || []).map((q, qi) => ({
      id: q.id || `q${qi + 1}`,
      text: q.text || '',
      type: q.type || 'short_answer',
      difficulty: ['Easy', 'Moderate', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Moderate',
      marks: Number(q.marks) || 1,
      answerKey: q.answerKey || '',
      options: q.type === 'mcq' ? (q.options || []) : undefined,
    })),
  }))

  return {
    sections,
    totalMarks: Number(parsed.totalMarks) || 0,
    totalQuestions: Number(parsed.totalQuestions) || 0,
    timeAllowed: Number(parsed.timeAllowed) || 60,
  }
}

module.exports = { handleGenerateAssessment }
