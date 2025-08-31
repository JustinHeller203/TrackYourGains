<template>
    <div class="settings">
        <div class="settings-header">
            <h2 class="page-title">⚙️ Einstellungen</h2>
            <p class="page-subtext">Personalisiere deine Gym-Tracking Experience</p>
        </div>

        <div class="settings-grid">
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
                <div class="setting-icon">🔔</div>
                <div class="setting-content">
                    <h3 class="setting-title">Toast-Nachrichten</h3>
                    <p class="setting-description">Ein-/Ausschalten von Toast-Benachrichtigungen</p>
                </div>
                <div class="setting-control">
                    <input id="toasts-toggle" type="checkbox" class="toggle-switch" v-model="toastsEnabled" />
                    <label for="toasts-toggle" class="toggle-label">
                        <span class="toggle-text">{{ toastsEnabled ? 'AN' : 'AUS' }}</span>
                    </label>
                </div>
            </div>

        </div>

        <div class="settings-footer">
            <button class="save-button" @click="saveSettings">💾 Einstellungen speichern</button>
        </div>

        <Toast v-if="toast && toastsEnabled"
               :toast="toast"
               :dismissible="true"
               @dismiss="startToastExit" />

    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue'
    import { isDark, initTheme, setTheme, previewTheme } from '@/composables/useTheme'
    import { onBeforeRouteLeave } from 'vue-router'
    import Toast from '@/components/ui/Toast.vue'

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
    }

    const preferredUnit = ref<'kg' | 'lbs'>('kg')
    const autoCalcEnabled = ref(false)
    const allowedUnits = ['kg', 'lbs'] as const

    // Globale Toast-Einstellung
    const toastsEnabled = ref(true)

    // Zentraler Toast-State für diese Seite
    const toast = ref<ToastModel | null>(null)

    // Draft-State für das UI
    const isDarkDraft = ref(false)
    const persistedTheme = ref<'dark' | 'light'>('light')
    const saved = ref(false)


    onMounted(() => {
        // Persistierten Zustand initialisieren
        initTheme()
        persistedTheme.value = isDark.value ? 'dark' : 'light'
        isDarkDraft.value = isDark.value

        // Einheiten / AutoCalc laden
        const unit = (localStorage.getItem('preferredUnit') || '').toLowerCase()
        preferredUnit.value = (allowedUnits as readonly string[]).includes(unit)
            ? (unit as 'kg' | 'lbs')
            : 'kg'
        autoCalcEnabled.value = localStorage.getItem('autoCalcEnabled') === 'true'

        // Toasts aktiviert?
        const stored = localStorage.getItem('toastsEnabled')
        toastsEnabled.value = stored === null ? true : stored === 'true'
    })

    watch(isDarkDraft, (v) => {
        previewTheme(v ? 'dark' : 'light')
    })
    const startToastExit = () => {
        if (!toast.value) return
        toast.value.exiting = true
        setTimeout(() => { toast.value = null }, 300) // matcht deine .toast-exit Dauer
    }
    function saveSettings() {
        // Theme persistieren
        setTheme(isDarkDraft.value ? 'dark' : 'light')
        persistedTheme.value = isDarkDraft.value ? 'dark' : 'light'
        saved.value = true

        // Units & AutoCalc persistieren
        const unit = (preferredUnit.value || 'kg').toLowerCase() as 'kg' | 'lbs'
        const normalized = (allowedUnits as readonly string[]).includes(unit) ? unit : 'kg'
        localStorage.setItem('preferredUnit', normalized)
        window.dispatchEvent(new CustomEvent('preferred-unit-changed', { detail: normalized }))

        localStorage.setItem('autoCalcEnabled', String(autoCalcEnabled.value))

        // Toasts persistieren + global announcen
        localStorage.setItem('toastsEnabled', String(toastsEnabled.value))
        window.dispatchEvent(new CustomEvent('toasts-enabled-changed', { detail: toastsEnabled.value }))

        // Zentralen Toast zeigen – nur wenn erlaubt
        if (toastsEnabled.value) {
            const id = Date.now()
            toast.value = {
                id,
                message: 'Einstellungen gespeichert! 🎉',
                emoji: '💾',
                type: 'toast-save',
                exiting: false
            }
            // sanft ausblenden wie in Toast.vue erwartet
            setTimeout(() => {
                if (toast.value?.id === id) {
                    toast.value.exiting = true
                    setTimeout(() => {
                        if (toast.value?.id === id) toast.value = null
                    }, 300)
                }
            }, 2500)
        }
    }

    // Bei Verlassen ohne Speichern: Preview zurücksetzen
    onBeforeRouteLeave((_to, _from, next) => {
        if (!saved.value) {
            previewTheme(persistedTheme.value)
        }
        next()
    })
</script>
<style scoped>
    .settings {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 0;
        background: var(--bg-primary) !important;
    }

    html.dark-mode .settings {
        background: #161b22 !important;
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

    .setting-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 2rem;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1.5rem;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    }

    html.dark-mode .setting-card {
        background: #1c2526;
        border-color: #30363d;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .setting-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
    }

    .setting-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    }

    html.dark-mode .setting-card::before {
        background: linear-gradient(90deg, #6B8DD6, #4B6CB7);
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
        gap: 1rem;
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
        cursor: pointer;
        user-select: none;
    }

    .toggle-text {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
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

    .save-button {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #ffffff;
        border: none;
        border-radius: 16px;
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow);
    }

    html.dark-mode .save-button {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
    }

    .save-button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
        background: var(--accent-hover);
    }

    html.dark-mode .save-button:hover {
        background: #5a7bc4;
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
</style>