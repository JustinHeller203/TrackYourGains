import { ref, onMounted, watch } from 'vue';
import { isDark, initTheme, setTheme, previewTheme } from '@/composables/useTheme';
import { onBeforeRouteLeave } from 'vue-router';
import Toast from '@/components/ui/Toast.vue';
const preferredUnit = ref('kg');
const autoCalcEnabled = ref(false);
const allowedUnits = ['kg', 'lbs'];
// Globale Toast-Einstellung
const toastsEnabled = ref(true);
// Zentraler Toast-State für diese Seite
const toast = ref(null);
// Draft-State für das UI
const isDarkDraft = ref(false);
const persistedTheme = ref('light');
const saved = ref(false);
onMounted(() => {
    // Persistierten Zustand initialisieren
    initTheme();
    persistedTheme.value = isDark.value ? 'dark' : 'light';
    isDarkDraft.value = isDark.value;
    // Einheiten / AutoCalc laden
    const unit = (localStorage.getItem('preferredUnit') || '').toLowerCase();
    preferredUnit.value = allowedUnits.includes(unit)
        ? unit
        : 'kg';
    autoCalcEnabled.value = localStorage.getItem('autoCalcEnabled') === 'true';
    // Toasts aktiviert?
    const stored = localStorage.getItem('toastsEnabled');
    toastsEnabled.value = stored === null ? true : stored === 'true';
});
watch(isDarkDraft, (v) => {
    previewTheme(v ? 'dark' : 'light');
});
const startToastExit = () => {
    if (!toast.value)
        return;
    toast.value.exiting = true;
    setTimeout(() => { toast.value = null; }, 300); // matcht deine .toast-exit Dauer
};
function saveSettings() {
    // Theme persistieren
    setTheme(isDarkDraft.value ? 'dark' : 'light');
    persistedTheme.value = isDarkDraft.value ? 'dark' : 'light';
    saved.value = true;
    // Units & AutoCalc persistieren
    const unit = (preferredUnit.value || 'kg').toLowerCase();
    const normalized = allowedUnits.includes(unit) ? unit : 'kg';
    localStorage.setItem('preferredUnit', normalized);
    window.dispatchEvent(new CustomEvent('preferred-unit-changed', { detail: normalized }));
    localStorage.setItem('autoCalcEnabled', String(autoCalcEnabled.value));
    // Toasts persistieren + global announcen
    localStorage.setItem('toastsEnabled', String(toastsEnabled.value));
    window.dispatchEvent(new CustomEvent('toasts-enabled-changed', { detail: toastsEnabled.value }));
    // Zentralen Toast zeigen – nur wenn erlaubt
    if (toastsEnabled.value) {
        const id = Date.now();
        toast.value = {
            id,
            message: 'Einstellungen gespeichert! 🎉',
            emoji: '💾',
            type: 'toast-save',
            exiting: false
        };
        // sanft ausblenden wie in Toast.vue erwartet
        setTimeout(() => {
            if (toast.value?.id === id) {
                toast.value.exiting = true;
                setTimeout(() => {
                    if (toast.value?.id === id)
                        toast.value = null;
                }, 300);
            }
        }, 2500);
    }
}
// Bei Verlassen ohne Speichern: Preview zurücksetzen
onBeforeRouteLeave((_to, _from, next) => {
    if (!saved.value) {
        previewTheme(persistedTheme.value);
    }
    next();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-select']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-select']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-select']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-select']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-select']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-content']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtext" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "setting-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "setting-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "darkmode-toggle",
    type: "checkbox",
    ...{ class: "toggle-switch" },
});
(__VLS_ctx.isDarkDraft);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "darkmode-toggle",
    ...{ class: "toggle-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "toggle-text" },
});
(__VLS_ctx.isDarkDraft ? 'AN' : 'AUS');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "setting-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "setting-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.preferredUnit),
    ...{ class: "unit-select" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "kg",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "lbs",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "setting-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "setting-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "autocalc-toggle",
    type: "checkbox",
    ...{ class: "toggle-switch" },
});
(__VLS_ctx.autoCalcEnabled);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "autocalc-toggle",
    ...{ class: "toggle-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "toggle-text" },
});
(__VLS_ctx.autoCalcEnabled ? 'AN' : 'AUS');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "setting-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "setting-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "toasts-toggle",
    type: "checkbox",
    ...{ class: "toggle-switch" },
});
(__VLS_ctx.toastsEnabled);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "toasts-toggle",
    ...{ class: "toggle-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "toggle-text" },
});
(__VLS_ctx.toastsEnabled ? 'AN' : 'AUS');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.saveSettings) },
    ...{ class: "save-button" },
});
if (__VLS_ctx.toast && __VLS_ctx.toastsEnabled) {
    /** @type {[typeof Toast, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Toast, new Toast({
        ...{ 'onDismiss': {} },
        toast: (__VLS_ctx.toast),
        dismissible: (true),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onDismiss': {} },
        toast: (__VLS_ctx.toast),
        dismissible: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onDismiss: (__VLS_ctx.startToastExit)
    };
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-content']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-content']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['unit-select']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-content']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-card']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-content']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-title']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Toast: Toast,
            preferredUnit: preferredUnit,
            autoCalcEnabled: autoCalcEnabled,
            toastsEnabled: toastsEnabled,
            toast: toast,
            isDarkDraft: isDarkDraft,
            startToastExit: startToastExit,
            saveSettings: saveSettings,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
