<!--Nutrition.vue-->
<template>
    <div class="nutrition">
        <h2 class="page-title">🍽️ Ernährung</h2>
        <p class="page-subtext">Tracke deine Mahlzeiten, Makros & Ziele</p>

        <!-- === Dashboard-Cards mit Balken === -->
        <div class="dashboard-grid">
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
        <div class="chart-container card-surface">
            <div class="card-head">
                <h3 class="card-title">Makro-Verteilung</h3>
                <span class="card-tag">Heute</span>
            </div>
            <canvas id="macroChart"></canvas>
        </div>

        <!-- === Aktionen === -->
        <div class="actions">
            <div class="actions-left">
                <button class="btn-primary" @click="openMealPopup">+ Neue Mahlzeit</button>
                <button class="btn-ghost" @click="openExportPopup">⬇️ Exportieren</button>
            </div>
            <div class="actions-right">
                <select v-model="filter" class="filter-select">
                    <option value="">Alle</option>
                    <option value="protein">Proteinbomben (>30g)</option>
                    <option value="carbs">High Carb (>50g)</option>
                </select>
                <input v-model="search" placeholder="Mahlzeit suchen..." class="search-input" />
            </div>
        </div>

        <div class="quick-add">
            <p>Quick-Add</p>
            <div class="quick-list">
                <button v-for="q in quickMeals"
                        :key="q.name"
                        class="quick-pill"
                        @click="quickAdd(q)">
                    {{ q.name }}
                </button>
            </div>
        </div>

        <!-- === Liste der Mahlzeiten === -->
        <div v-if="filteredMeals.length" class="meal-list">
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
        <p v-else class="no-meals">Noch keine Mahlzeiten eingetragen.</p>

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

</script>

<style scoped>
    .nutrition {
        position: relative;
        padding: 2.4rem 1.8rem 3rem;
        background: radial-gradient(1200px 700px at 15% -5%, rgba(99, 102, 241, 0.15), transparent 60%),
                    radial-gradient(1000px 700px at 85% 10%, rgba(16, 185, 129, 0.12), transparent 60%);
        min-height: 100vh;
        overflow: visible;
    }

    .page-title {
        font-size: 2.3rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: .2rem;
        letter-spacing: -0.02em;
        color: var(--text-primary);
    }

    .page-subtext {
        text-align: center;
        color: var(--text-secondary);
        margin-bottom: 1.8rem;
    }

    .card-surface {
        border-radius: 18px;
        padding: 1rem 1.2rem 1.2rem;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%),
                    radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%),
                    color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
    }

    .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        margin-bottom: .5rem;
    }

    .card-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
    }

    .card-tag {
        font-size: .72rem;
        text-transform: uppercase;
        letter-spacing: .14em;
        padding: .25rem .55rem;
        border-radius: 999px;
        background: rgba(129, 140, 248, 0.18);
        color: var(--text-primary);
        border: 1px solid rgba(129, 140, 248, 0.4);
    }

    .chart-container {
        max-width: 520px;
        margin: 1.8rem auto 1.4rem;
    }

    .actions {
        display: grid;
        grid-template-columns: 1fr;
        gap: .9rem;
        margin: 1.2rem 0 1rem;
    }

    .actions-left,
    .actions-right {
        display: flex;
        gap: .8rem;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
    }

    .btn-primary,
    .btn-ghost {
        height: 42px;
        padding: 0 1.25rem;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
        border: 1px solid rgba(148, 163, 184, 0.26);
        transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease;
    }

    .btn-primary {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #fff;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.25);
    }

    .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.32);
    }

    .btn-ghost {
        background: transparent;
        color: var(--text-primary);
    }

    .btn-ghost:hover {
        border-color: rgba(129, 140, 248, 0.55);
        transform: translateY(-1px);
    }

    .search-input,
    .filter-select {
        height: 42px;
        padding: 0 .85rem;
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 10px;
        background: color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        color: var(--text-primary);
        min-width: 200px;
    }

    .meal-list {
        display: grid;
        gap: 1rem;
        margin-top: .5rem;
    }

    .meal-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 55%),
                    radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 60%),
                    color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        padding: 1.1rem 1.2rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 1rem;
        align-items: center;
        transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
    }

        .meal-card:hover {
            transform: translateY(-2px);
            border-color: rgba(129, 140, 248, 0.55);
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.28);
        }

    .meal-info {
        font-size: .95rem;
        color: var(--text-primary);
    }

    .meal-kcal {
        font-weight: 700;
        color: var(--accent-primary);
    }

    .entry-actions {
        display: flex;
        gap: .5rem;
    }

    .edit-btn,
    .delete-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: transparent;
        cursor: pointer;
        transition: transform .15s ease, border-color .2s ease;
    }

    .delete-btn:hover {
        border-color: rgba(239, 68, 68, 0.5);
    }

    .quick-add {
        margin-top: .25rem;
        display: grid;
        gap: .5rem;
        text-align: center;
    }

    .quick-add p {
        margin: 0;
        font-weight: 800;
        color: var(--text-secondary);
        letter-spacing: .08em;
        text-transform: uppercase;
        font-size: .78rem;
    }

    .quick-list {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
        justify-content: center;
    }

    .quick-pill {
        padding: .45rem .8rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        font-weight: 700;
        cursor: pointer;
        transition: transform .15s ease, border-color .2s ease;
    }

    .quick-pill:hover {
        transform: translateY(-1px);
        border-color: rgba(129, 140, 248, 0.5);
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

    @media (max-width: 720px) {
        .meal-card {
            grid-template-columns: 1fr;
            align-items: start;
        }

        .actions-left,
        .actions-right {
            justify-content: center;
        }
    }
</style>
