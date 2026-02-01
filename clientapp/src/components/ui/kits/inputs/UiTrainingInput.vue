<!-- components/ui/kits/inputs/UiTrainingInput.vue -->
<template>
    <div class="ti" :class="{ 'is-disabled': disabled, 'has-error': !!error }">
        <label v-if="label" class="ti-label" :for="id">{{ label }}</label>

        <div class="ti-control-wrap">
            <!-- INPUT -->
            <input v-if="kind === 'input'"
                   :id="id"
                   class="ti-control"
                   :class="{ slim }"
                   :type="type"
                   :value="stringValue"
                   :placeholder="placeholder"
                   :name="name"
                   :inputmode="inputmode"
                   :autocomplete="autocomplete"
                   :min="min"
                   :max="max"
                   :step="step"
                   :maxlength="maxLength"
                   :required="required"
                   :readonly="readonly"
                   :disabled="disabled"
                   :aria-label="ariaLabel || label || undefined"
                   :aria-invalid="!!error || undefined"
                   :aria-describedby="describedBy"
                   @input="onInput"
                   @blur="$emit('blur')"
                   @focus="$emit('focus')"
                   @keydown.enter="$emit('enter')" />

            <!-- TEXTAREA -->
            <textarea v-else-if="kind === 'textarea'"
                      :id="id"
                      class="ti-control ti-textarea"
                      :class="{ slim }"
                      :value="stringValue"
                      :placeholder="placeholder"
                      :name="name"
                      :autocomplete="autocomplete"
                      :maxlength="maxLength"
                      :required="required"
                      :readonly="readonly"
                      :disabled="disabled"
                      :rows="rows"
                      :aria-label="ariaLabel || label || undefined"
                      :aria-invalid="!!error || undefined"
                      :aria-describedby="describedBy"
                      @input="onInput"
                      @blur="$emit('blur')"
                      @focus="$emit('focus')" />

            <!-- SELECT -->
            <select v-else
                    :id="id"
                    class="ti-control ti-select"
                    :class="{ slim }"
                    :value="stringValue"
                    :name="name"
                    :required="required"
                    :disabled="disabled"
                    :aria-label="ariaLabel || label || undefined"
                    :aria-invalid="!!error || undefined"
                    :aria-describedby="describedBy"
                    @change="onInput"
                    @blur="$emit('blur')"
                    @focus="$emit('focus')">
                <option v-if="placeholder" disabled value="__placeholder__">{{ placeholder }}</option>
                <option v-for="opt in options"
                        :key="String(opt.value)"
                        :value="String(opt.value)"
                        :disabled="!!opt.disabled">
                    {{ opt.label }}
                </option>
            </select>

            <div v-if="$slots.right" class="ti-right">
                <slot name="right" />
            </div>
        </div>

        <p v-if="hint && !error" class="ti-hint" :id="hintId">{{ hint }}</p>
        <p v-if="error" class="ti-error" :id="errorId">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Option = { label: string; value: string | number; disabled?: boolean };

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined;

    label?: string;
    id: string;

    kind?: "input" | "textarea" | "select";
    type?: string;

    name?: string;
    placeholder?: string;

    inputmode?: string;
    autocomplete?: string;

    min?: number | string;
    max?: number | string;
    step?: number | string;
    maxLength?: number;

    rows?: number;

    required?: boolean;
    readonly?: boolean;
    disabled?: boolean;

    slim?: boolean;

    options?: Option[];

    ariaLabel?: string;

    hint?: string;
    error?: string;
  }>(),
  {
    kind: "input",
    type: "text",
    rows: 3,
    required: false,
    readonly: false,
    disabled: false,
    slim: false,
    options: () => [],
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "blur"): void;
  (e: "focus"): void;
  (e: "enter"): void;
}>();

const stringValue = computed(() => {
  // select placeholder support
  if (props.kind === "select" && (props.modelValue == null || props.modelValue === "")) {
    return props.placeholder ? "__placeholder__" : "";
  }
  return props.modelValue == null ? "" : String(props.modelValue);
});

const hintId = computed(() => `${props.id}__hint`);
const errorId = computed(() => `${props.id}__error`);

const describedBy = computed(() => {
  if (props.error) return errorId.value;
  if (props.hint) return hintId.value;
  return undefined;
});

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const v = el.value;

  // select placeholder -> treat as empty
  if (props.kind === "select" && v === "__placeholder__") {
    emit("update:modelValue", "");
    return;
  }

  emit("update:modelValue", v);
};
</script>

<style scoped>
    .ti {
        display: grid;
        gap: 0.4rem;
        width: 100%;
        flex: 1 1 0;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
    }

    .ti-label {
        font-weight: 700;
        font-size: 0.92rem;
        color: var(--text-primary);
        letter-spacing: -0.01em;
    }

    .ti-control-wrap {
        position: relative;
        display: grid;
        grid-template-columns: 1fr; /* default: volle Breite */
        align-items: center;
        gap: 0.5rem;
    }

        /* nur wenn rechts wirklich was existiert -> 2 Spalten */
        .ti-control-wrap:has(.ti-right) {
            grid-template-columns: 1fr auto;
        }
    .ti-control {
        width: 100%;
        min-width: 0;
        height: calc(var(--control-height, 48px) + var(--ti-height-bump, 4px));
        font-size: var(--control-font-size, 0.95rem);
        padding: 0 .9rem;
        border-radius: 12px;
        box-sizing: border-box;
        /* exakt wie UiSelect */
        border: 2px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color, #e5e7eb) 58%);
        background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), color-mix(in srgb, var(--bg-secondary, #f3f4f6) 86%, transparent);
        color: var(--text-primary, #111827);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--accent-primary) 7%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        outline: none;
        transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
    }

    ti-control.slim {
        height: calc(var(--control-height, 48px) - 6px + var(--ti-height-bump, 4px));
    }


    .ti-textarea {
        height: auto;
        padding: 0.8rem 1rem;
        resize: vertical;
        min-height: calc(var(--control-height, 48px) * 1.35);
    }

    .ti-select {
        padding-right: 2.25rem;
    }

    @media (hover: hover) {
        .ti-control:hover {
            border-color: color-mix(in srgb, var(--accent-primary) 56%, var(--border-color, #e5e7eb) 44%);
            box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent) inset, 0 0 0 5px color-mix(in srgb, var(--accent-primary) 10%, transparent);
        }
    }

    .ti-control:focus {
        outline: none;
    }

    .ti-control:focus-visible {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 32%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
    }

    .ti-right {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: calc(var(--control-height, 48px) + var(--ti-height-bump, 4px));
    }

    .is-disabled .ti-control {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .ti-hint {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.85;
        color: var(--text-secondary, var(--text-primary));
    }

    .ti-error {
        margin: 0;
        font-size: 0.85rem;
        color: #ef4444;
    }

    .has-error .ti-control {
        border-color: rgba(239, 68, 68, 0.65);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12), 0 16px 36px rgba(15, 23, 42, 0.18);
    }

    :root.dark .ti-control,
    html.dark-mode .ti-control {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.85) 52%, rgba(148, 163, 184, 0.35) 48%);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.14), transparent 58%), rgba(2, 6, 23, 0.48);
        color: #fff;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(129, 140, 248, 0.22) inset, 0 0 0 5px rgba(129, 140, 248, 0.10);
    }
</style>
