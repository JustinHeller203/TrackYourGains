<!--Pfad: src/components/ui/menu/KebabMenu.vue-->

<template>
    <teleport to="body">
        <div v-if="open" class="km-root" @mousedown.stop>
            <div class="km-backdrop" @mousedown="emitClose" />

            <div class="km-menu"
                 :style="menuStyle"
                 role="menu"
                 aria-label="Aktionen"
                 @keydown.esc.prevent="emitClose"
                 tabindex="-1"
                 ref="menuEl">
                <button v-for="item in items"
                        :key="item.id"
                        class="km-item"
                        role="menuitem"
                        type="button"
                        :disabled="!!item.disabled"
                        :data-danger="!!item.danger"
                        @click="onPick(item)">
                    <span v-if="item.icon" class="km-icon" aria-hidden="true">{{ item.icon }}</span>
                    <span class="km-label">{{ item.label }}</span>
                    <span v-if="item.hint" class="km-hint">{{ item.hint }}</span>
                </button>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
    import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

    export type KebabMenuItem = {
        id: string
        label: string
        icon?: string
        hint?: string
        disabled?: boolean
        danger?: boolean
    }

    const props = defineProps<{
        open: boolean
        anchorEl: HTMLElement | null
        items: KebabMenuItem[]
        offsetX?: number
        offsetY?: number
    }>()

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'select', id: string): void
    }>()

    const menuEl = ref<HTMLElement | null>(null)

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const menuStyle = computed(() => {
        const offX = props.offsetX ?? 6
        const offY = props.offsetY ?? 8

        const rect = props.anchorEl?.getBoundingClientRect()
        const w = 220
        const h = Math.min(48 * props.items.length + 16, 320)

        const vw = window.innerWidth
        const vh = window.innerHeight

        // default: rechts-unten am Button
        let left = (rect?.right ?? vw / 2) - w + offX
        let top = (rect?.bottom ?? vh / 2) + offY

        // clamp ins viewport
        left = clamp(left, 10, vw - w - 10)
        top = clamp(top, 10, vh - h - 10)

        return {
            left: `${left}px`,
            top: `${top}px`,
            width: `${w}px`
        }
    })

    const emitClose = () => emit('close')

    const onPick = (item: KebabMenuItem) => {
        if (item.disabled) return
        emit('select', item.id)
        emitClose()
    }

    const onDocKeydown = (e: KeyboardEvent) => {
        if (!props.open) return
        if (e.key === 'Escape') emitClose()
    }

    const focusMenu = async () => {
        await nextTick()
        menuEl.value?.focus()
    }

    watch(() => props.open, (v) => {
        if (v) focusMenu()
    })

    onMounted(() => {
        document.addEventListener('keydown', onDocKeydown, { capture: true })
    })
    onBeforeUnmount(() => {
        document.removeEventListener('keydown', onDocKeydown, { capture: true } as any)
    })
</script>

<style scoped>

    .km-menu {
        position: fixed;
        padding: 0.45rem;
        border-radius: 16px;
        outline: none;
        /* Typo: exakt wie App-UI */
        font-family: inherit;
        font-size: 0.92rem;
        line-height: 1.15;
        letter-spacing: -0.01em;
        /* gleiche Materialwelt wie Cards */
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 70%), color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
        box-shadow: 0 18px 46px rgba(15, 23, 42, 0.38);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    html.dark-mode .km-menu {
        background: radial-gradient(circle at 18% 22%, color-mix(in srgb, #6366f1 12%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, #22c55e 10%, transparent), transparent 70%), rgba(2, 6, 23, 0.82);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.65);
    }

    .km-item {
        width: 100%;
        display: grid;
        grid-template-columns: 20px 1fr auto;
        gap: 0.6rem;
        align-items: center;
        padding: 0.62rem 0.7rem;
        border-radius: 14px;
        /* CLEAN: keine Item-Border mehr */
        border: 0;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: background .15s ease, transform .15s ease, opacity .15s ease, box-shadow .15s ease;
    }


        .km-item:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .km-item[data-danger="true"] {
            color: rgba(248, 113, 113, 0.92);
            border-color: rgba(248, 113, 113, 0.18);
        }

    @media (hover:hover) {
        .km-item:not(:disabled):hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(129, 140, 248, 0.35);
            box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
            transform: translateY(-1px);
        }

        .km-item[data-danger="true"]:not(:disabled):hover {
            border-color: rgba(248, 113, 113, 0.35);
        }
    }

    .km-icon {
        display: grid;
        place-items: center;
        opacity: 0.9;
        font-size: 1rem;
    }

    .km-label {
        font-weight: 700; /* statt 800 -> wirkt “App-typisch” */
        letter-spacing: -0.01em;
    }

    .km-hint {
        font-size: 0.78rem;
        opacity: 0.6;
        font-weight: 600;
    }

    .km-root {
        position: fixed;
        inset: 0;
        z-index: 9999;
    }

    .km-backdrop {
        position: fixed;
        inset: 0;
        background: transparent;
    }

    .km-item:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    .km-item[data-danger="true"] {
        color: rgba(248, 113, 113, 0.95);
    }

    @media (hover:hover) {
        .km-item:not(:disabled):hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(129, 140, 248, 0.35);
            transform: translateY(-1px);
        }
    }
</style>
