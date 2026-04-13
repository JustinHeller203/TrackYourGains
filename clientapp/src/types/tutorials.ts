export type TutorialLevel = 'Anfänger' | 'Fortgeschritten' | 'Pro'

export type TutorialSource = 'builtin' | 'custom' | 'exercise'

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
}

export type TutorialStatusBadge = { kind: 'recent' | 'plan'; label: string }
