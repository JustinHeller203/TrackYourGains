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

            <button class="filter-btn"
                    type="button"
                    aria-label="Kategorie Filter öffnen"
                    :aria-expanded="filterOpen ? 'true' : 'false'"
                    @click="filterOpen = !filterOpen">
                Kategorie
                <span class="filter-caret">▾</span>
            </button>

            <div v-if="filterOpen" class="filter-overlay" @mousedown.self="filterOpen = false">
                <div class="filter-panel" role="menu" aria-label="Kategorie wählen">
                    <button class="filter-item"
                            role="menuitem"
                            :data-active="(props.calcCategory ?? 'alle') === 'alle'"
                            @click="setCategory('alle')">
                        Alle
                    </button>

                    <button class="filter-item"
                            role="menuitem"
                            :data-active="props.calcCategory === 'gesundheit'"
                            @click="setCategory('gesundheit')">
                        Gesundheit
                    </button>

                    <button class="filter-item"
                            role="menuitem"
                            :data-active="props.calcCategory === 'kraft'"
                            @click="setCategory('kraft')">
                        Kraft
                    </button>

                    <button class="filter-item"
                            role="menuitem"
                            :data-active="props.calcCategory === 'ernaehrung'"
                            @click="setCategory('ernaehrung')">
                        Ernährung
                    </button>

                    <button class="filter-item"
                            role="menuitem"
                            :data-active="props.calcCategory === 'alltag'"
                            @click="setCategory('alltag')">
                        Alltag
                    </button>
                </div>
            </div>
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
    import { ref, watch } from 'vue'

    type CalcCategory = 'alle' | 'gesundheit' | 'kraft' | 'ernaehrung' | 'alltag'

    const props = defineProps<{
        modelValue: 'stats' | 'calculators' | 'plans'
        searchQuery: string
        planSearchQuery: string
        calcCategory?: CalcCategory
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: 'stats' | 'calculators' | 'plans'): void
        (e: 'update:searchQuery', v: string): void
        (e: 'update:planSearchQuery', v: string): void
        (e: 'update:calcCategory', v: CalcCategory): void
    }>()

    const filterOpen = ref(false)

    function setCategory(v: CalcCategory) {
        emit('update:calcCategory', v)
        filterOpen.value = false
    }

    watch(() => props.modelValue, () => {
        filterOpen.value = false
    })

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

    .search-container {
        display: flex;
        align-items: center;
        gap: .75rem;
        flex: 1;
        max-width: 520px; /* bisschen mehr Platz für Button */
    }

    .search-input {
        flex: 1;
    }

    .filter-btn {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        cursor: pointer;
        transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
        white-space: nowrap;
    }

        .filter-btn:hover {
            border-color: var(--accent-primary);
            transform: translateY(-1px);
        }

    .filter-caret {
        opacity: .8;
    }

    .filter-overlay {
        position: fixed;
        inset: 0;
        z-index: 999;
    }

    .filter-panel {
        position: absolute;
        right: 1rem;
        top: 4.6rem; /* falls’s nicht sitzt: runter/hoch schieben */
        width: min(260px, calc(100vw - 2rem));
        padding: .6rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        box-shadow: 0 18px 60px rgba(0,0,0,.25);
        display: grid;
        gap: .35rem;
    }

    .filter-item {
        text-align: left;
        padding: .65rem .75rem;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: var(--text-color);
        cursor: pointer;
    }

        .filter-item:hover {
            background: var(--bg-hover);
        }

        .filter-item[data-active="true"] {
            background: var(--accent-primary);
            color: #fff;
        }

</style>
