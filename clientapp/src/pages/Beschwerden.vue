<template>
    <div class="complaints-page">
        <h2 class="page-title">Beschwerden</h2>

        <section class="section-block" aria-label="Beschwerden Übersicht">
            <h3 class="section-title">Deine Übersicht</h3>

            <div class="dashboard-grid">
                <DashboardCard title="Aktive Beschwerden"
                               :info="String(activeCount)"
                               :muted="!entries.length"
                               compact />

                <DashboardCard title="Durchschnittliche Intensität"
                               :info="averageIntensityInfo"
                               :muted="!entries.length"
                               compact />

                <DashboardCard title="Häufigste Körperstelle"
                               :info="hotspotLabel"
                               :muted="!entries.length" />
            </div>
        </section>

        <section class="stack-layout">
            <h3 class="section-title">Neue Beschwerde anlegen</h3>

            <form ref="creatorFormRef" class="form-card builder-grid creator-card" @submit.prevent="submitEntry">
                <div class="builder-left">
                    <div class="card-header creator-header">
                        <div>
                            <p class="section-kicker section-kicker--left">Schritt 1</p>
                            <h3>Neue Beschwerde</h3>
                        </div>
                    </div>

                    <div class="form-grid form-grid--double">
                        <UiPopupSelect
                            v-model="form.area"
                            label="Körperstelle"
                            placeholder="Bereich wählen"
                            quick-jump-value="benutzerdefiniert"
                            quick-jump-title="Zu Benutzerdefiniert springen"
                            :options="areaOptions"
                            :error="errors.area" />

                        <UiPopupInput
                            v-model="form.date"
                            label="Datum"
                            type="date"
                            :max="today"
                            :error="errors.date" />
                    </div>

                    <div v-if="form.area === 'benutzerdefiniert' || form.area === 'sonstiges'" class="form-grid form-grid--double">
                        <UiPopupSelect
                            v-model="form.customAreaSuggestion"
                            label="Gespeicherte Körperstellen"
                            placeholder="Optional auswählen"
                            :options="customAreaSuggestionOptions"
                            :error="errors.customAreaName" />

                        <UiPopupInput
                            v-model="form.customAreaName"
                            label="Benutzerdefinierte Körperstelle"
                            placeholder="z. B. Schulterblatt links"
                            :maxlength="50"
                            :error="errors.customAreaName" />
                    </div>

                    <div class="form-grid form-grid--double">
                        <UiPopupSelect
                            v-model="form.category"
                            label="Art"
                            placeholder="Art wählen"
                            :options="categoryOptions"
                            :error="errors.category" />

                        <UiPopupSelect
                            v-model="form.status"
                            label="Status"
                            placeholder="Status wählen"
                            :options="statusOptions"
                            :error="errors.status" />
                    </div>

                    <ComplaintInjuryEstimator
                        ref="injuryEstimatorRef"
                        v-if="form.category === 'schmerz'"
                        v-model="form.injuryType"
                        v-model:custom-injury-name="form.customInjuryName"
                        :area="form.area as ComplaintArea | ''"
                        :area-display="resolvedAreaDisplay"
                        @estimate-days="onInjuryEstimateDays"
                        @summary-line="onInjurySummaryLine" />
                    <p v-if="errors.customInjuryName" class="field-error">{{ errors.customInjuryName }}</p>

                    <UiPopupInput
                        v-if="form.category === 'schmerz'"
                        v-model="form.estimatedDowntimeDays"
                        label="Geschätzte Ausfallzeit in Tagen (optional)"
                        type="number"
                        min="1"
                        max="365"
                        inputmode="numeric"
                        placeholder="z. B. 7"
                        :error="errors.estimatedDowntimeDays" />

                    <div class="intensity-field" :class="{ 'has-error': !!errors.intensity }">
                        <div class="intensity-head">
                            <label class="field-label">Intensität</label>
                            <strong>{{ form.intensity }}/10</strong>
                        </div>

                        <div class="intensity-grid" role="group" aria-label="Intensität auswählen">
                            <button
                                v-for="value in intensityOptions"
                                :key="value"
                                type="button"
                                class="intensity-pill"
                                :class="{ 'is-selected': form.intensity === value }"
                                @click="form.intensity = value">
                                {{ value }}
                            </button>
                        </div>

                        <p v-if="errors.intensity" class="field-error">{{ errors.intensity }}</p>
                    </div>

                    <UiPopupInput
                        v-model="form.notes"
                        label="Notiz (optional)"
                        as="textarea"
                        :rows="3"
                        :maxlength="400"
                        placeholder="Optional: z. B. beim Beugen schlimmer oder morgens steif."
                         />

                    <div class="form-actions">
                        <button type="submit" class="primary-button">
                            {{ editingEntryId ? 'Beschwerde aktualisieren' : 'Beschwerde speichern' }}
                        </button>
                        <button
                            v-if="editingEntryId"
                            type="button"
                            class="secondary-button"
                            @click="cancelEditing">
                            Bearbeitung abbrechen
                        </button>
                    </div>
                </div>
            </form>

            <template v-if="entries.length">
                <h3 class="section-title">Bisherige Beschwerden</h3>

                <div class="timeline-card">
                    <p class="section-meta timeline-meta">{{ sortedFilteredEntries.length }} von {{ entries.length }} Einträgen sichtbar · Neueste zuerst</p>

                    <div v-if="entries.length > 1" class="filters-grid">
                        <UiPopupSelect
                            v-model="statusFilter"
                            label="Status filtern"
                            placeholder="Alle Status"
                            :options="statusFilterOptions" />

                        <UiPopupSelect
                            v-model="areaFilter"
                            label="Körperstelle filtern"
                            placeholder="Alle Bereiche"
                            :options="areaFilterOptions" />
                    </div>

                    <div v-if="sortedFilteredEntries.length" class="timeline-list">
                        <article v-for="entry in sortedFilteredEntries" :key="entry.id" class="list-item complaint-item">
                            <div class="complaint-main">
                                <div class="entry-top">
                                    <div>
                                        <p class="entry-area">{{ displayAreaLabel(entry) }}</p>
                                        <p class="entry-meta-line">
                                            <span><strong>Erfasst:</strong> {{ formatDateTime(entry.createdAt) }}</span>
                                            <span><strong>Art:</strong> {{ categoryLabel(entry.category) }}</span>
                                            <span><strong>Status:</strong> {{ statusLabel(entry.status) }}</span>
                                        </p>
                                    </div>

                                    <div class="entry-side">
                                        <span class="entry-chip" :data-tone="entry.category">{{ categoryLabel(entry.category) }}</span>
                                        <span class="entry-chip" :data-tone="entry.status">{{ statusLabel(entry.status) }}</span>
                                    </div>
                                </div>

                                <div class="chip-row intensity-row">
                                    <span class="intensity-label">Intensität</span>
                                    <div class="intensity-meter">
                                        <div class="intensity-fill"
                                             :style="intensityFillStyle(entry.intensity)"></div>
                                        <span class="intensity-value">{{ entry.intensity }}/10</span>
                                    </div>
                                </div>

                                <p v-if="entry.notes" class="entry-notes">{{ entry.notes }}</p>

                                <div class="status-row">
                                    <p class="status-title">Status auswählen</p>
                                    <div class="status-actions complaint-actions" aria-label="Status aktualisieren">
                                        <button
                                            v-for="option in statusOptions"
                                            :key="`${entry.id}-${option.value}`"
                                            type="button"
                                            class="status-pill"
                                            :data-tone="option.value"
                                            :class="{ 'is-active': entry.status === option.value }"
                                            :aria-pressed="entry.status === option.value"
                                            @click="updateStatus(entry.id, option.value)">
                                            {{ option.label }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="complaint-footer">
                                <button
                                    type="button"
                                    class="secondary-button complaints-edit-btn"
                                    @click="startEditing(entry)">
                                    Bearbeiten
                                </button>
                                <ResetButton class="secondary-button complaints-edit-btn complaints-delete-btn"
                                             title="Löschen"
                                             aria-label="Löschen"
                                             data-short="Löschen"
                                             @click="requestDeleteEntry(entry.id)">
                                    Löschen
                                </ResetButton>
                            </div>
                        </article>
                    </div>

                    <div v-else class="empty-state">
                        <h4>Kein Treffer</h4>
                        <p>Für die aktuellen Filter gibt es keine sichtbaren Einträge.</p>
                    </div>
                </div>
            </template>
        </section>

        <ComplaintTrainingContextPopup
            :show="showTrainingContextPopup"
            :date="trainingContextDate"
            :exerciseOptions="trainingContextExerciseOptions"
            @save="onTrainingContextPopupSave"
            @cancel="onTrainingContextPopupCancel" />

        <DeleteConfirmPopup
            :show="showDeletePopup"
            @confirm="confirmDeleteEntry"
            @cancel="cancelDeleteEntry" />
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import ComplaintInjuryEstimator from '@/components/ui/complaints/ComplaintInjuryEstimator.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import ComplaintTrainingContextPopup from '@/components/ui/popups/ComplaintTrainingContextPopup.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import { useAuthStore } from '@/store/authStore'
    import { useComplaintsStore } from '@/store/complaintsStore'
    import { useProgressStore } from '@/store/progressStore'
    import { useSettingsStore } from '@/store/settingsStore'
    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { LS_COMPLAINTS_CUSTOM_AREAS, LS_CONFIRM_DELETE_ENABLED } from '@/constants/storageKeys'
    import type { ComplaintArea, ComplaintCategory, ComplaintStatus } from '@/types/complaint'

    const complaintsStore = useComplaintsStore()
    const authStore = useAuthStore()
    const progressStore = useProgressStore()
    const settingsStore = useSettingsStore()
    const trainingPlansStore = useTrainingPlansStore()

    const today = new Date().toISOString().slice(0, 10)
    const intensityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const CUSTOM_INJURY_VALUE = '__custom__'

    type InjuryEstimatorExpose = {
        rememberSample: (payload: {
            area: string
            injuryType: string
            customInjuryName?: string
            downtimeDays: string
        }) => void
    }

    const areaOptions: Array<{ label: string; value: ComplaintArea }> = [
        { label: 'Nacken', value: 'nacken' },
        { label: 'Schulter', value: 'schulter' },
        { label: 'Ellbogen', value: 'ellbogen' },
        { label: 'Unterarm', value: 'unterarm' },
        { label: 'Handgelenk', value: 'handgelenk' },
        { label: 'Hand', value: 'hand' },
        { label: 'Finger', value: 'finger' },
        { label: 'Brust', value: 'brust' },
        { label: 'Bauch', value: 'bauch' },
        { label: 'Rücken', value: 'ruecken' },
        { label: 'Leiste', value: 'leiste' },
        { label: 'Hüfte', value: 'huefte' },
        { label: 'Oberschenkel', value: 'oberschenkel' },
        { label: 'Knie', value: 'knie' },
        { label: 'Unterschenkel', value: 'unterschenkel' },
        { label: 'Wade', value: 'wade' },
        { label: 'Sprunggelenk', value: 'sprunggelenk' },
        { label: 'Fuß', value: 'fuss' },
        { label: 'Kopf', value: 'kopf' },
        { label: 'Benutzerdefiniert', value: 'benutzerdefiniert' },
    ]

    const categoryOptions: Array<{ label: string; value: ComplaintCategory }> = [
        { label: 'Muskelkater', value: 'muskelkater' },
        { label: 'Überlastung', value: 'ueberlastung' },
        { label: 'Schmerz', value: 'schmerz' },
    ]

    const statusOptions: Array<{ label: string; value: ComplaintStatus }> = [
        { label: 'Aktiv', value: 'aktiv' },
        { label: 'Besser', value: 'besser' },
        { label: 'Weg', value: 'weg' },
    ]

    const statusFilterOptions = [
        { label: 'Alle Status', value: 'all' },
        ...statusOptions,
    ]

    const areaFilterOptions = [
        { label: 'Alle Bereiche', value: 'all' },
        ...areaOptions,
        { label: 'Sonstiges (Legacy)', value: 'sonstiges' },
    ]

    function normalizeCustomLabel(valueRaw: string) {
        return String(valueRaw ?? '').trim().replace(/\s+/g, ' ').slice(0, 50)
    }

    function loadCustomAreaHistory() {
        try {
            const raw = localStorage.getItem(LS_COMPLAINTS_CUSTOM_AREAS)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []
            return parsed
                .map((item) => normalizeCustomLabel(String(item ?? '')))
                .filter(Boolean)
                .slice(0, 40)
        } catch {
            return []
        }
    }

    function saveCustomAreaHistory(list: string[]) {
        try {
            localStorage.setItem(LS_COMPLAINTS_CUSTOM_AREAS, JSON.stringify(list.slice(0, 40)))
        } catch {
            // ignore
        }
    }

    const form = reactive({
        area: '',
        customAreaSuggestion: '',
        customAreaName: '',
        category: '',
        status: 'aktiv',
        date: today,
        intensity: 4,
        injuryType: '',
        customInjuryName: '',
        estimatedDowntimeDays: '',
        notes: '',
    })

    const errors = reactive({
        area: '',
        customAreaName: '',
        category: '',
        status: '',
        date: '',
        intensity: '',
        customInjuryName: '',
        estimatedDowntimeDays: '',
    })

    const statusFilter = ref<'all' | ComplaintStatus>('all')
    const areaFilter = ref<'all' | ComplaintArea>('all')
    const showTrainingContextPopup = ref(false)
    const trainingContextDate = ref('')
    const trainingContextExerciseOptions = ref<string[]>([])
    const injurySummaryLine = ref('')
    const customAreaHistory = ref<string[]>(loadCustomAreaHistory())
    const editingEntryId = ref<string | null>(null)
    const creatorFormRef = ref<HTMLElement | null>(null)
    const injuryEstimatorRef = ref<InjuryEstimatorExpose | null>(null)
    const showDeletePopup = ref(false)
    const pendingDeleteEntryId = ref<string | null>(null)
    let trainingContextResolver: ((payload: { duringTraining: boolean; exercise?: string }) => void) | null = null

    const entries = computed(() => complaintsStore.entries)

    const filteredEntries = computed(() => entries.value.filter((entry) => {
        if (statusFilter.value !== 'all' && entry.status !== statusFilter.value) return false
        if (areaFilter.value !== 'all' && entry.area !== areaFilter.value) return false
        return true
    }))

    const sortedFilteredEntries = computed(() => [...filteredEntries.value].sort((a, b) => {
        const byDate = b.date.localeCompare(a.date)
        if (byDate !== 0) return byDate
        return b.createdAt.localeCompare(a.createdAt)
    }))

    const activeCount = computed(() => entries.value.filter((entry) => entry.status !== 'weg').length)

    const averageIntensity = computed(() => {
        if (!entries.value.length) return '-'
        const total = entries.value.reduce((sum, entry) => sum + entry.intensity, 0)
        return (total / entries.value.length).toFixed(1)
    })

    const averageIntensityInfo = computed(() => (
        entries.value.length ? `${averageIntensity.value}/10` : 'Keine Einträge'
    ))

    const hotspotLabel = computed(() => {
        if (!entries.value.length) return 'Noch offen'

        const counts = new Map<ComplaintArea, number>()
        for (const entry of entries.value) {
            counts.set(entry.area, (counts.get(entry.area) ?? 0) + 1)
        }

        let hottest: ComplaintArea | null = null
        let highest = -1
        for (const [area, count] of counts.entries()) {
            if (count > highest) {
                hottest = area
                highest = count
            }
        }

        return hottest ? areaLabel(hottest) : 'Noch offen'
    })

    const customAreaSuggestionOptions = computed(() => customAreaHistory.value.map((name) => ({
        label: name,
        value: name,
    })))

    const resolvedAreaDisplay = computed(() => {
        if (form.area === 'benutzerdefiniert' || form.area === 'sonstiges') {
            return normalizeCustomLabel(form.customAreaName) || 'Benutzerdefiniert'
        }
        return areaLabel(form.area as ComplaintArea)
    })

    watch(() => form.category, (nextCategory) => {
        if (nextCategory !== 'schmerz') {
            form.injuryType = ''
            form.customInjuryName = ''
            form.estimatedDowntimeDays = ''
            injurySummaryLine.value = ''
            errors.customInjuryName = ''
            errors.estimatedDowntimeDays = ''
        }
    })

    watch(() => form.customAreaSuggestion, (next) => {
        const value = normalizeCustomLabel(next)
        if (value) form.customAreaName = value
    })

    watch(() => form.area, (next) => {
        if (next !== 'benutzerdefiniert' && next !== 'sonstiges') {
            form.customAreaSuggestion = ''
            form.customAreaName = ''
            errors.customAreaName = ''
        }
    })

    function onInjuryEstimateDays(value: string) {
        form.estimatedDowntimeDays = value
    }

    function onInjurySummaryLine(value: string) {
        injurySummaryLine.value = value
    }

    function areaLabel(value: ComplaintArea) {
        if (value === 'sonstiges') return 'Benutzerdefiniert'
        return areaOptions.find((option) => option.value === value)?.label ?? value
    }

    function displayAreaLabel(entry: (typeof entries.value)[number]) {
        const custom = readCustomAreaName(entry.notes)
        if (custom) return custom
        return areaLabel(entry.area)
    }

    function categoryLabel(value: ComplaintCategory) {
        return categoryOptions.find((option) => option.value === value)?.label ?? value
    }

    function statusLabel(value: ComplaintStatus) {
        return statusOptions.find((option) => option.value === value)?.label ?? value
    }

    function formatDate(value: string) {
        try {
            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date(`${value}T12:00:00`))
        } catch {
            return value
        }
    }

    function formatDateTime(value: string) {
        try {
            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).format(new Date(value))
        } catch {
            return '-'
        }
    }

    function hexToRgb(hex: string) {
        const clean = hex.replace('#', '')
        const n = Number.parseInt(clean, 16)
        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: n & 255,
        }
    }

    function lerpColor(aHex: string, bHex: string, tRaw: number) {
        const t = Math.max(0, Math.min(1, tRaw))
        const a = hexToRgb(aHex)
        const b = hexToRgb(bHex)
        const r = Math.round(a.r + (b.r - a.r) * t)
        const g = Math.round(a.g + (b.g - a.g) * t)
        const bCh = Math.round(a.b + (b.b - a.b) * t)
        return `rgb(${r}, ${g}, ${bCh})`
    }

    function intensityFillColor(valueRaw: number) {
        const value = Math.max(1, Math.min(10, Math.round(Number(valueRaw) || 1)))

        // 1-3: nur Gruen
        if (value <= 3) {
            const t = (value - 1) / 2
            return lerpColor('#22c55e', '#16a34a', t)
        }

        // 4-6: nur Gelb
        if (value <= 6) {
            const t = (value - 4) / 2
            return lerpColor('#facc15', '#eab308', t)
        }

        // 7-10: Orange -> Rot, 9-10 klar rot
        if (value <= 8) {
            const t = (value - 7) / 1
            return lerpColor('#f59e0b', '#f97316', t)
        }
        const t = (value - 9) / 1
        return lerpColor('#ef4444', '#dc2626', t)
    }

    function intensityFillStyle(valueRaw: number) {
        const value = Math.max(1, Math.min(10, Math.round(Number(valueRaw) || 1)))
        return {
            width: `${value * 10}%`,
            background: intensityFillColor(value),
        }
    }

    function resetErrors() {
        errors.area = ''
        errors.customAreaName = ''
        errors.category = ''
        errors.status = ''
        errors.date = ''
        errors.intensity = ''
        errors.customInjuryName = ''
        errors.estimatedDowntimeDays = ''
    }

    function resetForm() {
        form.area = ''
        form.customAreaSuggestion = ''
        form.customAreaName = ''
        form.category = ''
        form.status = 'aktiv'
        form.date = today
        form.intensity = 4
        form.injuryType = ''
        form.customInjuryName = ''
        form.estimatedDowntimeDays = ''
        form.notes = ''
        injurySummaryLine.value = ''
        editingEntryId.value = null
        resetErrors()
    }

    function stripGeneratedHealthLines(valueRaw: string) {
        return String(valueRaw ?? '')
            .split('\n')
            .filter((line) => {
                const normalized = line.trim()
                if (!normalized) return false
                if (normalized.startsWith('[Ausfallzeit]')) return false
                if (normalized.startsWith('[Verletzung]')) return false
                if (/^\[K.*rperstelle\]/i.test(normalized)) return false
                return true
            })
            .join('\n')
            .trim()
    }

    function readEstimatedDowntimeDays(valueRaw: string) {
        const lines = String(valueRaw ?? '').split('\n')
        for (const line of lines) {
            const match = line.trim().match(/^\[Ausfallzeit\]\s*Voraussichtlich\s*(\d{1,3})\s*Tag(?:e)?$/i)
            if (match?.[1]) return match[1]
        }
        return ''
    }

    function estimatedDowntimeLine(valueRaw: string) {
        const days = Number.parseInt(String(valueRaw ?? '').trim(), 10)
        if (!Number.isFinite(days) || days < 1) return ''
        return `[Ausfallzeit] Voraussichtlich ${days} ${days === 1 ? 'Tag' : 'Tage'}`
    }

    function customAreaLine(valueRaw: string) {
        const custom = normalizeCustomLabel(valueRaw)
        if (!custom) return ''
        return `[Körperstelle] Benutzerdefiniert: ${custom}`
    }

    function readCustomAreaName(valueRaw: string) {
        const lines = String(valueRaw ?? '').split('\n')
        for (const line of lines) {
            const match = line.trim().match(/^\[K.*rperstelle\]\s*Benutzerdefiniert:\s*(.+)$/i)
            if (match?.[1]) return normalizeCustomLabel(match[1])
        }
        return ''
    }

    function readInjuryType(valueRaw: string) {
        const lines = String(valueRaw ?? '').split('\n')
        for (const line of lines) {
            const match = line.trim().match(/\[key:([a-z0-9:_-]+)\]\s*$/i)
            if (match?.[1]) return match[1]
        }
        return ''
    }

    function readInjurySummaryLine(valueRaw: string) {
        const lines = String(valueRaw ?? '').split('\n')
        for (const line of lines) {
            if (line.trim().startsWith('[Verletzung]')) return line.trim()
        }
        return ''
    }

    function readInjuryName(valueRaw: string) {
        const summary = readInjurySummaryLine(valueRaw)
        const match = summary.match(/^\[Verletzung\]\s*(.+?)\s*\(/)
        if (match?.[1]) return normalizeCustomLabel(match[1])
        return ''
    }

    function rememberCustomArea(valueRaw: string) {
        const custom = normalizeCustomLabel(valueRaw)
        if (!custom) return
        const next = [custom, ...customAreaHistory.value.filter((item) => item !== custom)].slice(0, 40)
        customAreaHistory.value = next
        saveCustomAreaHistory(next)
    }

    function validateForm() {
        resetErrors()

        if (!form.area) errors.area = 'Bitte eine Körperstelle wählen.'
        const isCustomArea = form.area === 'benutzerdefiniert' || form.area === 'sonstiges'
        if (isCustomArea && !normalizeCustomLabel(form.customAreaName)) {
            errors.customAreaName = 'Bitte eine benutzerdefinierte Körperstelle angeben.'
        }
        if (!form.category) errors.category = 'Bitte eine Art wählen.'
        if (!form.status) errors.status = 'Bitte einen Status wählen.'
        if (!form.date) errors.date = 'Bitte ein Datum setzen.'
        if (form.date > today) errors.date = 'Zukünftige Daten sind hier nicht erlaubt.'
        if (form.intensity < 1 || form.intensity > 10) errors.intensity = 'Intensität muss zwischen 1 und 10 liegen.'
        if (form.category === 'schmerz' && form.injuryType === CUSTOM_INJURY_VALUE && !normalizeCustomLabel(form.customInjuryName)) {
            errors.customInjuryName = 'Bitte eine benutzerdefinierte Verletzung eingeben.'
        }

        const downtimeRaw = String(form.estimatedDowntimeDays ?? '').trim()
        if (downtimeRaw) {
            const downtimeDays = Number.parseInt(downtimeRaw, 10)
            if (!Number.isFinite(downtimeDays) || downtimeDays < 1 || downtimeDays > 365) {
                errors.estimatedDowntimeDays = 'Bitte eine ganze Zahl zwischen 1 und 365 eintragen.'
            }
            if (form.category !== 'schmerz') {
                errors.estimatedDowntimeDays = 'Ausfallzeit kann nur bei der Art Schmerz genutzt werden.'
            }
        }

        const nextStatus = String(form.status ?? '').trim() as ComplaintStatus
        const isOpenStatus = nextStatus === 'aktiv' || nextStatus === 'besser'
        const hasAreaAndCategory = !!form.area && !!form.category

        const isSpecialArea = form.area === 'sonstiges' || form.area === 'benutzerdefiniert'
        if (!errors.area && !errors.customAreaName && !errors.category && !errors.status && hasAreaAndCategory && isOpenStatus && !isSpecialArea) {
            const hasSimilarOpen = entries.value.some((entry) =>
                entry.id !== editingEntryId.value &&
                entry.area === form.area &&
                entry.category === form.category &&
                (entry.status === 'aktiv' || entry.status === 'besser')
            )

            if (hasSimilarOpen) {
                const area = areaLabel(form.area as ComplaintArea)
                const category = categoryLabel(form.category as ComplaintCategory)
                errors.status = 'Für ' + area + ' ist ' + category + ' bereits als aktiv/besser vorhanden. Bitte bestehenden Eintrag aktualisieren.'
            }
        }

        return !errors.area &&
            !errors.customAreaName &&
            !errors.category &&
            !errors.status &&
            !errors.date &&
            !errors.intensity &&
            !errors.customInjuryName &&
            !errors.estimatedDowntimeDays
    }
    const guidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const toDay = (value: string | null | undefined) => String(value ?? '').slice(0, 10)

    async function getMatchingExercisesForDate(day: string): Promise<string[]> {
        if (!authStore.isAuthenticated) return []

        try {
            if (!trainingPlansStore.items.length) {
                await trainingPlansStore.loadList()
            }
        } catch {
            return []
        }

        const planIds = trainingPlansStore.items
            .map((p) => String(p?.id ?? ''))
            .filter((id) => guidRx.test(id))

        if (!planIds.length) return []

        await Promise.all(planIds.map(async (planId) => {
            try {
                await progressStore.load(planId)
            } catch {
                // ignorieren: wenn einzelne Pläne nicht geladen werden, weiter mit dem Rest
            }
        }))

        const result = new Set<string>()
        for (const planId of planIds) {
            const items = progressStore.byPlan?.[planId]?.items ?? []
            for (const item of items) {
                if (toDay(item?.date) !== day) continue
                const ex = String(item?.exercise ?? '').trim()
                if (ex) result.add(ex)
            }
        }

        return [...result]
    }

    async function submitEntry() {
        if (!validateForm()) return

        const isEditing = !!editingEntryId.value
        const matchingExercises = await getMatchingExercisesForDate(form.date)
        let trainingContext = ''

        if (!isEditing && form.category === 'schmerz' && matchingExercises.length > 0) {
            const answer = await askTrainingContext(form.date, matchingExercises)
            if (answer?.duringTraining) {
                const exercise = String(answer.exercise ?? '').trim()
                trainingContext = exercise
                    ? `[Trainingbezug] Während Training bei: ${exercise}`
                    : '[Trainingbezug] Während Training (Übung nicht angegeben)'
            }
        }

        const baseNotes = stripGeneratedHealthLines(String(form.notes ?? '').trim())
        const customAreaInfo = (form.area === 'benutzerdefiniert' || form.area === 'sonstiges')
            ? customAreaLine(form.customAreaName)
            : ''
        const downtimeLine = form.category === 'schmerz'
            ? estimatedDowntimeLine(form.estimatedDowntimeDays)
            : ''
        const injuryLine = form.category === 'schmerz'
            ? injurySummaryLine.value
            : ''
        const combinedNotes = [baseNotes, trainingContext, customAreaInfo, injuryLine, downtimeLine].filter(Boolean).join('\n')

        const payload = {
            area: form.area as ComplaintArea,
            category: form.category as ComplaintCategory,
            status: form.status as ComplaintStatus,
            date: form.date,
            intensity: form.intensity,
            notes: combinedNotes,
        }

        if (editingEntryId.value) {
            await complaintsStore.updateEntry(editingEntryId.value, payload)
        } else {
            await complaintsStore.addEntry(payload)
        }

        if (form.area === 'benutzerdefiniert' || form.area === 'sonstiges') {
            rememberCustomArea(form.customAreaName)
        }

        if (form.category === 'schmerz') {
            injuryEstimatorRef.value?.rememberSample({
                area: String(form.area || ''),
                injuryType: String(form.injuryType || ''),
                customInjuryName: normalizeCustomLabel(form.customInjuryName),
                downtimeDays: String(form.estimatedDowntimeDays || ''),
            })
        }

        resetForm()
    }

    async function updateStatus(id: string, status: string) {
        await complaintsStore.updateStatus(id, status as ComplaintStatus)
    }

    function startEditing(entry: (typeof entries.value)[number]) {
        editingEntryId.value = entry.id
        form.area = entry.area
        form.customAreaSuggestion = ''
        form.customAreaName = readCustomAreaName(entry.notes)
        form.category = entry.category
        form.status = entry.status
        form.date = entry.date
        form.intensity = entry.intensity
        form.injuryType = readInjuryType(entry.notes)
        form.customInjuryName = readInjuryName(entry.notes)
        if (form.injuryType.startsWith('custom:')) {
            form.injuryType = CUSTOM_INJURY_VALUE
        }
        form.estimatedDowntimeDays = readEstimatedDowntimeDays(entry.notes)
        injurySummaryLine.value = readInjurySummaryLine(entry.notes)
        form.notes = stripGeneratedHealthLines(entry.notes)
        resetErrors()

        void nextTick(() => {
            creatorFormRef.value?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            })
        })
    }

    function cancelEditing() {
        resetForm()
    }

    function requestDeleteEntry(id: string) {
        const confirmDeleteEnabled = resolveConfirmDeleteEnabled()

        // DeleteConfirmPopup liest intern localStorage + Event.
        // Daher hier vor dem Öffnen synchronisieren, damit das Verhalten konsistent ist.
        try {
            localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(confirmDeleteEnabled))
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: confirmDeleteEnabled }))
        } catch {
            // ignore
        }

        if (!confirmDeleteEnabled) {
            void complaintsStore.removeEntry(id)
            if (editingEntryId.value === id) {
                resetForm()
            }
            return
        }

        pendingDeleteEntryId.value = id
        showDeletePopup.value = true
    }

    function cancelDeleteEntry() {
        showDeletePopup.value = false
        pendingDeleteEntryId.value = null
    }

    function confirmDeleteEntry() {
        const id = pendingDeleteEntryId.value
        if (id) {
            void complaintsStore.removeEntry(id)
            if (editingEntryId.value === id) {
                resetForm()
            }
        }
        showDeletePopup.value = false
        pendingDeleteEntryId.value = null
    }

    function readConfirmDeleteEnabledFromStorage() {
        try {
            const raw = localStorage.getItem(LS_CONFIRM_DELETE_ENABLED)
            if (raw == null) return true
            const normalized = raw.trim().toLowerCase()
            if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true
            if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') return false
            return true
        } catch {
            return true
        }
    }

    function resolveConfirmDeleteEnabled() {
        const fromStore = settingsStore?.dto?.confirmDeleteEnabled
        if (typeof fromStore === 'boolean') return fromStore
        return readConfirmDeleteEnabledFromStorage()
    }

    function askTrainingContext(date: string, exercises: string[]) {
        trainingContextDate.value = date
        trainingContextExerciseOptions.value = [...exercises]
        showTrainingContextPopup.value = true

        return new Promise<{ duringTraining: boolean; exercise?: string }>((resolve) => {
            trainingContextResolver = resolve
        })
    }

    function settleTrainingContext(payload: { duringTraining: boolean; exercise?: string }) {
        showTrainingContextPopup.value = false
        const resolve = trainingContextResolver
        trainingContextResolver = null
        if (resolve) resolve(payload)
    }

    function onTrainingContextPopupSave(payload: { duringTraining: boolean; exercise?: string }) {
        settleTrainingContext(payload)
    }

    function onTrainingContextPopupCancel() {
        settleTrainingContext({ duringTraining: false })
    }

    onMounted(() => {
        void complaintsStore.load()
    })
</script>

<style scoped>
    .complaints-page {
        padding: 1rem;
        background: transparent;
        width: 100%;
        max-width: 1200px;
        margin-inline: auto;
        min-height: 100dvh;
        overflow-x: visible;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .section-kicker {
        margin: 0 0 0.4rem;
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-secondary);
        text-align: center;
    }

    .section-kicker--left {
        text-align: left;
    }

    .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-align: center;
        color: var(--text-primary);
        letter-spacing: -0.025em;
    }

    .section-copy,
    .entry-notes,
    .empty-state p {
        margin: 0;
        line-height: 1.5;
        color: var(--text-secondary);
    }

    .section-block,
    .stack-layout {
        display: grid;
        gap: 0.75rem;
    }

    .section-title {
        margin: 0 0 0.45rem;
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        text-align: center;
    }

    .dashboard-grid {
        --cards-gap-x: 1.1rem;
        --cards-gap-y: 0.9rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--cards-gap-y) var(--cards-gap-x);
        align-items: stretch;
        margin-bottom: 1.4rem;
        width: 100%;
        max-width: 100%;
    }

    .stack-layout {
        gap: 0.75rem;
        grid-template-columns: minmax(0, 1fr);
    }

    .form-card,
    .list-item {
        position: relative;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 1.1rem;
        padding: 1.75rem 1.9rem;
        border-radius: 18px;
        box-sizing: border-box;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    @media (hover: hover) {
        .form-card:hover,
        .list-item:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    .form-card.builder-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box;
    }

    .builder-left,
    .builder-head,
    .builder-head > * {
        min-width: 0;
    }

    .builder-left {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
    }

    .plan-card {
        position: relative;
        z-index: 1;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        padding: 1.3rem 1.4rem 1.2rem;
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        border: 1px solid rgba(148, 163, 184, 0.35);
        transition: background 180ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, transform 160ms ease-out;
        display: grid;
        gap: 1rem;
    }

    .plan-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
        border-color: rgba(129, 140, 248, 0.7);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        gap: 0.9rem;
        align-items: start;
        margin-bottom: 0.1rem;
    }

    .card-header h3,
    .empty-state h4 {
        margin: 0;
        color: var(--text-primary);
    }

    .section-copy {
        max-width: 28ch;
        margin-top: 0.35rem;
        font-size: 0.92rem;
        text-align: left;
        overflow-wrap: anywhere;
    }

    .section-meta {
        margin: 0;
        padding: 0.42rem 0.7rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.08);
        color: var(--text-secondary);
        font-size: 0.86rem;
        font-weight: 600;
        white-space: nowrap;
    }

    .complaint-form,
    .timeline-card {
        display: grid;
        gap: 0.9rem;
    }

    .timeline-meta {
        justify-self: end;
    }

    .complaints-reset-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0.8rem 1rem;
    }

    .complaints-delete-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
    }

    .complaints-delete-btn.btn-danger-ghost {
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.05);
        color: var(--text-primary);
        padding: 0.8rem 1rem;
        font-weight: 700;
        transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .complaints-delete-btn.btn-danger-ghost:hover {
        color: var(--text-primary);
        border-color: rgba(148, 163, 184, 0.24);
        transform: translateY(-1px);
    }

    .complaints-delete-btn.btn-danger-ghost::after {
        content: none !important;
    }

    .complaints-delete-btn :deep(.btn-icon) {
        display: none;
    }

    .complaints-delete-btn :deep(.btn-label) {
        display: inline;
        margin: 0;
    }

    .form-grid {
        display: grid;
        gap: 0.8rem;
    }

    .form-grid--double,
    .filters-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .field-label {
        font-weight: 600;
        font-size: 0.92rem;
        color: var(--text-primary);
    }

    .creator-header {
        margin-bottom: 0;
    }

    .creator-card + .section-title {
        margin-top: 2.4rem;
    }

    .intensity-field {
        display: grid;
        gap: 0.6rem;
        padding-top: 0.15rem;
    }

    .intensity-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        color: var(--text-primary);
    }

    .intensity-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.55rem;
    }

    .intensity-pill,
    .status-pill,
    .primary-button,
    .secondary-button,
    .icon-button {
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 14px;
        transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .intensity-pill,
    .status-pill,
    .icon-button,
    .secondary-button {
        background: rgba(15, 23, 42, 0.12);
        color: var(--text-primary);
    }

    .intensity-pill {
        min-height: 44px;
        cursor: pointer;
        font-weight: 700;
    }

    .intensity-pill.is-selected,
    .status-pill.is-active {
        border-color: rgba(249, 115, 22, 0.42);
        background: linear-gradient(180deg, rgba(249, 115, 22, 0.18), rgba(245, 158, 11, 0.08));
    }

    .field-error {
        margin: 0;
        color: #ef4444;
        font-size: 0.9rem;
        font-weight: 650;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.7rem;
        flex-wrap: wrap;
    }

    .primary-button,
    .secondary-button,
    .icon-button {
        padding: 0.8rem 1rem;
        font-weight: 700;
        cursor: pointer;
    }

    .primary-button {
        color: var(--text-primary);
        border-color: color-mix(in srgb, var(--accent-primary) 48%, rgba(148, 163, 184, 0.52));
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 60%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.28), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset;
    }

    .primary-button:hover {
        border-color: color-mix(in srgb, var(--accent-primary) 78%, #a5b4fc 22%);
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.34), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 34%, transparent) inset;
    }

    .secondary-button {
        background: rgba(15, 23, 42, 0.05);
    }

    .filters-grid {
        display: grid;
        gap: 0.85rem;
    }

    .timeline-list {
        display: grid;
        gap: 0.75rem;
    }

    .complaint-item {
        align-items: stretch;
        flex-direction: column;
        justify-content: flex-start;
    }

    .complaint-main {
        display: grid;
        gap: 0.75rem;
    }

    .entry-top,
    .entry-side,
    .chip-row,
    .status-actions {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
    }

    .entry-top {
        justify-content: space-between;
        align-items: flex-start;
    }

    .entry-side {
        margin-left: auto;
        justify-content: flex-end;
        align-items: flex-start;
        align-self: flex-start;
    }

    .entry-area {
        margin: 0;
        font-size: 1.02rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .entry-notes {
        overflow-wrap: anywhere;
        padding-top: 0.15rem;
        border-top: 1px dashed rgba(148, 163, 184, 0.24);
    }

    .entry-chip {
        padding: 0.38rem 0.7rem;
        border-radius: 999px;
        font-size: 0.86rem;
        font-weight: 700;
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .intensity-row {
        justify-content: flex-start;
        align-items: center;
        gap: 0.55rem;
        margin-top: 0.5rem;
    }

    .intensity-label {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.01em;
    }

    .intensity-meter {
        position: relative;
        flex: 1 1 180px;
        min-width: 160px;
        height: 28px;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.26);
        background: color-mix(in srgb, var(--bg-card) 84%, #0f172a 16%);
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.35);
    }

    .intensity-fill {
        position: absolute;
        inset: 0 auto 0 0;
        background: #22c55e;
        border-radius: inherit;
        transition: width 220ms ease, background-color 220ms ease, background 220ms ease;
    }

    .intensity-value {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.82rem;
        color: #f8fafc;
        text-shadow: 0 1px 2px rgba(2, 6, 23, 0.8);
    }

    .entry-chip[data-tone="muskelkater"] {
        background: rgba(16, 185, 129, 0.12);
        color: #0f766e;
    }

    .entry-chip[data-tone="ueberlastung"] {
        background: rgba(245, 158, 11, 0.14);
        color: #b45309;
    }

    .entry-chip[data-tone="schmerz"],
    .entry-chip[data-tone="aktiv"] {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
    }

    .entry-chip[data-tone="besser"] {
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
    }

    .entry-chip[data-tone="weg"] {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
    }

    .status-actions {
        gap: 0.5rem;
    }

    .status-row {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.6rem;
        flex-wrap: nowrap;
    }

    .status-title {
        margin: 0;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.01em;
    }

    .complaint-actions {
        margin-top: 0;
        padding-top: 0.1rem;
    }

    .complaint-footer {
        margin-top: 0.6rem;
        padding-top: 0.65rem;
        border-top: 1px solid rgba(148, 163, 184, 0.18);
        display: flex;
        gap: 0.6rem;
        justify-content: flex-end;
    }

    .complaints-edit-btn {
        min-height: 44px;
    }

    .entry-meta-line {
        margin: 0.45rem 0 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.65rem;
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.35;
    }

    .entry-meta-line strong {
        color: var(--text-primary);
        font-size: 0.85rem;
    }

    .entry-meta-line span {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }

    .entry-meta-line span + span::before {
        content: "•";
        color: rgba(148, 163, 184, 0.8);
        margin-right: 0.2rem;
    }

    .status-pill {
        padding: 0.55rem 0.75rem;
        cursor: pointer;
        font-weight: 650;
    }

    .complaint-actions .status-pill {
        border-color: rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-card) 86%, transparent);
        color: var(--text-primary);
    }

    .complaint-actions .status-pill.is-active {
        border-color: color-mix(in srgb, var(--accent-primary) 72%, rgba(148, 163, 184, 0.28));
        background: radial-gradient(circle at 18% 25%, color-mix(in srgb, var(--accent-primary) 20%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 84%, #020617 16%);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 24%, transparent) inset;
    }

    .icon-button {
        padding: 0.55rem 0.8rem;
    }

    .icon-button--danger:hover {
        color: #7f1d1d;
        border-color: rgba(239, 68, 68, 0.26);
    }

    .empty-state {
        min-height: 220px;
        display: grid;
        place-items: center;
        text-align: center;
        padding: 1rem;
        border-radius: 20px;
        border: 1px dashed rgba(148, 163, 184, 0.28);
        background: rgba(15, 23, 42, 0.04);
    }

    .primary-button:hover,
    .secondary-button:hover,
    .icon-button:hover,
    .intensity-pill:hover,
    .status-pill:hover {
        transform: translateY(-1px);
    }

    html.dark-mode .form-card,
    html.dark-mode .list-item {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .plan-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    @supports not (backdrop-filter: blur(10px)) or not (color-mix(in srgb, black 10%, white 90%)) {
        .form-card,
        .list-item {
            background: var(--bg-card);
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.45);
        }
    }

    html.dark-mode .entry-chip[data-tone="muskelkater"] {
        color: #6ee7b7;
    }

    html.dark-mode .entry-chip[data-tone="ueberlastung"] {
        color: #fbbf24;
    }

    html.dark-mode .entry-chip[data-tone="schmerz"],
    html.dark-mode .entry-chip[data-tone="aktiv"] {
        color: #fca5a5;
    }

    html.dark-mode .entry-chip[data-tone="besser"] {
        color: #93c5fd;
    }

    html.dark-mode .entry-chip[data-tone="weg"] {
        color: #86efac;
    }

    html.dark-mode .intensity-meter {
        background: color-mix(in srgb, #020617 88%, transparent);
        border-color: rgba(148, 163, 184, 0.34);
    }

    @media (max-width: 900px) {
        .card-header {
            grid-template-columns: 1fr;
            display: grid;
        }

        .section-copy {
            max-width: none;
            text-align: left;
        }

        .section-meta {
            width: fit-content;
            white-space: normal;
        }

        .timeline-meta {
            justify-self: start;
        }
    }

    @media (max-width: 620px) {
        .form-card,
        .plan-card,
        .list-item {
            border-radius: 16px;
        }

        .form-card {
            padding: 1.05rem 1.05rem;
        }

        .plan-card {
            padding: 1.15rem 1.05rem 1rem;
        }

        .form-grid--double,
        .filters-grid {
            grid-template-columns: 1fr;
        }

        .intensity-row {
            align-items: stretch;
            flex-direction: column;
        }

        .intensity-meter {
            width: 100%;
        }

        .entry-meta-line {
            gap: 0.3rem 0.5rem;
            font-size: 0.82rem;
        }

        .intensity-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .form-actions {
            justify-content: stretch;
        }

        .primary-button,
        .complaints-reset-btn {
            width: 100%;
        }

        .section-meta {
            width: 100%;
            text-align: center;
        }

        .timeline-meta {
            justify-self: stretch;
        }

        .list-item {
            padding: 1.05rem 1.05rem;
        }

        .complaint-actions {
            padding-top: 0.2rem;
        }

        .complaint-footer {
            padding-top: 0.5rem;
        }
        .section-title {
            font-size: 1.2rem;
        }

        .creator-card + .section-title {
            margin-top: 2rem;
        }
    }

    @media (max-width: 420px) {
        .complaints-page {
            padding: 1rem;
        }

        .page-title {
            font-size: 1.9rem;
        }
    }

    @media (max-width: 520px) {
        .dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 0.85rem;
        }
    }

    @media (max-width: 360px) {
        .page-title {
            font-size: 1.75rem;
        }
    }
</style>






