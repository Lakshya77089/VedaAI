function buildAssessmentPrompt(assignment) {
  const { questionConfig, additionalInstructions, additionalInfo, subject, className } = assignment

  const activeTypes = questionConfig.filter((cfg) => cfg.count > 0)

  const questionBreakdown = activeTypes
    .map((cfg) => `  - ${cfg.label || cfg.type}: ${cfg.count} question(s), ${cfg.marksEach} mark(s) each`)
    .join('\n')

  const totalMarks = questionConfig.reduce((sum, cfg) => sum + cfg.count * cfg.marksEach, 0)
  const totalQuestions = questionConfig.reduce((sum, cfg) => sum + cfg.count, 0)
  const timeAllowed = Math.max(30, totalMarks)

  const typeList = activeTypes.map((cfg) => `"${cfg.type}"`).join(', ')

  return `You are an expert school teacher creating an examination paper.

SUBJECT: ${subject}
CLASS / GRADE: ${className}

${additionalInfo ? `ADDITIONAL CONTEXT (use this background information about the paper/topic to generate relevant, well-targeted questions):\n${additionalInfo}\n` : ''}${additionalInstructions ? `TEACHER NOTES (use these to guide question style/topic focus, but do NOT include them on the paper):\n${additionalInstructions}\n` : ''}Create a complete question paper with the following question distribution:
${questionBreakdown}

TOTAL QUESTIONS: ${totalQuestions}
TOTAL MARKS: ${totalMarks}
TIME ALLOWED: ${timeAllowed} minutes

STRICT OUTPUT RULES — READ CAREFULLY:
1. Respond ONLY with a valid JSON object. No markdown, no explanation text, no code fences, no backticks.
2. Your entire response must start with { and end with }
3. The JSON must exactly match this structure:
{
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "Easy",
          "marks": 1,
          "answerKey": "The correct answer with brief explanation",
          "options": ["Option A", "Option B", "Option C", "Option D"]
        }
      ]
    }
  ],
  "totalMarks": ${totalMarks},
  "totalQuestions": ${totalQuestions},
  "timeAllowed": ${timeAllowed}
}

RULES FOR EACH FIELD:
- "difficulty" must be EXACTLY one of: "Easy", "Moderate", "Hard"
- "type" must be EXACTLY one of the types provided by the teacher: ${typeList}
- For "mcq" type: always include "options" with exactly 4 answer choices (just the answer text, no "A)" labels)
- For all other types: omit "options" entirely
- Group questions by type into separate sections (one section per type, only include sections that have questions)
- Each section's "instruction" should mention marks per question
- Make questions appropriate for the class level and subject
- answerKey must be a complete, accurate answer suitable for a marking scheme

Now generate the examination paper JSON for ${subject} (${className}):`.trim()
}

module.exports = { buildAssessmentPrompt }
