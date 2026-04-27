import { requestAuth, getToken, API_BASE } from "./authService";
import type { InterviewSession, Answer, Evaluation } from "../types";

export interface ApiSession {
  id: string;
  jobId: string;
  applicationId?: string;
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
  jobDepartment?: string;
  status: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    text: string;
    score?: number;
    feedback?: string;
    timestamp: string;
    isFollowUp?: boolean;
  }>;
  evaluation?: Evaluation;
  startedAt: string;
  completedAt?: string;
  language?: string;
  hasRecording?: boolean;
  application?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    experienceYears?: number;
    resumeFileName?: string;
    analysis?: any;
  } | null;
}

function mapApiSessionToSession(api: ApiSession): InterviewSession {
  return {
    id: api.id,
    jobId: api.jobId,
    applicationId: api.applicationId,
    candidateId: api.candidateId,
    candidateName: api.candidateName,
    jobTitle: api.jobTitle,
    jobDepartment: api.jobDepartment,
    status: api.status as InterviewSession["status"],
    answers: (api.answers ?? []).map((a) => ({
      questionId: a.questionId,
      questionText: a.questionText,
      text: a.text,
      score: a.score,
      feedback: a.feedback,
      timestamp: a.timestamp,
      isFollowUp: a.isFollowUp,
    })),
    evaluation: api.evaluation,
    startedAt: api.startedAt,
    completedAt: api.completedAt,
    language: api.language as InterviewSession["language"],
    hasRecording: api.hasRecording,
  };
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  averageScore: number;
  recommendations: Record<string, number>;
}

export async function getSessionStats(): Promise<SessionStats> {
  const res = await requestAuth<SessionStats>("/sessions/stats");
  if (!res.data) throw new Error("No stats returned");
  return res.data;
}

export async function getSessions(params?: { status?: string; jobId?: string }): Promise<InterviewSession[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.jobId) q.set("jobId", params.jobId);
  const query = q.toString();
  const res = await requestAuth<ApiSession[]>(`/sessions${query ? `?${query}` : ""}`);
  return (res.data ?? []).map(mapApiSessionToSession);
}

export async function getSessionsByJob(jobId: string): Promise<InterviewSession[]> {
  const res = await requestAuth<ApiSession[]>(`/sessions/job/${jobId}`);
  return (res.data ?? []).map(mapApiSessionToSession);
}

export async function getSession(id: string): Promise<InterviewSession | null> {
  const res = await requestAuth<ApiSession>(`/sessions/${id}`);
  return res.data ? mapApiSessionToSession(res.data) : null;
}

export async function getSessionDetails(id: string): Promise<InterviewSession | null> {
  const res = await requestAuth<ApiSession>(`/sessions/${id}/details`);
  return res.data ? mapApiSessionToSession(res.data) : null;
}

/** Get session details with raw application data */
export async function getSessionDetailsRaw(id: string): Promise<ApiSession | null> {
  const res = await requestAuth<ApiSession>(`/sessions/${id}/details`);
  return res.data || null;
}

/** HR: kandidatning barcha oldingi suhbatlari (applicationId yoki sessionId orqali) */
export async function getCandidateHistory(params: {
  applicationId?: string;
  sessionId?: string;
}): Promise<InterviewSession[]> {
  const q = new URLSearchParams();
  if (params.applicationId) q.set("applicationId", params.applicationId);
  if (params.sessionId) q.set("sessionId", params.sessionId);
  const query = q.toString();
  if (!query) return [];
  const res = await requestAuth<ApiSession[]>(`/sessions/candidate-history?${query}`);
  return (res.data ?? []).map(mapApiSessionToSession);
}

/** HR: sessiya yozuvini (video/audio) blob sifatida olish */
export async function getRecordingBlob(sessionId: string): Promise<Blob | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/recording`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.blob();
}
