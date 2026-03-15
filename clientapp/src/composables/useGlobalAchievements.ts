// src/composables/useGlobalAchievements.ts

import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useTrainingPlansStore } from '@/store/trainingPlansStore'
import { getProfile, updateProfile } from '@/services/profile'
import { computeBadges, type Badge } from '@/utils/achievements'

const ACTIVITY_DAYS = 21
const MIN_REFRESH_INTERVAL_MS = 1500

const isGuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

export function useGlobalAchievements() {
    const auth = useAuthStore()
    const progressStore = useProgressStore()
    const trainingPlansStore = useTrainingPlansStore()

    const showAchievementPopup = ref(false)
    const latestAchievement = ref<Badge | null>(null)

    const popupQueue: Badge[] = []

    let running = false
    let lastRefreshAt = 0

    function queuePopup(badge: Badge) {
        if (showAchievementPopup.value) {
            popupQueue.push(badge)
            return
        }
        latestAchievement.value = badge
        showAchievementPopup.value = true
    }

    function closeAchievementPopup() {
        if (popupQueue.length > 0) {
            latestAchievement.value = popupQueue.shift() ?? null
            showAchievementPopup.value = !!latestAchievement.value
            return
        }

        showAchievementPopup.value = false
        latestAchievement.value = null
    }

    async function loadBackendActivity(): Promise<number[]> {
        await trainingPlansStore.loadList()

        const planIds = trainingPlansStore.items
            .map((p: { id: string }) => p.id)
            .filter((id: string) => isGuid(id))

        if (!planIds.length) return Array(ACTIVITY_DAYS).fill(0)

        await Promise.all(planIds.map((id: string) => progressStore.load(id, true)))

        const counts = new Map<string, number>()
        for (const id of planIds) {
            const items = progressStore.byPlan?.[id]?.items ?? []
            for (const it of items) {
                const day = String(it.date ?? '').slice(0, 10)
                if (!day) continue
                counts.set(day, (counts.get(day) ?? 0) + 1)
            }
        }

        const days: number[] = []
        const now = Date.now()
        const dayMs = 86400000
        for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
            const key = new Date(now - i * dayMs).toISOString().slice(0, 10)
            days.push(counts.get(key) ?? 0)
        }
        return days
    }

    async function refreshAchievements(force = false) {
        const now = Date.now()
        if (!force && now - lastRefreshAt < MIN_REFRESH_INTERVAL_MS) return
        if (running) return
        if (!auth.user) return

        running = true
        lastRefreshAt = now

        try {
            let activity: number[] = []
            const profile = await getProfile()
            const earnedBadges = Array.isArray(profile.earnedBadges) ? profile.earnedBadges : []

            try {
                activity = await loadBackendActivity()
            } catch {
                activity = Array.isArray(profile.activity) ? profile.activity : []
            }

            const badges = computeBadges(activity)
            if (!badges.length) return

            const known = new Set(earnedBadges)
            const newly = badges.filter(b => !known.has(b.id))
            if (!newly.length) return

            const merged = Array.from(new Set([...earnedBadges, ...newly.map(b => b.id)]))

            await updateProfile({ earnedBadges: merged })

            for (const badge of newly) queuePopup(badge)
        } catch {
            // silently ignore - achievements are non-critical
        } finally {
            running = false
        }
    }

    onMounted(() => {
        void refreshAchievements(true)
    })

    return {
        showAchievementPopup,
        latestAchievement,
        closeAchievementPopup,
        refreshAchievements,
    }
}
