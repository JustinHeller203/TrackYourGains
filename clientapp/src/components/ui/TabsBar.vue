<!--Pfad: src/components/ui/TabsBar.vue-->

<template>
    <div class="tabs">
        <div class="tabs__segmented" role="tablist" aria-label="Ansicht wählen">
            <button class="tabs__tab"
                    role="tab"
                    :aria-selected="modelValue === 'stats' ? 'true' : 'false'"
                    :data-active="modelValue === 'stats'"
                    @click="$emit('update:modelValue', 'stats')">
                Statistiken
            </button>

            <button class="tabs__tab"
                    role="tab"
                    :aria-selected="modelValue === 'calculators' ? 'true' : 'false'"
                    :data-active="modelValue === 'calculators'"
                    @click="$emit('update:modelValue', 'calculators')">
                Rechner
            </button>

            <button class="tabs__tab"
                    role="tab"
                    :aria-selected="modelValue === 'plans' ? 'true' : 'false'"
                    :data-active="modelValue === 'plans'"
                    @click="$emit('update:modelValue', 'plans')">
                Pläne
            </button>
        </div>

        <div v-if="modelValue === 'calculators'" class="search-container calculators-search calc-search-wrap">
            <div class="search-field">
                <UiSearch v-model="calcSearchModel"
                          placeholder="Rechner suchen..."
                          ariaLabel="Rechner suchen"
                          :center="false"
                          maxWidth="100%" />

                <button class="filter-btn icon-only"
                        ref="filterBtnEl"
                        type="button"
                        aria-label="Kategorie Filter öffnen"
                        :aria-expanded="filterOpen ? 'true' : 'false'"
                        @click="toggleFilter">
                    <img src="/Filter.png" class="filter-icon" alt="" aria-hidden="true" />
                    <span class="sr-only">Kategorie</span>
                </button>

                <FilterMenu v-model:open="filterOpen"
                            v-model="calcCategoryModel"
                            title="Kategorie"
                            :anchorEl="filterBtnEl"
                            :items="categoryItems" />
            </div>
        </div>

        <div v-if="modelValue === 'plans'" class="search-container">
            <div class="search-field">
                <UiSearch v-model="planSearchModel"
                          placeholder="Pläne suchen..."
                          ariaLabel="Pläne suchen"
                          :center="false"
                          maxWidth="100%" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch, computed } from 'vue'
    import UiSearch from '@/components/ui/kits/UiSearch.vue'
    import FilterMenu from '@/components/ui/menu/FilterMenu.vue'

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
    const calcSearchModel = computed({
        get: () => props.searchQuery,
        set: (v: string) => emit('update:searchQuery', v),
    })

    const planSearchModel = computed({
        get: () => props.planSearchQuery,
        set: (v: string) => emit('update:planSearchQuery', v),
    })

    const filterOpen = ref(false)
    const filterBtnEl = ref<HTMLElement | null>(null)

    const calcCategoryModel = computed<CalcCategory>({
        get: () => (props.calcCategory ?? 'alle'),
        set: (v) => emit('update:calcCategory', v),
    })

    const categoryItems: Array<{ value: CalcCategory; label: string }> = [
        { value: 'alle', label: 'Alle' },
        { value: 'gesundheit', label: 'Gesundheit' },
        { value: 'kraft', label: 'Kraft' },
        { value: 'ernaehrung', label: 'Ernährung' },
        { value: 'alltag', label: 'Alltag' },
    ]

    function toggleFilter() {
        filterOpen.value = !filterOpen.value
    }

    function closeFilter() {
        filterOpen.value = false
    }

    watch(() => props.modelValue, () => {
        closeFilter()
    })

</script>

<style scoped>
    .tabs {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        column-gap: 1rem;
        row-gap: 1rem;
        align-items: center;
        width: 100%;
        margin-bottom: 2rem;
        margin-left: 0;
        margin-right: 0;
        padding-left: 0;
        padding-right: 0;
        --ui-search-max: 640px; /* <- cap auf wide screens */
    }

    .tabs__segmented {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        padding: .35rem;
        width: fit-content; /* <- shrink to content */
        max-width: 100%;
        justify-self: start; /* <- kein Grid-stretch */
        overflow: hidden; /* <- sauber bei kleinen Screens */

        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
        background: radial-gradient(circle at 18% 35%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), radial-gradient(circle at 85% 70%, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 86%, white 14%);
        box-shadow: 0 14px 40px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255,255,255,0.08);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
    }

    .tabs__tab {
        border: 0;
        background: transparent;
        color: color-mix(in srgb, var(--text-secondary) 92%, transparent);
        font-weight: 700;
        font-size: .95rem;
        padding: .62rem 1.05rem;
        border-radius: 999px;
        cursor: pointer;
        transition: transform .12s ease, background-color .12s ease, color .12s ease, box-shadow .12s ease;
        user-select: none;
        white-space: nowrap;
    }

        .tabs__tab:hover {
            color: var(--text-primary);
            background: color-mix(in srgb, var(--bg-secondary) 82%, white 18%);
            transform: translateY(-1px);
        }

        .tabs__tab[data-active="true"] {
            color: var(--text-primary);
            background: radial-gradient(circle at 18% 30%, color-mix(in srgb, var(--accent-primary) 22%, transparent), transparent 60%), color-mix(in srgb, var(--bg-secondary) 82%, white 18%);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
            border: 1px solid color-mix(in srgb, var(--accent-primary) 40%, transparent);
        }

        .tabs__tab:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 24%, transparent);
        }

    /* Dark Mode */
    html.dark-mode .tabs__segmented {
        background: radial-gradient(circle at 18% 35%, rgba(99,102,241,0.16), transparent 58%), radial-gradient(circle at 85% 70%, rgba(34,197,94,0.12), transparent 62%), rgba(2, 6, 23, 0.72);
        border-color: rgba(148, 163, 184, 0.22);
        box-shadow: 0 18px 55px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
    }

    html.dark-mode .tabs__tab:hover {
        background: rgba(30, 41, 59, 0.45);
    }

    html.dark-mode .tabs__tab[data-active="true"] {
        background: radial-gradient(circle at 18% 30%, rgba(99,102,241,0.22), transparent 60%), rgba(30, 41, 59, 0.55);
        border-color: rgba(99, 102, 241, 0.42);
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

    @media (max-width: 720px) {
        .tabs {
            grid-template-columns: 1fr;
            --ui-search-max: 100%;
        }

        .search-container {
            justify-self: stretch;
            max-width: 100%;
        }

        .search-grow {
            width: 100%;
            margin-left: 0;
        }
    }

        .search-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
            outline: none;
        }

    .calc-search-wrap {
        --ui-search-right-offset: 2.6rem; /* Platz für Filter-Button rechts */
    }

    .calculators-search {
        width: 100%;
        min-width: 0;
        justify-self: stretch;
        display: flex;
        justify-content: flex-end; /* <- bis ganz nach rechts */
    }

    .search-input.with-filter {
        width: 100%;
        padding-right: 3.1rem; /* Platz für Icon-Button */
    }

    .search-field {
        position: relative;
        width: 100%;
    }

    .filter-btn.icon-only {
        position: absolute;
        top: 50%;
        right: .5rem;
        transform: translateY(-50%);
        width: 2.35rem;
        height: 2.35rem;
        padding: 0;
        border-radius: 10px;
        border: none;
        background: transparent;
        box-shadow: none;
        justify-content: center;
        gap: 0;
    }


        .filter-btn.icon-only:hover {
            transform: translateY(-50%) translateY(-1px);
        }

    .filter-icon {
        width: 1.15rem;
        height: 1.15rem;
        display: block;
        /* macht dunkles PNG-Icon weiß */
        filter: brightness(0) invert(1);
        opacity: .95;
    }

    .filter-btn.icon-only:hover {
        background: var(--bg-hover);
    }

    .filter-btn.icon-only:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
    }


    /* Screenreader-only */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
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


    /* optional, aber hilft falls Grid/Flex gemischt ist */
    .search-container,
    .calculators-search {
        min-width: 0;
    }

    .search-container {
        width: 100%;
        min-width: 0;
        justify-self: stretch; /* füllt die ganze Grid-Spalte bis ganz rechts */
    }

    .search-field {
        position: relative; /* <- anchor for absolute filter button */
        width: min(var(--ui-search-max), 100%);
        margin-left: auto; /* <- schiebt das Feld ganz nach rechts */
    }

</style>
