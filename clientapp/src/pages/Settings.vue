<!--Settings.vue-->

<template>
    <div class="settings">
        <div class="settings-header">
            <h2 class="page-title">⚙️ Einstellungen</h2>
            <p class="page-subtext">Personalisiere deine Gym-Tracking Experience</p>
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
                        <span class="group-chevron" :class="{ open: openGroups.display }">⌄</span>
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
                                <p class="setting-description">Scrollt automatisch nach oben</p>
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
                                <select v-model="preferredUnit" class="unit-select">
                                    <option value="kg">Kilogramm (kg)</option>
                                    <option value="lbs">Pfund (lbs)</option>
                                </select>
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
                        <span class="group-chevron" :class="{ open: openGroups.system }">⌄</span>
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
                            <div class="group-sub">Benachrichtigungen, Dauer & Typen</div>
                        </div>
                    </div>

                    <div class="group-right">
                        <span class="group-chevron" :class="{ open: openGroups.toast }">⌄</span>
                    </div>
                </button>
                <Transition name="sg-collapse">

                    <div v-show="openGroups.toast" class="group-body">
                        <div class="setting-card">
                            <div class="setting-icon">🔔</div>
                            <div class="setting-content">
                                <div class="setting-title-row">
                                    <h3 class="setting-title">Toast-Nachrichten</h3>

                                    <button type="button"
                                            class="tm-preview"
                                            aria-label="Vorschau"
                                            title="Vorschau"
                                            @click="previewToastSettingsDemo">
                                        👁️
                                    </button>
                                </div>

                                <p class="setting-description">Ein-/Ausschalten von Toast-Benachrichtigungen</p>
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
                                <h3 class="setting-title">Toast-Dauer</h3>
                                <p class="setting-description">Wie lange Toasts sichtbar bleiben sollen</p>
                            </div>
                            <div class="setting-control">
                                <select v-model.number="toastDurationMs" class="unit-select">
                                    <option :value="1500">1.5s</option>
                                    <option :value="2500">2.5s</option>
                                    <option :value="4000">4s</option>
                                    <option :value="6000">6s</option>
                                    <option :value="9000">9s</option>
                                    <option :value="12000">12s</option>
                                </select>
                            </div>
                        </div>

                        <div class="setting-card" v-if="toastsEnabled">
                            <div class="setting-icon">🧩</div>
                            <div class="setting-content">
                                <h3 class="setting-title">Toast-Arten</h3>
                                <p class="setting-description">Wähle, welche Kategorien angezeigt werden (pro Toast-Typ)</p>
                            </div>

                            <div class="setting-control toast-types-control">
                                <div class="toast-types-summary">
                                    <button type="button" class="manage-btn" @click="openToastTypeManager">
                                        Verwalten
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
                <SettingsSaveButton :disabled="false"
                                    title="Einstellungen speichern"
                                    @click="saveSettings" />
            </div>
        </div>

        <ReminderPopup :show="showSaveHint"
                       :x="saveHintX"
                       :y="saveHintY"
                       emoji="💾"
                       text="Denk dran: unten noch auf „Einstellungen speichern“ klicken 👀" />

        <!-- Toast-Arten verwalten (Modal) -->
        <ToastTypeManagerPopup :show="showToastTypeManager"
                               :options="toastTypeOptions"
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
    import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue'
    import { isDark, initTheme, setTheme, previewTheme } from '@/composables/useTheme'
    import { onBeforeRouteLeave } from 'vue-router'
    import Toast from '@/components/ui/Toast.vue'
    import SettingsSaveButton from '@/components/ui/buttons/SettingsSaveButton.vue'
    import ToastTypeManagerPopup from '@/components/ui/popups/ToastTypeManagerPopup.vue'
    import ReminderPopup from '@/components/ui/popups/ReminderPopup.vue'
    import {
        LS_PREFERRED_UNIT,
        LS_AUTO_CALC_ENABLED,
        LS_TOASTS_ENABLED,
        LS_TOAST_DURATION_MS,
        LS_CONFIRM_DELETE_ENABLED,
        LS_BACK_TO_TOP_ENABLED,
        LS_TOAST_TYPES_REMINDER_COUNT,
        LS_TOAST_TYPE_ENABLED,
        LS_TOAST_DISABLED_TYPES,
        LS_STICKY_TIMER_ENABLED,
        LS_STICKY_STOPWATCH_ENABLED,
    } from '@/constants/storageKeys'

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

    const openGroups = reactive<Record<SettingsGroupKey, boolean>>({
        display: true,
        system: true,
        toast: true
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

    function onToastDismiss(id: number) {
        if (toast.value?.id === id) {
            toast.value = null
        }
    }
    const preferredUnit = ref<'kg' | 'lbs'>('kg')
    const autoCalcEnabled = ref(false)
    const allowedUnits = ['kg', 'lbs'] as const

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

        const opt = toastTypeOptions.find(o => o.key === k)

        toast.value = {
            id: Date.now(),
            message: msgByType[k],
            emoji: opt?.emoji ?? '🔔',
            type: k,
            exiting: false,
            durationMs: toastDurationMs.value
        }
    }

    // Globale Toast-Einstellung
    const toastsEnabled = ref(false)

    const toastDurationMs = ref<number>(2500)

    // Zentraler Toast-State für diese Seite
    const toast = ref<ToastModel | null>(null)
    const toastPosition = ref<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')

    // Draft-State für das UI
    const isDarkDraft = ref(false)
    const persistedTheme = ref<'dark' | 'light'>('light')
    const saved = ref(false)

    const confirmDeleteEnabled = ref(true)
    const backToTopEnabled = ref(true)
    const stickyTimerEnabled = ref(true)
    const stickyStopwatchEnabled = ref(true)

    const onToastsEnabledChanged = (e: CustomEvent<boolean>) => {
        toastsEnabled.value = !!e.detail
    }

    const toastTypeOptions = [
        { key: 'toast-default', label: 'Standard', emoji: '💬', hint: 'Allgemeine Infos & Hinweise' },
        { key: 'toast-save', label: 'Speichern', emoji: '💾', hint: 'Wenn etwas gespeichert wurde' },
        { key: 'toast-add', label: 'Hinzufügen', emoji: '➕', hint: 'Wenn du etwas erstellst/hinzufügst' },
        { key: 'toast-delete', label: 'Löschen', emoji: '🗑️', hint: 'Wenn du etwas entfernst/löschst' },
        { key: 'toast-timer', label: 'Timer', emoji: '⏱️', hint: 'Timer/Rest-Pausen Meldungen' },
        { key: 'toast-reset', label: 'Reset', emoji: '🔁', hint: 'Wenn etwas zurückgesetzt wird' }
    ] as const satisfies ReadonlyArray<{ key: ToastType; label: string; emoji: string; hint: string }>

    const showToastTypeManager = ref(false)

    const saveBtnWrap = ref<HTMLElement | null>(null)
    const showSaveHint = ref(false)
    const saveHintX = ref(0)
    const saveHintY = ref(0)

    let toastTypesSnapshot = ''
    let saveHintTimer: number | null = null

    function openToastTypeManager() {
        // Snapshot, um später echte Änderungen zu erkennen
        toastTypesSnapshot = JSON.stringify({ ...toastTypeEnabled })
        showToastTypeManager.value = true
    }

    function previewToastSettingsDemo() {
        toast.value = {
            id: Date.now(),
            message: toastsEnabled.value ? 'Beispiel: Toast ist aktiv ✅' : 'Beispiel: Toast ist AUS (nur Vorschau) 👀',
            emoji: '👁️',
            type: 'toast-default',
            exiting: false,
            durationMs: toastDurationMs.value
        }
    }
    function maybeShowSaveHintEvery5() {
        // Position über dem Save-Button setzen
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

    function onToastTypeManagerDone() {
        // Fertig -> hier Reminder-Logik
        showToastTypeManager.value = false

        const now = JSON.stringify({ ...toastTypeEnabled })
        const changed = toastTypesSnapshot && now !== toastTypesSnapshot
        toastTypesSnapshot = ''

        if (!changed) return

        const raw = Number(localStorage.getItem(LS_TOAST_TYPES_REMINDER_COUNT) || '0')
        const next = Number.isFinite(raw) ? raw + 1 : 1
        localStorage.setItem(LS_TOAST_TYPES_REMINDER_COUNT, String(next))

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

    const loadToastTypePrefs = () => {
        // Primär: enabled-map
        const raw = localStorage.getItem(LS_TOAST_TYPE_ENABLED)
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as Partial<Record<ToastType, unknown>>
                    ; (Object.keys(toastTypeEnabled) as ToastType[]).forEach((k) => {
                        if (typeof parsed?.[k] === 'boolean') toastTypeEnabled[k] = parsed[k] as boolean
                    })
                return
            } catch { /* ignore */ }
        }

        // Fallback: disabled-array (falls dein Toast-Menü sowas nutzt)
        const rawDisabled = localStorage.getItem(LS_TOAST_DISABLED_TYPES)
        if (rawDisabled) {
            try {
                const disabled = JSON.parse(rawDisabled) as unknown
                if (Array.isArray(disabled)) {
                    ; (Object.keys(toastTypeEnabled) as ToastType[]).forEach((k) => {
                        toastTypeEnabled[k] = !disabled.includes(k)
                    })
                }
            } catch { /* ignore */ }
        }
    }

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

        if (saveHintTimer) {
            window.clearTimeout(saveHintTimer)
            saveHintTimer = null
        }
    })
    onMounted(() => {
        // Persistierten Zustand initialisieren
        initTheme()

        window.addEventListener('toasts-enabled-changed', onToastsEnabledChanged as EventListener)

        persistedTheme.value = isDark.value ? 'dark' : 'light'
        isDarkDraft.value = isDark.value

        // Einheiten / AutoCalc laden
        const unit = (localStorage.getItem(LS_PREFERRED_UNIT) || '').toLowerCase()
        preferredUnit.value = (allowedUnits as readonly string[]).includes(unit)
            ? (unit as 'kg' | 'lbs')
            : 'kg'

        autoCalcEnabled.value = localStorage.getItem(LS_AUTO_CALC_ENABLED) === 'true'

        // Toasts aktiviert?
        const stored = localStorage.getItem(LS_TOASTS_ENABLED)
        toastsEnabled.value = stored === null ? true : stored === 'true'

        // Toast-Dauer laden
        const durRaw = Number(localStorage.getItem(LS_TOAST_DURATION_MS))
        toastDurationMs.value = Number.isFinite(durRaw) && durRaw > 0 ? durRaw : 2500

        // Löschen bestätigen?
        const storedConfirm = localStorage.getItem(LS_CONFIRM_DELETE_ENABLED)
        confirmDeleteEnabled.value = storedConfirm === null ? true : storedConfirm === 'true'

        // Back-to-top?
        const bttStored = localStorage.getItem(LS_BACK_TO_TOP_ENABLED)
        backToTopEnabled.value = bttStored === null ? true : bttStored === 'true'

        // Sticky Timer / Stoppuhr?
        const stStored = localStorage.getItem(LS_STICKY_TIMER_ENABLED)
        stickyTimerEnabled.value = stStored === null ? true : stStored === 'true'

        const ssStored = localStorage.getItem(LS_STICKY_STOPWATCH_ENABLED)
        stickyStopwatchEnabled.value = ssStored === null ? true : ssStored === 'true'

        loadToastTypePrefs()

        window.addEventListener('toast-types-changed', onToastTypesChanged as EventListener)

        // Wenn wir von Settings weg sind, sollen die Gruppen beim nächsten Öffnen zu sein
        if (sessionStorage.getItem(SETTINGS_GROUPS_COLLAPSE_FLAG) === '1') {
            collapseAllGroups()
            sessionStorage.removeItem(SETTINGS_GROUPS_COLLAPSE_FLAG)
        }
    })

    onBeforeRouteLeave((_to, _from, next) => {
        // Flag setzen, damit beim nächsten Mount alles zu ist (falls Komponente neu gemountet wird)
        sessionStorage.setItem(SETTINGS_GROUPS_COLLAPSE_FLAG, '1')

        // current view auch direkt zuklappen (für KeepAlive / sauberen State)
        collapseAllGroups()

        if (!saved.value) {
            previewTheme(persistedTheme.value)
        }
        next()
    })


    watch(isDarkDraft, (v) => {
        previewTheme(v ? 'dark' : 'light')
    })
    const startToastExit = () => {
        if (!toast.value) return
        toast.value.exiting = true
        // Exit ist in Toast.vue per Inline-Style bereits auf 0ms gesetzt → sofort entfernen
        setTimeout(() => { toast.value = null }, 0)
    }
    function saveSettings() {
        // Theme persistieren
        setTheme(isDarkDraft.value ? 'dark' : 'light')
        persistedTheme.value = isDarkDraft.value ? 'dark' : 'light'
        saved.value = true

        // Units & AutoCalc persistieren
        const unit = (preferredUnit.value || 'kg').toLowerCase() as 'kg' | 'lbs'
        const normalized = (allowedUnits as readonly string[]).includes(unit) ? unit : 'kg'
        localStorage.setItem(LS_PREFERRED_UNIT, normalized)
        window.dispatchEvent(new CustomEvent('preferred-unit-changed', { detail: normalized }))

        localStorage.setItem(LS_AUTO_CALC_ENABLED, String(autoCalcEnabled.value))

        // Toasts persistieren + global announcen
        localStorage.setItem(LS_TOASTS_ENABLED, String(toastsEnabled.value))
        window.dispatchEvent(new CustomEvent('toasts-enabled-changed', { detail: toastsEnabled.value }))

        localStorage.setItem(LS_TOAST_TYPE_ENABLED, JSON.stringify({ ...toastTypeEnabled }))

        const disabledTypes = (Object.keys(toastTypeEnabled) as ToastType[]).filter((k) => !toastTypeEnabled[k])
        localStorage.setItem(LS_TOAST_DISABLED_TYPES, JSON.stringify(disabledTypes))

        window.dispatchEvent(new CustomEvent('toast-types-changed', { detail: { ...toastTypeEnabled } }))

        // Toast-Dauer persistieren + global announcen
        localStorage.setItem(LS_TOAST_DURATION_MS, String(toastDurationMs.value))
        window.dispatchEvent(new CustomEvent('toast-duration-changed', { detail: toastDurationMs.value }))

        // Confirm-Delete persistieren + global announcen
        localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(confirmDeleteEnabled.value))
        window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: confirmDeleteEnabled.value }))

        localStorage.setItem(LS_BACK_TO_TOP_ENABLED, String(backToTopEnabled.value))
        window.dispatchEvent(new CustomEvent('back-to-top-enabled-changed', { detail: backToTopEnabled.value }))

        localStorage.setItem(LS_STICKY_TIMER_ENABLED, String(stickyTimerEnabled.value))
        window.dispatchEvent(new CustomEvent('sticky-timer-enabled-changed', { detail: stickyTimerEnabled.value }))

        localStorage.setItem(LS_STICKY_STOPWATCH_ENABLED, String(stickyStopwatchEnabled.value))
        window.dispatchEvent(new CustomEvent('sticky-stopwatch-enabled-changed', { detail: stickyStopwatchEnabled.value }))

        if (toastsEnabled.value && toastTypeEnabled['toast-save']) {
            const id = Date.now()
            toast.value = {
                id,
                message: 'Einstellungen gespeichert! 🎉',
                emoji: '💾',
                type: 'toast-save',
                exiting: false,
                durationMs: toastDurationMs.value
            }
        }

    }
</script>
<style scoped>
    .settings {
        max-width: 800px;
        margin: 0 auto;
        padding: clamp(1.4rem, 3vw, 2.4rem) 0;
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
        color: #ffffff !important; /* Weiß für Lesbarkeit */
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

    /* Dark-Mode – gleiche Welt wie plan-card / tutorial-card */
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
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border-radius: 16px;
        box-shadow: var(--shadow);
        color: #ffffff;
    }

    html.dark-mode .setting-icon {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
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
    }

    /* Toast-Arten: Pills/Chips statt hässlicher Switch-Liste */
    .toast-types-control {
        align-items: stretch;
    }



    .toggle-switch {
        width: 70px;
        height: 36px;
        appearance: none;
        background: var(--border-color);
        border-radius: 50px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    html.dark-mode .toggle-switch {
        background: #30363d;
    }

    .toggle-switch:checked {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    }

    html.dark-mode .toggle-switch:checked {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
    }

    .toggle-switch::before {
        content: '';
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-primary);
        top: 2px;
        left: 2px;
        transition: all 0.3s ease;
        box-shadow: var(--shadow);
    }

    html.dark-mode .toggle-switch::before {
        background: #161b22;
    }

    .toggle-switch:checked::before {
        transform: translateX(34px);
    }

    .toggle-label {
        display: inline-flex;
        align-items: center;
        line-height: 1; /* verhindert Höhen-Jump */
    }

    .toggle-text {
        display: inline-block;
        width: 3.2ch; /* genug für "AUS" */
        text-align: left; /* bleibt an der gleichen Stelle wie vorher */
        text-transform: uppercase;
        letter-spacing: 1px;
        white-space: nowrap; /* kein Umbruch */
    }

    html.dark-mode .toggle-text {
        color: #c9d1d9;
    }

    .unit-select {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 0.8rem 1.2rem;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 160px;
    }

    html.dark-mode .unit-select {
        background: #0d1117;
        color: #ffffff;
        border-color: #30363d;
    }

    .unit-select:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    html.dark-mode .unit-select:focus {
        border-color: #6B8DD6;
    }

    .unit-select:hover {
        border-color: var(--accent-primary);
    }

    html.dark-mode .unit-select:hover {
        border-color: #6B8DD6;
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

    @media (max-width: 768px) {
        .setting-card {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 1.5rem;
        }

        .setting-content {
            text-align: center;
        }

        .setting-control {
            justify-content: center;
        }

        .settings {
            padding: 1rem;
        }
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
        border: 2px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        border-radius: 14px;
        padding: 0.65rem 0.9rem;
        font-weight: 800;
        cursor: pointer;
        transition: transform 140ms ease, border-color 180ms ease, box-shadow 180ms ease;
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
    }

        .manage-btn:hover {
            transform: translateY(-1px);
            border-color: rgba(129, 140, 248, 0.65);
            box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
        }

    html.dark-mode .manage-btn {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.45);
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
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #fff;
        font-size: 1.15rem;
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16);
    }

    html.dark-mode .group-icon {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
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
        font-size: 1.1rem;
        transform: translateY(-1px);
        transition: transform 160ms ease;
        opacity: 0.9;
        color: var(--text-primary);
    }

    html.dark-mode .group-chevron {
        color: #fff;
    }

    .group-chevron.open {
        transform: rotate(180deg);
    }

    .group-body {
        padding: 0;
        display: grid;
        gap: 1.25rem;
    }

    @media (max-width: 768px) {
        .group-sub {
            display: none;
        }

        .group-head {
            padding: 0.95rem 1rem;
        }

        .group-body {
            gap: 1rem;
        }
    }

    /* Collapse Animation für Settings-Gruppen (SMOOTH & HEAVY) */
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
</style>