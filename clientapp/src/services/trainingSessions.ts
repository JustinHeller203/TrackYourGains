import { api } from "@/lib/api";

export type TrainingSessionFeedbackPayload = {
    intensity?: number | null
    bestExercise?: string | null
    strengthTechnique?: number | null
    cardioIntensity?: number | null
    stretchPain?: number | null
    note?: string | null
}

export type CreateTrainingSessionPayload = {
    planId: string
    startedAtUtc?: string | null
    finishedAtUtc?: string | null
    durationSec?: number | null
    exercisesTotal?: number | null
    exercisesDone?: number | null
    typesPresent?: string[] | null
    feedback?: TrainingSessionFeedbackPayload | null
}

export type TrainingSessionCreateResult = {
    sessionId: string
    feedbackId?: string | null
}

export async function createTrainingSession(payload: CreateTrainingSessionPayload) {
    const { data } = await api.post<TrainingSessionCreateResult>("/training-sessions", payload)
    return data
}

export type TrainingSessionFeedbackRecord = {
    sessionId: string
    planId: string
    finishedAtUtc: string
    feedbackId?: string | null
    intensity?: number | null
    bestExercise?: string | null
    strengthTechnique?: number | null
    cardioIntensity?: number | null
    stretchPain?: number | null
    note?: string | null
}

export type UpdateTrainingSessionFeedbackPayload = {
    intensity?: number | null
    bestExercise?: string | null
    strengthTechnique?: number | null
    cardioIntensity?: number | null
    stretchPain?: number | null
    note?: string | null
}

export async function listTrainingSessions(params?: {
    planId?: string | null
    fromUtc?: string | null
    toUtc?: string | null
}) {
    const { data } = await api.get<TrainingSessionFeedbackRecord[]>("/training-sessions", {
        params: {
            planId: params?.planId ?? undefined,
            fromUtc: params?.fromUtc ?? undefined,
            toUtc: params?.toUtc ?? undefined,
        }
    })
    return data ?? []
}

export async function upsertTrainingSessionFeedback(sessionId: string, payload: UpdateTrainingSessionFeedbackPayload) {
    const { data } = await api.put<TrainingSessionFeedbackRecord>(`/training-sessions/${sessionId}/feedback`, payload)
    return data
}
