<template>
    <BasePopup :show="show"
               title="Schmerztagebuch"
               overlayClass="pain-feedback-popup"
               :show-actions="false"
               @cancel="onSkip">
        <div class="pain-root">
            <p class="pain-sub">
                Wie fühlte sich dein Schmerz nach dem Training an?
            </p>

            <div class="intensity-field">
                <div class="intensity-head">
                    <label class="field-label">Intensität</label>
                    <strong>{{ painLevel }}/10</strong>
                </div>

                <div class="intensity-slider-wrap">
                    <input v-model.number="painLevel"
                           class="intensity-slider"
                           type="range"
                           min="0"
                           max="10"
                           step="1"
                           :style="sliderStyle"
                           aria-label="Intensität auswählen" />
                    <div class="intensity-ends" aria-hidden="true">
                        <span>0</span>
                        <span>10</span>
                    </div>
                </div>
            </div>
            <p class="pain-hint">0 = kein Schmerz · 10 = maximal</p>

            <textarea v-model="note"
                      rows="2"
                      class="pain-note"
                      placeholder="Optional: kurz notieren (z. B. besser als letzte Einheit)" />

            <div class="pain-actions">
                <PopupActionButton variant="ghost" @click="onSkip">
                    Überspringen
                </PopupActionButton>
                <PopupActionButton @click="onSave">
                    Speichern
                </PopupActionButton>
            </div>
        </div>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    const props = defineProps<{
        show: boolean
    }>()

    const emit = defineEmits<{
        (e: 'save', payload: { painLevel: number; note: string }): void
        (e: 'skip'): void
    }>()

    const painLevel = ref(4)
    const note = ref('')
    const sliderStyle = computed(() => {
        const ratio = Math.max(0, Math.min(1, painLevel.value / 10))
        const hue = 120 - (120 * ratio) // 120=grün -> 0=rot
        return {
            '--thumb-color': `hsl(${hue} 85% 48%)`,
        }
    })

    const reset = () => {
        painLevel.value = 4
        note.value = ''
    }

    const onSave = () => {
        emit('save', {
            painLevel: painLevel.value,
            note: note.value.trim().slice(0, 220),
        })
        reset()
    }

    const onSkip = () => {
        emit('skip')
        reset()
    }

    watch(() => props.show, (open) => {
        if (open) reset()
    })
</script>

<style scoped>
    .pain-root {
        display: grid;
        gap: .75rem;
    }

    .pain-sub {
        margin: 0;
        color: var(--text-secondary);
        font-size: .95rem;
    }

    .intensity-field {
        display: grid;
        gap: .6rem;
        padding-top: .15rem;
    }

    .intensity-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        color: var(--text-primary);
    }

    .intensity-slider {
        width: 100%;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        margin: 0;
    }

    .intensity-slider-wrap {
        display: grid;
        gap: .28rem;
    }

    .intensity-slider::-webkit-slider-runnable-track {
        height: 10px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.32);
        background: linear-gradient(90deg,
                rgba(34, 197, 94, 0.7) 0%,
                rgba(249, 115, 22, 0.78) 55%,
                rgba(239, 68, 68, 0.82) 100%);
    }

    .intensity-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-top: -4px;
        border: 2px solid rgba(255, 255, 255, 0.9);
        background: var(--thumb-color, var(--accent-primary));
        box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.24);
        transition: transform .14s ease, box-shadow .14s ease;
    }

    .intensity-slider:active::-webkit-slider-thumb {
        transform: scale(1.08);
        box-shadow: 0 0 0 5px rgba(249, 115, 22, 0.2);
    }

    .intensity-slider::-moz-range-track {
        height: 10px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.32);
        background: linear-gradient(90deg,
                rgba(34, 197, 94, 0.7) 0%,
                rgba(249, 115, 22, 0.78) 55%,
                rgba(239, 68, 68, 0.82) 100%);
    }

    .intensity-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.9);
        background: var(--thumb-color, var(--accent-primary));
        box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.24);
        transition: transform .14s ease, box-shadow .14s ease;
    }

    .intensity-slider:active::-moz-range-thumb {
        transform: scale(1.08);
        box-shadow: 0 0 0 5px rgba(249, 115, 22, 0.2);
    }

    .intensity-ends {
        display: flex;
        justify-content: space-between;
        font-size: .95rem;
        font-weight: 800;
        letter-spacing: .01em;
        color: var(--text-primary);
        text-shadow: 0 1px 0 rgba(2, 6, 23, .2);
        padding: .05rem .2rem 0;
        opacity: .98;
    }

    .pain-hint {
        margin: 0;
        color: var(--text-secondary);
        font-size: .84rem;
    }

    .pain-note {
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(0, 0, 0, .1);
        color: var(--text-primary);
        padding: .55rem .7rem;
        resize: vertical;
    }

    .pain-actions {
        display: flex;
        justify-content: flex-end;
        gap: .55rem;
        flex-wrap: wrap;
    }
</style>
