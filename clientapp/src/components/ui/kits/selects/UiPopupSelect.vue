<!-- components/ui/kits/selects/UiPopupSelect.vue -->

<template>
    <div class="popsel" :class="{ 'is-disabled': disabled, 'has-error': !!error }">
        <label v-if="label" class="popsel__label" :for="id">{{ label }}</label>

        <div class="popsel__field"
             :class="{
         'is-open': isOpen,
         'has-leading': !!$slots.leading,
         'has-trailing': !!$slots.trailing
     }"
             @keydown="onKeydown">

            <span v-if="$slots.leading" class="popsel__slot popsel__slot--leading">
                <slot name="leading" />
            </span>

            <!-- Trigger -->
            <button :id="id"
                    ref="triggerEl"
                    type="button"
                    class="popsel__control popsel__trigger"
                    :class="{ 'has-leading': !!$slots.leading, 'has-trailing': !!$slots.trailing }"
                    :disabled="disabled"
                    :aria-invalid="!!error"
                    :aria-describedby="describedBy"
                    aria-haspopup="listbox"
                    :aria-expanded="isOpen ? 'true' : 'false'"
                    @click="toggle()"
                    @blur="onTriggerBlur">

                <span class="popsel__value" :class="{ 'is-placeholder': !stringValue }">
                    {{ displayLabel }}
                </span>
            </button>

            <!-- Rechts: Pfeil (immer) -->
            <span class="popsel__chev" aria-hidden="true"></span>

            <span v-if="$slots.trailing" class="popsel__slot popsel__slot--trailing">
                <slot name="trailing" />
            </span>

            <!-- Dropdown -->
            <Teleport to="body">
                <transition name="popsel-dd">
                    <div v-if="isOpen"
                         ref="menuEl"
                         class="popsel__menu"
                         role="listbox"
                         :aria-labelledby="id"
                         :style="menuStyle"
                         @pointerdown.prevent>

                        <div v-if="placeholder"
                             class="popsel__opt popsel__opt--placeholder"
                             aria-hidden="true">
                            {{ placeholder }}
                        </div>

                        <button v-for="(opt, idx) in options"
                                :key="opt.value"
                                type="button"
                                class="popsel__opt"
                                :class="{
                        'is-selected': opt.value === stringValue,
                        'is-active': activeIndex === idx
                    }"
                                @mousemove="activeIndex = idx"
                                @click="selectValue(opt.value)">
                            <span class="popsel__opt-label">{{ opt.label }}</span>
                            <span v-if="opt.value === stringValue" class="popsel__check" aria-hidden="true">✓</span>
                        </button>
                    </div>
                </transition>
            </Teleport>

        </div>

        <p v-if="error" class="popsel__msg popsel__msg--error" :id="errorId">{{ error }}</p>
        <p v-else-if="hint" class="popsel__msg" :id="hintId">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onBeforeUnmount, ref } from "vue";

    const props = withDefaults(defineProps<{
        modelValue: string | null | undefined
        label?: string
        placeholder?: string
        hint?: string
        error?: string
        id?: string
        disabled?: boolean

        options?: Array<{ label: string; value: string }>
    }>(), {
        disabled: false,
        options: () => [],
    });

    const emit = defineEmits<{
        (e: "update:modelValue", v: string): void
        (e: "enter"): void
        (e: "blur"): void
    }>();

    const fallbackId = `popsel-${Math.random().toString(36).slice(2, 10)}`;
    const id = computed(() => props.id || fallbackId);

    const hintId = computed(() => `${id.value}-hint`);
    const errorId = computed(() => `${id.value}-error`);

    const describedBy = computed(() => {
        if (props.error) return errorId.value;
        if (props.hint) return hintId.value;
        return undefined;
    });

    const stringValue = computed(() => (props.modelValue ?? "").toString());

    const isOpen = ref(false);
    const activeIndex = ref<number>(-1);

    const triggerEl = ref<HTMLElement | null>(null);

    const menuStyle = ref<Record<string, string>>({});

    function updateMenuPosition() {
        const t = triggerEl.value;
        if (!t) return;

        const r = t.getBoundingClientRect();
        // fixed -> immer über dem Modal-Scroll, nix wird gecropped
        menuStyle.value = {
            position: "fixed",
            left: `${Math.round(r.left)}px`,
            top: `${Math.round(r.bottom + 8)}px`,
            width: `${Math.round(r.width)}px`,
            zIndex: "10100",
        };

    }

    function onAnyScrollOrResize() {
        if (!isOpen.value) return;
        updateMenuPosition();
    }

    const menuEl = ref<HTMLElement | null>(null);

    const labelFor = (v: string) => props.options?.find(o => o.value === v)?.label ?? "";
    const displayLabel = computed(() => {
        if (!stringValue.value) return props.placeholder ?? "Bitte wählen";
        return labelFor(stringValue.value) || stringValue.value;
    });

    function open() {
        if (props.disabled) return;
        isOpen.value = true;

        const idx = props.options?.findIndex(o => o.value === stringValue.value) ?? -1;
        // wenn nix ausgewählt -> erstes echtes Item aktivieren (statt Placeholder)
        activeIndex.value = idx >= 0 ? idx : (props.options?.length ? 0 : -1);

        nextTick(() => {
            updateMenuPosition();
            scrollActiveIntoView();
        });

        window.addEventListener("pointerdown", onOutsidePointerDown, { capture: true });
        window.addEventListener("resize", onAnyScrollOrResize);
        window.addEventListener("scroll", onAnyScrollOrResize, true); // true = auch Modal-Scrolls catchen
    }

    function close(focusBack = false) {
        isOpen.value = false;

        window.removeEventListener("pointerdown", onOutsidePointerDown, { capture: true } as any);
        window.removeEventListener("resize", onAnyScrollOrResize);
        window.removeEventListener("scroll", onAnyScrollOrResize, true);

        if (focusBack) nextTick(() => triggerEl.value?.focus());
    }

    function toggle() {
        if (isOpen.value) close(true);
        else open();
    }

    function selectValue(v: string) {
        // placeholder ist NUR Anzeige -> "" wird nie angenommen
        const next = (v ?? "").toString().trim();
        if (!next) return;

        emit("update:modelValue", next);
        emit("blur");
        close(true);
    }

    function onOutsidePointerDown(e: Event) {
        const t = e.target as Node | null;
        if (!t) return;
        if (triggerEl.value?.contains(t)) return;
        if (menuEl.value?.contains(t)) return;
        close(false);
    }

    function onTriggerBlur() {
        // Blur kommt auch beim Klick ins Menü -> deswegen nicht hart schließen,
        // Outside-Listener regelt’s sauber.
        emit("blur");
    }

    function clampIndex(i: number) {
        const max = (props.options?.length ?? 0) - 1;
        if (max < 0) return -1;
        return Math.max(0, Math.min(max, i));
    }

    function moveActive(delta: number) {
        const len = props.options?.length ?? 0;
        if (!len) return;
        const next = activeIndex.value < 0 ? 0 : clampIndex(activeIndex.value + delta);
        activeIndex.value = next;
        nextTick(() => scrollActiveIntoView());
    }

    function scrollActiveIntoView() {
        const el = menuEl.value;
        if (!el) return;
        const idx = activeIndex.value;
        if (idx < 0) return;
        const items = el.querySelectorAll<HTMLElement>(".popsel__opt:not(.popsel__opt--placeholder)");
        const item = items[idx];
        if (!item) return;

        const itemTop = item.offsetTop;
        const itemBottom = itemTop + item.offsetHeight;
        const viewTop = el.scrollTop;
        const viewBottom = viewTop + el.clientHeight;

        if (itemTop < viewTop) {
            el.scrollTop = itemTop;
        } else if (itemBottom > viewBottom) {
            el.scrollTop = itemBottom - el.clientHeight;
        }
    }

    function onKeydown(e: KeyboardEvent) {
        if (props.disabled) return;

        if (!isOpen.value) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
            }
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            close(true);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            moveActive(1);
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            moveActive(-1);
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const opt = props.options?.[activeIndex.value];
            if (opt) selectValue(opt.value);
            else close(true);
            emit("enter");
            return;
        }
    }

    function focus() {
        triggerEl.value?.focus();
    }

    defineExpose({ focus });

    onBeforeUnmount(() => {
        window.removeEventListener("pointerdown", onOutsidePointerDown, { capture: true } as any);
        window.removeEventListener("resize", onAnyScrollOrResize);
        window.removeEventListener("scroll", onAnyScrollOrResize, true);
    });

</script>

<style scoped>
    .popsel {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        width: 100%;
    }

    .popsel__label {
        font-size: 0.92rem;
        font-weight: 650;
        color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
        line-height: 1.2;
        margin: 0;
    }

    .popsel__field {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.32);
        background: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
        transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
    }

    .popsel__control {
        width: 100%;
        border: 0;
        outline: none;
        background: transparent;
        color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
        font-size: 0.98rem;
        line-height: 1.2;
        padding: 0.86rem 0.95rem;
        min-height: 46px;
        letter-spacing: 0.01em;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
    }

        .popsel__control.has-leading {
            padding-left: 2.45rem;
        }

        .popsel__control.has-trailing {
            padding-right: 2.65rem;
        }

        .popsel__control option[disabled] {
            color: rgba(148, 163, 184, 0.85);
        }

    .popsel__slot {
        position: absolute;
        display: grid;
        place-items: center;
        width: 2.25rem;
        height: 100%;
        opacity: 0.78;
        pointer-events: none;
        color: rgba(148, 163, 184, 0.95);
        filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.35));
    }

    .popsel__slot--leading {
        left: 0.18rem;
    }

    .popsel__slot--trailing {
        right: 0.18rem;
    }

    .popsel__field:focus-within {
        border-color: rgba(148, 163, 184, 0.55);
        background: color-mix(in srgb, #020617 84%, var(--bg-card) 16%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.55);
        transform: translateY(-1px);
    }

    .popsel.has-error .popsel__field {
        border-color: rgba(239, 68, 68, 0.55);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 3px rgba(239, 68, 68, 0.14), 0 18px 52px rgba(0, 0, 0, 0.5);
    }

    .popsel.is-disabled {
        opacity: 0.55;
        pointer-events: none;
        filter: saturate(0.85);
    }

    .popsel__msg {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.84;
        line-height: 1.35;
        color: rgba(148, 163, 184, 0.95);
    }

    .popsel__msg--error {
        opacity: 1;
        color: #ef4444;
        font-weight: 650;
    }
    /* Trigger als Button */
    .popsel__trigger {
        cursor: pointer;
        text-align: left;
        display: flex;
        align-items: center;
    }

    /* Label/Value */
    .popsel__value {
        display: block;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

        .popsel__value.is-placeholder {
            color: rgba(148, 163, 184, 0.85);
        }

    /* Rechts-Pfeil (Chevron) */
    .popsel__chev {
        position: absolute;
        right: 0.9rem;
        width: 10px;
        height: 10px;
        pointer-events: none;
        opacity: 0.9;
        transform: rotate(45deg);
        border-right: 2px solid rgba(148, 163, 184, 0.9);
        border-bottom: 2px solid rgba(148, 163, 184, 0.9);
        transition: transform 0.18s ease, opacity 0.18s ease;
    }

    .popsel__field.has-trailing .popsel__chev {
        right: 2.85rem;
    }
    .popsel__field.is-open .popsel__chev {
        transform: rotate(-135deg);
        opacity: 1;
    }

    /* Platz für Chevron rechts */
    .popsel__control {
        padding-right: 2.6rem;
    }

    /* Dropdown Menu */
    .popsel__menu {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 8px);
        z-index: 50;
        max-height: 240px;
        overflow: auto;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.26);
        background: color-mix(in srgb, #020617 86%, var(--bg-card) 14%);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05);
        padding: 0.35rem;
    }

    /* Optionen */
    .popsel__opt {
        width: 100%;
        border: 0;
        background: transparent;
        color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
        padding: 0.7rem 0.75rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        cursor: pointer;
        transition: background 0.14s ease, transform 0.14s ease;
    }

        .popsel__opt:hover,
        .popsel__opt.is-active {
            background: color-mix(in srgb, rgba(99, 102, 241, 0.22) 55%, transparent 45%);
        }

        .popsel__opt.is-selected {
            background: color-mix(in srgb, rgba(99, 102, 241, 0.28) 70%, transparent 30%);
        }

    .popsel__opt--placeholder {
        opacity: 0.85;
        font-weight: 650;
    }

    /* Check */
    .popsel__check {
        opacity: 0.95;
        font-weight: 800;
    }

    /* Dropdown Transition */
    .popsel-dd-enter-active,
    .popsel-dd-leave-active {
        transition: opacity 0.16s ease, transform 0.16s ease;
    }

    .popsel-dd-enter-from,
    .popsel-dd-leave-to {
        opacity: 0;
        transform: translateY(-4px);
    }

    /* Scrollbar im Dropdown */
    .popsel__menu::-webkit-scrollbar {
        width: var(--sb-size);
        height: var(--sb-size);
    }

    .popsel__menu::-webkit-scrollbar-track {
        background: transparent;
    }

    .popsel__menu::-webkit-scrollbar-thumb {
        background: color-mix(in oklab, var(--accent-primary) 55%, transparent);
        border-radius: 999px;
        border: 3px solid transparent;
        background-clip: padding-box;
    }

    .popsel__opt--placeholder {
        cursor: default;
        pointer-events: none;
        user-select: none;
        opacity: 0.75;
    }

</style>
