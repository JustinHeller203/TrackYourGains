export type TutorialCatalogEntry = {
    id: number
    title: string
    videoUrl: string | null
    matchTerms: string[]
}

const BUILTIN_TUTORIALS: TutorialCatalogEntry[] = [
    { id: 1, title: 'Bankdrücken', videoUrl: 'https://www.youtube.com/embed/Br8FJCuR4a4', matchTerms: ['bankdrücken', 'bench press', 'chest press', 'brust'] },
    { id: 2, title: 'Kniebeugen', videoUrl: 'https://www.youtube.com/embed/GBsAXMvZGwc', matchTerms: ['kniebeuge', 'squat', 'back squat', 'front squat'] },
    { id: 3, title: 'Kreuzheben', videoUrl: 'https://www.youtube.com/embed/eUhawFmUXZ0', matchTerms: ['kreuzheben', 'deadlift', 'romanian deadlift', 'rdl'] },
    { id: 4, title: 'Schulterdrücken', videoUrl: 'https://www.youtube.com/embed/bdMZfPOGWqw', matchTerms: ['schulterdrücken', 'shoulder press', 'overhead press', 'military press'] },
    { id: 5, title: 'Klimmzüge', videoUrl: 'https://www.youtube.com/embed/mWU2888TDLo', matchTerms: ['klimmzug', 'pull up', 'chin up', 'lat'] },
    { id: 6, title: 'Ausfallschritte', videoUrl: 'https://www.youtube.com/embed/YDaLrvY4UlU', matchTerms: ['ausfallschritt', 'lunge', 'split squat', 'bulgarian split squat'] },
    { id: 7, title: 'Plank', videoUrl: 'https://www.youtube.com/embed/iqh1AgblK3w', matchTerms: ['plank', 'core', 'hollow', 'stütz'] },
    { id: 8, title: 'Bizepscurls', videoUrl: 'https://www.youtube.com/embed/UBE9a2xTEl4', matchTerms: ['bizepscurl', 'curl', 'biceps curl', 'hammer curl'] },
    { id: 9, title: 'Beinpresse', videoUrl: 'https://www.youtube.com/embed/ai5g8OFbnZI', matchTerms: ['beinpresse', 'leg press'] },
    { id: 10, title: 'Burpees', videoUrl: 'https://www.youtube.com/embed/VkY1YpAjlwg', matchTerms: ['burpee', 'conditioning', 'hiit'] },
    { id: 11, title: 'Rudern am Kabel', videoUrl: 'https://www.youtube.com/embed/VsW98LIzHKA', matchTerms: ['rudern', 'seated row', 'cable row', 'row'] },
    { id: 12, title: 'Latziehen', videoUrl: 'https://www.youtube.com/embed/VqD9sPjRV9U', matchTerms: ['latziehen', 'lat pulldown', 'pulldown'] },
    { id: 13, title: 'Hip Thrust', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', matchTerms: ['hip thrust', 'glute bridge', 'glutes'] },
    { id: 14, title: 'Rumänisches Kreuzheben', videoUrl: 'https://www.youtube.com/embed/lIUsXvrQXcE', matchTerms: ['rumänisches kreuzheben', 'romanian deadlift', 'rdl'] },
    { id: 15, title: 'Face Pulls', videoUrl: 'https://www.youtube.com/embed/RRXyfDlLHwo', matchTerms: ['face pull', 'rear delt', 'hintere schulter'] },
    { id: 16, title: 'Dips', videoUrl: 'https://www.youtube.com/embed/AloHKkWtUiE', matchTerms: ['dip', 'dips', 'trizeps dips'] },
    { id: 17, title: 'Trizeps Pushdown', videoUrl: 'https://www.youtube.com/embed/EsIddhEdo1M', matchTerms: ['pushdown', 'trizeps', 'triceps pushdown'] },
    { id: 18, title: 'Seitheben', videoUrl: 'https://www.youtube.com/embed/bTYps6PsRZw', matchTerms: ['seitheben', 'lateral raise', 'schulter'] },
    { id: 19, title: 'Wadenheben', videoUrl: 'https://www.youtube.com/embed/hYnpAmykqDA', matchTerms: ['wadenheben', 'calf raise', 'calves'] },
    { id: 20, title: 'Leg Curl', videoUrl: 'https://www.youtube.com/embed/Uu-wvoXbYTE', matchTerms: ['leg curl', 'beinbeuger', 'hamstring curl'] },
    { id: 21, title: 'Leg Extension', videoUrl: 'https://www.youtube.com/embed/0Yed-nbKN7U', matchTerms: ['leg extension', 'beinstrecker', 'quadrizeps'] },
    { id: 22, title: 'Chest Fly', videoUrl: null, matchTerms: ['fly', 'chest fly', 'pec deck'] },
    { id: 23, title: 'Mountain Climbers', videoUrl: null, matchTerms: ['mountain climber', 'conditioning', 'core cardio'] },
    { id: 24, title: 'Russian Twists', videoUrl: null, matchTerms: ['russian twist', 'rotation', 'obliques'] },
    { id: 25, title: 'Bird Dog', videoUrl: null, matchTerms: ['bird dog', 'stabilität', 'lower back'] },
    { id: 26, title: 'Glute Bridge', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', matchTerms: ['glute bridge', 'bridge', 'hip bridge'] },
    { id: 27, title: 'Goblet Squat', videoUrl: 'https://www.youtube.com/embed/8VrXHfHH5PM', matchTerms: ['goblet squat', 'squat', 'front squat'] },
    { id: 28, title: 'Incline Dumbbell Press', videoUrl: 'https://www.youtube.com/embed/0WPRqCYF4pA', matchTerms: ['incline press', 'schrägbank', 'dumbbell press'] },
]

function normalize(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
}

export function isYouTubeEmbed(url: string | null | undefined): boolean {
    return /^https:\/\/www\.youtube\.com\/embed\//i.test(String(url ?? '').trim())
}

export function findTutorialForExercise(exerciseName: string): TutorialCatalogEntry | null {
    const needle = normalize(exerciseName)
    if (!needle) return null

    let best: { tutorial: TutorialCatalogEntry; score: number } | null = null

    for (const tutorial of BUILTIN_TUTORIALS) {
        let score = 0
        const title = normalize(tutorial.title)

        if (title === needle) score = Math.max(score, 120)
        if (title.includes(needle) || needle.includes(title)) score = Math.max(score, 90)

        for (const termRaw of tutorial.matchTerms) {
            const term = normalize(termRaw)
            if (!term) continue
            if (term === needle) score = Math.max(score, 110)
            else if (term.includes(needle) || needle.includes(term)) score = Math.max(score, 80)
        }

        if (!best || score > best.score) best = { tutorial, score }
    }

    return best && best.score >= 80 ? best.tutorial : null
}
