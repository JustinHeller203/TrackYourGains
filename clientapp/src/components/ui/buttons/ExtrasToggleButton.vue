<!-- ExtrasToggleButton.vue -->
<template>
    <BaseButton v-bind="$attrs"                     
    :type="type"
    :title="computedTitle"
    :aria-label="ariaLabel || computedTitle"
    :disabled="disabled"
    :extraClass="mergedClass"         
    :aria-pressed="toggled ? 'true' : 'false'"
    @click="$emit('click', $event)"
  >
    <span class="extras-icon" :class="{ rotated: toggled }" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h12M4 17h16M16 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="extras-label">
      {{ toggled ? 'Extras ausblenden' : 'Extras einblenden' }}
    </span>
  </BaseButton>
</template>

<script setup lang="ts">
    import { computed, useAttrs } from 'vue'
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    type ClassLike = string | Record<string, boolean>
    type ClassProp = ClassLike | ClassLike[]

    const props = withDefaults(defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        extraClass?: ClassProp
        toggled?: boolean
    }>(), {
        type: 'button',
        title: 'Extras einblenden',
        disabled: false,
        toggled: false,
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

    const attrs = useAttrs()

    const computedTitle = computed(() =>
        props.toggled ? 'Extras ausblenden' : (props.title || 'Extras einblenden')
    )

    const toArray = (cls?: ClassProp | null): ClassLike[] =>
        cls ? (Array.isArray(cls) ? cls : [cls]) : []

    const mergedClass = computed<ClassLike[]>(() => [
        'toggle-exercise-btn',
        'btn-extras-chip',
        ...toArray(attrs.class as ClassProp | undefined),
        ...toArray(props.extraClass),
        { active: !!props.toggled },
    ])
</script>

<style scoped>
    .extras-icon {
        display: inline-flex;
        width: 1.05rem;
        height: 1.05rem;
        margin-right: .4rem;
        transition: transform .18s ease;
    }

        .extras-icon.rotated {
            transform: rotate(180deg);
        }

    .extras-label {
        line-height: 1;
        white-space: nowrap;
        font-weight: 600;
        letter-spacing: .01em;
    }

    /* Mobile: nur Icon anzeigen, kein gequetschter Text */
    @media (max-width: 560px) {
        .extras-label {
            display: none;
        }

        .extras-icon {
            margin-right: 0;
        }
    }

    .extras-icon {
        display: inline-flex;
        width: 1.05rem;
        height: 1.05rem;
        margin-right: .4rem;
        transition: transform .18s ease;
    }

        .extras-icon.rotated {
            transform: rotate(180deg);
        }

    .extras-label {
        line-height: 1;
        white-space: nowrap;
        font-weight: 600;
        letter-spacing: .01em;
    }

    /* icon-only bis 960px */
    @media (max-width: 960px) {
        .extras-label {
            display: none;
        }

        .extras-icon {
            margin-right: 0;
        }
    }

</style>
