<!-- components/ui/kits/inputs/UiPopupInput.vue -->
<template>
    <div class="popinp" :class="{ 'is-disabled': disabled, 'has-error': !!error }">
        <label v-if="label" class="popinp__label" :for="id">{{ label }}</label>

        <div class="popinp__field">
            <span v-if="$slots.leading" class="popinp__slot popinp__slot--leading">
                <slot name="leading" />
            </span>

            <!-- INPUT / TEXTAREA -->
            <component :is="as"
                       ref="controlEl"
                       :id="id"
                       class="popinp__control"
                       :class="{ 'has-leading': !!$slots.leading, 'has-trailing': !!$slots.trailing }"
                       :type="as === 'input' ? type : undefined"
                       :value="stringValue"
                       :placeholder="placeholder"
                       :disabled="disabled"
                       :readonly="readonly"
                       :inputmode="inputmode"
                       :autocomplete="autocomplete"
                       :min="min"
                       :max="max"
                       :step="step"
                       :maxlength="maxlength"
                       :rows="as === 'textarea' ? rows : undefined"
                       :aria-invalid="!!error"
                       :aria-describedby="describedBy"
                       @input="onInput"
                       @focus="$emit('focus')"
                       @keydown.enter="onEnter"
                       @blur="$emit('blur')" />


            <span v-if="$slots.trailing" class="popinp__slot popinp__slot--trailing">
                <slot name="trailing" />
            </span>
        </div>

        <p v-if="error" class="popinp__msg popinp__msg--error" :id="errorId">{{ error }}</p>
        <p v-else-if="hint" class="popinp__msg" :id="hintId">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from "vue";

    type PopupInputAs = "input" | "textarea";

    const props = withDefaults(defineProps<{
        modelValue: string | number | null | undefined
        label?: string
        placeholder?: string
        hint?: string
        error?: string
        id?: string
        as?: PopupInputAs
        type?: string
        rows?: number
        disabled?: boolean
        readonly?: boolean
        autofocus?: boolean
        inputmode?: string
        autocomplete?: string
        min?: string | number
        max?: string | number
        step?: string | number
        maxlength?: number
    }>(), {
        as: "input",
        type: "text",
        rows: 3,
        disabled: false,
        readonly: false,
        autofocus: false,
        autocomplete: "off",
    });

    const emit = defineEmits<{
        (e: "update:modelValue", v: string): void
        (e: "enter"): void
        (e: "focus"): void
        (e: "blur"): void
    }>();

    const fallbackId = `popinp-${Math.random().toString(36).slice(2, 10)}`;
    const id = computed(() => props.id || fallbackId);
    const controlEl = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const hintId = computed(() => `${id.value}-hint`);
    const errorId = computed(() => `${id.value}-error`);

    const describedBy = computed(() => {
        if (props.error) return errorId.value;
        if (props.hint) return hintId.value;
        return undefined;
    });

    function focus() {
        // 1) Ref bevorzugen
        controlEl.value?.focus();
        // 2) Fallback auf id (falls ref mal nicht greift)
        if (!controlEl.value) {
            const el = document.getElementById(id.value) as HTMLInputElement | HTMLTextAreaElement | null;
            el?.focus();
        }
    }

    defineExpose({ focus });

    const stringValue = computed(() => (props.modelValue ?? "").toString());

    const onInput = (e: Event) => {
        const v = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
        emit("update:modelValue", v);
    };

    const onEnter = (e: KeyboardEvent) => {
        if (props.as === "textarea") return; // Enter soll in Textarea normal bleiben
        emit("enter");
    };

    onMounted(() => {
        if (!props.autofocus) return;
        const el = document.getElementById(id.value) as HTMLInputElement | HTMLTextAreaElement | null;
        el?.focus();
    });
</script>

<style scoped>
    .popinp {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        width: 100%;
    }

    .popinp__label {
        font-size: 0.92rem;
        font-weight: 650;
        color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
        line-height: 1.2;
        margin: 0;
    }

    .popinp__field {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.32);
        /* DARK wie Popup */
        background: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
        /* Tiefe wie Modal-Card */
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
        transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
    }

    .popinp__control {
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
    }

        .popinp__control.has-leading {
            padding-left: 2.45rem;
        }

        .popinp__control.has-trailing {
            padding-right: 2.65rem;
        }

        .popinp__control::placeholder {
            opacity: 0.52;
            color: rgba(148, 163, 184, 0.85);
        }

    /* Slots */
    .popinp__slot {
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

    .popinp__slot--leading {
        left: 0.18rem;
    }

    .popinp__slot--trailing {
        right: 0.18rem;
    }

    /* Fokus: weniger “neon”, mehr “Popup-Glow” */
    .popinp__field:focus-within {
        border-color: rgba(148, 163, 184, 0.55);
        background: color-mix(in srgb, #020617 84%, var(--bg-card) 16%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.55);
        transform: translateY(-1px);
    }

    /* Error: dark + clean */
    .popinp.has-error .popinp__field {
        border-color: rgba(239, 68, 68, 0.55);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 3px rgba(239, 68, 68, 0.14), 0 18px 52px rgba(0, 0, 0, 0.5);
    }

    .popinp.is-disabled {
        opacity: 0.55;
        pointer-events: none;
        filter: saturate(0.85);
    }

    .popinp__msg {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.84;
        line-height: 1.35;
        color: rgba(148, 163, 184, 0.95);
    }

    .popinp__msg--error {
        opacity: 1;
        color: #ef4444;
        font-weight: 650;
    }
</style>
