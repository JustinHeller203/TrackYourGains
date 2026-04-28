import { getExerciseCatalog } from '@/services/training/exerciseLibrary'
import { resolveTutorialForExercise } from '@/services/tutorialCatalog'
import { mergeTutorialTranslations } from '@/services/tutorialLocalization'
import type { TutorialEntry, TutorialLevel } from '@/types/tutorials'

export function normalizeTutorialText(value: string) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tutorialDedupKeys(tutorial: Pick<TutorialEntry, 'title' | 'translations' | 'exerciseId'>) {
  const keys = new Set<string>()
  if (tutorial.exerciseId) keys.add(`exercise:${tutorial.exerciseId}`)
  if (tutorial.title) keys.add(`title:${normalizeTutorialText(tutorial.title)}`)
  const englishTitle = tutorial.translations?.en?.title
  if (englishTitle) keys.add(`title-en:${normalizeTutorialText(englishTitle)}`)
  return keys
}

export function getTutorialMuscleGroups(tutorial: TutorialEntry): string[] {
  if (tutorial.muscleGroups?.length) return tutorial.muscleGroups

  const text = [tutorial.title, tutorial.description, tutorial.category, ...(tutorial.matchTerms ?? [])]
    .map(normalizeTutorialText)
    .join(' ')

  if (/bankdruck|bench press|chest press|fly|incline press|schragbank|dip/.test(text)) return ['Brust', 'Trizeps', 'Vordere Schulter']
  if (/schulterdruck|shoulder press|overhead press|military press|seitheben/.test(text)) return ['Schultern', 'Trizeps']
  if (/klimmzug|pull up|chin up|latziehen|pulldown|rudern|row|face pull/.test(text)) return ['Latissimus', 'Oberer Rücken', 'Bizeps']
  if (/bizepscurl|curl/.test(text)) return ['Bizeps', 'Unterarme']
  if (/pushdown|trizeps/.test(text)) return ['Trizeps']
  if (/kniebeuge|squat|beinpresse|leg press|leg extension|beinstrecker|ausfallschritt|lunge|goblet squat/.test(text)) return ['Quadrizeps', 'Gesäß']
  if (/kreuzheben|deadlift|rdl|rumanisches kreuzheben|leg curl|beinbeuger|hamstring/.test(text)) return ['Hintere Kette', 'Beinbeuger', 'Gesäß']
  if (/hip thrust|glute bridge|bridge/.test(text)) return ['Gesäß', 'Beinbeuger']
  if (/wadenheben|calf raise/.test(text)) return ['Waden']
  if (/plank|russian twist|bird dog|mountain climber|core|hollow|stutz|rotation|seitstutz/.test(text)) return ['Bauch', 'Core', 'Unterer Rücken']
  if (/burpee|ergometer|rower|cross trainer|walking/.test(text)) return ['Ganzkörper', 'Beine', 'Core']
  return tutorial.category === 'Oberkörper'
    ? ['Oberkörper']
    : tutorial.category === 'Unterkörper'
      ? ['Unterkörper']
      : tutorial.category === 'Core'
        ? ['Core']
        : ['Ganzkörper']
}

export function getSimilarTutorials(tutorials: TutorialEntry[], current: TutorialEntry | null, limit = 3): TutorialEntry[] {
  if (!current) return []

  const currentTerms = new Set(
    [current.title, ...(current.matchTerms ?? [])]
      .map(normalizeTutorialText)
      .filter(Boolean)
  )

  return tutorials
    .filter(tutorial => tutorial.id !== current.id)
    .map(tutorial => {
      let score = 0
      if (tutorial.category === current.category) score += 4
      if (tutorial.level && current.level && tutorial.level === current.level) score += 2
      const candidateTerms = [tutorial.title, ...(tutorial.matchTerms ?? [])]
        .map(normalizeTutorialText)
        .filter(Boolean)
      for (const term of candidateTerms) {
        if ([...currentTerms].some(currentTerm =>
          currentTerm.includes(term)
          || term.includes(currentTerm)
          || currentTerm.split(' ').some(part => part.length >= 4 && term.includes(part))
        )) {
          score += 3
        }
      }
      return { tutorial, score }
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.tutorial.title.localeCompare(b.tutorial.title, 'de'))
    .slice(0, limit)
    .map(entry => entry.tutorial)
}

function mapLevel(level?: string): TutorialLevel | undefined {
  if (level === 'Anfänger') return 'Anfänger'
  if (level === 'Fortgeschritten' || level === 'Mittelstufe') return 'Fortgeschritten'
  if (level === 'Pro') return 'Pro'
  return undefined
}

function mapCategory(category?: string) {
  if (category === 'Cardio' || category === 'Mobilität') return 'Ganzkörper'
  return category || 'Ganzkörper'
}

function hashExerciseId(value: string) {
  return value.split('').reduce((acc, char) => ((acc * 33) + char.charCodeAt(0)) % 9000000, 5381)
}

export function buildExerciseTutorialEntries(): TutorialEntry[] {
  const seenKeys = new Set<string>()
  const entries: TutorialEntry[] = []

  for (const exercise of getExerciseCatalog()) {
    const resolved = resolveTutorialForExercise(exercise)
    const customTutorial = exercise.tutorial ?? null
    const isCustomExercise = exercise.id.startsWith('custom-')

    if (isCustomExercise && !customTutorial) continue

    const tutorial: TutorialEntry = {
      id: 100000 + hashExerciseId(exercise.id),
      title: customTutorial?.title?.trim() || exercise.name,
      description: customTutorial?.description?.trim() || resolved.description || `${exercise.name} im Detail erklärt.`,
      videoUrl: customTutorial?.videoUrl?.trim() || resolved.videoUrl,
      category: customTutorial?.category?.trim() || mapCategory(resolved.category),
      level: customTutorial?.level || mapLevel(resolved.level),
      equipment: customTutorial?.equipment?.length
        ? customTutorial.equipment
        : resolved.equipment?.length
          ? resolved.equipment
          : undefined,
      muscleGroups: customTutorial?.muscleGroups?.length
        ? customTutorial.muscleGroups
        : resolved.muscleGroups?.length
          ? resolved.muscleGroups
          : undefined,
      matchTerms: Array.from(new Set([
        exercise.name,
        ...exercise.aliases,
        ...exercise.substitutions,
        exercise.muscleGroup,
        ...exercise.secondaryMuscleGroups,
        ...(resolved.matchTerms ?? []),
      ].filter(Boolean))),
      cues: customTutorial?.cues?.length ? customTutorial.cues : resolved.cues,
      steps: customTutorial?.steps?.length ? customTutorial.steps : resolved.steps,
      mistakes: customTutorial?.mistakes?.length ? customTutorial.mistakes : resolved.mistakes,
      source: customTutorial ? 'custom' : 'exercise',
      communityScore: 60,
      exerciseId: exercise.id,
      translations: mergeTutorialTranslations(resolved.translations, customTutorial?.translations),
    }

    const dedupKeys = tutorialDedupKeys(tutorial)
    if ([...dedupKeys].some((key) => seenKeys.has(key))) continue
    dedupKeys.forEach((key) => seenKeys.add(key))
    entries.push(tutorial)
  }

  return entries
}

export function mergeTutorialsWithExerciseLibrary(baseTutorials: TutorialEntry[]): TutorialEntry[] {
  const merged = [...baseTutorials]
  const existingKeys = new Set<string>()
  for (const tutorial of baseTutorials) {
    tutorialDedupKeys(tutorial).forEach((key) => existingKeys.add(key))
  }

  for (const tutorial of buildExerciseTutorialEntries()) {
    const keys = tutorialDedupKeys(tutorial)
    if ([...keys].some((key) => existingKeys.has(key))) continue
    keys.forEach((key) => existingKeys.add(key))
    merged.push(tutorial)
  }

  return merged
}

export function findExerciseTutorialByExerciseId(exerciseId?: string | null, tutorials?: TutorialEntry[]) {
  if (!exerciseId) return null
  const source = tutorials ?? buildExerciseTutorialEntries()
  return source.find(tutorial => tutorial.exerciseId === exerciseId) ?? null
}
