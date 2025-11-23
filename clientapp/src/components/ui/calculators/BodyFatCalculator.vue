<!-- src/components/ui/calculators/BodyFatCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Körperfett-Rechner' }}
                <InfoHover :text="infoText" />
            </h3>

            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzuf�gen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <div class="input-group">
            <label>Geschlecht</label>
            <select :value="gender" @change="onGenderChange" class="edit-input">
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
            </select>
        </div>

        <div class="input-group">
            <label>Bauchumfang (cm)</label>
            <input :value="waist ?? ''"
                   @input="onWaist"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 85" />
        </div>

        <div class="input-group">
            <label>Halsumfang (cm)</label>
            <input :value="neck ?? ''"
                   @input="onNeck"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 38" />
        </div>

        <div class="input-group" v-if="gender === 'female'">
            <label>Hüftumfang (cm)</label>
            <input :value="hip ?? ''"
                   @input="onHip"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 95" />
        </div>

        <div class="input-group">
            <label>Größe (cm)</label>
            <input :value="height ?? ''"
                   @input="onHeight"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 170" />
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result !== null" class="result">
            <div class="result-header">
                <p><strong>Körperfett:</strong> {{ result!.toFixed(1) }}%</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <p class="hint">Formel: US Navy Methode</p>
        </div>

        <div class="card-footer">
            <div class="footer-actions">
                <ExportButton class="calc-footer-btn"
                              title="Exportieren"
                              aria-label="Exportieren"
                              data-short="Export"
                              @click="$emit('export')" />
                <ResetButton class="calc-footer-btn"
                             title="Zurücksetzen"
                             aria-label="Zurücksetzen"
                             data-short="Reset"
                             @click="$emit('reset')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import InfoHover from '@/components/ui/InfoHover.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

    type Gender = 'male' | 'female'

    const props = defineProps<{
        autoCalcEnabled: boolean
        bodyFatGender: Gender
        bodyFatWaist: number | null
        bodyFatNeck: number | null
        bodyFatHip: number | null
        bodyFatHeight: number | null
        bodyFatResult: number | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:bodyFatGender', v: Gender): void
        (e: 'update:bodyFatWaist', v: number | null): void
        (e: 'update:bodyFatNeck', v: number | null): void
        (e: 'update:bodyFatHip', v: number | null): void
        (e: 'update:bodyFatHeight', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    // Default-Infotext, falls Parent nichts liefert
    const infoText = computed(
        () =>
            props.info ??
            'US-Navy-Methode: nutzt Bauch- und Halsumfang (bei Frauen zusätzlich Hüfte) sowie die Körpergröße, um den Körperfettanteil zu schätzen.'
    )

    const gender = computed(() => props.bodyFatGender)
    const waist = computed(() => props.bodyFatWaist)
    const neck = computed(() => props.bodyFatNeck)
    const hip = computed(() => props.bodyFatHip)
    const height = computed(() => props.bodyFatHeight)
    const result = computed(() => props.bodyFatResult)

    function onGenderChange(ev: Event) {
        emit('update:bodyFatGender', (ev.target as HTMLSelectElement).value as Gender)
    }
    function onWaist(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatWaist', v === '' ? null : Number(v))
    }
    function onNeck(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatNeck', v === '' ? null : Number(v))
    }
    function onHip(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatHip', v === '' ? null : Number(v))
    }
    function onHeight(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatHeight', v === '' ? null : Number(v))
    }
</script>

<style scoped>
    /* Basis-Styles, Tooltip-/Fav-Button-Styles entfernt (kommen aus InfoHover/FavoriteButton) */
    .calculator-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: transform .3s, box-shadow .3s, border-color .3s;
        color: var(--text-primary);
    }

        .calculator-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: var(--accent-primary);
        }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: .5rem;
    }

    .input-group {
        margin-bottom: 1rem;
    }

        .input-group label {
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

    .edit-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        transition: border-color .3s, box-shadow .3s;
    }

        .edit-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
            outline: none;
        }

    .result {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
    }

    .result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        margin-bottom: .35rem;
    }

    .card-footer {
        border-top: 1px solid var(--border-color);
        padding: 0.75rem 1rem 0;
        display: flex;
        justify-content: center; /* zentriert den Button-Block */
        gap: 0.75rem;
        margin-top: 0.75rem;
    }

    .footer-spacer {
        flex: 1;
    }

    .footer-actions {
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
        justify-content: center; /* Buttons innerhalb mittig */
        margin: 0 auto; /* Block selbst mittig (falls irgendwas schiebt) */
        width: auto; /* nicht volle Breite erzwingen */
    }

    @media (max-width: 600px) {
        .footer-actions {
            display: grid;
            grid-template-columns: 1fr 1fr; /* zwei gleich breite Buttons */
            gap: .5rem;
            width: 100%;
        }

        .calc-footer-btn {
            min-height: 44px; /* gutes Touch-Target */
            padding: .5rem .6rem;
        }
    }
    @media (max-width: 600px) {
        .footer-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: .5rem;
            width: 100%;
            justify-items: center; /* Grid-Zellen-Inhalt mittig */
        }
    }
</style>

