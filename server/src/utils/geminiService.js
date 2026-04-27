const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
// v1beta da gemini-1.5-flash 404; ishlatish: gemini-2.5-flash, gemini-2.0-flash, gemini-2.0-flash-lite
const DEFAULT_MODEL = 'gemini-2.5-flash';

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY .env faylida o\'rnatilmagan');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function getModelName() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function is429(e) {
  return e?.status === 429 || (e?.message && String(e.message).includes('429'));
}

function getRetryDelayMs(e) {
  const msg = e?.message || '';
  const match = msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000);
  return 18000; // 18 s default
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Intervyu javoblarini AI orqali baholash
 * @param {string} jobTitle - Ish nomi
 * @param {Array} answers - Javoblar ro'yxati [{questionId, questionText, answerText}]
 * @param {string} language - Til (en, ru, uz)
 * @returns {Promise<{evaluation: Object, gradedAnswers: Array}>}
 */
async function evaluateInterview(jobTitle, answers, language = 'ru') {
  const ai = getAI();
  const modelName = getModelName();
  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  const langNames = { en: 'English', ru: 'Russian', uz: 'Uzbek' };
  const interviewData = answers
    .map((a, i) => `[ID: ${a.questionId}] Question: ${a.questionText}\nAnswer: ${a.answerText || '(javob berilmagan)'}`)
    .join('\n\n');

  const prompt = `You are an expert HR interviewer and evaluator. Analyze the following interview for a "${jobTitle}" position.

INTERVIEW DATA:
${interviewData}

TASKS:
1. Score each answer from 1 to 10 based on:
   - Relevance to the question
   - Technical accuracy (if applicable)
   - Communication clarity
   - Problem-solving demonstration

2. Provide overall evaluation scores (1-10):
   - technicalScore: Technical knowledge demonstrated
   - communicationScore: How clearly they expressed themselves
   - problemSolvingScore: Analytical thinking shown
   - overallScore: Weighted average of all factors

3. Give a hiring recommendation: "Strong Hire", "Hire", "Maybe", or "Reject"

4. Write a brief summary (2-3 sentences) in ${langNames[language] || 'Russian'}

5. List 2-3 strengths and 2-3 weaknesses in ${langNames[language] || 'Russian'}

IMPORTANT: In gradedAnswers, use the EXACT questionId from each "[ID: xxx]" in the interview data (e.g. q0, q1, q2).

RESPOND IN THIS EXACT JSON FORMAT:
{
  "evaluation": {
    "technicalScore": <number 1-10>,
    "communicationScore": <number 1-10>,
    "problemSolvingScore": <number 1-10>,
    "overallScore": <number 1-10>,
    "overallRecommendation": "<Strong Hire|Hire|Maybe|Reject>",
    "summary": "<brief summary>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"]
  },
  "gradedAnswers": [
    {
      "questionId": "<id>",
      "score": <number 1-10>,
      "feedback": "<brief feedback in ${langNames[language] || 'Russian'}>"
    }
  ]
}`;

  const runOnce = async () => {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    const gradedAnswers = answers.map(a => {
      const grade = parsed.gradedAnswers?.find(g => g.questionId === a.questionId) || {
        score: 5,
        feedback: 'Baholanmadi'
      };
      return {
        questionId: a.questionId,
        questionText: a.questionText,
        text: a.answerText || '',
        score: grade.score,
        feedback: grade.feedback,
        timestamp: new Date().toISOString()
      };
    });
    return {
      evaluation: parsed.evaluation || {
        technicalScore: 5,
        communicationScore: 5,
        problemSolvingScore: 5,
        overallScore: 5,
        overallRecommendation: 'Maybe',
        summary: 'Baholash amalga oshmadi',
        strengths: [],
        weaknesses: []
      },
      gradedAnswers
    };
  };

  const fallbackResult = () => ({
    evaluation: {
      technicalScore: 0,
      communicationScore: 0,
      problemSolvingScore: 0,
      overallScore: 0,
      overallRecommendation: 'Maybe',
      summary: 'API kvota tugadi (429). Keyinroq qayta urinib ko‘ring yoki .env da GEMINI_MODEL=gemini-1.5-flash qo‘ying.',
      strengths: [],
      weaknesses: []
    },
    gradedAnswers: answers.map(a => ({
      questionId: a.questionId,
      questionText: a.questionText,
      text: a.answerText || '',
      score: 0,
      feedback: 'Baholanmadi',
      timestamp: new Date().toISOString()
    }))
  });

  try {
    return await runOnce();
  } catch (error) {
    if (is429(error)) {
      const delayMs = getRetryDelayMs(error);
      console.warn(`Gemini 429 (quota). ${delayMs / 1000}s kutib qayta urinilmoqda...`);
      await sleep(delayMs);
      try {
        return await runOnce();
      } catch (retryErr) {
        console.error('Gemini evaluation (retry failed):', retryErr.message || retryErr);
        return fallbackResult();
      }
    }
    console.error('Gemini evaluation error:', error.message || error);
    return fallbackResult();
  }
}

/**
 * Rezyumeni AI orqali tahlil qilish
 * @param {string} resumeText - Rezyume matni
 * @param {string} jobTitle - Ish nomi
 * @param {Array} requiredSkills - Talab qilinadigan ko'nikmalar
 * @returns {Promise<Object>} ResumeAnalysis
 */
async function analyzeResume(resumeText, jobTitle, requiredSkills = []) {
  const ai = getAI();
  const modelName = getModelName();
  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  const prompt = `Analyze this resume for a "${jobTitle}" position.
Required skills: ${requiredSkills.join(', ') || 'Not specified'}

RESUME:
${resumeText}

Respond in JSON:
{
  "skillsScore": <0-100>,
  "experienceScore": <0-100>,
  "relevanceScore": <0-100>,
  "overallScore": <0-100>,
  "detectedSkills": ["skill1", "skill2"],
  "summary": "<brief assessment>",
  "suitabilityLabel": "<High|Medium|Low>"
}`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Resume analysis error:', error);
    return {
      skillsScore: 0,
      experienceScore: 0,
      relevanceScore: 0,
      overallScore: 0,
      detectedSkills: [],
      summary: `Tahlil xatosi: ${error.message}`,
      suitabilityLabel: 'Low'
    };
  }
}

module.exports = {
  evaluateInterview,
  analyzeResume
};
