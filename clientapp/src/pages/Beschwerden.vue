<template>
    <div class="complaints-page">
        <h2 class="page-title">{{ t('complaints.pageTitle') }}</h2>

        <section class="section-block" :aria-label="t('complaints.overview.aria')">
            <h3 class="section-title">{{ t('complaints.overview.title') }}</h3>

            <div class="dashboard-grid">
                <div class="dashboard-card-shell"
                     :class="{ 'is-dashboard-visible': dashboardCardsVisible }"
                     style="--dashboard-delay: 0ms;">
                    <DashboardCard :title="t('complaints.dashboard.active')"
                                   :info="activeCountDisplay"
                                   :muted="!entries.length"
                                   :class="{ 'is-dashboard-glowing': activeCountGlowActive }">
                        <AnimatedReelValue :text="activeCountDisplay"
                                           :muted="!entries.length"
                                           :jump-nonce="activeCountJumpNonce" />
                    </DashboardCard>
                </div>

                <div class="dashboard-card-shell"
                     :class="{ 'is-dashboard-visible': dashboardCardsVisible }"
                     style="--dashboard-delay: 60ms;">
                    <DashboardCard :title="t('complaints.dashboard.averageIntensity')"
                                   :info="averageIntensityInfo"
                                   :muted="!entries.length">
                        <AnimatedReelValue :text="averageIntensityInfo"
                                           :muted="!entries.length"
                                           :animate-from="averageIntensityAnimateFrom"
                                           :animate-to="averageIntensityAnimateTo"
                                           :animate-nonce="averageIntensityAnimateNonce" />
                    </DashboardCard>
                </div>

                <div class="dashboard-card-shell"
                     :class="{ 'is-dashboard-visible': dashboardCardsVisible }"
                     style="--dashboard-delay: 120ms;">
                    <DashboardCard :title="t('complaints.dashboard.hotspot')"
                                   :info="hotspotLabel"
                                   :muted="!entries.length" />
                </div>
            </div>
        </section>

        <section class="stack-layout">
            <h3 class="section-title">{{ t('complaints.create.sectionTitle') }}</h3>
            <form ref="creatorFormRef"
                  class="form-card builder-grid creator-card"
                  :class="{ 'creator-card--editing': !!editingEntryId }"
                  @submit.prevent="submitEntry">
                <div class="builder-left">
                    <div class="card-header creator-header">
                        <div>
                            <p class="section-kicker section-kicker--left">{{ t('complaints.create.step1') }}</p>
                            <h3>{{ editingEntryId ? t('complaints.create.editTitle') : t('complaints.create.title') }}</h3>
                        </div>
                    </div>

                    <div class="form-grid form-grid--double">
                        <UiPopupSelect v-model="form.area"
                                       :label="t('complaints.form.area')"
                                       :placeholder="t('complaints.form.areaPlaceholder')"
                                       quick-jump-value="benutzerdefiniert"
                                       :quick-jump-title="t('complaints.form.jumpCustom')"
                                       :options="translatedAreaOptions"
                                       :error="errors.area" />

                        <UiPopupInput v-model="form.date"
                                      :label="t('complaints.form.date')"
                                      type="date"
                                      :max="today"
                                      :error="errors.date" />
                    </div>

                    <div v-if="form.area === 'benutzerdefiniert' || form.area === 'sonstiges'" class="form-grid form-grid--double">
                        <UiPopupSelect v-model="form.customAreaSuggestion"
                                       :label="t('complaints.form.savedAreas')"
                                       :placeholder="t('complaints.form.optionalSelect')"
                                       :options="customAreaSuggestionOptions"
                                       :error="errors.customAreaName" />

                        <UiPopupInput v-model="form.customAreaName"
                                      :label="t('complaints.form.customArea')"
                                      :placeholder="t('complaints.form.customAreaPlaceholder')"
                                      :maxlength="50"
                                      :error="errors.customAreaName" />
                    </div>

                    <div class="form-grid form-grid--double">
                        <UiPopupSelect v-model="form.category"
                                       :label="t('complaints.form.category')"
                                       :placeholder="t('complaints.form.categoryPlaceholder')"
                                       :options="translatedCategoryOptions"
                                       :error="errors.category" />

                        <UiPopupSelect v-model="form.status"
                                       :label="t('complaints.form.status')"
                                       :placeholder="t('complaints.form.statusPlaceholder')"
                                       :options="translatedStatusOptions"
                                       :error="errors.status" />
                    </div>

                    <ComplaintInjuryEstimator ref="injuryEstimatorRef"
                                              v-if="form.category === 'schmerz'"
                                              v-model="form.injuryType"
                                              v-model:custom-injury-name="form.customInjuryName"
                                              :area="form.area as ComplaintArea | ''"
                                              :area-display="resolvedAreaDisplay"
                                              @estimate-days="onInjuryEstimateDays"
                                              @summary-line="onInjurySummaryLine" />
                    <p v-if="errors.customInjuryName" class="field-error">{{ errors.customInjuryName }}</p>

                    <UiPopupInput v-if="form.category === 'schmerz'"
                                  v-model="form.estimatedDowntimeDays"
                                  :label="t('complaints.form.estimatedDowntime')"
                                  type="number"
                                  min="1"
                                  max="365"
                                  inputmode="numeric"
                                  :placeholder="t('complaints.form.estimatedDowntimePlaceholder')"
                                  :error="errors.estimatedDowntimeDays" />

                    <div class="intensity-field" :class="{ 'has-error': !!errors.intensity }">
                        <div class="intensity-head">
                            <label class="field-label">{{ t('complaints.form.intensity') }}</label>                            <strong>{{ form.intensity }}/10</strong>
                        </div>

                        <div class="intensity-grid" role="group" :aria-label="t('complaints.form.intensityAria')">
                            <button v-for="value in intensityOptions"
                                    :key="value"
                                    type="button"
                                    class="intensity-pill"
                                    :class="{ 'is-selected': form.intensity === value }"
                                    :style="{ '--intensity-accent': intensityFillColor(value) }"
                                    :aria-pressed="form.intensity === value"
                                    @click="form.intensity = value">
                                {{ value }}
                            </button>
                        </div>

                        <p v-if="errors.intensity" class="field-error">{{ errors.intensity }}</p>
                    </div>

                    <UiPopupInput v-model="form.notes"
                                  :label="t('complaints.form.note')"
                                  :placeholder="t('complaints.form.notePlaceholder')"
                                  as="textarea"
                                  :rows="3"
                                  :maxlength="400" />

                    <div class="form-actions">
                        <button type="submit"
                                class="primary-button"
                                :class="{ 'builder-edit-action-btn': !!editingEntryId }">
                            {{ editingEntryId ? t('complaints.actions.update') : t('complaints.actions.save') }}
                        </button>
                        <button v-if="editingEntryId"
                                type="button"
                                class="secondary-button builder-edit-action-btn"
                                @click="cancelEditing">
                            {{ t('complaints.actions.cancelEdit') }}
                        </button>
                    </div>
                </div>
            </form>

            <template v-if="entries.length">
                <h3 class="section-title">{{ t('complaints.list.title') }}</h3>
                <div class="timeline-card">
                    <p class="section-meta timeline-meta">
                        {{ tp('complaints.list.visibleCount', { visible: sortedFilteredEntries.length, total: entries.length }) }}
                    </p>
                    <div v-if="entries.length > 1" class="filters-grid">
                        <UiPopupSelect v-model="statusFilter"
                                       :label="t('complaints.filter.status')"
                                       :placeholder="t('complaints.filter.allStatuses')"
                                       :options="translatedStatusFilterOptions" />

                        <UiPopupSelect v-model="areaFilter"
                                       :label="t('complaints.filter.area')"
                                       :placeholder="t('complaints.filter.allAreas')"
                                       :options="translatedAreaFilterOptions" />
                    </div>

                    <div v-if="sortedFilteredEntries.length" class="timeline-list">
                        <article v-for="entry in sortedFilteredEntries"
                                 :key="entry.id"
                                 :ref="(el) => setComplaintItemRef(entry.id, el)"
                                 class="list-item complaint-item"
                                 :class="{ 'is-created-highlight': highlightedEntryId === entry.id }">
                            <div class="complaint-main">
                                <div class="entry-top">
                                    <div>
                                        <p class="entry-area">{{ displayAreaLabel(entry) }}</p>
                                        <p class="entry-meta-line">
                                            <span><strong>{{ t('complaints.meta.recorded') }}:</strong> {{ formatDateTime(entry.createdAt) }}</span>
                                            <span><strong>{{ t('complaints.meta.category') }}:</strong> {{ categoryLabel(entry.category) }}</span>
                                            <span><strong>{{ t('complaints.meta.status') }}:</strong> {{ statusLabel(entry.status) }}</span>
                                        </p>
                                    </div>

                                    <div class="entry-side">
                                        <span class="entry-chip" :data-tone="entry.category">{{ categoryLabel(entry.category) }}</span>
                                        <span class="entry-chip" :data-tone="entry.status">{{ statusLabel(entry.status) }}</span>
                                    </div>
                                </div>

                                <div class="chip-row intensity-row">
                                    <span class="intensity-label">{{ t('complaints.form.intensityShort') }}</span>                                    <div class="intensity-meter">
                                        <div class="intensity-fill"
                                             :style="intensityFillStyle(entry.intensity)"></div>
                                        <span class="intensity-value">{{ entry.intensity }}/10</span>
                                    </div>
                                </div>

                                <p v-if="displayEntryNotes(entry.notes)" class="entry-notes">{{ displayEntryNotes(entry.notes) }}</p>
                                <section v-if="painDiaryPreviewByComplaint[entry.id]?.length" class="pain-diary-preview">
                                    <p class="pain-diary-preview__title">{{ t('complaints.diary.title') }}</p>                                    <ul class="pain-diary-preview__list">
                                        <li v-for="diary in painDiaryPreviewByComplaint[entry.id]"
                                            :key="diary.id"
                                            class="pain-diary-preview__item">
                                            <div class="pain-diary-preview__line">
                                                <span class="pain-diary-preview__date">{{ formatDateTime(diary.createdAt) }}</span>
                                                <span class="pain-diary-preview__source">{{ diarySourceLabel(diary.source) }}</span>
                                                <span class="pain-diary-preview__actions">
                                                    <button type="button"
                                                            class="pain-diary-preview__action-btn"
                                                            @click="startPainDiaryEdit(diary)">
                                                        {{ t('common.edit') }}
                                                    </button>
                                                    <button type="button"
                                                            class="pain-diary-preview__action-btn pain-diary-preview__action-btn--danger"
                                                            @click="requestDeletePainDiaryRecord(diary, $event)">
                                                        {{ t('common.delete') }}
                                                    </button>
                                                </span>
                                            </div>
                                            <div class="pain-diary-preview__scale-row">
                                                <div class="pain-diary-preview__scale" role="img" :aria-label="tp('complaints.diary.intensityValue', { value: diary.painLevel })">
                                                    <div class="pain-diary-preview__scale-fill"
                                                         :style="painDiaryScaleStyle(diary.painLevel)"></div>
                                                    <span class="pain-diary-preview__scale-value">{{ diary.painLevel }}/10</span>
                                                </div>
                                            </div>
                                            <p v-if="diary.note" class="pain-diary-preview__note">{{ diary.note }}</p>
                                            <div v-if="editingPainDiaryId === diary.id" class="pain-diary-preview__editor">
                                                <div class="pain-diary-preview__editor-head">
                                                    <label class="field-label">{{ t('complaints.form.intensity') }}</label>                                                    <strong>{{ editingPainDiaryLevel }}/10</strong>
                                                </div>
                                                <input v-model.number="editingPainDiaryLevel"
                                                       class="pain-diary-preview__slider"
                                                       type="range"
                                                       min="0"
                                                       max="10"
                                                       step="1"
                                                       :style="painDiaryEditorSliderStyle"
                                                       :aria-label="t('complaints.diary.editIntensityAria')" />
                                                <textarea v-model="editingPainDiaryNote"
                                                          class="pain-diary-preview__editor-note"
                                                          rows="2"
                                                          maxlength="220"
                                                          :placeholder="t('complaints.diary.optionalNote')" />
                                                <div class="pain-diary-preview__editor-actions">
                                                    <button type="button"
                                                            class="pain-diary-preview__action-btn"
                                                            @click="cancelPainDiaryEdit">
                                                        {{ t('common.cancel') }}
                                                    </button>
                                                    <button type="button"
                                                            class="pain-diary-preview__action-btn"
                                                            @click="savePainDiaryEdit(diary.id)">
                                                        {{ t('common.save') }}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </section>

                                <section class="pain-diary-create-card">
                                    <div class="pain-diary-create-card__head">
                                        <div>
                                            <p class="pain-diary-preview__title">{{ t('complaints.diary.newEntry') }}</p>
                                            <p class="pain-diary-create-card__sub">{{ t('complaints.diary.newEntrySub') }}</p>
                                        </div>
                                        <button type="button"
                                                class="pain-diary-preview__action-btn"
                                                @click="togglePainDiaryCreate(entry)">
                                            {{ activePainDiaryCreateId === entry.id ? t('common.close') : t('complaints.diary.log') }}
                                        </button>
                                    </div>

                                </section>

                                <div class="status-row">
                                    <p class="status-title">{{ t('complaints.status.choose') }}</p>
                                    <div class="status-actions complaint-actions" :aria-label="t('complaints.status.updateAria')">
                                        <button v-for="option in translatedStatusOptions"
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
                                <PopupActionButton variant="ghost"
                                                   class="complaints-edit-btn"
                                                   @click="startEditing(entry)">
                                    {{ t('common.edit') }}
                                </PopupActionButton>
                                <PopupActionButton variant="ghost" danger class="complaints-edit-btn complaints-delete-btn"
                                                   :title="t('common.delete')"
                                                   :aria-label="t('common.delete')"
                                                   :data-short="t('common.delete')"
                                                   @click="requestDeleteEntry(entry, $event)">
                                    {{ t('common.delete') }}
                                </PopupActionButton>
                            </div>
                        </article>
                    </div>

                    <div v-else class="empty-state">
                        <h4>{{ t('complaints.empty.noMatchTitle') }}</h4>
                        <p>{{ t('complaints.empty.noMatchText') }}</p>
                    </div>
                </div>
            </template>
        </section>

        <ComplaintTrainingContextPopup :show="showTrainingContextPopup"
                                       :date="trainingContextDate"
                                       :exerciseOptions="trainingContextExerciseOptions"
                                       @save="onTrainingContextPopupSave"
                                       @cancel="onTrainingContextPopupCancel" />

        <BasePopup :show="!!activePainDiaryCreateEntry"
                   :title="t('complaints.diary.popupTitle')"
                   overlayClass="pain-diary-create-popup"
                   @cancel="closePainDiaryCreate"
                   @save="savePainDiaryCreateFromPopup">
            <div class="pain-diary-create-popup__body">
                <div class="pain-diary-create-popup__hero">
                    <p v-if="activePainDiaryCreateEntry" class="pain-diary-create-popup__label">
                        {{ displayAreaLabel(activePainDiaryCreateEntry) }}
                    </p>
                    <p class="pain-diary-create-popup__sub">
                        {{ t('complaints.diary.popupSub') }}
                    </p>
                </div>

                <div class="pain-diary-create-popup__section">
                    <div class="pain-diary-preview__editor-head">
                        <label class="field-label">{{ t('complaints.form.intensity') }}</label>                        <strong>{{ creatingPainDiaryLevel }}/10</strong>
                    </div>
                    <input v-model.number="creatingPainDiaryLevel"
                           class="pain-diary-preview__slider"
                           type="range"
                           min="0"
                           max="10"
                           step="1"
                           :style="painDiaryCreateSliderStyle"
                           :aria-label="t('complaints.diary.addIntensityAria')" />
                </div>

                <div class="pain-diary-create-popup__section">
                    <label class="field-label" for="pain-diary-create-note">{{ t('complaints.form.noteShort') }}</label>                    <textarea id="pain-diary-create-note"
                                                                                                                                                      v-model="creatingPainDiaryNote"
                                                                                                                                                      class="pain-diary-preview__editor-note pain-diary-create-popup__note"
                                                                                                                                                      rows="4"
                                                                                                                                                      maxlength="220"
                                                                                                                                                      :placeholder="t('complaints.diary.notePlaceholder')" />
                </div>
            </div>
            <template #actions>
                <PopupActionButton variant="ghost" @click="closePainDiaryCreate">
                    {{ t('common.cancel') }}
                </PopupActionButton>
                <PopupActionButton @click="savePainDiaryCreateFromPopup">
                    {{ t('common.save') }}
                </PopupActionButton>
            </template>
        </BasePopup>

        <DeleteConfirmPopup :show="showDeletePopup"
                            @confirm="confirmDeleteEntry"
                            @cancel="cancelDeleteEntry" />

        <Transition name="delete-trash">
            <div v-if="deleteTrashState.visible" class="delete-trash-overlay" aria-hidden="true">
                <div v-if="deleteTrashState.itemName" class="delete-trash-flight" :style="deleteTrashFlightStyle">
                    <span class="delete-trash-flight__title">{{ deleteTrashState.itemName }}</span>
                </div>
                <div class="delete-trash-bin">
                    <div class="delete-trash-bin__lid"></div>
                    <div class="delete-trash-bin__body"></div>
                </div>
            </div>
        </Transition>

        <Transition name="create-flight">
            <div v-if="createFlightState.visible" class="create-flight-overlay" aria-hidden="true">
                <div class="create-flight-card" :style="createFlightStyle">
                    <span class="create-flight-card__area">{{ createFlightState.area }}</span>
                    <span class="create-flight-card__meta">
                        <span class="create-flight-card__chip">{{ createFlightState.intensity }}/10</span>
                        <span class="create-flight-card__status">{{ createFlightState.status }}</span>
                    </span>
                </div>
            </div>
        </Transition>

        <div v-if="builderActionLabel.visible"
             :key="`builder-action-${builderActionLabel.seq}`"
             class="builder-action-label"
             aria-hidden="true">
            <span class="builder-action-label__spark builder-action-label__spark--left"></span>
            <span class="builder-action-label__spark builder-action-label__spark--right"></span>
            <span class="builder-action-label__kicker">{{ t('complaints.builder.active') }}</span>
            <strong class="builder-action-label__main">{{ builderActionLabel.label }}</strong>
            <span class="builder-action-label__sub">{{ t('complaints.builder.sub') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onActivated, onDeactivated, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import AnimatedReelValue from '@/components/ui/progress/AnimatedReelValue.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import ComplaintInjuryEstimator from '@/components/ui/complaints/ComplaintInjuryEstimator.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import ComplaintTrainingContextPopup from '@/components/ui/popups/ComplaintTrainingContextPopup.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import { appendPainDiaryEntry, listPainDiaryEntries, removePainDiaryEntry, updatePainDiaryEntry, type PainDiaryEntry } from '@/components/ui/feedback/painDiary'
    import { useAuthStore } from '@/store/authStore'
    import { useComplaintsStore } from '@/store/complaintsStore'
    import { showDeleteTrashOverlay, DELETE_TRASH_ANIMATION_MS } from '@/composables/useDeleteTrashOverlay'
    import { useProgressStore } from '@/store/progressStore'
    import { useSettingsStore } from '@/store/settingsStore'
    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { LS_COMPLAINTS_CUSTOM_AREAS, LS_CONFIRM_DELETE_ENABLED } from '@/constants/storageKeys'
    import type { ComplaintArea, ComplaintCategory, ComplaintEntry, ComplaintStatus } from '@/types/complaint'
    import { useRoute, useRouter } from 'vue-router'
    import { useI18n } from '@/composables/useI18n'

    const complaintsStore = useComplaintsStore()
    const authStore = useAuthStore()
    const progressStore = useProgressStore()
    const settingsStore = useSettingsStore()
    const trainingPlansStore = useTrainingPlansStore()
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()

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

    const translatedAreaOptions = computed(() => areaOptions.map((option) => ({
        ...option,
        label: areaLabel(option.value),
    })))

    const translatedCategoryOptions = computed(() => categoryOptions.map((option) => ({
        ...option,
        label: categoryLabel(option.value),
    })))

    const translatedStatusOptions = computed(() => statusOptions.map((option) => ({
        ...option,
        label: statusLabel(option.value),
    })))

    const translatedStatusFilterOptions = computed(() => statusFilterOptions.map((option) => ({
        ...option,
        label: option.value === 'all' ? t('complaints.filter.allStatuses') : statusLabel(option.value as ComplaintStatus),
    })))

    const translatedAreaFilterOptions = computed(() => areaFilterOptions.map((option) => ({
        ...option,
        label: option.value === 'all'
            ? t('complaints.filter.allAreas')
            : option.value === 'sonstiges'
                ? t('complaints.area.otherLegacy')
                : areaLabel(option.value as ComplaintArea),
    })))

    function tp(key: string, params: Record<string, string | number>) {
        return Object.entries(params).reduce(
            (text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
            t(key)
        )
    }
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
    const painDiaryEntries = ref<PainDiaryEntry[]>([])
    const editingPainDiaryId = ref<string | null>(null)
    const editingPainDiaryLevel = ref(0)
    const editingPainDiaryNote = ref('')
    const activePainDiaryCreateId = ref<string | null>(null)
    const creatingPainDiaryLevel = ref(0)
    const creatingPainDiaryNote = ref('')
    const editingEntryId = ref<string | null>(null)
    const builderActionLabel = ref<{ visible: boolean; label: string; seq: number }>({ visible: false, label: '', seq: 0 })
    const creatorFormRef = ref<HTMLElement | null>(null)
    const injuryEstimatorRef = ref<InjuryEstimatorExpose | null>(null)
    const showDeletePopup = ref(false)
    const pendingDeleteEntryId = ref<string | null>(null)
    const pendingDeletePainDiaryId = ref<string | null>(null)
    const pendingDeleteEntryEvent = ref<MouseEvent | null>(null)
    const pendingDeletePainDiaryEvent = ref<MouseEvent | null>(null)
    const complaintItemRefs = new Map<string, HTMLElement>()
    const highlightedEntryId = ref<string | null>(null)
    const createFlightState = ref({
        visible: false,
        area: '',
        intensity: 0,
        status: '',
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    })
    const deleteTrashState = ref({
        visible: false,
        itemName: '',
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    })
    let deleteTrashTimer: ReturnType<typeof setTimeout> | null = null
    let createFlightTimer: ReturnType<typeof setTimeout> | null = null
    let highlightTimer: ReturnType<typeof setTimeout> | null = null
    let builderActionTimer: ReturnType<typeof setTimeout> | null = null
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

    const deleteTrashFlightStyle = computed(() => ({
        left: `${deleteTrashState.value.startX}px`,
        top: `${deleteTrashState.value.startY}px`,
        '--delete-fly-x': `${deleteTrashState.value.deltaX}px`,
        '--delete-fly-y': `${deleteTrashState.value.deltaY}px`,
    }))

    const createFlightStyle = computed(() => ({
        left: `${createFlightState.value.startX}px`,
        top: `${createFlightState.value.startY}px`,
        '--create-fly-x': `${createFlightState.value.deltaX}px`,
        '--create-fly-y': `${createFlightState.value.deltaY}px`,
    }))

    const painDiaryPreviewByComplaint = computed<Record<string, PainDiaryEntry[]>>(() => {
        const grouped: Record<string, PainDiaryEntry[]> = {}
        const seenDayByComplaint: Record<string, Set<string>> = {}

        for (const diaryEntry of painDiaryEntries.value) {
            const day = String(diaryEntry.createdAt ?? '').slice(0, 10)
            for (const complaintId of diaryEntry.activeComplaintIds) {
                if (!grouped[complaintId]) grouped[complaintId] = []
                if (!seenDayByComplaint[complaintId]) seenDayByComplaint[complaintId] = new Set<string>()

                if (day && seenDayByComplaint[complaintId].has(day)) continue
                if (grouped[complaintId].length >= 5) continue

                grouped[complaintId].push(diaryEntry)
                if (day) seenDayByComplaint[complaintId].add(day)
            }
        }

        return grouped
    })

    const activeCount = computed(() => entries.value.filter((entry) => entry.status !== 'weg').length)
    const activeCountDisplay = computed(() => String(activeCount.value))

    const averageIntensity = computed(() => {
        if (!entries.value.length) return '-'
        const total = entries.value.reduce((sum, entry) => sum + entry.intensity, 0)
        return (total / entries.value.length).toFixed(1)
    })

    const averageIntensityInfo = computed(() => (
        entries.value.length ? `${averageIntensity.value}/10` : t('complaints.empty.noEntries')
    ))

    const dashboardCardsVisible = ref(false)
    const activeCountJumpNonce = ref(0)
    const activeCountGlowActive = ref(false)
    const averageIntensityAnimateFrom = ref<string | null>(null)
    const averageIntensityAnimateTo = ref<string | null>(null)
    const averageIntensityAnimateNonce = ref(0)
    let activeCountGlowTimer: ReturnType<typeof setTimeout> | null = null
    let dashboardRevealTimer: ReturnType<typeof setTimeout> | null = null
    let hasSeenActiveCount = false
    let hasSeenAverageIntensity = false

    function clearDashboardRevealTimer() {
        if (dashboardRevealTimer) {
            clearTimeout(dashboardRevealTimer)
            dashboardRevealTimer = null
        }
    }

    function scheduleDashboardReveal() {
        clearDashboardRevealTimer()
        dashboardCardsVisible.value = false
        dashboardRevealTimer = setTimeout(() => {
            dashboardCardsVisible.value = true
            dashboardRevealTimer = null
        }, 32)
    }

    watch(activeCount, (next, previous) => {
        if (!hasSeenActiveCount) {
            hasSeenActiveCount = true
            return
        }
        if (previous === undefined) return
        activeCountJumpNonce.value += 1

        if (next > previous) {
            if (activeCountGlowTimer) clearTimeout(activeCountGlowTimer)
            activeCountGlowActive.value = false
            requestAnimationFrame(() => {
                activeCountGlowActive.value = true
                activeCountGlowTimer = setTimeout(() => {
                    activeCountGlowActive.value = false
                    activeCountGlowTimer = null
                }, 320)
            })
        }
    })

    watch(averageIntensityInfo, (next, previous) => {
        if (!hasSeenAverageIntensity) {
            hasSeenAverageIntensity = true
            return
        }
        if (previous === undefined || next === previous) return
        averageIntensityAnimateFrom.value = previous
        averageIntensityAnimateTo.value = next
        averageIntensityAnimateNonce.value += 1
    })

    const hotspotLabel = computed(() => {
        if (!entries.value.length) return t('complaints.empty.stillOpen')
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

        return hottest ? areaLabel(hottest) : t('complaints.empty.stillOpen')
    })

    const customAreaSuggestionOptions = computed(() => customAreaHistory.value.map((name) => ({
        label: name,
        value: name,
    })))

    const resolvedAreaDisplay = computed(() => {
        if (form.area === 'benutzerdefiniert' || form.area === 'sonstiges') {
            return normalizeCustomLabel(form.customAreaName) || t('complaints.area.custom')        }
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
        if (value === 'sonstiges' || value === 'benutzerdefiniert') return t('complaints.area.custom')
        return t(`complaints.area.${value}`)
    }

    function displayAreaLabel(entry: (typeof entries.value)[number]) {
        const custom = readCustomAreaName(entry.notes)
        if (custom) return custom
        return areaLabel(entry.area)
    }

    function categoryLabel(value: ComplaintCategory) {
        if (value === 'muskelkater') return t('complaints.category.soreMuscles')
        if (value === 'ueberlastung') return t('complaints.category.overload')
        if (value === 'schmerz') return t('complaints.category.pain')
        return value
    }

    function statusLabel(value: ComplaintStatus) {
        if (value === 'aktiv') return t('complaints.status.active')
        if (value === 'besser') return t('complaints.status.better')
        if (value === 'weg') return t('complaints.status.gone')
        return value
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

    function diarySourceLabel(source: PainDiaryEntry['source']) {
        if (source === 'training-simulation') return t('complaints.diary.source.training')
        if (source === 'complaints') return t('complaints.diary.source.complaints')
        return t('complaints.diary.source.plan')
    }

    const painDiaryEditorSliderStyle = computed(() => {
        const ratio = Math.max(0, Math.min(1, editingPainDiaryLevel.value / 10))
        const hue = 120 - (120 * ratio)
        return {
            '--pain-thumb-color': `hsl(${hue} 85% 48%)`,
        }
    })

    const painDiaryCreateSliderStyle = computed(() => {
        const ratio = Math.max(0, Math.min(1, creatingPainDiaryLevel.value / 10))
        const hue = 120 - (120 * ratio)
        return {
            '--pain-thumb-color': `hsl(${hue} 85% 48%)`,
        }
    })

    const activePainDiaryCreateEntry = computed(() =>
        entries.value.find((entry) => entry.id === activePainDiaryCreateId.value) ?? null
    )

    function loadPainDiaryEntries() {
        painDiaryEntries.value = listPainDiaryEntries()
    }

    function startPainDiaryEdit(entry: PainDiaryEntry) {
        editingPainDiaryId.value = entry.id
        editingPainDiaryLevel.value = Math.max(0, Math.min(10, Math.round(Number(entry.painLevel) || 0)))
        editingPainDiaryNote.value = String(entry.note ?? '').slice(0, 220)
    }

    function cancelPainDiaryEdit() {
        editingPainDiaryId.value = null
        editingPainDiaryLevel.value = 0
        editingPainDiaryNote.value = ''
    }

    function prefillPainDiaryLevel(entry: ComplaintEntry) {
        const latest = painDiaryEntries.value.find((item) => item.activeComplaintIds.includes(entry.id))
        return latest ? latest.painLevel : entry.intensity
    }

    function closePainDiaryCreate() {
        activePainDiaryCreateId.value = null
        creatingPainDiaryLevel.value = 0
        creatingPainDiaryNote.value = ''
    }

    function togglePainDiaryCreate(entry: ComplaintEntry) {
        if (activePainDiaryCreateId.value === entry.id) {
            closePainDiaryCreate()
            return
        }

        activePainDiaryCreateId.value = entry.id
        creatingPainDiaryLevel.value = prefillPainDiaryLevel(entry)
        creatingPainDiaryNote.value = ''
    }

    function savePainDiaryCreate(entry: ComplaintEntry) {
        appendPainDiaryEntry({
            source: 'complaints',
            painLevel: creatingPainDiaryLevel.value,
            note: creatingPainDiaryNote.value,
            activeComplaints: [entry],
        })
        loadPainDiaryEntries()
        closePainDiaryCreate()
    }

    function savePainDiaryCreateFromPopup() {
        if (!activePainDiaryCreateEntry.value) return
        savePainDiaryCreate(activePainDiaryCreateEntry.value)
    }

    function savePainDiaryEdit(id: string) {
        const success = updatePainDiaryEntry({
            id,
            painLevel: editingPainDiaryLevel.value,
            note: editingPainDiaryNote.value,
        })
        if (!success) return
        loadPainDiaryEntries()
        cancelPainDiaryEdit()
    }

    function requestDeletePainDiaryRecord(entry: PainDiaryEntry, event?: MouseEvent) {
        const id = entry.id
        const confirmDeleteEnabled = resolveConfirmDeleteEnabled()

        try {
            localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(confirmDeleteEnabled))
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: confirmDeleteEnabled }))
        } catch {
            // ignore
        }

        if (!confirmDeleteEnabled) {
            launchDeleteTrashFlight(
                tp('complaints.diary.deleteFlight', { date: formatDateTime(entry.createdAt) }),
                event
            )
            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
                const success = removePainDiaryEntry(id)
                if (!success) return
                if (editingPainDiaryId.value === id) cancelPainDiaryEdit()
                loadPainDiaryEntries()
            }, DELETE_TRASH_ANIMATION_MS)
            return
        }

        pendingDeletePainDiaryId.value = id
        pendingDeletePainDiaryEvent.value = event ?? null
        showDeletePopup.value = true
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

    function painDiaryScaleStyle(valueRaw: number) {
        const value = Math.max(0, Math.min(10, Math.round(Number(valueRaw) || 0)))
        return {
            width: `${value * 10}%`,
            background: intensityFillColor(value === 0 ? 1 : value),
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

    function displayEntryNotes(valueRaw: string) {
        return String(valueRaw ?? '')
            .split('\n')
            .map((line) => translateVisibleNoteLine(line.trim()))
            .filter(Boolean)
            .join('\n')
    }

    function translateVisibleNoteLine(line: string) {
        if (!line) return ''

        const downtimeMatch = line.match(/^\[Ausfallzeit\]\s*Voraussichtlich\s*(\d{1,3})\s*Tag(?:e)?$/i)
        if (downtimeMatch?.[1]) {
            return tp('complaints.note.downtime', { days: downtimeMatch[1] })
        }

        const customAreaMatch = line.match(/^\[K.*rperstelle\]\s*Benutzerdefiniert:\s*(.+)$/i)
        if (customAreaMatch?.[1]) {
            return tp('complaints.note.customArea', { area: normalizeCustomLabel(customAreaMatch[1]) })
        }

        const injuryMatch = line.match(/^\[Verletzung\]\s*(.+)$/i)
        if (injuryMatch?.[1]) {
            return tp('complaints.note.injury', { injury: injuryMatch[1].replace(/\s*\[key:[^\]]+\]\s*$/i, '') })
        }

        const trainingExerciseMatch = line.match(/^\[Trainingbezug\]\s*Während Training bei:\s*(.+)$/i)
        if (trainingExerciseMatch?.[1]) {
            return tp('complaints.note.trainingExercise', { exercise: trainingExerciseMatch[1] })
        }

        if (/^\[Trainingbezug\]\s*Während Training\s*\(Übung nicht angegeben\)$/i.test(line)) {
            return t('complaints.note.trainingUnknown')
        }

        return line
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

        if (!form.area) errors.area = t('complaints.validation.areaRequired')
        const isCustomArea = form.area === 'benutzerdefiniert' || form.area === 'sonstiges'
        if (isCustomArea && !normalizeCustomLabel(form.customAreaName)) {
            errors.customAreaName = t('complaints.validation.customAreaRequired')
        }
        if (!form.category) errors.category = t('complaints.validation.categoryRequired')
        if (!form.status) errors.status = t('complaints.validation.statusRequired')
        if (!form.date) errors.date = t('complaints.validation.dateRequired')
        if (form.date > today) errors.date = t('complaints.validation.dateFuture')
        if (form.intensity < 1 || form.intensity > 10) errors.intensity = t('complaints.validation.intensityRange')
        if (form.category === 'schmerz' && form.injuryType === CUSTOM_INJURY_VALUE && !normalizeCustomLabel(form.customInjuryName)) {
            errors.customInjuryName = t('complaints.validation.customInjuryRequired')
        }

        const downtimeRaw = String(form.estimatedDowntimeDays ?? '').trim()
        if (downtimeRaw) {
            const downtimeDays = Number.parseInt(downtimeRaw, 10)
            if (!Number.isFinite(downtimeDays) || downtimeDays < 1 || downtimeDays > 365) {
                errors.estimatedDowntimeDays = t('complaints.validation.downtimeRange')
            }
            if (form.category !== 'schmerz') {
                errors.estimatedDowntimeDays = t('complaints.validation.downtimePainOnly')
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
                errors.status = tp('complaints.validation.duplicateOpen', { area, category })            }
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
            .map((p: { id?: string | null }) => String(p?.id ?? ''))
            .filter((id: string) => guidRx.test(id))

        if (!planIds.length) return []

        await Promise.all(planIds.map(async (planId: string) => {
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

        let createdEntry: ComplaintEntry | null = null

        if (editingEntryId.value) {
            await complaintsStore.updateEntry(editingEntryId.value, payload)
        } else {
            createdEntry = await complaintsStore.addEntry(payload)
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

        if (createdEntry) {
            await playCreateFlight(createdEntry)
        }
    }

    async function updateStatus(id: string, status: string) {
        await complaintsStore.updateStatus(id, status as ComplaintStatus)
    }

    function triggerBuilderActionLabel(label: string) {
        if (builderActionTimer) clearTimeout(builderActionTimer)
        builderActionLabel.value = {
            visible: true,
            label,
            seq: builderActionLabel.value.seq + 1,
        }
        builderActionTimer = setTimeout(() => {
            builderActionLabel.value = {
                visible: false,
                label: '',
                seq: builderActionLabel.value.seq,
            }
            builderActionTimer = null
        }, 2200)
    }

    function startEditing(entry: (typeof entries.value)[number]) {
        triggerBuilderActionLabel(t('common.edit'))
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

    function clearDeleteTrashTimer() {
        if (deleteTrashTimer) {
            clearTimeout(deleteTrashTimer)
            deleteTrashTimer = null
        }
    }

    function clearCreateFlightTimer() {
        if (createFlightTimer) {
            clearTimeout(createFlightTimer)
            createFlightTimer = null
        }
    }

    function clearHighlightTimer() {
        if (highlightTimer) {
            clearTimeout(highlightTimer)
            highlightTimer = null
        }
    }

    function hideDeleteTrash() {
        clearDeleteTrashTimer()
        deleteTrashState.value = {
            visible: false,
            itemName: '',
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
        }
    }

    function hideCreateFlight() {
        clearCreateFlightTimer()
        createFlightState.value = {
            visible: false,
            area: '',
            intensity: 0,
            status: '',
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
        }
    }

    function setComplaintItemRef(id: string, el: unknown) {
        if (el instanceof HTMLElement) {
            complaintItemRefs.set(id, el)
            return
        }
        complaintItemRefs.delete(id)
    }

    function triggerCreatedHighlight(id: string) {
        clearHighlightTimer()
        highlightedEntryId.value = id
        highlightTimer = setTimeout(() => {
            highlightedEntryId.value = null
            highlightTimer = null
        }, 1400)
    }

    async function focusComplaintFromRoute() {
        const complaintId = String(route.query.complaintId ?? '').trim()
        if (!complaintId) return

        statusFilter.value = 'all'
        areaFilter.value = 'all'
        await nextTick()

        const el = complaintItemRefs.get(complaintId)
        if (!el) return

        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        triggerCreatedHighlight(complaintId)

        const { complaintId: _omit, ...restQuery } = route.query
        void router.replace({ query: restQuery })
    }

    async function playCreateFlight(entry: ComplaintEntry) {
        if (typeof window === 'undefined') return

        const formRect = creatorFormRef.value?.getBoundingClientRect()
        const fallbackX = window.innerWidth / 2
        const fallbackY = Math.max(140, window.innerHeight / 2)
        const startX = formRect ? formRect.left + Math.min(formRect.width * 0.74, formRect.width - 110) : fallbackX
        const startY = formRect ? formRect.top + Math.min(formRect.height - 70, formRect.height * 0.82) : fallbackY

        await nextTick()

        const targetEl = complaintItemRefs.get(entry.id)
        if (!targetEl) {
            triggerCreatedHighlight(entry.id)
            return
        }

        const targetRect = targetEl.getBoundingClientRect()
        createFlightState.value = {
            visible: true,
            area: displayAreaLabel(entry),
            intensity: entry.intensity,
            status: statusLabel(entry.status),
            startX,
            startY,
            deltaX: targetRect.left + 28 - startX,
            deltaY: targetRect.top + 22 - startY,
        }

        createFlightTimer = setTimeout(() => {
            hideCreateFlight()
            triggerCreatedHighlight(entry.id)
        }, 820)
    }

    function launchDeleteTrashFlight(itemName: string, event?: MouseEvent) {
        clearDeleteTrashTimer()

        const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
        const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
        const startX = event?.clientX ?? fallbackX
        const startY = event?.clientY ?? Math.max(140, fallbackY - 40)
        const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : startX
        const targetY = typeof window !== 'undefined' ? window.innerHeight - 84 : startY

        deleteTrashState.value = {
            visible: true,
            itemName,
            startX,
            startY,
            deltaX: targetX - startX,
            deltaY: targetY - startY,
        }
        showDeleteTrashOverlay({
            startX,
            startY,
            title: itemName,
            targetX,
            targetY,
            durationMs: DELETE_TRASH_ANIMATION_MS,
        })
    }

    function requestDeleteEntry(entry: ComplaintEntry, event?: MouseEvent) {
        const id = entry.id
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
            launchDeleteTrashFlight(displayAreaLabel(entry), event)
            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
                void complaintsStore.removeEntry(id)
                if (editingEntryId.value === id) {
                    resetForm()
                }
            }, DELETE_TRASH_ANIMATION_MS)
            return
        }

        pendingDeleteEntryId.value = id
        pendingDeleteEntryEvent.value = event ?? null
        showDeletePopup.value = true
    }

    function cancelDeleteEntry() {
        showDeletePopup.value = false
        pendingDeleteEntryId.value = null
        pendingDeletePainDiaryId.value = null
        pendingDeleteEntryEvent.value = null
        pendingDeletePainDiaryEvent.value = null
    }

    function confirmDeleteEntry() {
        const complaintId = pendingDeleteEntryId.value
        const painDiaryId = pendingDeletePainDiaryId.value

        if (complaintId) {
            const complaint = entries.value.find((entry) => entry.id === complaintId)
            launchDeleteTrashFlight(
                complaint ? displayAreaLabel(complaint) : t('complaints.deleteFallback.complaint'),
                pendingDeleteEntryEvent.value ?? undefined
            )

            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
                void complaintsStore.removeEntry(complaintId)
                if (editingEntryId.value === complaintId) {
                    resetForm()
                }
            }, DELETE_TRASH_ANIMATION_MS)
        }

        if (painDiaryId) {
            const diary = painDiaryEntries.value.find((entry) => entry.id === painDiaryId)
            launchDeleteTrashFlight(
                diary ? tp('complaints.diary.deleteFlight', { date: formatDateTime(diary.createdAt) }) : t('complaints.deleteFallback.diary'),
                pendingDeletePainDiaryEvent.value ?? undefined
            )
            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
                const success = removePainDiaryEntry(painDiaryId)
                if (success) {
                    if (editingPainDiaryId.value === painDiaryId) cancelPainDiaryEdit()
                    loadPainDiaryEntries()
                }
            }, DELETE_TRASH_ANIMATION_MS)
        }

        showDeletePopup.value = false
        pendingDeleteEntryId.value = null
        pendingDeletePainDiaryId.value = null
        pendingDeleteEntryEvent.value = null
        pendingDeletePainDiaryEvent.value = null
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
        loadPainDiaryEntries()
        scheduleDashboardReveal()
        void focusComplaintFromRoute()
    })

    onActivated(() => {
        scheduleDashboardReveal()
        loadPainDiaryEntries()
        void focusComplaintFromRoute()
    })

    watch(() => [route.query.complaintId, entries.value.length], async () => {
        await focusComplaintFromRoute()
    })

    onDeactivated(() => {
        clearDashboardRevealTimer()
        dashboardCardsVisible.value = false
    })

    onUnmounted(() => {
        clearDashboardRevealTimer()
        if (activeCountGlowTimer) clearTimeout(activeCountGlowTimer)
        clearCreateFlightTimer()
        clearHighlightTimer()
        clearDeleteTrashTimer()
        if (builderActionTimer) clearTimeout(builderActionTimer)
    })
</script>

<style scoped>
    .builder-action-label {
        position: fixed;
        left: 50%;
        top: 46%;
        z-index: 1400;
        pointer-events: none;
        transform: translate(-50%, -50%);
        display: grid;
        justify-items: center;
        gap: .3rem;
        min-width: min(88vw, 460px);
        padding: 1rem 1.4rem 1.05rem;
        border-radius: 1.6rem;
        border: 1px solid rgba(250, 204, 21, 0.72);
        background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0) 55%), linear-gradient(180deg, rgba(255, 251, 235, 0.99), rgba(255, 244, 214, 0.96));
        color: #b45309;
        line-height: 1;
        text-align: center;
        overflow: hidden;
        box-shadow: 0 22px 42px rgba(245, 158, 11, 0.24), 0 0 0 1px rgba(255, 248, 220, 0.76), 0 0 0 10px rgba(250, 204, 21, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.94);
        animation: builder-action-label-rise 2.2s cubic-bezier(0.2, 0.82, 0.24, 1) both, builder-action-label-glow 2.2s ease-in-out both;
    }

    .builder-action-label__kicker {
        padding: .26rem .7rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.72);
        color: #92400e;
        font-size: .74rem;
        font-weight: 900;
        letter-spacing: .18em;
        text-transform: uppercase;
        box-shadow: inset 0 0 0 1px rgba(250, 204, 21, 0.2);
    }

    .builder-action-label__main {
        display: block;
        font-size: clamp(1.6rem, 4.8vw, 2.5rem);
        font-weight: 1000;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #b45309;
        text-shadow: 0 2px 0 rgba(255, 255, 255, 0.7), 0 0 22px rgba(250, 204, 21, 0.18);
    }

    .builder-action-label__sub {
        display: block;
        font-size: .9rem;
        font-weight: 800;
        letter-spacing: .05em;
        color: #a16207;
        opacity: .9;
    }

    .builder-action-label__spark {
        position: absolute;
        top: 50%;
        width: 76px;
        height: 76px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(250, 204, 21, 0.9) 0 12%, rgba(250, 204, 21, 0.18) 34%, rgba(250, 204, 21, 0) 72%);
        filter: blur(2px);
        opacity: 0;
        animation: builder-action-spark 2.2s ease-out both;
    }

    .builder-action-label__spark--left {
        left: -8px;
    }

    .builder-action-label__spark--right {
        right: -8px;
        animation-delay: .12s;
    }

    @keyframes builder-action-label-rise {
        0% {
            opacity: 0;
            transform: translate(-50%, -28%) scale(.72) rotate(-5deg);
            filter: blur(10px);
            letter-spacing: .08em;
        }

        18% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.06) rotate(.5deg);
            filter: blur(0);
            letter-spacing: .12em;
        }

        62% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0);
            letter-spacing: .12em;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -68%) scale(.95) rotate(1deg);
            filter: blur(6px);
            letter-spacing: .14em;
        }
    }

    @keyframes builder-action-label-glow {
        0%, 100% {
            text-shadow: 0 0 0 rgba(255, 248, 220, 0), 0 0 0 rgba(250, 204, 21, 0);
        }

        50% {
            text-shadow: 0 0 18px rgba(255, 248, 220, 0.82), 0 0 36px rgba(250, 204, 21, 0.46);
        }
    }

    @keyframes builder-action-spark {
        0%, 20% {
            opacity: 0;
            transform: translateY(-50%) scale(.2);
        }

        40% {
            opacity: .9;
            transform: translateY(-50%) scale(1);
        }

        100% {
            opacity: 0;
            transform: translateY(-50%) scale(1.45);
        }
    }

    .delete-trash-overlay {
        position: fixed;
        inset: 0;
        z-index: 1300;
        pointer-events: none;
    }

    .create-flight-overlay {
        position: fixed;
        inset: 0;
        z-index: 1280;
        pointer-events: none;
    }

    .create-flight-card {
        position: fixed;
        min-width: 188px;
        max-width: 240px;
        display: grid;
        gap: 0.35rem;
        padding: 0.8rem 0.9rem;
        border-radius: 16px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, rgba(148, 163, 184, 0.26));
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 18%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 24px 56px rgba(15, 23, 42, 0.34), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 18%, transparent) inset;
        transform: translate(-50%, -50%);
        animation: complaint-create-flight .82s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        will-change: transform, opacity;
    }

    .create-flight-card__area {
        font-size: 0.98rem;
        font-weight: 800;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .create-flight-card__meta {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        flex-wrap: wrap;
    }

    .create-flight-card__chip,
    .create-flight-card__status {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 0.24rem 0.58rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 800;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.14);
        color: var(--text-primary);
    }

    .create-flight-card__chip {
        border-color: color-mix(in srgb, var(--accent-primary) 38%, rgba(148, 163, 184, 0.24));
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 16%, transparent) inset;
    }

    .complaint-item.is-created-highlight {
        animation: complaint-created-highlight 1.2s ease-out;
    }

    .delete-trash-flight {
        position: fixed;
        min-width: 180px;
        max-width: min(280px, calc(100vw - 2rem));
        padding: .8rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: radial-gradient(circle at top left, color-mix(in srgb, #ef4444 12%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, white 6%);
        box-shadow: 0 18px 38px rgba(15, 23, 42, 0.2);
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    .delete-trash-flight__title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: .92rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .delete-trash-bin {
        position: fixed;
        left: 50%;
        bottom: 1.25rem;
        width: 90px;
        height: 92px;
        transform: translateX(-50%);
        filter: drop-shadow(0 20px 30px rgba(15, 23, 42, 0.26));
        animation: delete-trash-bin-pop .3s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .delete-trash-bin__lid {
        position: absolute;
        left: 50%;
        top: 2px;
        width: 62px;
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(180deg, #94a3b8, #64748b);
        transform: translateX(-50%);
    }

        .delete-trash-bin__lid::before {
            content: "";
            position: absolute;
            left: 50%;
            top: -6px;
            width: 22px;
            height: 6px;
            border-radius: 999px 999px 0 0;
            background: #64748b;
            transform: translateX(-50%);
        }

    .delete-trash-bin__body {
        position: absolute;
        inset: 14px 12px 0;
        border-radius: 18px 18px 22px 22px;
        border: 2px solid rgba(71, 85, 105, 0.8);
        background: linear-gradient(180deg, rgba(226, 232, 240, 0.96), rgba(148, 163, 184, 0.88));
        overflow: hidden;
    }

        .delete-trash-bin__body::before,
        .delete-trash-bin__body::after {
            content: "";
            position: absolute;
            top: 12px;
            bottom: 12px;
            width: 4px;
            border-radius: 999px;
            background: rgba(71, 85, 105, 0.38);
        }

        .delete-trash-bin__body::before {
            left: 22px;
            box-shadow: 14px 0 0 rgba(71, 85, 105, 0.38), 28px 0 0 rgba(71, 85, 105, 0.38);
        }

    .delete-trash-enter-active,
    .delete-trash-leave-active {
        transition: opacity .22s ease;
    }

    .delete-trash-enter-from,
    .delete-trash-leave-to {
        opacity: 0;
    }

    @keyframes delete-trash-bin-pop {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(18px) scale(.92);
        }

        100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }

    @keyframes delete-trash-flight {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }

        68% {
            opacity: 1;
            transform: translate(calc(-50% + var(--delete-fly-x) * .82), calc(-50% + var(--delete-fly-y) * .82)) scale(.78) rotate(-10deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--delete-fly-x)), calc(-50% + var(--delete-fly-y))) scale(.26) rotate(-18deg);
        }
    }

    @keyframes complaint-create-flight {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.92) rotate(-4deg);
        }

        16% {
            opacity: 1;
            transform: translate(calc(-50% + var(--create-fly-x) * 0.1), calc(-50% + var(--create-fly-y) * 0.08)) scale(1.02) rotate(-2deg);
        }

        72% {
            opacity: 1;
            transform: translate(calc(-50% + var(--create-fly-x) * 0.84), calc(-50% + var(--create-fly-y) * 0.84)) scale(0.92) rotate(1deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--create-fly-x)), calc(-50% + var(--create-fly-y))) scale(0.78) rotate(0deg);
        }
    }

    @keyframes complaint-created-highlight {
        0% {
            transform: translateY(8px);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        }

        28% {
            transform: translateY(0);
            box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 12px color-mix(in srgb, var(--accent-primary) 12%, transparent), 0 22px 48px rgba(15, 23, 42, 0.28);
        }

        100% {
            transform: translateY(0);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        }
    }

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

    .dashboard-card-shell {
        opacity: 0;
        transform: translateY(22px);
        transition: opacity 380ms ease-out var(--dashboard-delay, 0ms), transform 520ms cubic-bezier(0.22, 1, 0.36, 1) var(--dashboard-delay, 0ms);
    }

        .dashboard-card-shell.is-dashboard-visible {
            opacity: 1;
            transform: translateY(0);
        }

    .is-dashboard-glowing {
        animation: complaints-dashboard-rise-glow 320ms ease-out;
    }

    @keyframes complaints-dashboard-rise-glow {
        0% {
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        }

        45% {
            box-shadow: 0 20px 46px rgba(15, 23, 42, 0.28), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 10px color-mix(in srgb, var(--accent-primary) 10%, transparent);
        }

        100% {
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        }
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

    .creator-card--editing {
        border-color: rgba(250, 204, 21, 0.92) !important;
        box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.96), 0 0 0 10px rgba(250, 204, 21, 0.16), 0 30px 60px rgba(217, 119, 6, 0.2) !important;
        animation: builder-form-edit-ring 1.95s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    @keyframes builder-form-edit-ring {
        0% {
            box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.08), 0 0 0 0 rgba(250, 204, 21, 0.08), 0 12px 24px rgba(217, 119, 6, 0.08);
            transform: translateY(0) scale(.995);
        }

        35% {
            box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.96), 0 0 0 14px rgba(250, 204, 21, 0.22), 0 30px 60px rgba(217, 119, 6, 0.24);
            transform: translateY(-2px) scale(1.002);
        }

        100% {
            box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.96), 0 0 0 10px rgba(250, 204, 21, 0.16), 0 30px 60px rgba(217, 119, 6, 0.2);
            transform: translateY(0) scale(1);
        }
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
        position: relative;
        isolation: isolate;
        overflow: hidden;
        min-height: 44px;
        cursor: pointer;
        font-weight: 700;
        background: rgba(15, 23, 42, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 18px rgba(15, 23, 42, 0.08);
        transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease, box-shadow 0.22s ease;
    }

        .intensity-pill::before,
        .intensity-pill::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
        }

        .intensity-pill::before {
            inset: -2px;
            z-index: 2;
            padding: 2.5px;
            background: conic-gradient(from 0deg, rgba(255, 255, 255, 0) 0deg, rgba(255, 255, 255, 0) 220deg, color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 92%, white 8%) 262deg, white 298deg, color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 98%, white 2%) 334deg, rgba(255, 255, 255, 0) 360deg);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            opacity: 0;
            transform: rotate(0deg);
            filter: drop-shadow(0 0 8px color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 58%, transparent)) drop-shadow(0 0 18px color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 28%, transparent));
            transition: opacity 0.2s ease;
        }

        .intensity-pill::after {
            inset: 1px;
            z-index: -1;
            background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 16%, transparent), transparent 68%), linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 46%);
            opacity: 0.55;
        }

        .intensity-pill.is-selected,
        .status-pill.is-active {
            border-color: rgba(249, 115, 22, 0.42);
            background: linear-gradient(180deg, rgba(249, 115, 22, 0.18), rgba(245, 158, 11, 0.08));
        }

        .intensity-pill:hover {
            border-color: color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 58%, rgba(148, 163, 184, 0.3));
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 12px 22px rgba(15, 23, 42, 0.12);
        }

        .intensity-pill:focus-visible {
            outline: none;
            border-color: color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 72%, white 28%);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 18%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 12px 24px rgba(15, 23, 42, 0.14);
        }

        .intensity-pill.is-selected {
            color: #fff7ed;
            border-color: transparent;
            background: radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 34%, white 8%), transparent 52%), linear-gradient(180deg, color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 34%, rgba(15, 23, 42, 0.18)), color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 18%, rgba(15, 23, 42, 0.22)));
            box-shadow: 0 0 0 1px color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 34%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 12%, transparent), 0 18px 34px color-mix(in srgb, var(--intensity-accent, var(--accent-primary)) 20%, rgba(15, 23, 42, 0.18));
        }

            .intensity-pill.is-selected::before {
                opacity: 1;
                animation: intensity-pill-border-run 0.62s linear infinite;
            }

    @keyframes intensity-pill-border-run {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(-360deg);
        }
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

    .builder-edit-action-btn {
        width: auto;
        flex: 1 1 0;
        min-height: 48px;
        padding: 0 1.5rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        border: 1px solid rgba(180, 83, 9, 0.22);
        background: linear-gradient(180deg, rgba(255, 251, 235, 0.96), rgba(255, 244, 214, 0.9));
        color: #9a3412;
        font-size: .95rem;
        font-weight: 900;
        letter-spacing: .02em;
        box-shadow: 0 12px 26px rgba(217, 119, 6, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.92);
        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    }

        .builder-edit-action-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            border-color: rgba(180, 83, 9, 0.34) !important;
            box-shadow: 0 16px 30px rgba(217, 119, 6, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.94) !important;
        }

        .builder-edit-action-btn:focus {
            outline: none;
        }

        .builder-edit-action-btn:focus-visible {
            box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.28), 0 16px 30px rgba(217, 119, 6, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.94) !important;
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
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: flex-start;
        gap: 0.6rem;
    }

    .entry-side {
        margin-left: 0;
        justify-content: flex-end;
        align-items: flex-start;
        align-self: flex-start;
        justify-self: end;
        flex-wrap: nowrap;
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

    .pain-diary-preview {
        margin-top: 0.2rem;
        padding: 0.65rem 0.7rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: rgba(15, 23, 42, 0.08);
        display: grid;
        gap: 0.45rem;
    }

    .pain-diary-preview__title {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: var(--text-secondary);
    }

    .pain-diary-create-card {
        display: grid;
        gap: 0.55rem;
        margin-top: 0.85rem;
        padding: 0.85rem 0.95rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 7%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 5%, transparent), transparent 62%), linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.1)), color-mix(in srgb, var(--bg-card) 90%, transparent);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 18px rgba(15, 23, 42, 0.08);
    }

    .pain-diary-create-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .pain-diary-create-card__sub {
        margin: 0.15rem 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.45;
    }

    html.dark-mode .pain-diary-create-card {
        border-color: rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 10%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 7%, transparent), transparent 60%), linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.01)), rgba(2, 6, 23, 0.28);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 10px 22px rgba(0, 0, 0, 0.18);
    }

    .pain-diary-create-popup__label {
        margin: 0;
        color: var(--text-primary);
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0.01em;
    }

    .pain-diary-create-popup__body {
        display: grid;
        gap: 1rem;
        padding: 0.2rem 0.1rem 0.35rem;
    }

    .pain-diary-create-popup__hero {
        display: grid;
        gap: 0.35rem;
        padding: 0.85rem 0.95rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-secondary) 76%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.22);
    }

    .pain-diary-create-popup__sub {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.93rem;
        line-height: 1.5;
    }

    .pain-diary-create-popup__section {
        display: grid;
        gap: 0.55rem;
        padding: 0.85rem 0.95rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-secondary) 76%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.22);
    }

    .pain-diary-create-popup__note {
        min-height: 88px;
    }

    .pain-diary-preview__list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.45rem;
    }

    .pain-diary-preview__item {
        display: grid;
        gap: 0.18rem;
    }

    .pain-diary-preview__line {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    .pain-diary-preview__scale-row {
        width: 100%;
        display: flex;
        align-items: center;
    }

    .pain-diary-preview__actions {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }

    .pain-diary-preview__action-btn {
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.12);
        color: var(--text-primary);
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.22rem 0.48rem;
        cursor: pointer;
        transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

        .pain-diary-preview__action-btn:hover {
            transform: translateY(-1px);
        }

    .pain-diary-preview__action-btn--danger {
        border-color: rgba(239, 68, 68, 0.28);
        color: #b91c1c;
    }

    .pain-diary-preview__date {
        color: var(--text-primary);
        font-weight: 650;
    }

    .pain-diary-preview__scale {
        position: relative;
        width: min(100%, 380px);
        min-width: 240px;
        height: 24px;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.26);
        background: color-mix(in srgb, var(--bg-card) 84%, #0f172a 16%);
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.35);
    }

    .pain-diary-preview__scale-fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: inherit;
        transition: width 220ms ease, background-color 220ms ease, background 220ms ease;
    }

    .pain-diary-preview__scale-value {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 800;
        color: #f8fafc;
        text-shadow: 0 1px 2px rgba(2, 6, 23, 0.85);
    }

    .pain-diary-preview__source {
        font-weight: 600;
    }

    .pain-diary-preview__note {
        margin: 0;
        font-size: 0.82rem;
        line-height: 1.4;
        color: var(--text-secondary);
        overflow-wrap: anywhere;
    }

    .pain-diary-preview__editor {
        display: grid;
        gap: 0.4rem;
        margin-top: 0.15rem;
        padding-top: 0.45rem;
        border-top: 1px dashed rgba(148, 163, 184, 0.24);
    }

    .pain-diary-preview__editor--create {
        margin-top: 0;
        padding-top: 0.65rem;
    }

    .pain-diary-preview__editor-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.6rem;
        color: var(--text-primary);
    }

    .pain-diary-preview__slider {
        width: 100%;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        margin: 0;
    }

        .pain-diary-preview__slider::-webkit-slider-runnable-track {
            height: 8px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.32);
            background: linear-gradient(90deg, rgba(34, 197, 94, 0.72) 0%, rgba(249, 115, 22, 0.8) 55%, rgba(239, 68, 68, 0.85) 100%);
        }

        .pain-diary-preview__slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            margin-top: -3px;
            border: 2px solid rgba(255, 255, 255, 0.9);
            background: var(--pain-thumb-color, var(--accent-primary));
            box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.24);
        }

        .pain-diary-preview__slider::-moz-range-track {
            height: 8px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.32);
            background: linear-gradient(90deg, rgba(34, 197, 94, 0.72) 0%, rgba(249, 115, 22, 0.8) 55%, rgba(239, 68, 68, 0.85) 100%);
        }

        .pain-diary-preview__slider::-moz-range-thumb {
            width: 13px;
            height: 13px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.9);
            background: var(--pain-thumb-color, var(--accent-primary));
            box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.24);
        }

    .pain-diary-preview__editor-note {
        width: 100%;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.1);
        color: var(--text-primary);
        padding: 0.45rem 0.55rem;
        resize: vertical;
        min-height: 56px;
    }

    .pain-diary-preview__editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.35rem;
        flex-wrap: wrap;
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

    html.dark-mode .creator-card--editing {
        border-color: rgba(251, 191, 36, 0.92) !important;
        box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.92), 0 0 0 10px rgba(251, 191, 36, 0.14), 0 28px 54px rgba(0, 0, 0, 0.34) !important;
    }

    html.dark-mode .delete-trash-flight {
        border-color: rgba(248, 113, 113, 0.28);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
    }

    html.dark-mode .delete-trash-flight__title {
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-bin__lid {
        background: linear-gradient(180deg, #64748b, #334155);
    }

        html.dark-mode .delete-trash-bin__lid::before {
            background: #475569;
        }

    html.dark-mode .delete-trash-bin__body {
        border-color: rgba(148, 163, 184, 0.62);
        background: linear-gradient(180deg, rgba(51, 65, 85, 0.96), rgba(15, 23, 42, 0.94));
    }

        html.dark-mode .delete-trash-bin__body::before {
            box-shadow: 14px 0 0 rgba(148, 163, 184, 0.26), 28px 0 0 rgba(148, 163, 184, 0.26);
            background: rgba(148, 163, 184, 0.26);
        }

    html.dark-mode .plan-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .builder-action-label {
        border-color: rgba(251, 191, 36, 0.54);
        background: radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.16), rgba(251, 191, 36, 0) 55%), linear-gradient(180deg, rgba(120, 53, 15, 0.98), rgba(92, 39, 12, 0.94));
        color: #fde68a;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 244, 214, 0.12), 0 0 22px rgba(250, 204, 21, 0.18), 0 0 0 10px rgba(250, 204, 21, 0.08);
    }

    html.dark-mode .builder-action-label__kicker {
        background: rgba(255, 248, 220, 0.08);
        color: #fde68a;
        box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.18);
    }

    html.dark-mode .builder-action-label__main {
        color: #fde68a;
        text-shadow: 0 2px 0 rgba(120, 53, 15, 0.6), 0 0 22px rgba(250, 204, 21, 0.22);
    }

    html.dark-mode .builder-action-label__sub {
        color: #fde68a;
        opacity: .82;
    }

    html.dark-mode .builder-edit-action-btn {
        border-color: rgba(251, 191, 36, 0.28);
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.94), rgba(92, 39, 12, 0.92));
        color: #fde68a;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
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

    @media (prefers-reduced-motion: reduce) {
        .dashboard-card-shell,
        .dashboard-card-shell.is-dashboard-visible {
            opacity: 1;
            transform: none;
            transition: none;
        }

        .create-flight-card,
        .complaint-item.is-created-highlight {
            animation: none;
        }

        .is-dashboard-glowing {
            animation: none;
        }

        .intensity-pill,
        .intensity-pill.is-selected {
            animation: none;
        }

            .intensity-pill::after,
            .intensity-pill.is-selected::after {
                animation: none;
                opacity: 0;
            }

            .intensity-pill::before,
            .intensity-pill.is-selected::before {
                animation: none;
            }

        .builder-action-label,
        .builder-action-label__spark {
            animation: none;
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
            align-items: center;
            flex-direction: row;
            flex-wrap: nowrap;
            gap: 0.45rem;
        }

        .intensity-meter {
            flex: 1 1 auto;
            width: auto;
            min-width: 0;
            height: 22px;
        }

        .intensity-value {
            font-size: 0.76rem;
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

        .builder-edit-action-btn {
            width: auto;
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

    @media (max-width: 713px) and (min-width: 567px) {
        .entry-meta-line {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, max-content));
            gap: 0.3rem 0.5rem;
        }

            .entry-meta-line span:first-child {
                grid-column: 1 / -1;
            }

            .entry-meta-line span + span::before {
                content: none;
            }
    }

    @media (max-width: 506px) {
        .entry-meta-line span:nth-child(2),
        .entry-meta-line span:nth-child(3) {
            display: none;
        }
    }

    @media (max-width: 420px) {
        .complaints-page {
            padding: 1rem;
        }

        .builder-action-label {
            min-width: min(92vw, 360px);
            padding: .9rem 1rem;
            top: 44%;
        }

        .builder-action-label__kicker {
            font-size: .62rem;
        }

        .builder-action-label__main {
            font-size: 1.18rem;
        }

        .builder-action-label__sub {
            font-size: .74rem;
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
