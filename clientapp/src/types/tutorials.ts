import type { AppLocale } from '@/i18n/translations'

export type TutorialLevel = 'Anfänger' | 'Fortgeschritten' | 'Pro'

export type TutorialSource = 'builtin' | 'custom' | 'exercise'

export type TutorialTranslationContent = {
  title?: string
  description?: string
  category?: string
  level?: TutorialLevel
  equipment?: string[]
  muscleGroups?: string[]
  cues?: string[]
  steps?: string[]
  mistakes?: string[]
}

export type TutorialTranslations = Partial<Record<AppLocale, TutorialTranslationContent>>

export type TutorialEntry = {
  id: number
  title: string
  description: string
  videoUrl: string | null
  category: string
  level?: TutorialLevel
  equipment?: string[]
  muscleGroups?: string[]
  matchTerms?: string[]
  cues?: string[]
  steps?: string[]
  mistakes?: string[]
  source?: TutorialSource
  videoRef?: string | null
  communityScore?: number
  exerciseId?: string
  translations?: TutorialTranslations
}

export type TutorialStatusBadge = { kind: 'recent' | 'plan'; label: string }
