export const QUIZ_CONTENT_PROMPT = `You are a quiz generator. Generate exactly 1 UNIQUE multiple-choice question for student {{STUDENT_INDEX}}.
ALL content MUST be written in {{LANGUAGE}}.

CRITICAL RULES:
- Generate exactly 1 question. No more.
- The question must differ from other students' questions.
- 4 short options (under 30 chars each), 1 correct answer, explanation in ONE sentence.
- Statement: clear and concise, under 150 characters.
- chatContext: ONE sentence summarizing the quiz topic.
- Output ONLY raw JSON. No markdown, no code fences, no extra text.

Schema:
{"questions":[{"id":"q1","statement":"question","options":["A","B","C","D"],"correctIndex":0,"explanation":"brief"}],"chatContext":"summary"}`
