<template>
    <div ref="rootEl" class="ui-select-wrapper" :class="{ 'is-open': isOpen }">
        <button type="button"
                ref="triggerEl"
                :class="['ui-select-trigger', externalClass]"
                v-bind="buttonAttrs"
                :disabled="disabled"
                @click="toggleOpen">
            <span class="ui-select-label">
                {{ displayText }}
            </span>
            <span class="ui-select-arrow">▾</span>
        </button>

        <Teleport to="body">
            <ul v-if="isOpen"
                ref="menuEl"
                class="ui-select-menu"
                :style="menuStyle"
                @pointerdown.stop
                @click.stop>
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
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  nextTick,
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
const triggerEl = ref<HTMLElement | null>(null);
const menuEl = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});

const currentOption = computed(() =>
  normalizedOptions.value.find((opt) => opt.value === props.modelValue) || null
);

const displayText = computed(() => {
  if (currentOption.value) return currentOption.value.label;
  return props.placeholder || '';
});

const updateMenuPosition = () => {
  const trigger = triggerEl.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  menuStyle.value = {
    position: 'fixed',
    left: `${Math.round(rect.left)}px`,
    top: `${Math.round(rect.bottom + 8)}px`,
    width: `${Math.round(rect.width)}px`,
    zIndex: '10100',
  };
};

const onPointerDownOutside = (event: Event) => {
  const target = event.target as Node | null;
  if (!target) return;
  if (rootEl.value?.contains(target)) return;
  if (menuEl.value?.contains(target)) return;
  close();
};

const open = () => {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;

  nextTick(() => {
    updateMenuPosition();
  });

  window.addEventListener('pointerdown', onPointerDownOutside, true);
  window.addEventListener('resize', updateMenuPosition);
  window.addEventListener('scroll', updateMenuPosition, true);
};

const close = () => {
  isOpen.value = false;
  window.removeEventListener('pointerdown', onPointerDownOutside, true);
  window.removeEventListener('resize', updateMenuPosition);
  window.removeEventListener('scroll', updateMenuPosition, true);
};

const toggleOpen = () => {
  if (props.disabled) return;
  if (isOpen.value) close();
  else open();
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

onBeforeUnmount(() => {
  close();
});
</script>

<style scoped>
    .ui-select-wrapper {
        position: relative;
        z-index: 0;
        isolation: isolate;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        flex: 1 1 0;
        box-sizing: border-box;
    }

    .ui-select-wrapper.is-open {
        z-index: 1400;
    }

    .ui-select-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        height: var(--control-height, 48px);
        font-size: var(--control-font-size, 0.95rem);
        min-width: 0;
        padding: 0 .9rem;
        border-radius: 12px;
        cursor: pointer;
        box-sizing: border-box;
        border: 2px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color, #e5e7eb) 58%);
        background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), color-mix(in srgb, var(--bg-secondary, #f3f4f6) 86%, transparent);
        color: var(--text-primary, #111827);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--accent-primary) 7%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
    }

    .ui-select-trigger:hover {
        border-color: color-mix(in srgb, var(--accent-primary) 56%, var(--border-color, #e5e7eb) 44%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent) inset, 0 0 0 5px color-mix(in srgb, var(--accent-primary) 10%, transparent);
    }

    .ui-select-trigger:focus {
        outline: none;
    }

    .ui-select-trigger:focus-visible {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 32%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
    }

    .ui-select-trigger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

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

    .ui-select-menu {
        margin: 0;
        padding: 6px 0;
        list-style: none;
        border-radius: 12px;
        border: 2px solid color-mix(in srgb, var(--accent-primary) 34%, var(--border-color, #e5e7eb) 66%);
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.99)),
            var(--bg-card, #ffffff);
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.62) inset;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        max-height: 220px;
        overflow-y: auto;
        box-sizing: border-box;
        pointer-events: auto;
    }

    .ui-select-option {
        padding: 0.35rem 0.75rem;
        font-size: 0.9rem;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: auto;
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

    :root.dark .ui-select-trigger,
    html.dark-mode .ui-select-trigger {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.85) 52%, rgba(148, 163, 184, 0.35) 48%);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.14), transparent 58%), rgba(2, 6, 23, 0.48);
        color: #fff;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(129, 140, 248, 0.22) inset, 0 0 0 5px rgba(129, 140, 248, 0.10);
    }

    :root.dark .ui-select-menu,
    html.dark-mode .ui-select-menu {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.70) 38%, rgba(148, 163, 184, 0.28) 62%);
        border-width: 2px;
        border-style: solid;
        background:
            linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98)),
            #0f172a;
    }

    :root.dark .ui-select-option:hover,
    html.dark-mode .ui-select-option:hover {
        background: rgba(99, 102, 241, 0.14);
    }
</style>
