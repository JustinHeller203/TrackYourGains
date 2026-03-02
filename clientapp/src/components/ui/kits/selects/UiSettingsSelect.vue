<!-- src/components/ui/kits/selects/UiSettingsSelect.vue -->
<template>
    <div class="ui-settings-select" :class="{ 'is-disabled': disabled, 'has-error': !!error }">
        <label v-if="label" class="ui-settings-select__label" :for="id">{{ label }}</label>

        <div class="ui-settings-select__field" @keydown="onKeydown">
            <button :id="id"
                    ref="triggerEl"
                    type="button"
                    class="ui-settings-select__control"
                    :disabled="disabled"
                    :aria-invalid="!!error"
                    :aria-describedby="describedBy"
                    aria-haspopup="listbox"
                    :aria-expanded="isOpen ? 'true' : 'false'"
                    @click="toggle"
                    @blur="emit('blur')">
                <span class="ui-settings-select__value" :class="{ 'is-placeholder': !hasSelection }">
                    {{ displayLabel }}
                </span>
                <span class="ui-settings-select__chevron" aria-hidden="true"></span>
            </button>

            <Teleport to="body">
                <transition name="ui-settings-select-dd">
                    <div v-if="isOpen"
                         ref="menuEl"
                         class="ui-settings-select__menu"
                         role="listbox"
                         :aria-labelledby="id"
                         :style="menuStyle"
                         @pointerdown.prevent>
                        <button v-for="(opt, idx) in options"
                                :key="String(opt.value)"
                                type="button"
                                role="option"
                                class="ui-settings-select__option"
                                :class="{
                                    'is-selected': String(opt.value) === stringValue,
                                    'is-active': idx === activeIndex
                                }"
                                :disabled="!!opt.disabled"
                                @mousemove="activeIndex = idx"
                                @click="selectValue(opt.value)">
                            <span>{{ opt.label }}</span>
                            <span v-if="String(opt.value) === stringValue" class="ui-settings-select__check" aria-hidden="true">✓</span>
                        </button>
                    </div>
                </transition>
            </Teleport>
        </div>

        <p v-if="error" class="ui-settings-select__msg ui-settings-select__msg--error" :id="errorId">{{ error }}</p>
        <p v-else-if="hint" class="ui-settings-select__msg" :id="hintId">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

    type SelectPrimitive = string | number

    type SelectOption = {
        label: string
        value: SelectPrimitive
        disabled?: boolean
    }

    const props = withDefaults(defineProps<{
        modelValue: SelectPrimitive | null | undefined
        options: ReadonlyArray<SelectOption>
        id?: string
        label?: string
        placeholder?: string
        hint?: string
        error?: string
        disabled?: boolean
    }>(), {
        disabled: false,
    })

    const emit = defineEmits<{
        (e: 'update:modelValue', value: SelectPrimitive): void
        (e: 'change', value: SelectPrimitive): void
        (e: 'blur'): void
    }>()

    const fallbackId = `ui-settings-select-${Math.random().toString(36).slice(2, 10)}`
    const id = computed(() => props.id || fallbackId)

    const hintId = computed(() => `${id.value}-hint`)
    const errorId = computed(() => `${id.value}-error`)
    const describedBy = computed(() => {
        if (props.error) return errorId.value
        if (props.hint) return hintId.value
        return undefined
    })

    const hasSelection = computed(() => props.modelValue !== null && props.modelValue !== undefined && String(props.modelValue) !== '')
    const stringValue = computed(() => hasSelection.value ? String(props.modelValue) : '')
    const displayLabel = computed(() => {
        const found = props.options.find(o => String(o.value) === stringValue.value)
        return found?.label ?? props.placeholder ?? 'Bitte auswählen'
    })

    const isOpen = ref(false)
    const activeIndex = ref(-1)

    const triggerEl = ref<HTMLElement | null>(null)
    const menuEl = ref<HTMLElement | null>(null)
    const menuStyle = ref<Record<string, string>>({})

    function updateMenuPosition() {
        const t = triggerEl.value
        if (!t) return
        const r = t.getBoundingClientRect()
        menuStyle.value = {
            position: 'fixed',
            left: `${Math.round(r.left)}px`,
            top: `${Math.round(r.bottom + 8)}px`,
            width: `${Math.round(r.width)}px`,
            zIndex: '12000',
        }
    }

    function onAnyScrollOrResize() {
        if (!isOpen.value) return
        updateMenuPosition()
    }

    function open() {
        if (props.disabled) return
        isOpen.value = true
        const idx = props.options.findIndex(o => String(o.value) === stringValue.value)
        activeIndex.value = idx >= 0 ? idx : (props.options.length ? 0 : -1)

        nextTick(() => {
            updateMenuPosition()
            scrollActiveIntoView()
        })

        window.addEventListener('pointerdown', onOutsidePointerDown, { capture: true })
        window.addEventListener('resize', onAnyScrollOrResize)
        window.addEventListener('scroll', onAnyScrollOrResize, true)
    }

    function close(focusBack = false) {
        isOpen.value = false
        window.removeEventListener('pointerdown', onOutsidePointerDown, { capture: true } as any)
        window.removeEventListener('resize', onAnyScrollOrResize)
        window.removeEventListener('scroll', onAnyScrollOrResize, true)
        if (focusBack) nextTick(() => triggerEl.value?.focus())
    }

    function toggle() {
        if (isOpen.value) close(true)
        else open()
    }

    function selectValue(v: SelectPrimitive) {
        emit('update:modelValue', v)
        emit('change', v)
        close(true)
    }

    function onOutsidePointerDown(e: Event) {
        const t = e.target as Node | null
        if (!t) return
        if (triggerEl.value?.contains(t)) return
        if (menuEl.value?.contains(t)) return
        close(false)
    }

    function clampIndex(i: number) {
        const max = props.options.length - 1
        if (max < 0) return -1
        return Math.max(0, Math.min(max, i))
    }

    function moveActive(delta: number) {
        if (!props.options.length) return
        activeIndex.value = activeIndex.value < 0 ? 0 : clampIndex(activeIndex.value + delta)
        nextTick(() => scrollActiveIntoView())
    }

    function scrollActiveIntoView() {
        const el = menuEl.value
        if (!el || activeIndex.value < 0) return
        const items = el.querySelectorAll<HTMLElement>('.ui-settings-select__option')
        const item = items[activeIndex.value]
        if (!item) return
        const itemTop = item.offsetTop
        const itemBottom = itemTop + item.offsetHeight
        const viewTop = el.scrollTop
        const viewBottom = viewTop + el.clientHeight
        if (itemTop < viewTop) el.scrollTop = itemTop
        else if (itemBottom > viewBottom) el.scrollTop = itemBottom - el.clientHeight
    }

    function onKeydown(e: KeyboardEvent) {
        if (props.disabled) return

        if (!isOpen.value) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                open()
            }
            return
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            close(true)
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
            const opt = props.options[activeIndex.value]
            if (opt && !opt.disabled) selectValue(opt.value)
        }
    }

    onBeforeUnmount(() => close(false))
</script>

<style scoped>
    .ui-settings-select {
        width: 100%;
        min-width: 140px;
    }

    .ui-settings-select__label {
        display: block;
        margin-bottom: 0.35rem;
        font-size: 0.82rem;
        color: var(--text-secondary, #6b7280);
        font-weight: 600;
    }

    .ui-settings-select__field {
        position: relative;
    }

   

    .ui-settings-select__control:focus-visible {
        border-color: rgba(129, 140, 248, 0.7);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary, #4B6CB7) 20%, transparent);
    }

    .ui-settings-select__control:hover {
        border-color: rgba(129, 140, 248, 0.7);
    }

    .ui-settings-select__value.is-placeholder {
        opacity: 0.78;
    }

    .ui-settings-select__chevron {
        position: absolute;
        right: 0.9rem;
        top: 50%;
        width: 0.5rem;
        height: 0.5rem;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: translateY(-60%) rotate(45deg);
        pointer-events: none;
        opacity: 0.72;
    }
    .ui-settings-select__control {
        width: 100%;
        min-height: 44px;
        border-radius: 18px;
        /* neutral wie die card – KEIN indigo glow */
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        padding: 0.72rem 2.25rem 0.72rem 0.95rem;
        font-size: 0.95rem;
        font-weight: 800;
        appearance: none;
        outline: none;
        cursor: pointer;
        text-align: left;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 160ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, background 180ms ease-out;
    }

        .ui-settings-select__control:hover {
            transform: translateY(-2px);
            border-color: rgba(129, 140, 248, 0.7);
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
        }

        .ui-settings-select__control:focus-visible {
            border-color: rgba(129, 140, 248, 0.7);
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.16), 0 22px 48px rgba(15, 23, 42, 0.32);
            transform: translateY(-2px);
        }
    .ui-settings-select__menu {
        max-height: min(280px, 52vh);
        overflow: auto;
        border-radius: 18px;
        /* neutral wie die card – KEIN indigo/grün glow */
        border: 1px solid rgba(148, 163, 184, 0.38);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
        padding: 0.35rem;
    }

    html.dark-mode .ui-settings-select__control {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .ui-settings-select__menu {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }
    .ui-settings-select__option {
        width: 100%;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: inherit;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
        text-align: left;
        padding: 0.56rem 0.62rem;
        cursor: pointer;
        font-size: 0.92rem;
    }

        .ui-settings-select__option:hover,
        .ui-settings-select__option.is-active {
            background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
        }

        .ui-settings-select__option.is-selected {
            background: color-mix(in srgb, var(--accent-primary) 22%, transparent);
            font-weight: 900;
        }

    .ui-settings-select__check {
        opacity: 0.9;
        font-size: 0.75rem;
        letter-spacing: 0.02em;
    }

    .ui-settings-select.is-disabled .ui-settings-select__control {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .ui-settings-select.has-error .ui-settings-select__control {
        border-color: #ef4444;
    }

    .ui-settings-select__msg {
        margin: 0.35rem 0 0;
        font-size: 0.78rem;
        color: var(--text-secondary, #6b7280);
    }

    .ui-settings-select__msg--error {
        color: #ef4444;
    }
    .ui-settings-select-dd-enter-active,
    .ui-settings-select-dd-leave-active {
        transition: opacity 120ms ease, transform 120ms ease;
    }

    .ui-settings-select-dd-enter-from,
    .ui-settings-select-dd-leave-to {
        opacity: 0;
        transform: translateY(-4px);
    }
</style>
