<!--Pfad: components/ui/popups/ToastTypeManagerPopup.vue-->

<template>
    <BasePopup :show="show"
               :showActions="true"
               @cancel="$emit('close')">

        <!-- Head wie im alten Modal (full width) -->
        <div class="tm-head">
            <div class="tm-title">
                <strong>Toast-Arten verwalten</strong>
                <span class="tm-sub">{{ enabledCount }} aktiv · {{ disabledCount }} deaktiviert</span>
            </div>

        </div>

        <!-- Actions wie früher (full width, border-bottom) -->
        <div class="tm-actions">
            <button type="button" class="tm-btn" @click="$emit('set-all', true)">
                Alle aktivieren
            </button>
            <button type="button" class="tm-btn ghost" @click="$emit('set-all', false)">
                Alle deaktivieren
            </button>
        </div>

        <div class="tm-list">
            <div class="tm-row" v-for="opt in options" :key="opt.key">
                <div class="tm-row-left">
                    <div class="tm-row-label">
                        {{ opt.emoji }} {{ opt.label }}
                        <button type="button"
                                class="tm-preview"
                                aria-label="Vorschau"
                                title="Vorschau"
                                @click.stop="$emit('preview', opt.key)">
                            👁️
                        </button>
                    </div>                    <div class="tm-row-hint">{{ opt.hint }}</div>
                </div>

                <button type="button"
                        class="tm-row-action"
                        :class="{ off: !enabledMap[opt.key] }"
                        @click="$emit('toggle', opt.key)">
                    {{ enabledMap[opt.key] ? 'Deaktivieren' : 'Aktivieren' }}
                </button>
            </div>
        </div>

        <template #actions>
            <div class="tm-foot">
                <PopupActionButton @click="$emit('done')">Fertig</PopupActionButton>
            </div>
        </template>
    </BasePopup>

</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    type ToastTypeOption = {
        key: string
        label: string
        emoji: string
        hint: string
    }

    const props = defineProps<{
        show: boolean
        options: ReadonlyArray<ToastTypeOption>
        enabledMap: Record<string, boolean>
    }>()

    defineEmits<{
        (e: 'close'): void
        (e: 'done'): void
        (e: 'set-all', v: boolean): void
        (e: 'toggle', key: string): void
        (e: 'preview', key: string): void
    }>()

    const enabledCount = computed(() =>
        props.options.filter(o => !!props.enabledMap[o.key]).length
    )
    const disabledCount = computed(() => props.options.length - enabledCount.value)
</script>

<style scoped>

    .tm-sub {
        color: var(--text-secondary);
        font-weight: 800;
        font-size: 0.95rem;
    }

    .tm-btn {
        border-radius: 14px;
        padding: 0.6rem 0.85rem;
        border: 2px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 800;
        cursor: pointer;
    }

        .tm-btn.ghost {
            opacity: 0.85;
        }

    .tm-btn {
        transition: transform 140ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease, opacity 140ms ease;
    }

        .tm-btn:hover {
            transform: translateY(-1px);
            border-color: rgba(129, 140, 248, 0.55);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16);
        }

        .tm-btn:active {
            transform: translateY(0);
            opacity: 0.95;
        }

        .tm-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.16), 0 14px 28px rgba(15, 23, 42, 0.16);
        }

        /* ghost bleibt ghosty, aber fühlt sich trotzdem “clickable” an */
        .tm-btn.ghost:hover {
            opacity: 1;
        }

    .tm-head {
        /* full width wie früher modal-head */
        margin: -1rem -1.1rem 0;
        padding: 1rem 1.1rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.25);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .tm-title strong {
        display: block;
        font-size: 1.05rem;
        color: var(--text-primary);
    }

    .tm-actions {
        /* full width wie früher modal-actions */
        margin: 0 -1.1rem;
        padding: 0.9rem 1.1rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        display: flex;
        gap: 0.6rem;
    }

    .tm-list {
        /* full width + scroll wie früher modal-list */
        margin: 0 -1.1rem -1rem;
        max-height: min(52vh, 520px);
        overflow: auto;
    }

    .tm-foot {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    .tm-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.95rem 1.1rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    }

    .tm-row-left {
        min-width: 0;
    }

    .tm-row-label {
        font-weight: 900;
        color: var(--text-primary);
        font-size: 1rem;
    }

    .tm-row-hint {
        margin-top: 0.25rem;
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 0.92rem;
    }

    .tm-row-action {
        flex: 0 0 auto;
        border-radius: 14px;
        padding: 0.55rem 0.8rem;
        border: 2px solid rgba(129, 140, 248, 0.45);
        background: rgba(129, 140, 248, 0.10);
        color: var(--text-primary);
        font-weight: 900;
        cursor: pointer;
        transition: transform 140ms ease, opacity 140ms ease;
    }

        .tm-row-action:hover {
            transform: translateY(-1px);
        }

        .tm-row-action.off {
            border-color: rgba(148, 163, 184, 0.35);
            background: rgba(148, 163, 184, 0.10);
            opacity: 0.85;
        }

    .tm-preview {
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        margin-left: 0.45rem;
        padding: 0;
        line-height: 1;
        font-size: 0.95rem;
        opacity: 0.85;
    }

        .tm-preview:hover {
            opacity: 1;
        }

    :global(html.dark-mode) .tm-btn {
        background: #0d1117;
        color: #ffffff;
        border-color: #30363d;
    }

    :global(html.dark-mode) .tm-row-label {
        color: #ffffff;
    }

    :global(html.dark-mode) .tm-row-hint,
    :global(html.dark-mode) .tm-sub {
        color: #c9d1d9;
    }

    :global(html.dark-mode) .tm-row-action {
        color: #ffffff;
    }
</style>
