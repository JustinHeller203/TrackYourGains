<!--Pfad: src/components/ui/kits/UiSearch.vue-->
<template>
   <div class="ui-search"
     :class="{ 'is-center': center }">
        <input class="ui-search__input"
               :id="id"
               :name="name"
               :value="modelValue"
               :placeholder="placeholder"
               :aria-label="ariaLabelComputed"
               :disabled="disabled"
               :autofocus="autofocus"
               @input="onInput"
               @keydown.esc="onEsc" />

        <button v-if="clearable && modelValue"
                class="ui-search__clear"
                type="button"
                aria-label="Suche leeren"
                title="Leeren"
                @click="clear">
            <img class="ui-search__clear-icon"
                 src="/SearchDelete.png"
                 alt=""
                 aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    const props = withDefaults(defineProps<{
        modelValue: string
        placeholder?: string
        ariaLabel?: string
        id?: string
        name?: string
        disabled?: boolean
        autofocus?: boolean
        clearable?: boolean
        center?: boolean
        maxWidth?: string
    }>(), {
        placeholder: 'Suchen…',
        ariaLabel: '',
        disabled: false,
        autofocus: false,
        clearable: true,
        center: true,
        maxWidth: '720px',
    })

    const emit = defineEmits<{
        (e: 'update:modelValue', v: string): void
    }>()

    const ariaLabelComputed = computed(() => props.ariaLabel?.trim() || props.placeholder || 'Suchen')

    function onInput(e: Event) {
        const v = (e.target as HTMLInputElement).value
        emit('update:modelValue', v)
    }

    function clear() {
        emit('update:modelValue', '')
    }

    function onEsc() {
        if (props.clearable && props.modelValue) clear()
    }
</script>

<style scoped>
    .ui-search {
        width: 100%;
        max-width: var(--ui-search-max, 720px);
        display: flex;
        justify-content: flex-start;
        position: relative;
    }

        .ui-search.is-center {
            justify-content: center;
            margin-inline: auto;
        }

    .ui-search__input {
        width: 100%;
        max-width: var(--ui-search-max, 720px);
        height: var(--control-height, 48px);
        font-size: var(--control-font-size, 0.95rem);
        color: var(--text-primary);
        padding: 0 calc(2.75rem + var(--ui-search-right-offset, 0px)) 0 2.35rem;
        border-radius: 999px;
        background-color: color-mix(in srgb, var(--bg-card) 86%, white 14%);
        border: 1px solid rgba(148, 163, 184, 0.22);
        background-image: radial-gradient(circle at 18% 35%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%), radial-gradient(circle at 85% 70%, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 19a8 8 0 1 1 5.293-14.707A8 8 0 0 1 11 19Zm9.707 1.293-4.2-4.2' stroke='%23888' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat, no-repeat, no-repeat;
        background-position: center, center, .9rem center;
        background-size: auto, auto, 16px 16px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 26px rgba(15, 23, 42, 0.12);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
    }

        .ui-search__input::placeholder {
            color: color-mix(in srgb, var(--text-secondary) 85%, transparent);
            opacity: 1;
        }

        .ui-search__input:hover {
            border-color: rgba(129, 140, 248, 0.35);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 14px 34px rgba(15, 23, 42, 0.16);
        }

        .ui-search__input:focus {
            outline: none;
            transform: translateY(-1px);
            border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(129, 140, 248, 0.55));
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent), 0 16px 38px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

    .ui-search__clear {
        position: absolute;
        right: calc(0.5rem + max(calc(var(--ui-search-right-offset, 0px) - 0.8rem), 0px));
        top: 50%;
        transform: translateY(-50%);
        width: 2.35rem;
        height: 2.35rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        background: transparent;
        border-radius: 10px;
        cursor: pointer;
        opacity: .95;
        transition: transform .12s ease, opacity .12s ease, background-color .12s ease;
    }


        .ui-search__clear:hover {
            opacity: 1;
            transform: translateY(-50%) scale(1.04);
            background: var(--bg-hover);
        }

    .ui-search__clear-icon {
        width: 1.75rem;
        height: 1.75rem;
        display: block;
        object-fit: contain;
        pointer-events: none;
        user-select: none;
    }
    /* Dark Mode */
    html.dark-mode .ui-search__input {
        color: #ffffff;
        background-color: rgba(2, 6, 23, 0.72);
        border-color: rgba(148, 163, 184, 0.28);
        background-image: radial-gradient(circle at 18% 35%, color-mix(in srgb, #6366f1 16%, transparent), transparent 58%), radial-gradient(circle at 85% 70%, color-mix(in srgb, #22c55e 12%, transparent), transparent 62%), url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 19a8 8 0 1 1 5.293-14.707A8 8 0 0 1 11 19Zm9.707 1.293-4.2-4.2' stroke='%239aa3ab' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 14px 34px rgba(0, 0, 0, 0.55);
    }

        html.dark-mode .ui-search__input::placeholder {
            color: rgba(201, 209, 217, 0.78);
        }

        html.dark-mode .ui-search__input:hover {
            border-color: rgba(129, 140, 248, 0.40);
        }

        html.dark-mode .ui-search__input:focus {
            border-color: color-mix(in srgb, var(--accent-primary) 65%, rgba(129, 140, 248, 0.55));
        }

    html.dark-mode .ui-search__clear {
        background: transparent;
        border: 0;
    }

    html.dark-mode .ui-search__clear-icon {
        width: 1.75rem;
        height: 1.75rem;
        display: block;
        object-fit: contain;
        pointer-events: none;
        user-select: none;
    }
</style>
