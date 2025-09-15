<template>
    <section class="profile">
        <!-- Header -->
        <header class="profile-header">
            <div class="avatar">
                <span v-if="initials">{{ initials }}</span>
                <i v-else class="fas fa-user"></i>
            </div>

            <div class="meta">
                <h1>Profil</h1>
                <p class="muted">
                    Angemeldet als <strong>{{ auth.user?.email }}</strong>
                </p>

                <div class="actions">
                    <router-link to="/settings" class="btn ghost">
                        <i class="fas fa-cog"></i> Einstellungen
                    </router-link>
                    <button class="btn" @click="goToTraining">
                        <i class="fas fa-dumbbell"></i> Training starten
                    </button>
                    <button class="btn danger" @click="logout">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </header>

        <!-- Quick Stats -->
        <section class="grid three">
            <div class="card stat">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <div>
                    <div class="stat-value">{{ weeklyWorkouts }}</div>
                    <div class="stat-label">Workouts (Woche)</div>
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
            </div>
        </section>

        <!-- Verknüpfte Bereiche -->
        <section class="grid three">
            <router-link to="/training" class="card link">
                <div class="link-icon"><i class="fas fa-dumbbell"></i></div>
                <div>
                    <h4>Training</h4>
                    <p class="muted">Pläne, Sätze & Timer</p>
                </div>
                <i class="fas fa-chevron-right chevron"></i>
            </router-link>

            <router-link to="/nutrition" class="card link">
                <div class="link-icon"><i class="fas fa-utensils"></i></div>
                <div>
                    <h4>Ernährung</h4>
                    <p class="muted">Mahlzeiten & Kalorien</p>
                </div>
                <i class="fas fa-chevron-right chevron"></i>
            </router-link>

            <router-link to="/progress" class="card link">
                <div class="link-icon"><i class="fas fa-chart-line"></i></div>
                <div>
                    <h4>Fortschritt</h4>
                    <p class="muted">Gewicht, PRs & Verlauf</p>
                </div>
                <i class="fas fa-chevron-right chevron"></i>
            </router-link>
        </section>
    </section>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'

    const auth = useAuthStore()
    const router = useRouter()

    // Placeholder-Daten (später durch echte Daten ersetzen)
    const weeklyWorkouts = ref(4)
    const favoriteTimers = ref(2)
    const streakDays = ref(6)
    const progress = ref({ muscle: 40, weight: 60, nutrition: 55 })

    const initials = computed(() => {
        const email = auth.user?.email || ''
        const name = email.split('@')[0] || ''
        if (!name) return ''
        const parts = name.replace(/[._-]+/g, ' ').split(' ')
        const chars = parts.slice(0, 2).map(p => p.charAt(0).toUpperCase())
        return chars.join('') || name.charAt(0).toUpperCase()
    })

    const memberSince = computed(() => '2025')

    function goToTraining() {
        router.push({ name: 'training' })
    }

    async function logout() {
        await auth.signOut()
        router.push({ name: 'home' })
    }
</script>

<style scoped>
    .profile {
        max-width: 1100px;
        margin: 60px auto 2rem;
        padding: 0 1rem
    }

    .profile-header {
        display: flex;
        gap: 1.25rem;
        align-items: center;
        margin-bottom: 1rem
    }

    .avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--accent-primary)
    }

    .meta h1 {
        font-size: 1.6rem;
        margin: 0 0 .15rem
    }

    .muted {
        color: var(--text-secondary)
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
        margin-top: .6rem
    }

    .btn {
        background: var(--accent-primary);
        color: #fff;
        border: 0;
        padding: .5rem .75rem;
        border-radius: 10px;
        cursor: pointer;
        transition: transform .06s
    }

        .btn:hover {
            transform: translateY(-1px)
        }

        .btn.ghost {
            background: transparent;
            color: var(--accent-primary);
            border: 1px solid var(--accent-primary)
        }

        .btn.danger {
            background: #dc2626
        }

    .grid {
        display: grid;
        gap: 1rem;
        margin: 1rem 0
    }

        .grid.two {
            grid-template-columns: repeat(2,minmax(0,1fr))
        }

        .grid.three {
            grid-template-columns: repeat(3,minmax(0,1fr))
        }

    @media (max-width:900px) {
        .grid.two, .grid.three {
            grid-template-columns: 1fr
        }

        .profile-header {
            align-items: flex-start
        }
    }

    .card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 1rem;
        box-shadow: var(--shadow)
    }

    .card-title {
        margin: 0 0 .5rem;
        font-size: 1rem
    }

    .stat {
        display: flex;
        align-items: center;
        gap: .9rem
    }

    .stat-icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: var(--bg-secondary);
        color: var(--accent-primary);
        border: 1px solid var(--border-color)
    }

    .stat-value {
        font-size: 1.4rem;
        font-weight: 700;
        line-height: 1
    }

    .stat-label {
        color: var(--text-secondary);
        font-size: .9rem
    }

    .list {
        padding: 0;
        margin: .25rem 0 0;
        list-style: none;
        display: grid;
        gap: .5rem
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
        padding: .1rem .5rem;
        border-radius: 999px
    }

    .goals {
        display: grid;
        gap: .8rem
    }

    .goal-top {
        display: flex;
        justify-content: space-between;
        font-size: .95rem
    }

    .goal-value {
        font-weight: 600
    }

    .bar {
        height: 10px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 999px;
        overflow: hidden
    }

        .bar > div {
            height: 100%;
            background: linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))
        }

    .link {
        display: flex;
        align-items: center;
        gap: .9rem;
        text-decoration: none;
        color: inherit;
        transition: transform .06s ease
    }

        .link:hover {
            transform: translateY(-1px)
        }

    .link-icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: var(--bg-secondary);
        color: var(--accent-primary);
        border: 1px solid var(--border-color)
    }

    .chevron {
        margin-left: auto;
        color: var(--text-secondary)
    }
</style>
