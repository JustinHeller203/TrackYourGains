<template>
    <div class="tabs">
        <button class="tab"
                :class="{ active: modelValue === 'stats' }"
                @click="$emit('update:modelValue', 'stats')">
            Statistiken
        </button>

        <button class="tab"
                :class="{ active: modelValue === 'calculators' }"
                @click="$emit('update:modelValue', 'calculators')">
            Rechner
        </button>

        <button class="tab"
                :class="{ active: modelValue === 'plans' }"
                @click="$emit('update:modelValue', 'plans')">
            Pläne
        </button>

        <div v-if="modelValue === 'calculators'" class="search-container">
            <input :value="searchQuery"
                   @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
                   type="text"
                   placeholder="Rechner suchen..."
                   class="search-input" />
        </div>

        <div v-if="modelValue === 'plans'" class="search-container">
            <input :value="planSearchQuery"
                   @input="$emit('update:planSearchQuery', ($event.target as HTMLInputElement).value)"
                   type="text"
                   placeholder="Pläne suchen..."
                   class="search-input" />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'stats' | 'calculators' | 'plans'
  searchQuery: string
  planSearchQuery: string
}>()

defineEmits<{
  (e: 'update:modelValue', v: 'stats' | 'calculators' | 'plans'): void
  (e: 'update:searchQuery', v: string): void
  (e: 'update:planSearchQuery', v: string): void
}>()
</script>

<style scoped>
    .tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        align-items: center;
    }

    .tab {
        padding: 0.75rem 1.5rem;
        border: none;
        background: var(--bg-secondary);
        color: var(--text-secondary);
        font-size: 1rem;
        font-weight: 500;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s, color 0.3s, transform 0.2s;
    }

        .tab:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
        }

        .tab.active {
            background: var(--accent-primary);
            color: #fff;
            transform: translateY(-2px);
        }

    .search-container {
        position: relative;
        flex: 1;
        max-width: 300px;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

        .search-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
            outline: none;
        }
</style>
