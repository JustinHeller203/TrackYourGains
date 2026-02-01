<template>
    <input :value="modelValue ?? ''"
           :class="inputClass"
           v-bind="forwardedAttrs"
           @input="onInput" />
</template>

<script setup lang="ts">
    import { computed, useAttrs } from 'vue'

    defineOptions({ inheritAttrs: false })

    const props = defineProps<{
        modelValue?: string | number | null
        compact?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: string): void
        (e: 'input', ev: Event): void
    }>()

    const attrs = useAttrs()

    const forwardedAttrs = computed(() => {
        const { class: _c, style: _s, ...rest } = attrs as Record<string, any>
        return rest
    })

    const inputClass = computed(() => {
        const extra = (attrs.class as any) || ''
        return ['tyg-timer-input', props.compact ? 'is-compact' : '', extra].filter(Boolean)
    })

    const onInput = (e: Event) => {
        const v = (e.target as HTMLInputElement | null)?.value ?? ''
        emit('update:modelValue', v)
        emit('input', e) // wichtig: damit dein bestehendes @input weiterläuft
    }
</script>

<style scoped>
    .tyg-timer-input {
        padding: 0.7rem 0.85rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.22);
        color: var(--text-primary);
        font-size: 0.92rem;
        width: 165px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }

        .tyg-timer-input:focus {
            outline: none;
            border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(129, 140, 248, 0.55));
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent), 0 10px 24px rgba(15, 23, 42, 0.18);
            transform: translateY(-1px);
        }

        .tyg-timer-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

    html.dark-mode .tyg-timer-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .is-compact {
        width: 120px;
    }
</style>
