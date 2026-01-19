<!--Pfad: components/ui/popups/ActionSelectPopup.vue-->
<template>
    <BasePopup :show="show"
               :title="title"
               :overlayClass="overlayClass"
               :variant="variant"
               :zIndex="zIndex"
               :showActions="true"
               :showClose="true"
               @cancel="emitCancel">

        <div class="asp-body" @keydown.esc.prevent="emitCancel" tabindex="-1" ref="bodyEl">
            <div v-if="subtitle" class="asp-sub">{{ subtitle }}</div>

            <label v-if="showAllOption && mode === 'multi'" class="asp-all">
                <input class="asp-input asp-check"
                       type="checkbox"
                       :checked="allSelected"
                       @change="toggleAll" />
                <span class="asp-all-label">{{ allLabelResolved }}</span>
            </label>

            <div class="asp-list" role="list">
                <label v-for="row in rows"
                       :key="row.id"
                       class="asp-row"
                       role="listitem"
                       :data-disabled="isDisabled(row) ? 'true' : 'false'">
                    <input v-if="mode === 'multi'"
                           class="asp-input asp-check"
                           type="checkbox"
                           :disabled="isDisabled(row)"
                           :checked="selectedSet.has(row.id)"
                           @change="toggleMulti(row.id, $event)" />

                    <input v-else
                           class="asp-input asp-radio"
                           type="radio"
                           name="asp-single"
                           :disabled="isDisabled(row)"
                           :checked="selectedSet.has(row.id)"
                           @change="toggleSingle(row.id)" />

                    <span class="asp-left">{{ row.label }}</span>
                    <span v-if="row.value" class="asp-right">{{ row.value }}</span>
                </label>
            </div>

            <div v-if="helper" class="asp-helper">{{ helper }}</div>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="emitCancel">
                {{ cancelTextResolved }}
            </PopupActionButton>

            <PopupActionButton :disabled="confirmDisabled"
                               :danger="!!confirmDanger"
                               @click="emitConfirm">
                {{ confirmTextResolved }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    export type ActionSelectRow = {
        id: string
        label: string
        value?: string
        disabled?: boolean
    }

    const props = defineProps<{
        show: boolean
        title: string
        subtitle?: string
        helper?: string

        rows: ActionSelectRow[]

        selectionMode?: 'multi' | 'single'

        showAllOption?: boolean
        allLabel?: string

        selectedIds: string[]
        allSelected: boolean

        cancelText?: string
        confirmText?: string
        confirmDanger?: boolean

        // wenn true: bei Multi darf Confirm auch ohne Auswahl (z.B. "Alle" an)
        allowEmptyConfirm?: boolean
        zIndex?: number

        // optional: damit du per Use-case stylen kannst
        overlayClass?: string | string[] | Record<string, boolean>
        variant?: string
    }>()

    const emit = defineEmits<{
        (e: 'cancel'): void
        (e: 'confirm', payload: { all: boolean; ids: string[] }): void
        (e: 'update:selectedIds', ids: string[]): void
        (e: 'update:allSelected', v: boolean): void
    }>()

    const bodyEl = ref<HTMLElement | null>(null)
    const selectedSet = ref(new Set<string>())

    const mode = computed(() => props.selectionMode ?? 'multi')
    const allLabelResolved = computed(() => props.allLabel ?? 'Alle auswählen')
    const cancelTextResolved = computed(() => props.cancelText ?? 'Abbrechen')
    const confirmTextResolved = computed(() => props.confirmText ?? 'OK')

    const syncFromProps = () => {
        selectedSet.value = new Set(props.selectedIds || [])
    }

    watch(() => props.selectedIds, syncFromProps, { immediate: true })

    watch(() => props.show, async (v) => {
        if (!v) return
        syncFromProps()
        await nextTick()
        bodyEl.value?.focus()
    })

    const isDisabled = (row: ActionSelectRow) => {
        if (row.disabled) return true
        if (mode.value === 'multi' && props.allSelected) return true
        return false
    }

    const toggleAll = (e: Event) => {
        const v = (e.target as HTMLInputElement).checked
        emit('update:allSelected', v)
        if (v) emit('update:selectedIds', [])
    }

    const toggleMulti = (id: string, e: Event) => {
        if (props.allSelected) return
        const checked = (e.target as HTMLInputElement).checked
        const s = new Set(selectedSet.value)
        if (checked) s.add(id)
        else s.delete(id)
        selectedSet.value = s
        emit('update:selectedIds', Array.from(s))
    }

    const toggleSingle = (id: string) => {
        if (props.allSelected) return
        const s = new Set<string>()
        s.add(id)
        selectedSet.value = s
        emit('update:selectedIds', [id])
    }

    const confirmDisabled = computed(() => {
        if (props.allowEmptyConfirm) return false
        if (props.allSelected) return false
        return (props.selectedIds?.length ?? 0) === 0
    })

    const emitCancel = () => emit('cancel')

    const emitConfirm = () => {
        emit('confirm', {
            all: !!props.allSelected,
            ids: props.allSelected ? [] : Array.from(selectedSet.value)
        })
    }
</script>

<style scoped>
    /* Alles “Card/Overlay/Teleport” macht BasePopup. Hier nur Content-Layout. */

    .asp-body {
        display: grid;
        gap: 0.75rem;
        outline: none;
    }

    .asp-sub {
        opacity: .7;
        font-weight: 600;
        font-size: .9rem;
        text-align: center;
        margin-top: -0.25rem;
    }

    .asp-all {
        display: flex !important;
        align-items: center;
        gap: .6rem;
        padding: .65rem .75rem;
        border-radius: 14px;
        background: rgba(255,255,255,.04);
        box-shadow: inset 0 0 0 1px rgba(148,163,184,.10);
        font-weight: 800;
        user-select: none;
        margin: 0 !important;
    }

 
    .asp-list {
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: inset 0 0 0 1px rgba(148,163,184,.10);
        background: rgba(255,255,255,.02);
    }

    .asp-row {
        display: grid !important;
        grid-template-columns: 26px 1fr auto;
        gap: .75rem;
        align-items: center;
        padding: .7rem .8rem;
        user-select: none;
        margin: 0 !important;
    }

        .asp-row:not(:last-child) {
            box-shadow: inset 0 -1px 0 rgba(148,163,184,.08);
        }

        .asp-row[data-disabled="true"] {
            opacity: .6;
        }

    .asp-left {
        font-weight: 850;
        letter-spacing: -0.012em;
        line-height: 1.15;
    }

    .asp-right {
        font-family: 'Roboto Mono', monospace;
        font-weight: 900;
        opacity: .9;
    }

    .asp-helper {
        opacity: .7;
        font-weight: 600;
        font-size: .85rem;
        text-align: center;
    }

    /* nicer Inputs */
    .asp-input {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(255, 255, 255, 0.03);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
        cursor: pointer;
        transition: transform .12s ease, border-color .12s ease, background .12s ease, box-shadow .12s ease, opacity .12s ease;
    }

        .asp-input.asp-radio {
            border-radius: 999px;
        }

        .asp-input:focus-visible {
            outline: none;
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.16), inset 0 1px 0 rgba(255,255,255,.06);
            border-color: rgba(129, 140, 248, 0.55);
        }

        .asp-input:checked {
            background: rgba(129, 140, 248, 0.18);
            border-color: rgba(129, 140, 248, 0.60);
            transform: scale(1.02);
            box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.35), inset 0 1px 0 rgba(255,255,255,.10);
        }

        .asp-input.asp-check:checked::after {
            content: "✓";
            font-weight: 1000;
            font-size: 0.82rem;
            line-height: 1;
            color: var(--text-primary);
        }

        .asp-input.asp-radio:checked::after {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--accent-primary) 80%, white);
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.12);
        }

    .asp-row[data-disabled="true"] .asp-input {
        opacity: .45;
        cursor: not-allowed;
        transform: none;
    }

</style>
