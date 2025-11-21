<template>
    <form @submit.prevent="submit" class="form-card">
        <input v-model="name" placeholder="Mahlzeit (z.B. HÃ¤hnchen mit Reis)" />
        <input v-model.number="calories" placeholder="Kalorien" type="number" />
        <input v-model.number="protein" placeholder="Protein (g)" type="number" />
        <input v-model.number="carbs" placeholder="Kohlenhydrate (g)" type="number" />
        <input v-model.number="fat" placeholder="Fett (g)" type="number" />
        <button type="submit">Speichern</button>
    </form>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import type { Meal } from '@/types/Meal'

    const emit = defineEmits<{
        (e: 'save', meal: Meal): void
    }>()

    const name = ref('')
    const calories = ref(0)
    const protein = ref(0)
    const carbs = ref(0)
    const fat = ref(0)

    const submit = () => {
        if (name.value && calories.value) {
            emit('save', {
                name: name.value,
                calories: calories.value,
                protein: protein.value,
                carbs: carbs.value,
                fat: fat.value,
                date: new Date().toISOString()
            })
            name.value = ''
            calories.value = 0
            protein.value = 0
            carbs.value = 0
            fat.value = 0
        }
    }
</script>

<style scoped>
    .form-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        transition: transform 0.3s, box-shadow 0.3s;
    }

        .form-card.dark-mode {
            background: #21262d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .form-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
        }

        .form-card input {
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            flex: 1;
            min-width: 120px;
            font-size: 0.9rem;
            color: var(--text-primary);
            background: var(--bg-secondary);
            transition: border-color 0.3s;
        }

        .form-card.dark-mode input {
            color: #f0f6fc;
            background: #161b22;
            border-color: #30363d;
        }

        .form-card input:focus {
            outline: none;
            border-color: var(--accent-primary);
        }

        .form-card.dark-mode input:focus {
            border-color: #6B8DD6;
        }

        .form-card button {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: #FFFFFF;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.3s, background 0.3s;
        }

        .form-card.dark-mode button {
            background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        }

        .form-card button:hover {
            transform: scale(1.05);
            opacity: 0.9;
            background: var(--accent-hover);
        }

        .form-card.dark-mode button:hover {
            background: #5a7bc4;
        }
</style>