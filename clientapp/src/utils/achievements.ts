// src/utils/achievements.ts

export type Badge = {
    id: string
    icon: string
    label: string
    desc: string
}

export function sumLastDays(arr: number[], days: number): number {
    return arr.slice(-days).reduce((a, b) => a + b, 0)
}

export function calcStreak(arr: number[]): number {
    let s = 0
    for (let i = arr.length - 1; i >= 0; i--) {
        if ((arr[i] ?? 0) > 0) s++
        else break
    }
    return s
}

export function computeBadges(activity: number[]): Badge[] {
    const arr: Badge[] = []

    const totalAll = sumLastDays(activity, activity.length)
    const total30 = sumLastDays(activity, 30)
    const streakDays = calcStreak(activity)
    const weeklyWorkouts = sumLastDays(activity, 7)

    if (totalAll >= 1) {
        arr.push({
            id: 'first_workout',
            icon: 'fas fa-star',
            label: 'Erster Step',
            desc: 'Dein erstes Workout ist drin - wichtiger als perfekt ist gestartet.'
        })
    }

    if (streakDays >= 3) {
        arr.push({
            id: 'streak3',
            icon: 'fas fa-fire',
            label: '3-Tage Streak',
            desc: 'Drei Tage am Stueck aktiv - jetzt bloss nicht abbrechen.'
        })
    }
    if (streakDays >= 7) {
        arr.push({
            id: 'streak7',
            icon: 'fas fa-bolt',
            label: '7-Tage Streak',
            desc: '7 Tage am Stueck aktiv - dein neuer Standard.'
        })
    }
    if (streakDays >= 14) {
        arr.push({
            id: 'streak14',
            icon: 'fas fa-mountain',
            label: '14-Tage Streak',
            desc: 'Zwei Wochen durchgezogen. Disziplin > Motivation.'
        })
    }
    if (streakDays >= 30) {
        arr.push({
            id: 'streak30',
            icon: 'fas fa-crown',
            label: '30-Tage Streak',
            desc: 'Ein ganzer Monat ohne Drop - absolut krank.'
        })
    }

    if (weeklyWorkouts >= 3) {
        arr.push({
            id: 'weekly3',
            icon: 'fas fa-running',
            label: 'Im Flow',
            desc: '3+ Workouts diese Woche - das ist der Sweet Spot fuers Momentum.'
        })
    }
    if (weeklyWorkouts >= 5) {
        arr.push({
            id: 'beast',
            icon: 'fas fa-dragon',
            label: 'Beast Mode',
            desc: '5+ Workouts diese Woche - du laesst Ausreden keine Chance.'
        })
    }
    if (weeklyWorkouts >= 7) {
        arr.push({
            id: 'no_days_off',
            icon: 'fas fa-fire-alt',
            label: 'No Days Off',
            desc: 'Jeden Tag diese Woche aktiv gewesen. Maschine.'
        })
    }

    if (total30 >= 20) {
        arr.push({
            id: 'grinder',
            icon: 'fas fa-dumbbell',
            label: 'Grinder 20/30',
            desc: '20 Workouts in 30 Tagen - du arbeitest, nicht redest.'
        })
    }

    if (totalAll >= 50) {
        arr.push({
            id: 'volume50',
            icon: 'fas fa-medal',
            label: 'Level 50+',
            desc: '50 Workouts insgesamt - deine Basis ist gebaut.'
        })
    }

    if (totalAll >= 100) {
        arr.push({
            id: 'volume100',
            icon: 'fas fa-trophy',
            label: '100 Workouts',
            desc: '100 Workouts sind nicht Glueck, das ist Identitaet.'
        })
    }

    if ((activity[0] ?? 0) === 0 && (activity.at(-1) ?? 0) > 0) {
        arr.push({
            id: 'comeback',
            icon: 'fas fa-redo-alt',
            label: 'Comeback',
            desc: 'Du warst raus und bist wieder drin. Genau das zaehlt.'
        })
    }

    return arr
}
