<!--pages/Settings.vue-->

<template>
    <div class="settings">
        <div class="settings-header">
            <h2 class="page-title">{{ t('settings.pageTitle') }}</h2>
            <p class="page-subtext">{{ t('settings.pageSubtext') }}</p>
        </div>

        <div class="settings-grid">

            <!-- Anzeige -->
            <section class="settings-group">
                <button type="button"
                        class="group-head"
                        @click="toggleGroup('display')"
                        :aria-expanded="openGroups.display">
                    <div class="group-left">
                        <div class="group-icon">🖥️</div>
                        <div class="group-text">
                            <div class="group-title">Anzeige</div>
                            <div class="group-sub">Theme, Einheiten & Look</div>
                        </div>
                    </div>

                    <div class="group-right">
                        <span class="group-chevron" :class="{ open: openGroups.display }"></span>
                    </div>
                </button>

                <Transition name="sg-collapse">

                    <div v-show="openGroups.display" class="group-body">
                        <div class="setting-card">
                            <div class="setting-icon">🌙</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Dark Mode</h3>
                                <p class="setting-description">Aktiviere den dunklen Modus für entspannteres Tracking</p>
                            </div>
                            <div class="setting-control">
                                <input id="darkmode-toggle" type="checkbox" class="toggle-switch" v-model="isDarkDraft" />
                                <label for="darkmode-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ isDarkDraft ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-card">
                            <div class="setting-icon">⬆️</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Scroll-Hoch Button</h3>
                                <p class="setting-description">Scrollt automatisch nach obens</p>
                            </div>
                            <div class="setting-control">
                                <input id="backtop-toggle" type="checkbox" class="toggle-switch" v-model="backToTopEnabled" />
                                <label for="backtop-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ backToTopEnabled ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-card">
                            <div class="setting-icon">📊</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Einheiten</h3>
                                <p class="setting-description">Wähle deine bevorzugten Maßeinheiten</p>
                            </div>
                            <div class="setting-control">
                                <UiSettingsSelect v-model="preferredUnit"
                                                  class="settings-select"
                                                  :options="unitOptions"
                                                  placeholder="Einheit auswählen" />
                            </div>
                        </div>

                        <div class="setting-card setting-card--language">
                            <div class="setting-icon">🌐</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Sprache</h3>
                                <p class="setting-description">Wähle aus, wie Texte in der App später angezeigt werden sollen</p>

                                <div class="language-preview" aria-hidden="true">
                                    <span class="language-preview__pill">{{ selectedLanguageLabelText }}</span>
                                </div>
                            </div>
                            <div class="setting-control setting-control--language">
                                <UiSettingsSelect v-model="selectedLanguage"
                                                  class="settings-select settings-select--language"
                                                  :options="localizedLanguageOptions"
                                                  placeholder="Sprache auswählen" />
                            </div>
                        </div>
                    </div>
                </Transition>

            </section>

            <!-- System -->
            <section class="settings-group">
                <button type="button"
                        class="group-head"
                        @click="toggleGroup('system')"
                        :aria-expanded="openGroups.system">
                    <div class="group-left">
                        <div class="group-icon">🧠</div>
                        <div class="group-text">
                            <div class="group-title">System</div>
                            <div class="group-sub">Automationen & Sicherheit</div>
                        </div>
                    </div>

                    <div class="group-right">
                        <span class="group-chevron" :class="{ open: openGroups.system }"></span>
                    </div>
                </button>
                <Transition name="sg-collapse">

                    <div v-show="openGroups.system" class="group-body">

                        <div class="setting-card">
                            <div class="setting-icon">⏲️</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Sticky Timer</h3>
                                <p class="setting-description">Sticky Timer überhaupt erlauben (ein-/ausblenden)</p>
                            </div>
                            <div class="setting-control">
                                <input id="sticky-timer-toggle"
                                       type="checkbox"
                                       class="toggle-switch"
                                       v-model="stickyTimerEnabled" />
                                <label for="sticky-timer-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ stickyTimerEnabled ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-card">
                            <div class="setting-icon">⏱️</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Sticky Stoppuhr</h3>
                                <p class="setting-description">Sticky Stoppuhren überhaupt erlauben (ein-/ausblenden)</p>
                            </div>
                            <div class="setting-control">
                                <input id="sticky-stopwatch-toggle"
                                       type="checkbox"
                                       class="toggle-switch"
                                       v-model="stickyStopwatchEnabled" />
                                <label for="sticky-stopwatch-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ stickyStopwatchEnabled ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-card">
                            <div class="setting-icon">⚡️</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Auto-Berechnung</h3>
                                <p class="setting-description">Rechner automatisch berechnen (Berechnen-Button ausblenden)</p>
                            </div>
                            <div class="setting-control">
                                <input id="autocalc-toggle" type="checkbox" class="toggle-switch" v-model="autoCalcEnabled" />
                                <label for="autocalc-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ autoCalcEnabled ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-card">
                            <div class="setting-icon">🗑️</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Löschen bestätigen</h3>
                                <p class="setting-description">Beim Löschen immer nachfragen (Schutz vor Fehlklicks)</p>
                            </div>
                            <div class="setting-control">
                                <input id="confirm-delete-toggle"
                                       type="checkbox"
                                       class="toggle-switch"
                                       v-model="confirmDeleteEnabled" />
                                <label for="confirm-delete-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ confirmDeleteEnabled ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </Transition>

            </section>

            <!-- Toasts -->
            <section class="settings-group">
                <button type="button"
                        class="group-head"
                        @click="toggleGroup('toast')"
                        :aria-expanded="openGroups.toast">
                    <div class="group-left">
                        <div class="group-icon">🔔</div>
                        <div class="group-text">
                            <div class="group-title">Toasts</div>
                            <div class="group-sub">{{ t('settings.group.toast.sub') }}</div>
                        </div>
                    </div>

                    <div class="group-right">
                        <span class="group-chevron" :class="{ open: openGroups.toast }"></span>
                    </div>
                </button>
                <Transition name="sg-collapse">

                    <div v-show="openGroups.toast" class="group-body">
                        <div class="setting-card">
                            <div class="setting-icon">🔔</div>
                            <div class="setting-content">
                                <div class="setting-title-row">
                                    <h3 class="setting-title">{{ t('settings.toasts.title') }}</h3>

                                    <button type="button"
                                            class="tm-preview"
                                            :aria-label="t('settings.toasts.preview')"
                                            :title="t('settings.toasts.preview')"
                                            @click="previewToastSettingsDemo">
                                        👁️
                                    </button>
                                </div>

                                <p class="setting-description">{{ t('settings.toasts.description') }}</p>
                            </div>

                            <div class="setting-control">
                                <input id="toasts-toggle" type="checkbox" class="toggle-switch" v-model="toastsEnabled" />
                                <label for="toasts-toggle" class="toggle-label">
                                    <span class="toggle-text">{{ toastsEnabled ? 'AN' : 'AUS' }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="setting-card" v-if="toastsEnabled">
                            <div class="setting-icon">⏳</div>
                            <div class="setting-content">
                                <h3 class="setting-title">{{ t('settings.toasts.duration.title') }}</h3>
                                <p class="setting-description">{{ t('settings.toasts.duration.description') }}</p>
                            </div>
                            <div class="setting-control">
                                <UiSettingsSelect v-model="toastDurationMs"
                                                  class="settings-select"
                                                  :options="toastDurationOptions"
                                                  :placeholder="t('settings.toasts.duration.placeholder')" />
                            </div>
                        </div>

                        <div class="setting-card" v-if="toastsEnabled">
                            <div class="setting-icon">🧩</div>
                            <div class="setting-content">
                                <h3 class="setting-title">{{ t('settings.toasts.types.title') }}</h3>
                                <p class="setting-description">{{ t('settings.toasts.types.description') }}</p>
                            </div>

                            <div class="setting-control toast-types-control">
                                <div class="toast-types-summary">
                                    <button type="button" class="manage-btn" @click="openToastTypeManager">
                                        {{ t('settings.toasts.types.manage') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

            </section>

        </div>

        <div class="settings-footer">
            <div ref="saveBtnWrap" class="save-wrap">
                <SettingsSaveButton :key="selectedLanguage"
                                    :disabled="false"
                                    :label="saveButtonLabel"
                                    :title="t('settings.saveTitle')"
                                    @click="saveSettings" />
            </div>
        </div>

        <ReminderPopup :show="showSaveHint"
                       :x="saveHintX"
                       :y="saveHintY"
                       emoji="ℹ️"
                       :text="t('settings.saveReminder')" />

        <!-- Toast-Arten verwalten (Modal) -->
        <ToastTypeManagerPopup :show="showToastTypeManager"
                               :options="localizedToastTypeOptions"
                               :enabledMap="toastTypeEnabled"
                               @close="onToastTypeManagerClose"
                               @done="onToastTypeManagerDone"
                               @set-all="setAllToastTypes"
                               @toggle="toggleToastType"
                               @preview="previewToastType" />

        <Toast v-if="toast"
               :toast="toast"
               :dismissible="true"
               :autoDismiss="true"
               :position="toastPosition"
               @dismiss="onToastDismiss" />
    </div>
</template>


<script setup lang="ts">
    import { computed, ref, reactive, onMounted, watch, onBeforeUnmount, onActivated } from 'vue'
    import { useI18n } from '@/composables/useI18n'
    import { isDark, initTheme, previewTheme } from '@/composables/useTheme'
    import { onBeforeRouteLeave } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import type { SettingsDto } from '@/services/settings'
    import { useSettingsStore } from '@/store/settingsStore'

    import Toast from '@/components/ui/Toast.vue'
    import SettingsSaveButton from '@/components/ui/buttons/SettingsSaveButton.vue'
    import ToastTypeManagerPopup from '@/components/ui/popups/ToastTypeManagerPopup.vue'
    import ReminderPopup from '@/components/ui/popups/ReminderPopup.vue'
    import UiSettingsSelect from '@/components/ui/kits/selects/UiSettingsSelect.vue'

    // Typen passend zu deiner Toast.vue
    type ToastType =
        | 'toast-default'
        | 'toast-save'
        | 'toast-add'
        | 'toast-delete'
        | 'toast-timer'
        | 'toast-reset'

    interface ToastModel {
        id: number
        message: string
        emoji: string
        type: ToastType
        exiting: boolean
        durationMs?: number
    }

    type SettingsGroupKey = 'display' | 'system' | 'toast'

    const auth = useAuthStore()
    const { locale, setLocale, t } = useI18n()

    const openGroups = reactive<Record<SettingsGroupKey, boolean>>({
        display: false,
        system: false,
        toast: false
    })

    const SETTINGS_GROUPS_COLLAPSE_FLAG = 'settings:collapse-groups-on-enter'

    function toggleGroup(key: SettingsGroupKey) {
        openGroups[key] = !openGroups[key]
    }

    function collapseAllGroups() {
        ; (Object.keys(openGroups) as SettingsGroupKey[]).forEach((k) => {
            openGroups[k] = false
        })
        showToastTypeManager.value = false
    }

    onActivated(() => {
        // Falls Settings via <KeepAlive> gecached ist: beim Re-Enter IMMER zu
        collapseAllGroups()
    })
    function onToastDismiss(id: number) {
        if (toast.value?.id === id) {
            toast.value = null
        }
    }
    const preferredUnit = ref<'kg' | 'lbs'>('kg')
    const autoCalcEnabled = ref(false)
    const allowedUnits = ['kg', 'lbs'] as const
    const unitOptions = computed(() => [
        { label: t('settings.units.kg'), value: 'kg' },
        { label: t('settings.units.lbs'), value: 'lbs' },
    ])
    const selectedLanguage = ref<'de' | 'en'>(locale.value)
    const languageOptions = computed(() => [
        { label: t('settings.language.de'), value: 'de' },
        { label: t('settings.language.en'), value: 'en' },
        { label: 'Türkçe', value: 'tr' },
        { label: 'Français', value: 'fr' },
    ])
    const languageLabelByValue = {
        de: 'Deutsch',
        en: 'English',
        tr: 'Türkçe',
        fr: 'Français',
    } as const
    const selectedLanguageLabel = ref(languageLabelByValue[selectedLanguage.value])
    const localizedLanguageOptions = computed(() => [
        { label: t('settings.language.de'), value: 'de' },
        { label: t('settings.language.en'), value: 'en' },
    ])
    const saveButtonLabel = computed(() => t('settings.save'))
    const selectedLanguageLabelText = computed(() => {
        if (selectedLanguage.value === 'en') return t('settings.language.en')
        return t('settings.language.de')
    })

    function previewToastType(key: string) {
        const k = key as ToastType

        const msgByType: Record<ToastType, string> = {
            'toast-default': 'Plan geladen',
            'toast-save': 'Einstellungen gespeichert! 🎉',
            'toast-add': 'Timer hinzugefügt',
            'toast-delete': 'Timer gelöscht',
            'toast-timer': 'Timername aktualisiert!',
            'toast-reset': 'Gewichtsverlauf zurückgesetzt'
        }

        const opt = localizedToastTypeOptions.value.find(o => o.key === k)

        toast.value = {
            id: Date.now(),
            message: msgByType[k],
            emoji: opt?.emoji ?? '??',
            type: k,
            exiting: false,
            durationMs: toastDurationMs.value
        }
    }

    // Globale Toast-Einstellung
    const toastsEnabled = ref(false)

    const toastDurationMs = ref<number>(2500)
    const toastDurationOptions = [
        { label: '1.5s', value: 1500 },
        { label: '2.5s', value: 2500 },
        { label: '4s', value: 4000 },
        { label: '6s', value: 6000 },
        { label: '9s', value: 9000 },
        { label: '12s', value: 12000 },
    ] as const

    // Zentraler Toast-State f�r diese Seite
    const toast = ref<ToastModel | null>(null)
    const toastPosition = ref<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')

    // Draft-State f�r das UI
    const isDarkDraft = ref(true)
    const persistedTheme = ref<'dark' | 'light'>('dark')
    const persistedLanguage = ref<'de' | 'en'>(locale.value)
    const saved = ref(false)

    const confirmDeleteEnabled = ref(true)
    const backToTopEnabled = ref(false)
    const stickyTimerEnabled = ref(true)
    const stickyStopwatchEnabled = ref(true)

    const onToastsEnabledChanged = (e: CustomEvent<boolean>) => {
        toastsEnabled.value = !!e.detail
    }
    const onConfirmDeleteEnabledChanged = (e: CustomEvent<boolean>) => {
        confirmDeleteEnabled.value = !!e.detail
    }
    const toastTypeOptions = [
        { key: 'toast-default', label: 'Standard', emoji: '💬', hint: 'Allgemeine Infos & Hinweise' },
        { key: 'toast-save', label: 'Speichern', emoji: '💾', hint: 'Wenn etwas gespeichert wurde' },
        { key: 'toast-add', label: 'Hinzufügen', emoji: '➕', hint: 'Wenn du etwas erstellst/hinzufügst' },
        { key: 'toast-delete', label: 'Löschen', emoji: '🗑️', hint: 'Wenn du etwas entfernst/löschst' },
        { key: 'toast-timer', label: 'Timer', emoji: '⏱️', hint: 'Timer/Rest-Pausen Meldungen' },
        { key: 'toast-reset', label: 'Reset', emoji: '🔁', hint: 'Wenn etwas zurückgesetzt wird' }
    ] as const satisfies ReadonlyArray<{ key: ToastType; label: string; emoji: string; hint: string }>

    const localizedToastTypeOptions = computed(() => [
        { key: 'toast-default', label: t('settings.toastType.default'), emoji: '💬', hint: t('settings.toastType.defaultHint') },
        { key: 'toast-save', label: t('settings.toastType.save'), emoji: '💾', hint: t('settings.toastType.saveHint') },
        { key: 'toast-add', label: t('settings.toastType.add'), emoji: '➕', hint: t('settings.toastType.addHint') },
        { key: 'toast-delete', label: t('settings.toastType.delete'), emoji: '🗑️', hint: t('settings.toastType.deleteHint') },
        { key: 'toast-timer', label: t('settings.toastType.timer'), emoji: '⏱️', hint: t('settings.toastType.timerHint') },
        { key: 'toast-reset', label: t('settings.toastType.reset'), emoji: '🔁', hint: t('settings.toastType.resetHint') }
    ] as const satisfies ReadonlyArray<{ key: ToastType; label: string; emoji: string; hint: string }>)

    const showToastTypeManager = ref(false)

    const saveBtnWrap = ref<HTMLElement | null>(null)
    const showSaveHint = ref(false)
    const saveHintX = ref(0)
    const saveHintY = ref(0)

    let toastTypesSnapshot = ''
    let saveHintTimer: number | null = null

    function openToastTypeManager() {
        // Snapshot, um sp�ter echte �nderungen zu erkennen
        toastTypesSnapshot = JSON.stringify({ ...toastTypeEnabled })
        showToastTypeManager.value = true
    }

    function previewToastSettingsDemo() {
        toast.value = {
            id: Date.now(),
            message: toastsEnabled.value ? 'Beispiel: Toast ist aktiv ✅' : 'Beispiel: Toast ist AUS (nur Vorschau) 👀',
            emoji: '🧠',
            type: 'toast-default',
            exiting: false,
            durationMs: toastDurationMs.value
        }
    }
    function maybeShowSaveHintEvery5() {
        // Position �ber dem Save-Button setzen
        const el = saveBtnWrap.value
        if (!el) return

        const r = el.getBoundingClientRect()
        saveHintX.value = r.left + r.width / 2
        saveHintY.value = r.top - 10

        showSaveHint.value = true

        if (saveHintTimer) window.clearTimeout(saveHintTimer)
        saveHintTimer = window.setTimeout(() => {
            showSaveHint.value = false
            saveHintTimer = null
        }, 3500)
    }

    function onToastTypeManagerClose() {
        // Abbruch / X / Overlay -> kein Reminder, Snapshot verwerfen
        showToastTypeManager.value = false
        toastTypesSnapshot = ''
    }

    function applySettingsDto(s: SettingsDto) {
        // Theme
        const theme = (s.theme || 'light') === 'dark' ? 'dark' : 'light'
        persistedTheme.value = theme
        isDarkDraft.value = theme === 'dark'
        previewTheme(theme)

        persistedLanguage.value = locale.value
        selectedLanguage.value = persistedLanguage.value

        // Units
        const unit = (s.preferredUnit || 'kg').toLowerCase() as 'kg' | 'lbs'
        preferredUnit.value = (allowedUnits as readonly string[]).includes(unit) ? unit : 'kg'

        // System
        autoCalcEnabled.value = !!s.autoCalcEnabled
        confirmDeleteEnabled.value = !!s.confirmDeleteEnabled
        backToTopEnabled.value = !!s.backToTopEnabled
        stickyTimerEnabled.value = !!s.stickyTimerEnabled
        stickyStopwatchEnabled.value = !!s.stickyStopwatchEnabled

        // Toasts
        toastsEnabled.value = s.toastsEnabled ?? true
        toastDurationMs.value = Number.isFinite(s.toastDurationMs) && s.toastDurationMs > 0 ? s.toastDurationMs : 2500

        // ToastTypes JSON
        try {
            const parsed = JSON.parse(s.toastTypeEnabledJson || '{}') as Partial<Record<ToastType, unknown>>
                ; (Object.keys(toastTypeEnabled) as ToastType[]).forEach((k) => {
                    if (typeof parsed?.[k] === 'boolean') toastTypeEnabled[k] = parsed[k] as boolean
                })
        } catch {
            // ignore: defaults bleiben
        }
    }

    function onToastTypeManagerDone() {
        // Fertig -> hier Reminder-Logik
        showToastTypeManager.value = false

        const now = JSON.stringify({ ...toastTypeEnabled })
        const changed = toastTypesSnapshot && now !== toastTypesSnapshot
        toastTypesSnapshot = ''

        if (!changed) return

        const key = 'settings:toast-types-reminder-count'
        const raw = Number(sessionStorage.getItem(key) || '0')
        const next = Number.isFinite(raw) ? raw + 1 : 1
        sessionStorage.setItem(key, String(next))

        const REMINDER_STEPS = [1, 2, 3, 5, 8, 13]

        if (REMINDER_STEPS.includes(next)) {
            maybeShowSaveHintEvery5()
        }
    }


    function setAllToastTypes(v: boolean) {
        ; (Object.keys(toastTypeEnabled) as ToastType[]).forEach(k => (toastTypeEnabled[k] = v))
    }

    function toggleToastType(key: string) {
        const k = key as ToastType
        toastTypeEnabled[k] = !toastTypeEnabled[k]
    }
    const toastTypeEnabled = reactive<Record<ToastType, boolean>>({
        'toast-default': true,
        'toast-save': true,
        'toast-add': true,
        'toast-delete': true,
        'toast-timer': true,
        'toast-reset': true
    })

    const onToastTypesChanged = (e: CustomEvent<Partial<Record<ToastType, boolean>>>) => {
        const map = e.detail || {}
            ; (Object.keys(toastTypeEnabled) as ToastType[]).forEach((k) => {
                if (typeof map[k] === 'boolean') toastTypeEnabled[k] = map[k] as boolean
            })
    }

    onBeforeUnmount(() => {
        collapseAllGroups()

        window.removeEventListener('toasts-enabled-changed', onToastsEnabledChanged as EventListener)
        window.removeEventListener('toast-types-changed', onToastTypesChanged as EventListener)
        window.removeEventListener('confirm-delete-changed', onConfirmDeleteEnabledChanged as EventListener)

        if (saveHintTimer) {
            window.clearTimeout(saveHintTimer)
            saveHintTimer = null
        }
    })
    onMounted(async () => {
        initTheme()
        saved.value = false

        window.addEventListener('toasts-enabled-changed', onToastsEnabledChanged as EventListener)
        window.addEventListener('confirm-delete-changed', onConfirmDeleteEnabledChanged as EventListener)
        window.addEventListener('toast-types-changed', onToastTypesChanged as EventListener)

        const settings = useSettingsStore()

        if (auth.user) {
            try {
                await settings.loadFromBackend()
                applySettingsDto(settings.dto)
            } catch {
                // wenn backend failt: defaults (aber nix local speichern)
                settings.resetToDefaults()
                applySettingsDto(settings.dto)
            }
        } else {
            settings.resetToDefaults()
            applySettingsDto(settings.dto)
        }

        if (sessionStorage.getItem(SETTINGS_GROUPS_COLLAPSE_FLAG) === '1') {
            collapseAllGroups()
            sessionStorage.removeItem(SETTINGS_GROUPS_COLLAPSE_FLAG)
        }
        collapseAllGroups()
    })

    onBeforeRouteLeave((_to, _from, next) => {
        // Flag setzen, damit beim n�chsten Mount alles zu ist (falls Komponente neu gemountet wird)
        sessionStorage.setItem(SETTINGS_GROUPS_COLLAPSE_FLAG, '1')

        // current view auch direkt zuklappen (f�r KeepAlive / sauberen State)
        collapseAllGroups()

        if (!saved.value) {
            previewTheme(persistedTheme.value)
            setLocale(persistedLanguage.value)
        }
        next()
    })


    watch(isDarkDraft, (v) => {
        previewTheme(v ? 'dark' : 'light')
    })

    watch(selectedLanguage, (value) => {
        saved.value = false
        selectedLanguageLabel.value = languageLabelByValue[value]
        setLocale(value)
    })

    const startToastExit = () => {
        if (!toast.value) return
        toast.value.exiting = true
        // Exit ist in Toast.vue per Inline-Style bereits auf 0ms gesetzt ? sofort entfernen
        setTimeout(() => { toast.value = null }, 0)
    }

    async function saveSettings() {
        const theme: 'dark' | 'light' = isDarkDraft.value ? 'dark' : 'light'

        // Guest
        if (!auth.user) {
            if (toastsEnabled.value) {
                toast.value = {
                    id: Date.now(),
                    message: 'Nur mit Account werden Einstellungen gespeichert 👀',
                    emoji: '🔒',
                    type: 'toast-default',
                    exiting: false,
                    durationMs: toastDurationMs.value
                }
            }
            return
        }

        // Persistenz
        saved.value = true
        persistedTheme.value = theme
        persistedLanguage.value = selectedLanguage.value
        previewTheme(theme)

        const settings = useSettingsStore()

        const nextToastTypesJson = JSON.stringify({ ...toastTypeEnabled })

        settings.dto = {
            theme,
            preferredUnit: preferredUnit.value,
            autoCalcEnabled: autoCalcEnabled.value,
            confirmDeleteEnabled: confirmDeleteEnabled.value,
            backToTopEnabled: backToTopEnabled.value,
            stickyTimerEnabled: stickyTimerEnabled.value,
            stickyStopwatchEnabled: stickyStopwatchEnabled.value,
            toastsEnabled: toastsEnabled.value,
            toastDurationMs: toastDurationMs.value,
            toastTypeEnabledJson: nextToastTypesJson
        }

        try {
            await settings.saveToBackend()
            setLocale(persistedLanguage.value)

            // ? Verifizieren: direkt nochmal laden
            await settings.loadFromBackend()

            const persistedToastTypesJson = settings.dto.toastTypeEnabledJson ?? "{}"
            const ok = persistedToastTypesJson === nextToastTypesJson

            // UI-Draft sauber aus Backend-Truth setzen
            applySettingsDto(settings.dto)

            // deine bisherigen Events (kannst du sp�ter reduzieren, aber lassen wir)
            window.dispatchEvent(new CustomEvent('preferred-unit-changed', { detail: preferredUnit.value }))
            window.dispatchEvent(new CustomEvent('toasts-enabled-changed', { detail: toastsEnabled.value }))
            window.dispatchEvent(new CustomEvent('toast-duration-changed', { detail: toastDurationMs.value }))
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: confirmDeleteEnabled.value }))
            window.dispatchEvent(new CustomEvent('back-to-top-enabled-changed', { detail: backToTopEnabled.value }))
            window.dispatchEvent(new CustomEvent('sticky-timer-enabled-changed', { detail: stickyTimerEnabled.value }))
            window.dispatchEvent(new CustomEvent('sticky-stopwatch-enabled-changed', { detail: stickyStopwatchEnabled.value }))
            window.dispatchEvent(new Event('tyg:sticky-prefs-changed'))

            if (toastsEnabled.value) {
                toast.value = ok
                    ? {
                        id: Date.now(),
                        message: 'Einstellungen gespeichert! ✅',
                        emoji: '💾',
                        type: 'toast-save',
                        exiting: false,
                        durationMs: toastDurationMs.value
                    }
                    : {
                        id: Date.now(),
                        message: 'Toast-Arten wurden NICHT übernommen (Backend/DB).',
                        emoji: '⚠️',
                        type: 'toast-default',
                        exiting: false,
                        durationMs: toastDurationMs.value
                    }
            }
        } catch {
            if (toastsEnabled.value) {
                toast.value = {
                    id: Date.now(),
                    message: 'Speichern fehlgeschlagen (Netzwerk/Backend).',
                    emoji: '⚠️',
                    type: 'toast-default',
                    exiting: false,
                    durationMs: toastDurationMs.value
                }
            }
        }
    }
</script>
<style scoped>
    .settings {
        max-width: 800px;
        margin: 0 auto;
        padding: clamp(1.4rem, 3vw, 2.4rem) clamp(0.9rem, 4vw, 1.6rem);
        background: transparent;
    }

    html.dark-mode .settings {
        background: transparent;
    }

    .settings-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .page-title {
        font-size: clamp(2.5rem, 5vw, 3rem);
        font-weight: 900;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
    }

    html.dark-mode .page-title {
        color: #ffffff !important; /* Wei� f�r Lesbarkeit */
        background: none !important; /* Entfernt Gradient */
        -webkit-background-clip: initial !important; /* Deaktiviert Clip */
        -webkit-text-fill-color: initial !important; /* Deaktiviert transparent */
    }

    .page-subtext {
        color: var(--text-secondary);
        font-size: 1.2rem;
        margin: 0;
    }

    html.dark-mode .page-subtext {
        color: #c9d1d9;
    }

    .settings-grid {
        display: grid;
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    /* Settings-Cards im gleichen Premium-Look wie Tutorial-/Plan-Karten */
    .setting-card {
        position: relative;
        z-index: 1;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 18px;
        padding: 1.6rem 1.8rem;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1.5rem;
        align-items: center;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: background 180ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, transform 160ms ease-out;
        overflow: hidden;
        box-sizing: border-box;
        max-width: 100%;
    }

        /* Glow-Overlay statt nur Top-Strich */
        .setting-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.18), transparent 60%);
            opacity: 0;
            pointer-events: none;
            transition: opacity 160ms ease-out;
        }

        .setting-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.7);
        }

            .setting-card:hover::before {
                opacity: 1;
            }

    /* Dark-Mode � gleiche Welt wie plan-card / tutorial-card */
    html.dark-mode .setting-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .setting-icon {
        font-size: 2rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 16px;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
        color: var(--text-primary);
    }

    html.dark-mode .setting-icon {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        color: #ffffff;
    }

    .setting-content {
        text-align: left;
    }

    .setting-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.5rem 0;
    }

    html.dark-mode .setting-title {
        color: #ffffff;
    }

    .setting-description {
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0;
        line-height: 1.5;
    }

    html.dark-mode .setting-description {
        color: #c9d1d9;
    }

    .setting-control {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
    }

    /* Toast-Arten: Pills/Chips statt h�sslicher Switch-Liste */
    .toast-types-control {
        align-items: stretch;
    }



    .toggle-switch {
        width: 70px;
        height: 36px;
        appearance: none;
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 50px;
        position: relative;
        cursor: pointer;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 160ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, background 180ms ease-out;
        overflow: hidden;
    }

    html.dark-mode .toggle-switch {
        background: #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .toggle-switch:checked {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-color: rgba(129, 140, 248, 0.7);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
    }

    html.dark-mode .toggle-switch:checked {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        border-color: rgba(129, 140, 248, 0.7);
    }

    .toggle-switch:hover {
        transform: translateY(-2px);
        border-color: rgba(129, 140, 248, 0.7);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
    }

    .toggle-switch:focus-visible {
        outline: none;
        border-color: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.18), 0 22px 48px rgba(15, 23, 42, 0.32);
    }

    .toggle-switch::before {
        content: '';
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(226, 232, 240, 0.92));
        top: 2px;
        left: 2px;
        transition: all 0.3s ease;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.24);
    }

    html.dark-mode .toggle-switch::before {
        background: linear-gradient(180deg, #1e293b, #0f172a);
    }

    .toggle-switch:checked::before {
        transform: translateX(34px);
    }

    .toggle-label {
        display: inline-flex;
        align-items: center;
        line-height: 1; /* verhindert H�hen-Jump */
    }

    .toggle-text {
        display: inline-block;
        width: 3.2ch; /* genug f�r "AUS" */
        text-align: left; /* bleibt an der gleichen Stelle wie vorher */
        text-transform: uppercase;
        letter-spacing: 1px;
        white-space: nowrap; /* kein Umbruch */
    }

    html.dark-mode .toggle-text {
        color: #c9d1d9;
    }

    .settings-select {
        width: 100%;
        min-width: 0;
        max-width: 360px;
    }

    .setting-card--language {
        align-items: stretch;
    }

    .setting-control--language {
        min-width: min(100%, 320px);
        justify-content: flex-end;
    }

    .settings-select--language {
        max-width: 320px;
    }

    .language-preview {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 1rem;
    }

    .language-preview__pill {
        display: inline-flex;
        align-items: center;
        min-height: 2rem;
        padding: 0.38rem 0.8rem;
        border-radius: 999px;
        border: 1px solid rgba(129, 140, 248, 0.28);
        background: linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 14%, white), color-mix(in srgb, var(--accent-secondary) 12%, white));
        color: var(--text-primary);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
    }

    html.dark-mode .language-preview__pill {
        border-color: rgba(129, 140, 248, 0.4);
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(34, 197, 94, 0.18));
        color: #ffffff;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3);
    }

    .settings-footer {
        text-align: center;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
    }

    html.dark-mode .settings-footer {
        border-color: #30363d;
    }


    @keyframes slideIn {
        from {
            transform: translateY(100px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateY(0);
            opacity: 1;
        }

        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }

    .setting-title-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }


    .toast-types-summary {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
    }

    .toast-types-meta {
        margin: 0;
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 0.95rem;
    }

    .manage-btn {
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        border-radius: 18px;
        padding: 0.65rem 0.9rem;
        font-weight: 800;
        cursor: pointer;
        transition: transform 160ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, background 180ms ease-out;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
    }

        .manage-btn:hover {
            transform: translateY(-2px);
            border-color: rgba(129, 140, 248, 0.7);
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
        }

    html.dark-mode .manage-btn {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        color: #ffffff;
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .modal-card {
        background: #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 34px 90px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .modal-title strong {
        color: #ffffff;
    }

    html.dark-mode .modal-sub {
        color: #c9d1d9;
    }


    @media (max-width: 768px) {
        .toast-types-summary {
            width: min(420px, 100%);
        }
    }

    .settings-group {
        display: grid;
        gap: 1rem; /* Abstand zwischen Header-Card und Body */
    }

    .group-head {
        width: 100%;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 18px;
        padding: 1.15rem 1.2rem;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 60%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        transition: transform 160ms ease-out, box-shadow 200ms ease-out, border-color 180ms ease-out;
        box-sizing: border-box;
        max-width: 100%;
    }

        .group-head:hover {
            transform: translateY(-2px);
            border-color: rgba(129, 140, 248, 0.7);
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.28);
        }

        .group-head:focus-visible {
            outline: none;
            border-color: rgba(129, 140, 248, 0.85);
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.18), 0 22px 48px rgba(15, 23, 42, 0.28);
        }


    html.dark-mode .group-head {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 60%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.55);
    }


    .group-left {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        min-width: 0;
    }

    .group-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        color: var(--text-primary);
        font-size: 1.15rem;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
    }

    html.dark-mode .group-icon {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        color: #ffffff;
    }

    .group-text {
        min-width: 0;
        text-align: left;
    }

    .group-title {
        font-weight: 950;
        color: var(--text-primary);
        font-size: 1.05rem;
        line-height: 1.2;
    }

    .group-sub {
        margin-top: 0.18rem;
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 0.92rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    html.dark-mode .group-title {
        color: #fff;
    }

    html.dark-mode .group-sub {
        color: #c9d1d9;
    }

    .group-right {
        display: flex;
        align-items: center;
    }

    .group-chevron {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        opacity: 0.9;
        color: var(--text-primary);
        transition: transform 180ms ease, opacity 160ms ease;
    }

        .group-chevron::before {
            content: '';
            width: 9px;
            height: 9px;
            border-right: 2px solid currentColor;
            border-bottom: 2px solid currentColor;
            transform: rotate(45deg); /* runter */
            transition: transform 180ms ease;
        }

        .group-chevron.open::before {
            transform: rotate(225deg); /* hoch */
        }

    .group-head:hover .group-chevron {
        opacity: 1;
        transform: scale(1.05);
    }

    html.dark-mode .group-chevron {
        color: #fff;
    }

    .group-body {
        padding: 0;
        display: grid;
        gap: 1.25rem;
    }


    /* Collapse Animation f�r Settings-Gruppen (SMOOTH & HEAVY) */
    .sg-collapse-enter-active,
    .sg-collapse-leave-active {
        overflow: hidden;
        transform-origin: top;
        position: relative;
        isolation: isolate;
        border-radius: 18px;
        /* Performance: kein blur/clip-path */
        will-change: max-height, opacity, transform;
        contain: layout paint;
        backface-visibility: hidden;
        transform: translateZ(0);
    }

    /* Smooth open/close (Transitions statt Keyframes) */
    .sg-collapse-enter-active {
        transition: max-height 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out, transform 460ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sg-collapse-leave-active {
        transition: max-height 340ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease-in, transform 340ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* States */
    .sg-collapse-enter-from,
    .sg-collapse-leave-to {
        max-height: 0;
        opacity: 0;
        transform: translateY(-10px) scale(0.99);
    }

    .sg-collapse-enter-to,
    .sg-collapse-leave-from {
        max-height: 2400px;
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    /* 1:1 aus ToastTypeManagerPopup.vue (Preview-Auge) */
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

    .setting-title-row {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    /* Glow (ohne blur) */
    .sg-collapse-enter-active::before,
    .sg-collapse-leave-active::before {
        content: '';
        position: absolute;
        inset: -40px;
        z-index: -1;
        background: radial-gradient(circle at 18% 0%, rgba(129, 140, 248, 0.28), transparent 58%), radial-gradient(circle at 82% 0%, rgba(34, 197, 94, 0.14), transparent 62%);
        opacity: 0;
        transform: scale(0.985);
        transition: opacity 260ms ease-out, transform 460ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sg-collapse-enter-to::before {
        opacity: 1;
        transform: scale(1);
    }

    .sg-collapse-leave-to::before {
        opacity: 0;
        transform: scale(0.985);
    }

    /* Cards: stagger rein, clean raus (ohne blur) */
    .sg-collapse-enter-active .setting-card {
        will-change: transform, opacity;
        opacity: 0;
        transform: translateY(-10px) scale(0.992);
        transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out;
    }

    .sg-collapse-enter-to .setting-card {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    /* Stagger nur beim reinfahren */
    .sg-collapse-enter-active .setting-card:nth-child(1) {
        transition-delay: 40ms;
    }

    .sg-collapse-enter-active .setting-card:nth-child(2) {
        transition-delay: 85ms;
    }

    .sg-collapse-enter-active .setting-card:nth-child(3) {
        transition-delay: 130ms;
    }

    .sg-collapse-enter-active .setting-card:nth-child(4) {
        transition-delay: 175ms;
    }

    .sg-collapse-enter-active .setting-card:nth-child(5) {
        transition-delay: 220ms;
    }

    .sg-collapse-enter-active .setting-card:nth-child(6) {
        transition-delay: 265ms;
    }

    /* rausfahren: snap, aber smooth */
    .sg-collapse-leave-active .setting-card {
        transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease-in;
    }

    .sg-collapse-leave-to .setting-card {
        opacity: 0;
        transform: translateY(-8px) scale(0.99);
    }

    /* Motion-safety */
    @media (prefers-reduced-motion: reduce) {
        .sg-collapse-enter-active,
        .sg-collapse-leave-active {
            transition: none;
            transform: none;
        }

            .sg-collapse-enter-active::before,
            .sg-collapse-leave-active::before {
                transition: none;
                opacity: 1;
                transform: none;
            }

            .sg-collapse-enter-active .setting-card,
            .sg-collapse-leave-active .setting-card {
                transition: none;
                opacity: 1;
                transform: none;
            }
    }

    .save-wrap {
        display: inline-block;
        position: relative;
    }

    /* ? Settings Cards: clean mobile layout ab 640px */
    @media (max-width: 640px) {
        .setting-card {
            /* statt �alles in einer Zeile�: 2 Zeilen, klar getrennt */
            grid-template-columns: 56px 1fr;
            grid-template-areas:
                "icon content"
                "control control";
            align-items: start;
            gap: 0.85rem 0.95rem;
            padding: 1.15rem 1.1rem;
            border-radius: 16px;
        }

        .setting-icon {
            grid-area: icon;
            width: 48px;
            height: 48px;
            border-radius: 14px;
            font-size: 1.5rem;
            margin-top: 0.1rem; /* optisch besser aligned */
        }

        .setting-content {
            grid-area: content;
            min-width: 0;
        }

        .setting-title {
            font-size: 1.12rem;
            margin: 0 0 0.25rem 0;
            line-height: 1.15;
        }

        .setting-description {
            font-size: 0.95rem;
            line-height: 1.4;
            margin: 0;
        }

        /* Control-Zeile: �eigener Bereich� -> sieht sofort aufger�umt aus */
        .setting-control {
            grid-area: control;
            width: 100%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0.75rem;
            margin-top: 0.25rem;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(148, 163, 184, 0.22);
        }

        html.dark-mode .setting-control {
            border-top-color: rgba(148, 163, 184, 0.22);
        }

        /* Selects werden auf Mobile fast immer nicer als full width */
        .settings-select {
            width: 100%;
            min-width: 0;
            max-width: 360px; /* nicht zu riesig auf phablets */
        }

        /* Toggle minimal kleiner und �tight� */
        .toggle-switch {
            width: 64px;
            height: 34px;
        }

            .toggle-switch::before {
                width: 30px;
                height: 30px;
            }

            .toggle-switch:checked::before {
                transform: translateX(30px);
            }

        /* Toast Manage Button: full width => wirkt wie �Action Row� */
        .toast-types-summary {
            width: 100%;
            justify-content: stretch;
        }

        .manage-btn {
            width: 100%;
            max-width: 360px;
            text-align: center;
        }
    }

    @media (max-width: 444px) {
        .settings {
            /* vorher: horizontal 0 -> sorgt optisch f�r �rausgucken� */
            padding-left: 0.9rem;
            padding-right: 0.9rem;
            /* falls irgendwas minimal overflow produziert (shadows / transforms) */
            overflow-x: hidden;
        }

        .settings-grid {
            justify-items: stretch;
        }

        .settings-group {
            width: 100%;
        }

        /* Header-Card + Setting-Cards d�rfen NIE breiter als Viewport sein */
        .group-head,
        .setting-card {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            margin-left: auto;
            margin-right: auto;
        }

        /* Sicherheit: Grid-Kinder d�rfen schrumpfen (gegen min-content overflow) */
        .group-left,
        .setting-content,
        .setting-control {
            min-width: 0;
        }

        /* Select kann sonst �dr�cken� */
        .settings-select {
            max-width: 100%;
        }
    }

    /* ? WRAP/STACK: unter 640px darf nix mehr horizontal sprengen */
    @media (max-width: 640px) {
        /* Card bleibt grid, aber Control wird IMMER in neue Zeile gezwungen */
        .setting-card {
            grid-template-columns: 56px 1fr;
            grid-template-areas:
                "icon content"
                "control control";
            align-items: start;
        }

        .setting-icon {
            grid-area: icon;
        }

        .setting-content {
            grid-area: content;
            min-width: 0;
        }

        .setting-control {
            grid-area: control;
            width: 100%;
            justify-content: flex-end;
            flex-wrap: wrap; /* <- WRAP falls doch mal zu eng */
            min-width: 0;
        }

        /* Select immer full width, damit nix schiebt */
        .settings-select {
            width: 100%;
            max-width: 100%;
            min-width: 0;
        }

        /* Dieses AN/AUS Label frisst Platz -> auf klein weg */
        .toggle-label {
            display: none;
        }

        /* Switch kleiner (und translate passend) */
        .toggle-switch {
            width: 56px;
            height: 32px;
        }

            .toggle-switch::before {
                width: 28px;
                height: 28px;
            }

            .toggle-switch:checked::before {
                transform: translateX(24px);
            }

        /* Gruppen-Header: Text darf umbrechen statt zu dr�cken */
        .group-left {
            min-width: 0;
        }

        .group-sub {
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
        }
    }

</style>

