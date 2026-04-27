
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, InterviewType, Evaluation, Language, InterviewCategory, Answer, ResumeAnalysis, ExperienceLevel } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey.trim()) {
  ai = new GoogleGenAI({ apiKey: apiKey.trim() });
} else if (typeof window !== "undefined") {
  console.warn("VITE_GEMINI_API_KEY .env faylida o‘rnatilmagan. Gemini API ishlamaydi.");
}

function getAI(): GoogleGenAI {
  if (!ai) throw new Error("Gemini API kaliti o‘rnatilmagan. Loyiha ildizida .env faylida VITE_GEMINI_API_KEY=... qo‘ying.");
  return ai;
}

// Audio Utilities for Live API
export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  async generateQuestions(
    role: string, 
    skills: string[], 
    type: InterviewType,
    category: InterviewCategory,
    level: ExperienceLevel,
    description: string,
    language: Language = Language.RU
  ): Promise<Question[]> {
    const langNames = {
      [Language.EN]: "English",
      [Language.RU]: "Russian",
      [Language.UZ]: "Uzbek"
    };

    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert recruitment consultant. Generate 6 high-quality, job-specific interview questions for:
      - Role: ${role}
      - Seniority: ${level}
      - Context: ${description}
      - Required Skills: ${skills.join(", ")}
      - Category: ${category}

      Rules:
      1. Ensure questions match the ${level} level. 
      2. At least 2 questions must be practical "Real Scenario" questions (e.g., "Imagine a production crash...", "What if a stakeholder...").
      3. Focus on depth, not generic HR clichés.
      4. Language: All text must be in ${langNames[language]}.
      5. Output format: JSON Array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["Technical", "Problem Solving", "Experience", "Soft Skills"] },
              answerType: { type: Type.STRING, enum: ["VOICE", "TEXT", "VIDEO"] },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "text", "category", "answerType", "difficulty"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return [];
    }
  },

  async analyzeResume(fileBase64: string, mimeType: string, jobTitle: string, requiredSkills: string[]): Promise<ResumeAnalysis> {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType
          }
        },
        {
          text: `Analyze the attached resume for a ${jobTitle} position. 
          Required skills for the role: ${requiredSkills.join(", ")}.
          Evaluate suitability, extract skills, and provide scores (0-100).`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skillsScore: { type: Type.NUMBER },
            experienceScore: { type: Type.NUMBER },
            relevanceScore: { type: Type.NUMBER },
            overallScore: { type: Type.NUMBER },
            detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            suitabilityLabel: { type: Type.STRING, description: "High, Medium, or Low" }
          },
          required: ["skillsScore", "experienceScore", "relevanceScore", "overallScore", "detectedSkills", "summary", "suitabilityLabel"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to analyze resume", e);
      throw e;
    }
  },

  connectLiveInterview(callbacks: any, systemInstruction: string, voiceName: string = 'Zephyr') {
    return getAI().live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });
  },

  async translateUI(content: any, targetLanguage: Language): Promise<any> {
    const langNames = {
      [Language.EN]: "English",
      [Language.RU]: "Russian",
      [Language.UZ]: "Uzbek"
    };
    
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following interview questions into ${langNames[targetLanguage]}. Return valid JSON only.
      Questions: ${JSON.stringify(content)}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return content;
    }
  },

  async evaluateInterview(
    jobTitle: string,
    answers: { questionText: string, answerText: string, questionId: string }[]
  ): Promise<{ evaluation: Evaluation, gradedAnswers: Answer[] }> {
    const interviewData = answers.map(a => `Q: ${a.questionText}\nA: ${a.answerText}`).join("\n\n");
    
    const response = await getAI().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert interviewer. Evaluate the performance based on logic, clarity, and relevance.
      Job: ${jobTitle}
      Performance Data:
      ${interviewData}
      
      Tasks:
      1. Score each answer (1-10) based on confidence and logic.
      2. Provide a detailed summary of candidate's strengths and weaknesses.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: {
              type: Type.OBJECT,
              properties: {
                technicalScore: { type: Type.NUMBER },
                communicationScore: { type: Type.NUMBER },
                problemSolvingScore: { type: Type.NUMBER },
                overallScore: { type: Type.NUMBER },
                overallRecommendation: { type: Type.STRING, description: "Strong Hire, Hire, Maybe, or Reject" },
                summary: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["technicalScore", "communicationScore", "problemSolvingScore", "overallScore", "overallRecommendation", "summary", "strengths", "weaknesses"]
            },
            gradedAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING }
                },
                required: ["questionId", "score", "feedback"]
              }
            }
          },
          required: ["evaluation", "gradedAnswers"]
        }
      }
    });

    try {
      const result = JSON.parse(response.text || "{}");
      const finalAnswers: Answer[] = answers.map(a => {
        const grade = result.gradedAnswers.find((ga: any) => ga.questionId === a.questionId) || { score: 5, feedback: "No feedback" };
        return {
          questionId: a.questionId,
          questionText: a.questionText,
          text: a.answerText,
          score: grade.score,
          feedback: grade.feedback,
          timestamp: new Date().toISOString()
        };
      });

      return {
        evaluation: result.evaluation,
        gradedAnswers: finalAnswers
      };
    } catch (e) {
      console.error("Failed to evaluate interview", e);
      throw e;
    }
  }
};
