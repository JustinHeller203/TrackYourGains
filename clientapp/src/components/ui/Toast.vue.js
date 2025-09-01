const props = defineProps();
const emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-close']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-close']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toast-container" },
});
if (__VLS_ctx.toast) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toast" },
        ...{ class: ([__VLS_ctx.toast.type, { 'toast-exit': __VLS_ctx.toast.exiting }]) },
        role: "status",
        'aria-live': "polite",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toast-emoji" },
    });
    (__VLS_ctx.toast.emoji);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toast-message" },
    });
    (__VLS_ctx.toast.message);
    if (__VLS_ctx.dismissible) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.toast))
                        return;
                    if (!(__VLS_ctx.dismissible))
                        return;
                    __VLS_ctx.$emit('dismiss');
                } },
            ...{ class: "toast-close" },
            type: "button",
            'aria-label': "Toast schließen",
        });
    }
}
/** @type {__VLS_StyleScopedClasses['toast-container']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-exit']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-emoji']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-message']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-close']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
