<template>
    <section class="profile">
        <!-- Header -->
        <header class="profile-header">
            <div class="avatar ring">
                <span v-if="initials">{{ initials }}</span>
                <i v-else class="fas fa-user"></i>
            </div>

            <div class="meta">
                <h1 class="title">Profil</h1>
                <p class="muted">Angemeldet als <strong>{{ auth.user?.email }}</strong></p>

                <div class="actions">
                    <button class="btn neutral" @click="openEmailPopup">
                        <i class="fas fa-envelope"></i>
                        E-Mail ändern
                    </button>
                    <button class="btn neutral" @click="openPasswordPopup">
                        <i class="fas fa-key"></i>
                        Passwort ändern
                    </button>
                    <button class="btn danger-outline" @click="openDeletePopup">
                        <i class="fas fa-user-slash"></i>
                        Profil löschen
                    </button>
                    <button class="btn neutral logout" @click="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        </header>

        <!-- Quick Stats (aus Activity berechnet / gespeichert) -->
        <section class="grid three">
            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <div>
                    <div class="stat-value">{{ weeklyWorkouts }}</div>
                    <div class="stat-label">Workouts (7 Tage)</div>
                </div>
            </div>

            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-stopwatch"></i></div>
                <div>
                    <div class="stat-value">{{ favoriteTimers }}</div>
                    <div class="stat-label">Favorisierte Timer</div>
                </div>
            </div>

            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div>
                    <div class="stat-value">{{ streakDays }}</div>
                    <div class="stat-label">Streak (Tage)</div>
                </div>
            </div>
        </section>

        <!-- Activity + Achievements -->
        <section class="grid two">
            <div class="card">
                <h3 class="card-title"><i class="fas fa-heartbeat"></i> Aktivität</h3>

                <div class="sparkline-wrap">
                    <svg class="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none">
                        <polyline :points="sparkPoints" fill="none" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <div class="spark-legend">
                        Letzte {{ activity.length }} Tage · Ø {{ avgActivity }} Workouts/Tag
                    </div>
                </div>

                <!-- kleine Controls ohne Backend -->
                <div class="activity-controls">
                    <button class="chip" @click="addTodayWorkout">+1 Heute</button>
                    <button class="chip" @click="undoTodayWorkout" :disabled="todayCount === 0">−1 Heute</button>
                    <button class="chip ghost" @click="extendHistory">+7 Tage Historie</button>
                    <button class="chip ghost" @click="resetActivity">Reset</button>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title"><i class="fas fa-trophy"></i> Achievements</h3>
                <div class="badges">
                    <span v-for="b in computedBadges" :key="b.id" class="badge" :title="b.desc">
                        <i :class="b.icon"></i> {{ b.label }}
                    </span>
                    <span v-if="!computedBadges.length" class="badge muted">Noch keine – leg los! 🚀</span>
                </div>
            </div>
        </section>

        <!-- About + Ziele -->
        <section class="grid two">
            <div class="card">
                <h3 class="card-title"><i class="fas fa-user-circle"></i> Über dich</h3>
                <ul class="list">
                    <li><span class="key">E-Mail</span><span class="val">{{ auth.user?.email || '—' }}</span></li>
                    <li><span class="key">Mitglied seit</span><span class="val">{{ memberSince }}</span></li>
                    <li><span class="key">Status</span><span class="val badge">Aktiv</span></li>
                </ul>
            </div>

            <div class="card">
                <h3 class="card-title"><i class="fas fa-bullseye"></i> Ziele</h3>
                <div class="goals">
                    <div class="goal">
                        <div class="goal-top">
                            <span>Muskeln aufbauen</span>
                            <span class="goal-value">{{ progress.muscle }}%</span>
                        </div>
                        <div class="bar"><div :style="{ width: progress.muscle + '%' }"></div></div>
                    </div>

                    <div class="goal">
                        <div class="goal-top">
                            <span>Gewicht tracken</span>
                            <span class="goal-value">{{ progress.weight }}%</span>
                        </div>
                        <div class="bar"><div :style="{ width: progress.weight + '%' }"></div></div>
                    </div>

                    <div class="goal">
                        <div class="goal-top">
                            <span>Ernährung loggen</span>
                            <span class="goal-value">{{ progress.nutrition }}%</span>
                        </div>
                        <div class="bar"><div :style="{ width: progress.nutrition + '%' }"></div></div>
                    </div>
                </div>

                <div class="goal-controls">
                    <button class="chip ghost" @click="nudgeProgress('muscle', 5)">+5% Muskel</button>
                    <button class="chip ghost" @click="nudgeProgress('weight', 5)">+5% Gewicht</button>
                    <button class="chip ghost" @click="nudgeProgress('nutrition', 5)">+5% Ernährung</button>
                    <button class="chip" @click="resetProgress">Reset</button>
                </div>
            </div>
        </section>

        <!-- Motto (inline editierbar, localStorage) -->
        <section class="card">
            <h3 class="card-title"><i class="fas fa-quote-left"></i> Dein Motto</h3>
            <div class="motto-row">
                <input v-if="editingMotto" v-model.trim="motto" class="input motto-input" @keyup.enter="saveMotto" />
                <p v-else class="motto">{{ motto }}</p>
                <button class="chip" @click="toggleMotto">{{ editingMotto ? 'Speichern' : 'Bearbeiten' }}</button>
            </div>
        </section>

        <!-- === Popups === -->
        <EmailChangePopup :show="showEmailPopup"
                          @cancel="closeEmailPopup"
                          @save="handleEmailChange" />

        <PasswordChangePopup :show="showPasswordPopup"
                             @cancel="closePasswordPopup"
                             @save="handlePasswordChange" />


        <DeleteAccountPopup :show="showDeletePopup"
                            :confirmPhrase="deleteConfirmPhrase"
                            @cancel="closeDeletePopup"
                            @confirm="handleAccountDelete" />

        <!-- Toasts -->
        <Toast v-if="toast" :toast="toast" />
    </section>
</template>

<script setup lang="ts">
    import { computed, ref, watch, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PasswordChangePopup from '@/components/ui/popups/PasswordChangePopup.vue'
    import EmailChangePopup from '@/components/ui/popups/EmailChangePopup.vue'
    import Toast from '@/components/ui/Toast.vue'
    import DeleteAccountPopup from '@/components/ui/popups/DeleteAccountPopup.vue'
    import type { Toast as ToastModel } from '@/types/toast'

    // --- Stores / Router ---
    const auth = useAuthStore()
    const router = useRouter()

    // --- LocalStorage Keys ---
    const LS_KEYS = {
        activity: 'profile_activity',          // number[]
        progress: 'profile_progress',          // {muscle,weight,nutrition}
        favorites: 'profile_fav_timers',       // number
        motto: 'profile_motto',                // string
        memberSince: 'profile_member_since',   // string
        email: 'auth_email',                   // aus deinem Auth-Store
    } as const

    // --- State init (mit Fallbacks) ---
    const activity = ref<number[]>(loadJSON(LS_KEYS.activity, [1, 0, 2, 1, 3, 2, 2, 1, 0, 2]))
    const progress = ref<{ muscle: number; weight: number; nutrition: number }>(
        loadJSON(LS_KEYS.progress, { muscle: 40, weight: 60, nutrition: 55 })
    )
    const favoriteTimers = ref<number>(Number(localStorage.getItem(LS_KEYS.favorites) ?? 2))
    const motto = ref<string>(localStorage.getItem(LS_KEYS.motto) ?? 'No excuses. Just results.')
    const memberSince = computed(() => localStorage.getItem(LS_KEYS.memberSince) ?? '2025')

    // --- Derivates aus Activity ---
    const weeklyWorkouts = computed(() => sumLastDays(activity.value, 7))
    const streakDays = computed(() => calcStreak(activity.value))
    const todayCount = computed(() => activity.value.at(-1) ?? 0)
    const avgActivity = computed(() => (sumLastDays(activity.value, activity.value.length) / Math.max(activity.value.length, 1)).toFixed(1))

    // Sparkline Points
    const sparkPoints = computed(() => {
        if (!activity.value.length) return ''
        const max = Math.max(...activity.value, 1)
        const stepX = 100 / (activity.value.length - 1)
        return activity.value.map((v, i) => `${i * stepX},${32 - (v / max) * 32}`).join(' ')
    })

    // Badges dynamisch
    const computedBadges = computed(() => {
        const arr: { id: string; icon: string; label: string; desc: string }[] = []
        if (streakDays.value >= 7) arr.push({ id: 'streak7', icon: 'fas fa-bolt', label: '7-Tage Streak', desc: '7 Tage am Stück aktiv' })
        if (sumLastDays(activity.value, 30) >= 20) arr.push({ id: 'grinder', icon: 'fas fa-dumbbell', label: 'Grinder 20/30', desc: '20 Workouts in 30 Tagen' })
        if ((activity.value[0] ?? 0) === 0 && (activity.value.at(-1) ?? 0) > 0) arr.push({ id: 'comeback', icon: 'fas fa-rotate-right', label: 'Comeback', desc: 'Zurück im Training' })
        if (weeklyWorkouts.value >= 5) arr.push({ id: 'beast', icon: 'fas fa-dragon', label: 'Beast Mode', desc: '5+ Workouts diese Woche' })
        return arr
    })

    // --- UI: Motto Edit ---
    const editingMotto = ref(false)
    function toggleMotto() {
        if (editingMotto.value) saveMotto()
        editingMotto.value = !editingMotto.value
    }
    function saveMotto() {
        localStorage.setItem(LS_KEYS.motto, motto.value || '')
        addToast('Motto gespeichert', 'save')
    }

    // --- Activity Controls (ohne Backend) ---
    function addTodayWorkout() {
        if (!activity.value.length) activity.value = [0]
        activity.value[activity.value.length - 1]++
    }
    function undoTodayWorkout() {
        if (!activity.value.length) return
        activity.value[activity.value.length - 1] = Math.max(0, activity.value[activity.value.length - 1] - 1)
    }
    function extendHistory() {
        // prepend 7 "0"-Tage an den Anfang, um Historie zu verlängern
        activity.value = Array(7).fill(0).concat(activity.value)
    }
    function resetActivity() {
        activity.value = [0, 0, 0, 0, 0, 0, 0]
    }

    // --- Goal Controls (ohne Backend) ---
    function nudgeProgress(key: 'muscle' | 'weight' | 'nutrition', by = 5) {
        progress.value[key] = Math.min(100, Math.max(0, progress.value[key] + by))
    }
    function resetProgress() {
        progress.value = { muscle: 40, weight: 60, nutrition: 55 }
    }

    // --- E-Mail / Passwort / Delete (Frontend-only) ---
    const showEmailPopup = ref(false)
    const emailForm = ref({ newEmail: '', password: '' })
    const emailError = ref('')

    function openEmailPopup() { showEmailPopup.value = true }
    function closeEmailPopup() { showEmailPopup.value = false }

    async function handleEmailChange({ newEmail, password }: { newEmail: string; password: string }) {
        try {
            await auth.changeEmail(newEmail, password)
            addToast('E-Mail aktualisiert ✅', 'save')
            closeEmailPopup()
        } catch (e: any) {
            emailError.value = e?.response?.data?.message || 'E-Mail ändern fehlgeschlagen.'
        }
    }

    async function handleAccountDelete({ password }: { password: string }) {
        try {
            // Server löschen
            await auth.deleteAccount(password)

            // lokale Daten wipen (wie bisher)
            Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k))

            addToast('Konto gelöscht. Bye 👋', 'delete')
            router.push({ name: 'home' })
        } catch (e: any) {
            deleteError.value = e?.response?.data?.message || 'Löschen fehlgeschlagen.'
        }
    }
    async function submitEmail() {
        emailError.value = ''
        const { newEmail, password } = emailForm.value
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
        if (!valid) { emailError.value = 'Bitte eine gültige E-Mail eingeben.'; return }
        if (!password) { emailError.value = 'Passwort erforderlich (nur Bestätigung, kein Server-Check).'; return }

        // Update lokaler Auth-Store + localStorage (kein Backend)
        if (auth.user) auth.user.email = newEmail
        localStorage.setItem(LS_KEYS.email, newEmail)
        addToast('E-Mail lokal aktualisiert', 'save')
        closeEmailPopup()
    }

    const showPasswordPopup = ref(false)
    const pwdForm = ref({ current: '', next: '', repeat: '' })
    const pwdError = ref('')

    function openPasswordPopup() {
        showPasswordPopup.value = true
    }
    function closePasswordPopup() {
        showPasswordPopup.value = false
    }
    async function handlePasswordChange({ current, next }: { current: string; next: string; repeat: string }) {
        try {
            await auth.changePassword(current, next)
            addToast('Passwort erfolgreich geändert ✅', 'save')
            closePasswordPopup()
        } catch (e: any) {
            addToast(e?.response?.data?.message || 'Fehler beim Ändern.', 'delete')
        }
    }


    async function submitPassword() {
        pwdError.value = '';
        const { current, next, repeat } = pwdForm.value;

        if (!current || !next || !repeat) {
            pwdError.value = 'Bitte alle Felder ausfüllen.';
            return;
        }
        if (next.length < 8) {
            pwdError.value = 'Neues Passwort muss mindestens 8 Zeichen haben.';
            return;
        }
        if (next !== repeat) {
            pwdError.value = 'Passwörter stimmen nicht überein.';
            return;
        }

        try {
            await auth.changePassword(current, next);
            addToast('Passwort erfolgreich geändert ✅', 'save');
            closePasswordPopup();
        } catch (e: any) {
            pwdError.value = e?.response?.data?.message || 'Fehler beim Ändern.';
        }
    }


    const showDeletePopup = ref(false)
    const deleteConfirmPhrase = 'KONTO LÖSCHEN'
    const deleteConfirmInput = ref('')
    const deleteError = ref('')

    function openDeletePopup() {
        deleteConfirmInput.value = ''
        deleteError.value = ''
        showDeletePopup.value = true
    }
    function closeDeletePopup() { showDeletePopup.value = false }

    async function confirmDelete() {
        if (deleteConfirmInput.value !== deleteConfirmPhrase) {
            deleteError.value = `Bitte exakt „${deleteConfirmPhrase}“ eingeben.`
            return
        }
        // lokale Daten löschen
        Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k))
        addToast('Lokale Profildaten gelöscht', 'delete')
        await auth.signOut()
        router.push({ name: 'home' })
    }

    // --- Logout ---
    async function logout() {
        await auth.signOut()
        router.push({ name: 'home' })
    }

    // --- Identity / Initials ---
    const initials = computed(() => {
        const email = auth.user?.email || localStorage.getItem(LS_KEYS.email) || ''
        const name = email.split('@')[0] || ''
        if (!name) return ''
        const parts = name.replace(/[._-]+/g, ' ').split(' ')
        const chars = parts.slice(0, 2).map(p => p.charAt(0).toUpperCase())
        return chars.join('') || name.charAt(0).toUpperCase()
    })

    // --- Persist watch ---
    watch(activity, v => saveJSON(LS_KEYS.activity, v), { deep: true })
    watch(progress, v => saveJSON(LS_KEYS.progress, v), { deep: true })
    watch(favoriteTimers, v => localStorage.setItem(LS_KEYS.favorites, String(v)))
    onMounted(() => {
        // Falls memberSince noch nicht gesetzt, einmalig setzen
        if (!localStorage.getItem(LS_KEYS.memberSince)) {
            localStorage.setItem(LS_KEYS.memberSince, new Date().getFullYear().toString())
        }
    })

    // --- Toasts ---
    const toast = ref<ToastModel | null>(null)
    let toastId = 0
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null
    function addToast(message: string, kind: 'add' | 'delete' | 'save' | 'default' = 'default') {
        if (timeoutHandle) clearTimeout(timeoutHandle)
        const emojis = { add: '✅', delete: '🗑️', save: '💾', default: '📋' } as const
        const classes = { add: 'toast-add', delete: 'toast-delete', save: 'toast-save', default: 'toast-default' } as const
        toast.value = { id: toastId++, message, emoji: emojis[kind], type: classes[kind], exiting: false }
        timeoutHandle = setTimeout(() => (toast.value = null), 2800)
    }

    // --- Helpers ---
    function sumLastDays(arr: number[], days: number) {
        const slice = arr.slice(-days)
        return slice.reduce((a, b) => a + b, 0)
    }
    function calcStreak(arr: number[]) {
        let s = 0
        for (let i = arr.length - 1; i >= 0; i--) {
            if ((arr[i] ?? 0) > 0) s++
            else break
        }
        return s
    }
    function loadJSON<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem(key)
            return raw ? JSON.parse(raw) as T : fallback
        } catch { return fallback }
    }
    function saveJSON(key: string, val: unknown) {
        localStorage.setItem(key, JSON.stringify(val))
    }
</script>

<style scoped>
    .profile {
        max-width: 1100px;
        margin: 60px auto 2rem;
        padding: 0 1rem;
    }

    /* Header */
    .profile-header {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-bottom: 2rem;
    }

    .avatar.ring {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--bg-card);
        border: 2px solid var(--border-color);
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 1.35rem;
        color: var(--accent-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
    }

    .title {
        font-size: 1.7rem;
        margin: 0 0 .2rem;
        background: linear-gradient(90deg, #60a5fa, #34d399, #f59e0b);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .muted {
        color: var(--text-secondary)
    }

    .actions {
        margin-top: .7rem;
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
    }

    /* Buttons */
    .btn {
        border: 0;
        padding: .55rem .9rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        transition: transform .08s ease, box-shadow .2s;
    }

        .btn:hover {
            transform: translateY(-1px)
        }

        .btn.neutral {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            box-shadow: 0 4px 12px rgba(0,0,0,.08);
        }

            .btn.neutral.logout {
                background: var(--bg-secondary)
            }

        .btn.danger-outline {
            background: transparent;
            border: 1px solid rgba(220,38,38,.6);
            color: rgba(220,38,38,.9);
        }

    /* Chips / mini buttons */
    .chip {
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: .35rem .6rem;
        border-radius: 999px;
        font-size: .85rem;
        cursor: pointer;
    }

        .chip.ghost {
            background: transparent;
        }

    /* Grids */
    .grid {
        display: grid;
        gap: 1rem;
        margin: 1rem 0;
    }

        .grid.two {
            grid-template-columns: repeat(2, minmax(0,1fr))
        }

        .grid.three {
            grid-template-columns: repeat(3, minmax(0,1fr))
        }

    @media (max-width:900px) {
        .grid.two, .grid.three {
            grid-template-columns: 1fr
        }

        .profile-header {
            flex-direction: column;
            align-items: flex-start
        }
    }

    /* Cards */
    .card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 1rem;
        box-shadow: var(--shadow);
    }

    .card-title {
        margin: 0 0 .6rem;
        font-size: 1.05rem;
        display: flex;
        align-items: center;
        gap: .5rem;
    }

    /* Stats */
    .stat {
        display: flex;
        align-items: center;
        gap: 1rem
    }

    .stat-icon {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: var(--bg-secondary);
        color: var(--accent-primary);
        border: 1px solid var(--border-color);
    }

    .stat-value {
        font-size: 1.45rem;
        font-weight: 800;
        line-height: 1
    }

    .stat-label {
        color: var(--text-secondary);
        font-size: .92rem
    }

    /* Lists */
    .list {
        padding: 0;
        margin: .25rem 0 0;
        list-style: none;
        display: grid;
        gap: .55rem
    }

        .list li {
            display: flex;
            justify-content: space-between;
            gap: 1rem
        }

    .key {
        color: var(--text-secondary)
    }

    .val.badge {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        padding: .15rem .6rem;
        border-radius: 999px;
        font-weight: 600;
    }

    /* Goals */
    .goals {
        display: grid;
        gap: .85rem
    }

    .goal-top {
        display: flex;
        justify-content: space-between;
        font-size: .95rem
    }

    .goal-value {
        font-weight: 700
    }

    .bar {
        height: 10px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 999px;
        overflow: hidden;
    }

        .bar > div {
            height: 100%;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        }

    .goal-controls {
        margin-top: .7rem;
        display: flex;
        flex-wrap: wrap;
        gap: .4rem
    }

    /* Sparkline */
    .sparkline-wrap {
        text-align: center
    }

    .sparkline {
        width: 100%;
        height: 60px;
        color: var(--accent-primary)
    }

    .spark-legend {
        margin-top: .3rem;
        font-size: .85rem;
        color: var(--text-secondary)
    }

    .activity-controls {
        margin-top: .7rem;
        display: flex;
        gap: .4rem;
        flex-wrap: wrap
    }

    /* Form / Popups */
    .form-grid {
        display: grid;
        gap: .6rem
    }

    .label {
        font-size: .9rem;
        color: var(--text-secondary)
    }

    .input {
        width: 100%;
        padding: .6rem .7rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .form-error {
        color: rgba(220,38,38,.95);
        font-size: .9rem
    }

    .hint {
        margin-top: .4rem;
        font-size: .85rem;
        color: var(--text-secondary)
    }

    /* Motto */
    .motto-row {
        display: flex;
        gap: .6rem;
        align-items: center
    }

    .motto {
        font-style: italic;
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0
    }

    .motto-input {
        flex: 1
    }
</style>
