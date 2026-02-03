<!--Pfad: components/ui/kits/inputs/UiCalculatorInput.vue-->
<template>
    <div class="ui-input" :class="{ 'is-disabled': disabled, 'has-error': !!error }">
        <label v-if="label" class="ui-label" :for="computedId">
            <span class="ui-label__text">{{ label }}</span>
            <span v-if="required" class="ui-label__req">*</span>
        </label>

        <div class="ui-field">
            <component :is="as"
                       :id="computedId"
                       class="ui-control"
                       :class="{ 'with-suffix': !!suffix || !!$slots.suffix }"
                       :type="as === 'input' ? type : undefined"
                       :value="modelValue"
                       :placeholder="placeholder"
                       :disabled="disabled"
                       :inputmode="inputmode"
                       :autocomplete="autocomplete"
                       :min="min"
                       :max="max"
                       :step="step"
                       @input="onInput"
                       @change="onChange"
                       @blur="$emit('blur')"
                       @focus="$emit('focus')">
                <option v-if="as === 'select' && placeholder" disabled value="">
                    {{ placeholder }}
                </option>

                <option v-for="opt in options"
                        :key="String(opt.value)"
                        :value="opt.value">
                    {{ opt.label }}
                </option>
            </component>

            <div v-if="suffix || $slots.suffix" class="ui-suffix">
                <slot name="suffix">{{ suffix }}</slot>
            </div>
        </div>

        <div v-if="error" class="ui-msg ui-msg--error">{{ error }}</div>
        <div v-else-if="hint" class="ui-msg ui-msg--hint">{{ hint }}</div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    type Opt = { label: string; value: string | number }

    const props = withDefaults(defineProps<{
        modelValue: string | number
        label?: string
        hint?: string
        error?: string
        placeholder?: string
        type?: string
        as?: 'input' | 'select' | 'textarea'
        options?: Opt[]
        suffix?: string
        id?: string
        disabled?: boolean
        required?: boolean
        inputmode?: string
        autocomplete?: string
        min?: number | string
        max?: number | string
        step?: number | string
    }>(), {
        type: 'text',
        as: 'input',
        options: () => [],
    })

    const emit = defineEmits<{
        (e: 'update:modelValue', v: string | number): void
        (e: 'blur'): void
        (e: 'focus'): void
        (e: 'change', v: string | number): void
    }>()

    const computedId = computed(() => props.id || `ui-input-${Math.random().toString(16).slice(2)}`)

    function onInput(e: Event) {
        const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        emit('update:modelValue', el.value)
    }

    function onChange(e: Event) {
        const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        emit('change', el.value)
    }
</script>

<style scoped>
    .ui-input {
        display: grid;
        gap: .35rem;
    }

    .ui-label {
        display: inline-flex;
        gap: .35rem;
        align-items: baseline;
        font-size: .9rem;
        font-weight: 650;
        color: color-mix(in srgb, var(--text-secondary) 78%, var(--text-primary) 22%);
        letter-spacing: .02em;
    }

    .ui-label__req {
        color: color-mix(in srgb, var(--accent-primary) 70%, #ff3b7a 30%);
    }

    .ui-field {
        position: relative;
        display: grid;
    }

    .ui-control {
        width: 100%;
        min-width: 0;
        padding: .72rem .85rem;
        border-radius: 12px;
        /* gleiche DNA wie .calculator-card (nur „flacher“) */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.22);
        color: var(--text-primary);
        outline: none;
        font-size: .95rem;
        line-height: 1.2;
        /* wie Card, aber weniger brutal */
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,.04);
        transition: border-color .2s ease, box-shadow .2s ease, background .25s ease;
    }

    html.dark-mode .ui-control {
        /* 1:1 wie Card im Darkmode */
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border: 1px solid rgba(148, 163, 184, 0.38);
        box-shadow: 0 14px 30px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.03);
    }

    .ui-control.with-suffix {
        padding-right: 3.25rem;
    }

    .ui-control::placeholder {
        color: color-mix(in srgb, var(--text-secondary) 70%, transparent);
    }

    .ui-control:focus {
        border-color: rgba(129, 140, 248, 0.70);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 16%, transparent), 0 16px 34px rgba(15,23,42,.22), inset 0 1px 0 rgba(255,255,255,.04);
    }

    html.dark-mode .ui-control:focus {
        border-color: rgba(129, 140, 248, 0.70);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 18px 38px rgba(0,0,0,.60), inset 0 1px 0 rgba(255,255,255,.03);
    }

    .ui-suffix {
        position: absolute;
        right: .55rem;
        top: 50%;
        transform: translateY(-50%);
        padding: .48rem .6rem;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        color: color-mix(in srgb, var(--text-secondary) 75%, var(--text-primary) 25%);
        font-weight: 700;
        user-select: none;
    }

    html.dark-mode .ui-suffix {
        border-color: rgba(148, 163, 184, 0.38);
        background: radial-gradient(circle at top left, rgba(99,102,241,.10), transparent 62%), #020617;
    }


    .ui-msg {
        font-size: .88rem;
        line-height: 1.25;
    }

    .ui-msg--hint {
        color: color-mix(in srgb, var(--text-secondary) 82%, var(--text-primary) 18%);
    }

    .ui-msg--error {
        color: #ff4d6d;
    }

    .is-disabled .ui-control {
        opacity: .6;
        cursor: not-allowed;
    }

    .has-error .ui-control {
        border-color: color-mix(in srgb, #ff4d6d 70%, var(--border-color) 30%);
        box-shadow: 0 0 0 3px color-mix(in srgb, #ff4d6d 18%, transparent), 0 12px 26px rgba(15,23,42,.16);
    }
</style>
