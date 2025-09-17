<template>
    <div class="nutrition" :class="{ 'cs-locked': comingSoon }">
        <h2 class="page-title">🍽️ Ernährung</h2>
        <p class="page-subtext">Tracke deine Mahlzeiten, Makros & Ziele</p>

        <!-- === Dashboard-Cards mit Balken === -->
        <div class="dashboard-grid" :inert="comingSoon || undefined">
            <DashboardCard title="Kalorien" clickable @click="openGoalPopup">
                {{ totalCalories }} / {{ calorieGoal }} kcal
                <div class="progress-bar">
                    <div class="progress-bar-fill" :style="{ width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` }"></div>
                </div>
            </DashboardCard>
            <DashboardCard title="Protein">{{ totalProtein }} g</DashboardCard>
            <DashboardCard title="Carbs">{{ totalCarbs }} g</DashboardCard>
            <DashboardCard title="Fett">{{ totalFat }} g</DashboardCard>
        </div>

        <!-- === Chart === -->
        <div class="chart-container" :inert="comingSoon || undefined">
            <canvas id="macroChart"></canvas>
        </div>

        <!-- === Aktionen === -->
        <div class="actions" :inert="comingSoon || undefined">
            <button class="btn-ghost" @click="openMealPopup">+ Neue Mahlzeit</button>
            <button class="btn-ghost" @click="openExportPopup">⬇️ Exportieren</button>
            <select v-model="filter" class="filter-select">
                <option value="">Alle</option>
                <option value="protein">Proteinbomben (>30g)</option>
                <option value="carbs">High Carb (>50g)</option>
            </select>
            <input v-model="search" placeholder="Mahlzeit suchen..." class="search-input" />
        </div>

        <!-- === Liste der Mahlzeiten === -->
        <div v-if="filteredMeals.length" class="meal-list" :inert="comingSoon || undefined">
            <div v-for="(m, index) in filteredMeals" :key="index" class="meal-card">
                <div class="meal-info">
                    <strong>{{ m.name }}</strong>
                    <small>{{ m.protein }}g / {{ m.carbs }}g / {{ m.fat }}g</small>
                </div>
                <div class="meal-kcal">{{ m.calories }} kcal</div>
                <div class="entry-actions">
                    <button class="edit-btn" @click="editMeal(index)">✏️</button>
                    <button class="delete-btn" @click="deleteMeal(index)">🗑️</button>
                </div>
            </div>
        </div>
        <p v-else class="no-meals" :inert="comingSoon || undefined">Noch keine Mahlzeiten eingetragen.</p>

        <!-- === Popups === -->
        <BasePopup :show="showMealPopup"
                   :title="editingIndex !== null ? 'Mahlzeit bearbeiten' : 'Neue Mahlzeit'"
                   @cancel="closeMealPopup"
                   @save="saveMeal" />

        <ExportPopup :show="showExportPopup"
                     v-model="exportFormat"
                     @confirm="confirmExport"
                     @cancel="closeExportPopup" />

        <GoalPopup :show="showGoalPopup"
                   v-model="calorieGoal"
                   placeholder="z. B. 2500"
                   @save="closeGoalPopup"
                   @cancel="closeGoalPopup" />

        <!-- Toasts -->
        <Toast v-if="toast" :toast="toast" />

        <!-- === COMING SOON OVERLAY (nur über dieser Seite, Navbar bleibt sichtbar) === -->
        <div v-if="comingSoon"
             class="coming-soon-overlay"
             role="dialog"
             aria-modal="true"
             aria-label="Coming Soon Hinweis">
            <div class="coming-soon-card" @click.stop>
                <div class="cs-badge">Bald verfügbar</div>
                <h1 class="cs-title">COMING&nbsp;SOON!</h1>
                <p class="cs-sub">Dieser Bereich ist noch in Arbeit. Nutze die Navigation, um woanders hinzugehen.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick } from 'vue'
    import Chart from 'chart.js/auto'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import ExportPopup from '@/components/ui/popups/ExportPopup.vue'
    import GoalPopup from '@/components/ui/popups/GoalPopup.vue'
    import Toast from '@/components/ui/Toast.vue'
    import type { Toast as ToastModel } from '@/types/toast'

    interface Meal {
        name: string
        calories: number
        protein: number
        carbs: number
        fat: number
    }

    const meals = ref<Meal[]>([])
    const meal = ref<Meal>({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
    const showMealPopup = ref(false)
    const editingIndex = ref<number | null>(null)

    const calorieGoal = ref(2500)
    const search = ref('')
    const filter = ref('')

    const totalCalories = computed(() => meals.value.reduce((s, m) => s + m.calories, 0))
    const totalProtein = computed(() => meals.value.reduce((s, m) => s + m.protein, 0))
    const totalCarbs = computed(() => meals.value.reduce((s, m) => s + m.carbs, 0))
    const totalFat = computed(() => meals.value.reduce((s, m) => s + m.fat, 0))

    // Quick Meals
    const quickMeals: Meal[] = [
        { name: 'Proteinshake', calories: 300, protein: 30, carbs: 10, fat: 3 },
        { name: 'Chicken & Rice', calories: 550, protein: 40, carbs: 60, fat: 8 },
        { name: 'Nuts Mix', calories: 250, protein: 8, carbs: 10, fat: 20 },
    ]
    function quickAdd(q: Meal) {
        meals.value.unshift({ ...q })
        addToast(`${q.name} hinzugefügt`, 'add')
        updateChart()
    }

    // Filter + Suche
    const filteredMeals = computed(() => {
        return meals.value.filter((m) => {
            if (search.value && !m.name.toLowerCase().includes(search.value.toLowerCase())) return false
            if (filter.value === 'protein' && m.protein < 30) return false
            if (filter.value === 'carbs' && m.carbs < 50) return false
            return true
        })
    })

    // Chart
    let macroChart: Chart | null = null
    function updateChart() {
        const ctx = document.getElementById('macroChart') as HTMLCanvasElement
        if (!ctx) return
        if (macroChart) macroChart.destroy()
        macroChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fett'],
                datasets: [
                    {
                        data: [totalProtein.value, totalCarbs.value, totalFat.value],
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                    },
                ],
            },
            options: {
                plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-primary)' } } },
            },
        })
    }
    watch([totalProtein, totalCarbs, totalFat], () => nextTick(updateChart))

    // Meals Handling
    function openMealPopup() {
        resetMeal()
        showMealPopup.value = true
        editingIndex.value = null
    }
    function closeMealPopup() {
        showMealPopup.value = false
    }
    function saveMeal() {
        if (!meal.value.name || meal.value.calories <= 0) return
        if (editingIndex.value !== null) {
            meals.value[editingIndex.value] = { ...meal.value }
            addToast('Mahlzeit aktualisiert', 'add')
        } else {
            meals.value.unshift({ ...meal.value })
            addToast('Mahlzeit hinzugefügt', 'add')
        }
        resetMeal()
        showMealPopup.value = false
        updateChart()
    }
    function editMeal(i: number) {
        meal.value = { ...meals.value[i] }
        editingIndex.value = i
        showMealPopup.value = true
    }
    function deleteMeal(i: number) {
        meals.value.splice(i, 1)
        addToast('Mahlzeit gelöscht', 'delete')
        updateChart()
    }
    function resetMeal() {
        meal.value = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    // Goal
    const showGoalPopup = ref(false)
    function openGoalPopup() {
        showGoalPopup.value = true
    }
    function closeGoalPopup() {
        showGoalPopup.value = false
    }

    // Export
    const showExportPopup = ref(false)
    const exportFormat = ref<'html' | 'csv' | 'json' | 'pdf' | 'txt'>('html')
    function openExportPopup() {
        showExportPopup.value = true
    }
    function closeExportPopup() {
        showExportPopup.value = false
    }
    function confirmExport() {
        const data = {
            meals: meals.value,
            totals: { cal: totalCalories.value, protein: totalProtein.value, carbs: totalCarbs.value, fat: totalFat.value },
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nutrition.${exportFormat.value}`
        a.click()
        URL.revokeObjectURL(url)
        addToast('Daten exportiert', 'save')
        closeExportPopup()
    }

    // Toast
    const toast = ref<ToastModel | null>(null)
    let toastId = 0
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null

    function addToast(msg: string, kind: 'add' | 'delete' | 'save' | 'default' = 'default') {
        if (timeoutHandle) clearTimeout(timeoutHandle)

        const emojis = { add: '✅', delete: '🗑️', save: '💾', default: '📋' } as const
        const classes = {
            add: 'toast-add',
            delete: 'toast-delete',
            save: 'toast-save',
            default: 'toast-default',
        } as const

        toast.value = {
            id: toastId++,
            message: msg,
            emoji: emojis[kind],
            type: classes[kind],
            exiting: false,
        }

        timeoutHandle = setTimeout(() => (toast.value = null), 3000)
    }

    // === Coming Soon Overlay State (nicht schließbar) ===
    const comingSoon = ref(true)
</script>

<style scoped>
    .nutrition {
        position: relative; /* wichtig, damit das Overlay nur diesen Bereich bedeckt */
        padding: 2rem;
        background: var(--bg-primary);
        min-height: 100vh;
        overflow: hidden; /* verhindert Scrollen innerhalb der Seite, Navbar bleibt */
    }

    .chart-container {
        max-width: 400px;
        margin: 2rem auto;
    }

    .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
    }

    .search-input, .filter-select {
        padding: .5rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .meal-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .meal-card {
        background: var(--bg-card);
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: .2s;
    }

        .meal-card:hover {
            transform: translateY(-2px);
            border-color: var(--accent-primary);
            box-shadow: var(--shadow-hover);
        }

    .meal-info {
        font-size: .95rem;
        color: var(--text-primary);
    }

    .meal-kcal {
        font-weight: 700;
        color: var(--accent-primary);
    }

    .quick-add {
        margin-top: 1rem
    }

        .quick-add p {
            margin-bottom: .5rem;
            font-weight: 500
        }

        .quick-add .mini {
            font-size: .8rem;
            padding: .25rem .5rem
        }

    .progress-bar {
        height: 8px;
        background: var(--bg-progress-bar);
        border-radius: 4px;
        margin-top: .5rem;
    }

    .progress-bar-fill {
        height: 100%;
        background: var(--accent-primary);
        border-radius: 4px;
    }

    /* === COMING SOON OVERLAY: bedeckt NUR die Nutrition.vue, Navbar bleibt klickbar === */
    .coming-soon-overlay {
        position: absolute; /* innerhalb .nutrition */
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        animation: cs-fade .2s ease-out;
        pointer-events: all;
    }

    .coming-soon-card {
        width: 100%;
        max-width: 740px;
        text-align: center;
        padding: 3rem 2rem;
        border-radius: 24px;
        background: radial-gradient(1200px 400px at 50% -10%, rgba(59,130,246,.15), transparent 70%), radial-gradient(800px 300px at -10% 110%, rgba(16,185,129,.12), transparent 70%), var(--bg-card);
        border: 1px solid var(--border-color);
        box-shadow: 0 20px 60px rgba(0,0,0,.45);
        animation: cs-pop .25s cubic-bezier(.2,.8,.2,1);
        pointer-events: auto;
    }

    .cs-badge {
        display: inline-block;
        padding: .35rem .7rem;
        border-radius: 999px;
        font-size: .8rem;
        letter-spacing: .04em;
        background: rgba(59,130,246,.15);
        border: 1px solid rgba(59,130,246,.35);
        color: #9ec1ff;
        margin-bottom: .75rem;
    }

    .cs-title {
        font-size: clamp(2rem, 6vw, 4rem);
        font-weight: 900;
        margin: 0 0 .5rem 0;
        line-height: 1.05;
        background: linear-gradient(90deg, #60a5fa, #34d399, #f59e0b);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-shadow: 0 2px 30px rgba(96,165,250,.25);
    }

    .cs-sub {
        color: var(--text-secondary, #cbd5e1);
        margin-bottom: .25rem;
        font-size: 1rem;
    }

    @keyframes cs-pop {
        from {
            transform: scale(.96);
            opacity: .0
        }

        to {
            transform: scale(1);
            opacity: 1
        }
    }

    @keyframes cs-fade {
        from {
            opacity: 0
        }

        to {
            opacity: 1
        }
    }
</style>
