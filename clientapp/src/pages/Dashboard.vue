<template>
    <div class="dashboard">
        <h2 class="page-title">Willkommen, Champion! 🏆</h2>
        <p class="page-subtext">Hier ist dein Fortschritt auf einen Blick:</p>
        <div class="dashboard-grid">
            <div class="card">
                <h3 class="card-title">Letztes Training</h3>
                <p class="card-info">{{ lastWorkout || 'Kein Training erfasst' }}</p>
            </div>
            <div class="card">
                <h3 class="card-title">Kalorien heute</h3>
                <p class="card-info">{{ totalCalories }} / 2500 kcal</p>
            </div>
            <div class="card">
                <h3 class="card-title">Aktuelles Gewicht</h3>
                <p class="card-info">{{ currentWeight }} kg</p>
            </div>
            <div class="card">
                <h3 class="card-title">Ziel</h3>
                <p class="card-info">Lean Bulk bis 80 kg 💪</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'

    const workouts = ref([
        { exercise: 'Bankdrücken', weight: 80, reps: 8 },
        { exercise: 'Kniebeuge', weight: 100, reps: 10 }
    ])

    const meals = ref([
        { name: 'Frühstück', calories: 600 },
        { name: 'Mittagessen', calories: 850 },
        { name: 'Snack', calories: 300 }
    ])

    const weightHistory = ref([
        { date: '2025-05-28', weight: 76.4 },
        { date: '2025-05-27', weight: 76.2 }
    ])

    const lastWorkout = computed(() =>
        workouts.value.length
            ? `${workouts.value[0].exercise} – ${workouts.value[0].weight}kg x ${workouts.value[0].reps} Wdh`
            : null
    )

    const totalCalories = computed(() =>
        meals.value.reduce((sum, meal) => sum + meal.calories, 0)
    )

    const currentWeight = computed(() =>
        weightHistory.value.length ? weightHistory.value[0].weight : 'N/A'
    )
</script>

<style scoped>
    .dashboard {
        padding: 2rem 0;
    }

    .page-title {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #4B6CB7, #182848);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1.5rem;
    }

    .page-subtext {
        color: #4A5568;
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
    }

    .card {
        background: #FFFFFF;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s, box-shadow 0.3s;
    }

        .card:hover {
            transform: translateY(-6px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

    .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: #2D3748;
    }

    .card-info {
        color: #4A5568;
        font-size: 1rem;
    }
</style>