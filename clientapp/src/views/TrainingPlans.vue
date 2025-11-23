<template>
    <div class="plans">
        <h2 class="page-title">?? Trainingspl�ne</h2>

        <input v-model="q" placeholder="Suche (Name oder Ziel)" class="plan-search-input" />

        <div v-if="!filtered.length" class="empty">
            Noch keine Pl�ne gespeichert. Erstelle sie unter �Training�.
        </div>

        <div v-else class="plan-list">
            <div v-for="p in filtered" :key="p.id" class="plan-item">
                <div class="info">
                    <strong>{{ p.name }}</strong>
                    <small>{{ p.exercises.length }} �bungen</small>
                </div>
                <button class="open-btn" @click="openInTraining(p.id)">�ffnen</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface PlanExercise { exercise: string; sets: number; reps: number; goal?: string }
interface TrainingPlan { id: string; name: string; exercises: PlanExercise[] }

const router = useRouter()
const plans = ref<TrainingPlan[]>([])
const q = ref('')

const load = () => {
  try {
    const raw = localStorage.getItem('trainingData')
    plans.value = raw ? (JSON.parse(raw).plans ?? []) : []
  } catch {
    plans.value = []
  }
}

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return plans.value
  return plans.value.filter(p =>
    p.name.toLowerCase().includes(s) ||
    p.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(s))
  )
})

const openInTraining = (id: string) => {
  localStorage.setItem('trainingOpenPlanId', id)
  // an deine Routen anpassen:
  try { router.push({ name: 'Training' }) } catch { router.push('/training') }
}

const onStorage = (e: StorageEvent) => {
  if (e.key === 'trainingData') load()
}

onMounted(() => {
  load()
  window.addEventListener('storage', onStorage)
})

onUnmounted(() => window.removeEventListener('storage', onStorage))
</script>

<style scoped>
    .plans {
        max-width: 900px;
        margin: 0 auto;
        padding: 1rem;
    }

    .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 1rem;
    }

    .plan-search-input {
        width: 100%;
        padding: .75rem;
        border-radius: .5rem;
        border: 1px solid var(--border-color);
        margin-bottom: 1rem;
    }

    .plan-list {
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }

    .plan-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-card);
        padding: 1rem;
        border-radius: .5rem;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: .25rem;
    }

    .open-btn {
        background: #10b981;
        color: #fff;
        border: 0;
        border-radius: .5rem;
        padding: .5rem .9rem;
        cursor: pointer;
    }

    .empty {
        text-align: center;
        opacity: .7;
        padding: 1rem;
    }
</style>
