import { defineStore } from "pinia"
import { getSettings, saveSettings as saveSettingsApi, type SettingsDto } from "@/services/settings"
import { setTheme } from "@/composables/useTheme"

const DEFAULTS: SettingsDto = {
    theme: "dark",
    preferredUnit: "kg",
    autoCalcEnabled: false,
    confirmDeleteEnabled: true,
    backToTopEnabled: false,
    stickyTimerEnabled: true,
    stickyStopwatchEnabled: true,
    toastsEnabled: true,
    toastDurationMs: 2500,
    toastTypeEnabledJson: JSON.stringify({
        "toast-default": true,
        "toast-save": true,
        "toast-add": true,
        "toast-delete": true,
        "toast-timer": true,
        "toast-reset": true,
    }),
}

function safeTheme(v: any): "dark" | "light" {
    return v === "light" ? "light" : "dark"
}

function safeUnit(v: any): "kg" | "lbs" {
    return v === "lbs" ? "lbs" : "kg"
}

export const useSettingsStore = defineStore("settings", {
    state: () => ({
        loaded: false,
        dto: { ...DEFAULTS } as SettingsDto,
    }),

    getters: {
        theme: (s) => s.dto.theme,
        preferredUnit: (s) => s.dto.preferredUnit,
        autoCalcEnabled: (s) => s.dto.autoCalcEnabled,
        confirmDeleteEnabled: (s) => s.dto.confirmDeleteEnabled,
        backToTopEnabled: (s) => s.dto.backToTopEnabled,
        stickyTimerEnabled: (s) => s.dto.stickyTimerEnabled,
        stickyStopwatchEnabled: (s) => s.dto.stickyStopwatchEnabled,
        toastsEnabled: (s) => s.dto.toastsEnabled,
        toastDurationMs: (s) => s.dto.toastDurationMs,
        toastTypeEnabledJson: (s) => s.dto.toastTypeEnabledJson,
    },

    actions: {
        resetToDefaults() {
            this.dto = { ...DEFAULTS }
            this.loaded = true
            setTheme(this.dto.theme)
            this.broadcast()
        },

        applyDto(incoming: SettingsDto) {
            this.dto = {
                ...DEFAULTS,
                ...incoming,
                theme: safeTheme(incoming?.theme),
                preferredUnit: safeUnit(incoming?.preferredUnit),
                toastDurationMs:
                    Number.isFinite(incoming?.toastDurationMs) && incoming.toastDurationMs > 0
                        ? incoming.toastDurationMs
                        : DEFAULTS.toastDurationMs,
                toastsEnabled: incoming?.toastsEnabled ?? DEFAULTS.toastsEnabled,
                toastTypeEnabledJson: typeof incoming?.toastTypeEnabledJson === "string" ? incoming.toastTypeEnabledJson : DEFAULTS.toastTypeEnabledJson,
            }

            this.loaded = true
            setTheme(this.dto.theme)
            this.broadcast()

        },

        broadcast() {
            window.dispatchEvent(new CustomEvent("preferred-unit-changed", { detail: this.dto.preferredUnit }))
            window.dispatchEvent(new CustomEvent("toasts-enabled-changed", { detail: this.dto.toastsEnabled }))
            window.dispatchEvent(new CustomEvent("toast-duration-changed", { detail: this.dto.toastDurationMs }))
            window.dispatchEvent(new CustomEvent("confirm-delete-changed", { detail: this.dto.confirmDeleteEnabled }))
            window.dispatchEvent(new CustomEvent("back-to-top-enabled-changed", { detail: this.dto.backToTopEnabled }))
            window.dispatchEvent(new CustomEvent("sticky-timer-enabled-changed", { detail: this.dto.stickyTimerEnabled }))
            window.dispatchEvent(new CustomEvent("sticky-stopwatch-enabled-changed", { detail: this.dto.stickyStopwatchEnabled }))
            window.dispatchEvent(new Event("tyg:sticky-prefs-changed"))

            try {
                const map = JSON.parse(this.dto.toastTypeEnabledJson || "{}")
                window.dispatchEvent(new CustomEvent("toast-types-changed", { detail: map }))
            } catch {
                // ignore
            }

            // toast-types-changed wird NICHT global gebroadcastet, weil du es eh in Settings.vue lokal managst.
            // Wenn du es doch global brauchst: einfach JSON parse + dispatch.
        },

        async loadFromBackend() {
            const dto = await getSettings()
            this.applyDto(dto)
        },

        async saveToBackend() {
            // Theme wirklich "persistieren" (bei dir vermutlich html-class etc.)
            setTheme(this.dto.theme)
            await saveSettingsApi(this.dto)
            this.broadcast()
        },
    },
})
