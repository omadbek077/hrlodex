import { request } from "./authService";
import type { Job, Question, CandidateApplication, InterviewSession, Answer, Evaluation } from "../types";

const PUBLIC_PREFIX = "/public";

export interface ApiJob {
  id: string;
  title: string;
  department: string;
  role: string;
  description: string;
  experienceLevel: string;
  requiredSkills: string[];
  interviewType: string;
  interviewCategory: string;
  interviewMode: string;
  visibility: string;
  sourceLanguage: string;
  resumeRequired: boolean;
  questions: Array<{ id: string; text: string; category: string; answerType: string; difficulty: string }>;
  status: string;
  shareToken?: string;
  inviteCode?: string;
  createdAt: string;
  deadline?: string;
}

function mapApiJobToJob(api: Partial<ApiJob> & Pick<ApiJob, "id" | "title" | "department" | "role" | "description">): Job {
  return {
    id: api.id,
    title: api.title,
    department: api.department,
    role: api.role,
    description: api.description,
    experienceLevel: (api.experienceLevel ?? "Mid") as Job["experienceLevel"],
    requiredSkills: api.requiredSkills ?? [],
    interviewType: (api.interviewType ?? "TEXT") as Job["interviewType"],
    interviewCategory: (api.interviewCategory ?? "TECHNICAL") as Job["interviewCategory"],
    interviewMode: (api.interviewMode ?? "INSTANT") as Job["interviewMode"],
    visibility: (api.visibility ?? "PUBLIC") as Job["visibility"],
    sourceLanguage: (api.sourceLanguage ?? "uz") as Job["sourceLanguage"],
    resumeRequired: api.resumeRequired ?? true,
    questions: (api.questions ?? []).map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category as Question["category"],
      answerType: q.answerType as Question["answerType"],
      difficulty: q.difficulty as Question["difficulty"],
    })),
    status: (api.status ?? "Active") as Job["status"],
    shareToken: api.shareToken,
    inviteCode: api.inviteCode,
    createdAt: api.createdAt ?? new Date().toISOString(),
    deadline: api.deadline,
  };
}

export async function getPublicJobs(): Promise<Job[]> {
  const res = await request<ApiJob[]>(`${PUBLIC_PREFIX}/jobs`);
  return (res.data ?? []).map(mapApiJobToJob);
}

export async function getJobByToken(token: string): Promise<Job | null> {
  const res = await request<ApiJob>(`${PUBLIC_PREFIX}/jobs/token/${encodeURIComponent(token)}`);
  return res.data ? mapApiJobToJob(res.data) : null;
}

/** GET /api/public/jobs/:jobId – ariza sahifasi uchun ish ma’lumoti */
export async function getJobById(jobId: string, code?: string): Promise<Job | null> {
  const query = code ? `?code=${encodeURIComponent(code)}` : "";
  const res = await request<ApiJob>(`${PUBLIC_PREFIX}/jobs/${jobId}${query}`);
  return res.data ? mapApiJobToJob(res.data) : null;
}

export async function validateInvite(code: string): Promise<Job | null> {
  const res = await request<ApiJob>(`${PUBLIC_PREFIX}/validate-invite`, {
    method: "POST",
    body: { code },
  });
  return res.data ? mapApiJobToJob(res.data) : null;
}

export interface ApplyPayload {
  name: string;
  email: string;
  phone?: string;
  experienceYears?: number;
  resumeFileName?: string;
  resumeMimeType?: string;
  resumeBase64?: string;
  analysis?: CandidateApplication["analysis"];
}

export async function applyToJob(
  jobId: string,
  payload: ApplyPayload,
  code?: string
): Promise<CandidateApplication> {
  const query = code ? `?code=${encodeURIComponent(code)}` : "";
  const res = await request<CandidateApplication>(`${PUBLIC_PREFIX}/jobs/${jobId}/apply${query}`, {
    method: "POST",
    body: payload as object,
  });
  if (!res.data) throw new Error("No application returned");
  return res.data as CandidateApplication;
}

export interface StartSessionPayload {
  jobId?: string;
  code?: string;
  applicationId?: string;
  language?: string;
  /** Tizimga kirgan nomzodning ism-familiyasi (invite sessiyada ko‘rsatish uchun) */
  candidateName?: string;
}

export interface ApiSession {
  id: string;
  jobId: string;
  applicationId?: string;
  candidateId: string;
  candidateName?: string;
  status: string;
  answers: Answer[];
  startedAt: string;
  language?: string;
}

function mapApiSessionToSession(api: ApiSession): InterviewSession {
  return {
    id: api.id,
    jobId: api.jobId,
    applicationId: api.applicationId,
    candidateId: api.candidateId,
    candidateName: api.candidateName,
    status: api.status as InterviewSession["status"],
    answers: api.answers ?? [],
    startedAt: api.startedAt,
    language: api.language as InterviewSession["language"],
  };
}

export async function startSession(payload: StartSessionPayload): Promise<InterviewSession> {
  // Language ni payload dan yoki localStorage dan olish
  const language = payload.language || (() => {
    const saved = localStorage.getItem('language');
    return saved === 'ru' || saved === 'en' || saved === 'uz' ? saved : 'uz';
  })();
  
  const res = await request<ApiSession>(`${PUBLIC_PREFIX}/sessions/start`, {
    method: "POST",
    body: { ...payload, language } as object,
    language: language as any,
  });
  
  // Interviews yetarli bo'lmaganda xatolik
  if (!res.success && (res as any).requiresPayment) {
    const error = new Error((res as any).message || "Interviews yetarli emas");
    (error as any).requiresPayment = true;
    (error as any).interviews = (res as any).interviews;
    (error as any).errorCode = (res as any).errorCode;
    throw error;
  }
  
  if (!res.data) throw new Error("No session returned");
  return mapApiSessionToSession(res.data);
}

/** Hujjat: answers + skipAiEvaluation. Backend AI baholash qiladi va response da evaluation qaytaradi. */
export interface CompleteSessionPayload {
  answers: Array<{ questionId: string; questionText: string; text: string }>;
  skipAiEvaluation?: boolean;
}

export interface CompleteSessionResponse {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  answers: Answer[];
  evaluation?: Evaluation;
  completedAt?: string;
}

export async function completeSession(
  sessionId: string,
  payload: CompleteSessionPayload
): Promise<InterviewSession> {
  const res = await request<CompleteSessionResponse>(`${PUBLIC_PREFIX}/sessions/${sessionId}/complete`, {
    method: "PATCH",
    body: payload as object,
  });
  if (!res.data) throw new Error("No session returned");
  const d = res.data;
  return {
    id: d.id,
    jobId: d.jobId,
    candidateId: d.candidateId,
    status: d.status as InterviewSession["status"],
    answers: d.answers ?? [],
    evaluation: d.evaluation,
    startedAt: "",
    completedAt: d.completedAt,
    hasRecording: (d as { hasRecording?: boolean }).hasRecording,
  };
}

/** Nomzod: intervyu yozuvini (video/audio) yuklash – ochiq endpoint */
export async function uploadSessionRecording(sessionId: string, blob: Blob): Promise<void> {
  const { API_BASE } = await import("./authService");
  const form = new FormData();
  form.append("recording", blob, "recording.webm");
  const res = await fetch(`${API_BASE}/public/sessions/${sessionId}/recording`, {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `Upload failed: ${res.status}`);
}
