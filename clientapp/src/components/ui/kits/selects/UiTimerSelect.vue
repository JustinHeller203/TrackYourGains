<!--components/ui/kits/selects/UiTimerSelect.vue-->

<template>
    <div ref="rootEl"
         class="tyg-select"
         :class="[props.full ? 'is-full' : 'is-compact', isOpen ? 'is-open' : '', disabled ? 'is-disabled' : '']">

        <button ref="triggerEl" type="button"
                class="tyg-select-trigger"
                :disabled="disabled"
                v-bind="buttonAttrs"
                @click="toggle"
                @keydown="onTriggerKeydown">
            <span class="tyg-select-value" :class="display.isPlaceholder ? 'is-placeholder' : ''">
                {{ display.label }}
            </span>

            <span class="tyg-select-chevron" aria-hidden="true"></span>
        </button>

        <teleport to="body">
            <transition name="tyg-pop">
                <div v-if="isOpen"
                     ref="menuEl"
                     class="tyg-select-menu"
                     role="listbox"
                     tabindex="-1"
                     :style="menuStyle"
                     :aria-activedescendant="activeId">
                    <button v-for="(opt, idx) in options"
                            :key="opt.key"
                            type="button"
                            class="tyg-select-item"
                            :id="opt.key"
                            :disabled="opt.disabled"
                            :class="[
                      opt.disabled ? 'is-disabled' : '',
                      opt.value === normalizedValue ? 'is-selected' : '',
                      idx === activeIndex ? 'is-active' : ''
                    ]"
                            @click="pick(opt.value)">
                        <span class="tyg-select-item-label">{{ opt.label }}</span>
                        <span v-if="opt.value === normalizedValue" class="tyg-select-check" aria-hidden="true"></span>
                    </button>
                </div>
            </transition>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, onMounted, onBeforeUnmount, nextTick, watch, Fragment } from 'vue'

    type Model = string | number | null | undefined

    defineOptions({ inheritAttrs: false })

    const props = defineProps<{
        modelValue?: Model
        full?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: string): void
        (e: 'change', ev: Event): void
    }>()

    const attrs = useAttrs()
    const slots = useSlots()

    const rootEl = ref<HTMLElement | null>(null)
    const triggerEl = ref<HTMLButtonElement | null>(null)
    const menuEl = ref<HTMLElement | null>(null)

    const isOpen = ref(false)
    const activeIndex = ref<number>(-1)
    const openedAtMs = ref(0)
    const ignoreOutsideMs = 220
    const disabled = computed(() => {
        const d = (attrs as any)?.disabled
        return d === '' || d === true || d === 'true'
    })

    const normalizedValue = computed(() => String(props.modelValue ?? ''))

    type Opt = { key: string; value: string; label: string; disabled: boolean }

    const options = computed<Opt[]>(() => {
    const nodes = slots.default?.() ?? []
    const out: Opt[] = []
    let i = 0

    const pushOption = (n: any) => {
        const value = n.props?.value != null ? String(n.props.value) : ''
        const label =
            typeof n.children === 'string'
                ? n.children
                : Array.isArray(n.children)
                    ? n.children.map((c: any) => (typeof c === 'string' ? c : (c?.children ?? ''))).join('')
                    : String(n.children ?? '')

        const dis = n.props?.disabled === '' || n.props?.disabled === true || n.props?.disabled === 'true'

        out.push({
            key: `tyg-opt-${i++}-${value}`,
            value,
            label: label.trim() || value || '—',
            disabled: !!dis,
        })
    }

    const walk = (list: any[]) => {
        for (const n of list) {
            if (!n) continue

            // <option>
            if (typeof n.type === 'string' && n.type === 'option') {
                pushOption(n)
                continue
            }

            // Fragment / nested children (z.B. v-for im Slot)
            if (n.type === Fragment && Array.isArray(n.children)) {
                walk(n.children)
                continue
            }

            // Fallback: wenn irgendwas children als Array hat, auch reinlaufen
            if (Array.isArray(n.children)) {
                walk(n.children)
            }
        }
    }

    walk(nodes)
    return out
})

    const display = computed(() => {
    const found = options.value.find(o => o.value === normalizedValue.value)
    if (found) {
        // disabled option = Placeholder-Option (z.B. "Sound wählen")
        if (found.disabled) return { label: found.label, isPlaceholder: true }
        return { label: found.label, isPlaceholder: false }
    }

    // fallback: wenn es ein disabled "placeholder" option gibt (value=""), nimm das
    const ph = options.value.find(o => o.value === '' && o.disabled)
    if (ph) return { label: ph.label, isPlaceholder: true }

    return { label: 'Auswählen…', isPlaceholder: true }
})

    const activeId = computed(() => {
        const o = options.value[activeIndex.value]
        return o?.key || undefined
    })

    const forwardedAttrs = computed(() => {
        const { class: _c, style: _s, disabled: _d, ...rest } = attrs as Record<string, any>
        return rest
    })

    const buttonAttrs = computed(() => ({
        ...forwardedAttrs.value,
        // wichtig: wir sind jetzt ein Button, also keine select-only attrs
        'aria-haspopup': 'listbox',
        'aria-expanded': isOpen.value ? 'true' : 'false',
    }))

    const open = async () => {
        if (disabled.value) return
        openedAtMs.value = performance.now()
        isOpen.value = true

        await nextTick()
        updateMenuPosition()
        await nextTick()
        updateMenuPosition()
        await nextTick()
        updateMenuPosition()
        const idxSel = options.value.findIndex(o => o.value === normalizedValue.value && !o.disabled)
        if (idxSel >= 0) activeIndex.value = idxSel
        else activeIndex.value = options.value.findIndex(o => !o.disabled)
    }

    const menuStyle = ref<Record<string, string>>({})

    const updateMenuPosition = () => {
        const btn = triggerEl.value
        if (!btn) return

        const r = btn.getBoundingClientRect()
        const gap = 4 // kleiner Abstand zum Trigger

        // echte Menu-Höhe nutzen (nach dem Render)
        const maxH = 260
        const menuHRaw = menuEl.value?.offsetHeight ?? maxH
        const menuH = Math.min(menuHRaw, maxH)

        const belowTop = r.bottom + gap
        const aboveTop = r.top - gap - menuH

        const fitsBelow = belowTop + menuH <= window.innerHeight - gap
        const fitsAbove = aboveTop >= gap

        // Prefer below, aber wenn es nicht passt -> above (so nah wie möglich)
        const top = fitsBelow ? belowTop : (fitsAbove ? aboveTop : Math.max(gap, Math.min(belowTop, window.innerHeight - gap - menuH)))

        menuStyle.value = {
            position: 'fixed',
            left: `${Math.round(r.left)}px`,
            top: `${Math.round(top)}px`,
            width: `${Math.round(r.width)}px`,
            zIndex: '10000',
        }
    }

    const close = () => {
        isOpen.value = false
        activeIndex.value = -1
    }

    const toggle = async () => {
        if (isOpen.value) {
            close()
            // Fokus zurück auf Trigger (fühlt sich natürlicher an)
            await nextTick()
            triggerEl.value?.focus?.()
        } else {
            await open()
        }
    }

    const pick = (value: string) => {
        if (disabled.value) return
        emit('update:modelValue', value)

        // Event-like object, damit dein bestehendes onXChange weiter (target.value) lesen kann
        emit('change', { target: { value } } as any)

        close()
    }

    const moveActive = (dir: 1 | -1) => {
        const list = options.value
        if (!list.length) return

        let i = activeIndex.value
        if (i < 0) i = list.findIndex(o => !o.disabled)
        if (i < 0) return

        for (let step = 0; step < list.length; step++) {
            i = (i + dir + list.length) % list.length
            if (!list[i].disabled) {
                activeIndex.value = i
                return
            }
        }
    }

    const onTriggerKeydown = async (e: KeyboardEvent) => {
        if (disabled.value) return

        if (!isOpen.value) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                await open()
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                await open()
            }
            return
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            close()
            return
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            moveActive(1)
            return
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault()
            moveActive(-1)
            return
        }

        if (e.key === 'Enter') {
            e.preventDefault()
            const o = options.value[activeIndex.value]
            if (o && !o.disabled) pick(o.value)
        }
    }

    const onScrollClose = (e: Event) => {
    if (!isOpen.value) return

    // Wenn im Dropdown-Menü gescrollt wird: NICHT schließen
    const menu = menuEl.value
    if (menu) {
        const path = (e as any).composedPath?.() as EventTarget[] | undefined
        if (path && path.includes(menu)) return

        const target = e.target as Node | null
        if (target && menu.contains(target)) return
    }

    close()
}

    const onResizeReposition = () => {
        if (!isOpen.value) return
        updateMenuPosition()
    }

    onMounted(() => {
        // scroll => schließen (capturing, damit es auch in nested scroll-containern greift)
        window.addEventListener('scroll', onScrollClose, true)
        // resize => reposition (damit es nicht off-screen hängt)
        window.addEventListener('resize', onResizeReposition)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScrollClose, true)
        window.removeEventListener('resize', onResizeReposition)
    })

    const onGlobalPointerDownCapture = (e: PointerEvent) => {
        if (!isOpen.value) return

        // Guard: direkt nach open nichts schließen (fix gegen "wegbuggen")
        if (performance.now() - openedAtMs.value < ignoreOutsideMs) return

        const root = rootEl.value
        if (!root) return

        const path = (e.composedPath?.() ?? []) as EventTarget[]
        if (path.includes(root)) return

        close()
    }
    onMounted(() => {
        // capture=true => wir sehen den pointerdown bevor irgendein anderes Zeug dran rumspielt
        document.addEventListener('pointerdown', onGlobalPointerDownCapture, true)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('pointerdown', onGlobalPointerDownCapture, true)
    })
</script>

<style scoped>
    .tyg-select {
        position: relative;
        display: inline-block;
    }

        .tyg-select.is-full {
            width: 100%;
        }

        .tyg-select.is-compact {
            width: 165px;
        }

    /* Trigger = der sichtbare "Select" */
    .tyg-select-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        padding: 0.72rem 0.9rem;
        border-radius: 14px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.18);
        color: var(--text-primary);
        font-size: 0.92rem;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease, background .15s ease;
        cursor: pointer;
        user-select: none;
    }

    @media (hover: hover) {
        .tyg-select-item:not(.is-disabled):hover {
            background: color-mix(in srgb, var(--bg-card) 70%, transparent);
            border-color: rgba(148, 163, 184, 0.18);
            /* no movement = no hover flicker */
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }
    }

    .tyg-select.is-open .tyg-select-trigger {
        border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(129, 140, 248, 0.55));
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent), 0 16px 44px rgba(15, 23, 42, 0.20);
        transform: translateY(-1px);
    }

    .tyg-select.is-disabled .tyg-select-trigger {
        opacity: .6;
        cursor: not-allowed;
        transform: none;
    }

    /* Value */
    .tyg-select-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

        .tyg-select-value.is-placeholder {
            opacity: .72;
        }

    /* Chevron (clean, premium) */
    .tyg-select-chevron {
        width: 0.6rem;
        height: 0.6rem;
        flex: 0 0 auto;
        transform: rotate(45deg);
        border-right: 2px solid rgba(148, 163, 184, 0.95);
        border-bottom: 2px solid rgba(148, 163, 184, 0.95);
        transition: transform .15s ease, opacity .15s ease;
        opacity: .95;
    }

    .tyg-select.is-open .tyg-select-chevron {
        transform: rotate(225deg);
    }

    /* Menu */
    .tyg-select-menu {
        /* Position kommt jetzt aus :style (fixed + left/top/width/zIndex) */
        padding: .5rem;
        border-radius: 16px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.20);
        box-shadow: 0 18px 52px rgba(15, 23, 42, 0.26);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        max-height: 260px;
        overflow: auto;
        isolation: isolate;
    }

    /* Items */
    .tyg-select-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        padding: .65rem .75rem;
        border-radius: 12px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-primary);
        font-size: .92rem;
        cursor: pointer;
        transition: transform .12s ease, background .12s ease, border-color .12s ease;
    }

        .tyg-select-item.is-disabled {
            opacity: .55;
            cursor: not-allowed;
        }

    @media (hover: hover) {
        .tyg-select-item:not(.is-disabled):hover {
            background: color-mix(in srgb, var(--bg-card) 70%, transparent);
            border-color: rgba(148, 163, 184, 0.18);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }
    }

    .tyg-select-item.is-active {
        background: color-mix(in srgb, var(--bg-card) 72%, transparent);
        border-color: rgba(148, 163, 184, 0.22);
    }

    .tyg-select-item.is-selected {
        border-color: color-mix(in srgb, var(--accent-primary) 45%, rgba(148, 163, 184, 0.20));
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10);
    }

    .tyg-select-check {
        width: auto;
        height: auto;
        border: none;
        transform: none;
        line-height: 1;
        opacity: .7;
        font-weight: 700;
        font-size: .78rem;
    }

        .tyg-select-check::before {
            content: "✓";
        }
    /* nice open anim */
    .tyg-pop-enter-active, .tyg-pop-leave-active {
        transition: opacity .12s ease, transform .12s ease;
    }

    .tyg-pop-enter-from, .tyg-pop-leave-to {
        opacity: 0;
        transform: translateY(-4px) scale(.98);
    }

    /* Dark mode */
    html.dark-mode .tyg-select-trigger {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 12%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 9%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.26);
        color: #ffffff;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    html.dark-mode .tyg-select-menu {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 12%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 9%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.26);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.90);
    }

    html.dark-mode .tyg-select-chevron {
        border-right-color: rgba(226, 232, 240, 0.92);
        border-bottom-color: rgba(226, 232, 240, 0.92);
    }

    html.dark-mode .tyg-select-check {
        color: rgba(226, 232, 240, 0.92);
    }
</style>
