<!--Pfad: src/components/ui/menu/FilterMenu.vue-->
<template>
    <div v-if="open"
         ref="panelEl"
         class="ui-menu__panel"
         role="menu"
         :aria-label="title || 'Menü'"
         :style="panelStyle"
         @pointerdown.stop>
        <div v-if="title" class="ui-menu__head">
            <span class="ui-menu__title">{{ title }}</span>
        </div>

        <div class="ui-menu__list">
            <button v-for="it in items"
                    :key="it.value"
                    class="ui-menu__item"
                    role="menuitemradio"
                    :aria-checked="String(it.value) === String(modelValue) ? 'true' : 'false'"
                    :data-active="String(it.value) === String(modelValue)"
                    @click="select(it.value)">
                <span class="ui-menu__label">{{ it.label }}</span>

                <svg v-if="String(it.value) === String(modelValue)"
                     class="ui-menu__check"
                     viewBox="0 0 24 24"
                     aria-hidden="true">
                    <path d="M20 7L9 18l-5-5"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>


<script setup lang="ts">
    import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

    type MenuItem<T extends string = string> = {
        value: T
        label: string
    }

    const props = withDefaults(
        defineProps<{
            open: boolean
            anchorEl: HTMLElement | null
            items: MenuItem[]
            modelValue: string
            title?: string
            offset?: number
            maxWidth?: string
        }>(),
        {
            title: '',
            offset: 10,
            maxWidth: '280px',
        }
    )

    const emit = defineEmits<{
        (e: 'update:open', v: boolean): void
        (e: 'update:modelValue', v: string): void
        (e: 'select', v: string): void
    }>()

    const panelEl = ref<HTMLElement | null>(null)
    const panelStyle = ref<Record<string, string>>({})

    function clamp(n: number, min: number, max: number) {
        return Math.min(Math.max(n, min), max)
    }

    function position() {
        const a = props.anchorEl
        const p = panelEl.value
        if (!a || !p) return

        const container = (a.offsetParent as HTMLElement | null)
        // Fallback: wenn kein offsetParent, dann wenigstens viewport-basics
        const cr = container?.getBoundingClientRect() ?? { top: 0, left: 0, right: window.innerWidth }
        const ar = a.getBoundingClientRect()

        const pad = 8
        const w = p.offsetWidth || 280

        // absolut innerhalb des Containers (TabsBar/.calculators-search)
        const top = (ar.bottom - cr.top) + props.offset
        const left = clamp((ar.right - cr.left) - w, pad, (cr.right - cr.left) - w - pad)

        panelStyle.value = {
            top: `${top}px`,
            left: `${left}px`,
            maxWidth: props.maxWidth,
        }
    }

    function close() {
        emit('update:open', false)
    }

    function onEsc(e: KeyboardEvent) {
        if (e.key === 'Escape') close()
    }

    function onDocPointerDown(e: PointerEvent) {
        const p = panelEl.value
        const a = props.anchorEl
        const t = e.target as Node | null

        if (!t) return
        if (p && p.contains(t)) return
        if (a && a.contains(t)) return

        close()
    }

    function addOpenListeners() {
        window.addEventListener('resize', position, { passive: true })
        document.addEventListener('keydown', onEsc)
        document.addEventListener('pointerdown', onDocPointerDown, true) // click-outside
    }

    function removeOpenListeners() {
        window.removeEventListener('resize', position)
        document.removeEventListener('keydown', onEsc)
        document.removeEventListener('pointerdown', onDocPointerDown, true)
    }

    async function onOpen() {
        await nextTick()
        position()
        addOpenListeners()
    }

    watch(
        () => props.open,
        (v) => {
            if (v) onOpen()
            else removeOpenListeners()
        }
    )

    onBeforeUnmount(() => {
        removeOpenListeners()
    })

    function select(v: string) {
        emit('update:modelValue', v)
        emit('select', v)
        close()
    }
</script>

<style scoped>
    .ui-menu__panel {
        position: absolute; /* innerhalb des Containers */
        z-index: 1; /* WICHTIG: unter der Navbar, wie normaler Content */
        width: min(290px, calc(100vw - 1.5rem));
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
        background: radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 86%, white 14%);
        box-shadow: 0 22px 70px rgba(15, 23, 42, 0.26), inset 0 1px 0 rgba(255,255,255,0.08);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
    }
    .ui-menu__head {
        padding: .7rem .85rem .55rem;
        border-bottom: 1px solid color-mix(in srgb, var(--border-color) 55%, transparent);
        background: linear-gradient( 180deg, color-mix(in srgb, var(--bg-secondary) 78%, transparent), transparent );
    }

    .ui-menu__title {
        font-weight: 800;
        font-size: .78rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-primary) 86%, transparent);
    }

    .ui-menu__list {
        padding: .55rem;
        display: grid;
        gap: .35rem;
    }

    .ui-menu__item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        padding: .62rem .75rem;
        border-radius: 14px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: transform .12s ease, background-color .12s ease, border-color .12s ease, box-shadow .12s ease;
    }

        .ui-menu__item:hover {
            background: color-mix(in srgb, var(--bg-secondary) 82%, white 18%);
            border-color: color-mix(in srgb, var(--border-color) 70%, transparent);
            transform: translateY(-1px);
        }

        .ui-menu__item[data-active="true"] {
            position: relative;
            background: radial-gradient(circle at 18% 30%, color-mix(in srgb, var(--accent-primary) 18%, transparent), transparent 60%), color-mix(in srgb, var(--bg-secondary) 80%, white 20%);
            border-color: color-mix(in srgb, var(--accent-primary) 45%, transparent);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
        }


    .ui-menu__label {
        font-size: .95rem;
        color: var(--text-primary);
    }

    .ui-menu__check {
        width: 18px;
        height: 18px;
        color: var(--accent-primary);
        opacity: .95;
    }

    /* Dark Mode */
    html.dark-mode .ui-menu__panel {
        background: radial-gradient(circle at 18% 20%, rgba(99,102,241,0.16), transparent 58%), radial-gradient(circle at 85% 75%, rgba(34,197,94,0.12), transparent 62%), rgba(2, 6, 23, 0.78);
        border-color: rgba(148, 163, 184, 0.22);
        box-shadow: 0 26px 80px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.04);
    }

    html.dark-mode .ui-menu__head {
        border-bottom-color: rgba(148, 163, 184, 0.16);
    }

    html.dark-mode .ui-menu__item:hover {
        background: rgba(30, 41, 59, 0.45);
        border-color: rgba(148, 163, 184, 0.22);
    }

    html.dark-mode .ui-menu__item[data-active="true"] {
        background: radial-gradient(circle at 18% 30%, rgba(99,102,241,0.22), transparent 60%), rgba(30, 41, 59, 0.55);
        border-color: rgba(99, 102, 241, 0.42);
    }
</style>
