<template>
    <div ref="rootEl" class="ui-select-wrapper">
        <button type="button"
                :class="['ui-select-trigger', externalClass]"
                v-bind="buttonAttrs"
                :disabled="disabled"
                @click="toggleOpen">
            <span class="ui-select-label">
                {{ displayText }}
            </span>
            <span class="ui-select-arrow">▾</span>
        </button>

        <ul v-if="isOpen" class="ui-select-menu">
            <li v-if="placeholder"
                class="ui-select-option is-placeholder"
                @click="selectPlaceholder">
                {{ placeholder }}
            </li>

            <li v-for="opt in normalizedOptions"
                :key="String(opt.value)"
                class="ui-select-option"
                :class="{
          'is-disabled': opt.disabled,
          'is-selected': isSelected(opt.value),
          'is-custom': opt.isCustom
        }"
                @click="onOptionClick(opt)">
                {{ opt.label }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  useAttrs,
  defineOptions,
} from 'vue';

defineOptions({ inheritAttrs: false });

type Option = {
  label: string;
  value: string | number;
  disabled?: boolean;
  isCustom?: boolean;
};

const props = defineProps<{
  modelValue: string | number | null;
  options: Array<string | Option>;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
}>();

const rawAttrs = useAttrs();

const buttonAttrs = computed(() => {
  const { class: _cls, ...rest } = rawAttrs;
  return rest;
});

const externalClass = computed(() => {
  return (rawAttrs.class as string) || '';
});

const normalizedOptions = computed<Option[]>(() =>
  props.options.map((opt) =>
    typeof opt === 'string'
      ? { label: opt, value: opt }
      : opt
  )
);

const isOpen = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const currentOption = computed(() =>
  normalizedOptions.value.find((opt) => opt.value === props.modelValue) || null
);

const displayText = computed(() => {
  if (currentOption.value) return currentOption.value.label;
  return props.placeholder || '';
});

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const isSelected = (value: string | number) => {
  return props.modelValue === value;
};

const onOptionClick = (opt: Option) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  close();
};

const selectPlaceholder = () => {
  emit('update:modelValue', '');
  close();
};

const onClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target || !rootEl.value) return;
  if (!rootEl.value.contains(target)) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', onClickOutside);
});
</script>

<style scoped>
    .ui-select-wrapper {
        position: relative;
        width: 100%;
    }

    /* sichtbarer „Input“ */
    .ui-select-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        height: var(--control-height, 48px);
        font-size: var(--control-font-size, 0.95rem);
        padding: 0.75rem var(--control-padding-x, 1.5rem);
        border-radius: 8px;
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-secondary, #f3f4f6);
        color: var(--text-color, #111827);
        cursor: pointer;
        box-sizing: border-box;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.15s ease, transform 0.05s ease;
    }

        .ui-select-trigger:hover {
            background-color: #e5e7eb;
        }

        .ui-select-trigger:focus {
            outline: none;
        }

        .ui-select-trigger:focus-visible {
            outline: 2px solid #4b6cb7;
            outline-offset: 2px;
            box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        }

        .ui-select-trigger:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

    /* Text + Pfeil */
    .ui-select-label {
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ui-select-arrow {
        font-size: 0.75rem;
        flex: 0 0 auto;
    }

    /* Dropdown */
    .ui-select-menu {
        position: absolute;
        inset-inline: 0;
        margin-top: 2px;
        padding: 4px 0;
        background: var(--bg-card, #ffffff);
        border-radius: 8px;
        border: 1px solid var(--border-color, #e5e7eb);
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
        z-index: 50;
        max-height: 200px;
        overflow-y: auto;
        box-sizing: border-box;
    }

    /* Optionen */
    .ui-select-option {
        padding: 0.35rem 0.75rem;
        font-size: 0.9rem;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

        .ui-select-option:hover {
            background: #e5e7eb;
        }

        .ui-select-option.is-placeholder {
            opacity: 0.75;
        }

        .ui-select-option.is-disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .ui-select-option.is-selected {
            font-weight: 600;
        }

        .ui-select-option.is-custom {
            border-top: 1px solid rgba(148, 163, 184, 0.5);
            margin-top: 4px;
            padding-top: 0.5rem;
        }

    /* Dark Mode */
    :root.dark .ui-select-trigger,
    html.dark-mode .ui-select-trigger {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    :root.dark .ui-select-menu,
    html.dark-mode .ui-select-menu {
        background: #0d1117;
        border-color: #30363d;
    }

    :root.dark .ui-select-option:hover,
    html.dark-mode .ui-select-option:hover {
        background: #1f2933;
    }
</style>
