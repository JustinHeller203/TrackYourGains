<template>
    <BasePopup :show="isOpen"
               title="📚 TYG GL Tabelle (Richtwerte)"
               overlay-class="calc-gl-table-popup"
               :show-actions="false"
               @cancel="close()">

        <div class="glp">
            <div class="glp-scroll" role="region" aria-label="GL Tabelle Inhalt">
                <div class="glp-text">
                    Such dir ein Food → klick auf <strong>Übernehmen</strong> → wir setzen automatisch
                    <strong>GI</strong>, <strong>KH/100g</strong> und als Start <strong>Portion 100g</strong>.
                    Danach passt du die Portion einfach auf deine echte Menge an.
                </div>

                <div class="glp-tools">
                    <input class="glp-search"
                           v-model="query"
                           type="text"
                           placeholder="Suchen… z. B. Banane, Reis, Pasta, Hafer"
                           autocomplete="off" />

                    <button class="glp-clear"
                            type="button"
                            @click="query = ''"
                            :disabled="!query.trim()">
                        Reset
                    </button>
                </div>

                <div class="glp-grid" role="list" aria-label="GL Tabelle">
                    <div v-for="item in filtered"
                         :key="item.key"
                         class="glp-row"
                         role="listitem">
                        <div class="glp-row-main">
                            <div class="glp-food">{{ item.label }}</div>
                            <div class="glp-meta">
                                <span class="glp-pill">GI: <strong>{{ item.gi }}</strong></span>
                                <span class="glp-pill">KH/100g: <strong>{{ item.carbs100 }}g</strong></span>
                                <span v-if="item.note" class="glp-pill glp-pill--muted">{{ item.note }}</span>
                            </div>
                        </div>

                        <button class="glp-apply"
                                type="button"
                                @click="apply(item)">
                            Übernehmen
                        </button>
                    </div>

                    <div v-if="!filtered.length" class="glp-empty">
                        Kein Treffer 😅 — Tipp: versuch “Reis”, “Brot”, “Banane”, “Pasta”, “Hafer”.
                    </div>
                </div>

                <div class="glp-note">
                    Hinweis: Das sind <strong>Richtwerte</strong>. Wenn du eine spezifische Marke/Sorte hast,
                    kann’s abweichen. Für’s Vergleichen reicht’s aber locker.
                </div>
            </div>
        </div>

    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import BasePopup from '../BasePopup.vue'

    export type GlTableItem = {
        key: string
        label: string
        gi: number
        carbs100: number
        note?: string
    }

    const emit = defineEmits<{
        (e: 'apply', item: GlTableItem): void
    }>()

    const isOpen = ref(false)
    const query = ref('')

    // Du kannst die Liste später easy erweitern (oder per Props reinreichen)
    const table: GlTableItem[] = [
        { key: 'banana', label: 'Banane', gi: 55, carbs100: 23, note: 'Reife schwankt' },
        { key: 'apple', label: 'Apfel', gi: 36, carbs100: 14 },
        { key: 'oats', label: 'Haferflocken', gi: 55, carbs100: 60, note: 'je nach Zubereitung' },
        { key: 'white_rice', label: 'Reis (weiß, gekocht)', gi: 73, carbs100: 28, note: 'Sorte schwankt' },
        { key: 'basmati', label: 'Basmati (gekocht)', gi: 55, carbs100: 25 },
        { key: 'pasta_al_dente', label: 'Pasta (al dente)', gi: 50, carbs100: 30 },
        { key: 'bread_white', label: 'Weißbrot', gi: 75, carbs100: 49 },
        { key: 'bread_rye', label: 'Roggenbrot', gi: 55, carbs100: 48 },
        { key: 'potato_boiled', label: 'Kartoffeln (gekocht)', gi: 80, carbs100: 17, note: 'abgekühlt oft niedriger' },
        { key: 'sweet_potato', label: 'Süßkartoffel (gekocht)', gi: 60, carbs100: 20 },
        { key: 'cornflakes', label: 'Cornflakes', gi: 81, carbs100: 84 },
        { key: 'milk', label: 'Milch', gi: 30, carbs100: 5 },
        { key: 'yogurt', label: 'Joghurt (natur)', gi: 35, carbs100: 5 },
    ]

    const filtered = computed(() => {
        const q = query.value.trim().toLowerCase()
        if (!q) return table
        return table.filter(x => x.label.toLowerCase().includes(q))
    })

    function open() {
        isOpen.value = true
    }

    function close() {
        isOpen.value = false
        query.value = ''
    }

    function apply(item: GlTableItem) {
        emit('apply', item)
        close()
    }

    defineExpose({ open, close })
</script>

<style scoped>
    /* Popup kleiner + responsiv (wir targeten deine overlay-class) */
    :global(.calc-gl-table-popup .popup-card),
    :global(.calc-gl-table-popup .base-popup-card),
    :global(.calc-gl-table-popup .popup),
    :global(.calc-gl-table-popup .modal) {
        width: min(720px, calc(100vw - 28px));
        max-width: 720px;
    }

    @media (max-width: 560px) {
        :global(.calc-gl-table-popup .popup-card),
        :global(.calc-gl-table-popup .base-popup-card),
        :global(.calc-gl-table-popup .popup),
        :global(.calc-gl-table-popup .modal) {
            width: calc(100vw - 18px);
        }
    }

    .glp {
        display: grid;
        gap: .65rem;
        padding: .1rem;
    }

    /* der eigentliche Scroll-Container im Popup */
    .glp-scroll {
        max-height: min(62vh, 520px);
        overflow: auto;
        padding-right: 6px; /* Platz für Scrollbar */
        overscroll-behavior: contain;
    }

        /* nicer Scrollbar (optional, aber sieht clean aus) */
        .glp-scroll::-webkit-scrollbar {
            width: 10px;
        }

        .glp-scroll::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(148, 163, 184, 0.28);
            border: 3px solid transparent;
            background-clip: padding-box;
        }

        .glp-scroll::-webkit-scrollbar-track {
            background: transparent;
        }

    @media (max-width: 560px) {
        .glp-scroll {
            max-height: min(72vh, 560px);
            padding-right: 2px;
        }
    }


    .glp-text {
        font-size: .92rem;
        line-height: 1.45;
        color: var(--text-primary);
    }

    @media (max-width: 560px) {
        .glp-text {
            font-size: .9rem;
        }
    }

    .glp-tools {
        display: flex;
        gap: .5rem;
        align-items: center;
        margin: .15rem 0 .2rem;
    }

    .glp-search {
        flex: 1;
        padding: .65rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
        color: var(--text-primary);
        outline: none;
    }

        .glp-search:focus {
            border-color: rgba(129, 140, 248, 0.7);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
        }

    .glp-clear {
        padding: .65rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-secondary) 75%, transparent);
        color: var(--text-primary);
        cursor: pointer;
    }

        .glp-clear:disabled {
            opacity: .45;
            cursor: not-allowed;
        }

    .glp-grid {
        display: grid;
        gap: .55rem;
    }

    .glp-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .7rem;
        padding: .75rem .8rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: color-mix(in srgb, var(--bg-secondary) 84%, transparent);
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
    }

    .glp-row-main {
        min-width: 0;
    }

    .glp-food {
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: .25rem;
    }

    .glp-meta {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
    }

    .glp-pill {
        display: inline-flex;
        align-items: center;
        padding: .28rem .5rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(255, 255, 255, 0.04);
        font-size: .78rem;
        color: var(--text-primary);
    }

    .glp-pill--muted {
        opacity: .75;
    }

    .glp-apply {
        flex: 0 0 auto;
        padding: .55rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(129, 140, 248, 0.35);
        background: color-mix(in srgb, var(--accent-primary) 22%, transparent);
        color: var(--text-primary);
        cursor: pointer;
    }

        .glp-apply:hover {
            border-color: rgba(129, 140, 248, 0.7);
        }

    .glp-empty {
        padding: .85rem .8rem;
        border-radius: 14px;
        border: 1px dashed rgba(148, 163, 184, 0.25);
        color: var(--text-secondary);
        background: rgba(255, 255, 255, 0.03);
    }

    .glp-note {
        font-size: .85rem;
        color: var(--text-secondary);
        padding-top: .1rem;
    }

    @media (max-width: 560px) {
        .glp-row {
            flex-direction: column;
            align-items: stretch;
        }

        .glp-apply {
            width: 100%;
        }
    }
</style>
