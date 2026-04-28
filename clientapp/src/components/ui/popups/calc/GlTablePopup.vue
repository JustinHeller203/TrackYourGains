<template>
    <BasePopup :show="isOpen"
               :title="t('glTable.title')"
               overlay-class="calc-gl-table-popup"
               :show-actions="false"
               @cancel="close()">

        <div class="glp">
            <div class="glp-scroll" role="region" :aria-label="t('glTable.contentAria')">
                <div class="glp-text">
                    {{ t('glTable.introBeforeApply') }} <strong>{{ t('glTable.apply') }}</strong> {{ t('glTable.introAfterApply') }}
                    <strong>GI</strong>, <strong>{{ t('glTable.carbsPer100') }}</strong> {{ t('glTable.introAnd') }}
                    <strong>{{ t('glTable.portion100') }}</strong>.
                    {{ t('glTable.introAdjust') }}
                </div>

                <div class="glp-tools">
                    <input class="glp-search"
                           v-model="query"
                           type="text"
                           :placeholder="t('glTable.searchPlaceholder')"
                           autocomplete="off" />

                    <button class="glp-clear"
                            type="button"
                            @click="query = ''"
                            :disabled="!query.trim()">
                        {{ t('common.reset') }}
                    </button>
                </div>

                <div class="glp-grid" role="list" :aria-label="t('glTable.listAria')">
                    <div v-for="item in filtered"
                         :key="item.key"
                         class="glp-row"
                         role="listitem">
                        <div class="glp-row-main">
                            <div class="glp-food">{{ getItemLabel(item) }}</div>
                            <div class="glp-meta">
                                <span class="glp-pill">GI: <strong>{{ item.gi }}</strong></span>
                                <span class="glp-pill">{{ t('glTable.carbsPer100') }}: <strong>{{ item.carbs100 }}g</strong></span>
                                <span v-if="getItemNote(item)" class="glp-pill glp-pill--muted">{{ getItemNote(item) }}</span>
                            </div>
                        </div>

                        <button class="glp-apply"
                                type="button"
                                @click="apply(item)">
                            {{ t('glTable.apply') }}
                        </button>
                    </div>

                    <div v-if="!filtered.length" class="glp-empty">
                        {{ t('glTable.empty') }}
                    </div>
                </div>

                <div class="glp-note">
                    {{ t('glTable.noteStart') }} <strong>{{ t('glTable.guidelines') }}</strong>.
                    {{ t('glTable.noteEnd') }}
                </div>
            </div>
        </div>

    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import BasePopup from '../BasePopup.vue'
    import { useI18n } from '@/composables/useI18n'

    export type GlTableItem = {
        key: string
        labelKey: string
        gi: number
        carbs100: number
        noteKey?: string
    }

    const emit = defineEmits<{
        (e: 'apply', item: GlTableItem): void
    }>()

    const { t } = useI18n()

    const isOpen = ref(false)
    const query = ref('')

    const table: GlTableItem[] = [
        { key: 'banana', labelKey: 'glTable.food.banana', gi: 55, carbs100: 23, noteKey: 'glTable.note.ripenessVaries' },
        { key: 'apple', labelKey: 'glTable.food.apple', gi: 36, carbs100: 14 },
        { key: 'oats', labelKey: 'glTable.food.oats', gi: 55, carbs100: 60, noteKey: 'glTable.note.preparationVaries' },
        { key: 'white_rice', labelKey: 'glTable.food.whiteRice', gi: 73, carbs100: 28, noteKey: 'glTable.note.typeVaries' },
        { key: 'basmati', labelKey: 'glTable.food.basmati', gi: 55, carbs100: 25 },
        { key: 'pasta_al_dente', labelKey: 'glTable.food.pastaAlDente', gi: 50, carbs100: 30 },
        { key: 'bread_white', labelKey: 'glTable.food.whiteBread', gi: 75, carbs100: 49 },
        { key: 'bread_rye', labelKey: 'glTable.food.ryeBread', gi: 55, carbs100: 48 },
        { key: 'potato_boiled', labelKey: 'glTable.food.boiledPotatoes', gi: 80, carbs100: 17, noteKey: 'glTable.note.cooledLower' },
        { key: 'sweet_potato', labelKey: 'glTable.food.sweetPotato', gi: 60, carbs100: 20 },
        { key: 'cornflakes', labelKey: 'glTable.food.cornflakes', gi: 81, carbs100: 84 },
        { key: 'milk', labelKey: 'glTable.food.milk', gi: 30, carbs100: 5 },
        { key: 'yogurt', labelKey: 'glTable.food.yogurt', gi: 35, carbs100: 5 },
    ]

    const filtered = computed(() => {
        const q = query.value.trim().toLowerCase()
        if (!q) return table

        return table.filter((item) => {
            const label = getItemLabel(item).toLowerCase()
            const note = getItemNote(item).toLowerCase()
            return label.includes(q) || note.includes(q)
        })
    })

    function getItemLabel(item: GlTableItem) {
        return t(item.labelKey)
    }

    function getItemNote(item: GlTableItem) {
        return item.noteKey ? t(item.noteKey) : ''
    }

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
