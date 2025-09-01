const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['popup-body']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-body']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-body']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-body']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.teleport, typeof __VLS_components.Teleport, typeof __VLS_components.teleport, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    name: "fade",
}));
const __VLS_6 = __VLS_5({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
if (__VLS_ctx.show) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (...[$event]) => {
                if (!(__VLS_ctx.show))
                    return;
                __VLS_ctx.$emit('cancel');
            } },
        ...{ class: "popup-overlay" },
        ...{ class: (__VLS_ctx.overlayClass) },
        role: "dialog",
        'aria-modal': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    (__VLS_ctx.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-body" },
    });
    var __VLS_8 = {};
    if (__VLS_ctx.$slots.actions || __VLS_ctx.showActions) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "popup-actions" },
        });
        var __VLS_10 = {};
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.show))
                        return;
                    if (!(__VLS_ctx.$slots.actions || __VLS_ctx.showActions))
                        return;
                    __VLS_ctx.$emit('cancel');
                } },
            ...{ class: "popup-btn cancel-btn" },
            type: "button",
        });
        (__VLS_ctx.cancelText);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.show))
                        return;
                    if (!(__VLS_ctx.$slots.actions || __VLS_ctx.showActions))
                        return;
                    __VLS_ctx.$emit('save');
                } },
            ...{ class: "popup-btn save-btn" },
            type: "button",
        });
        (__VLS_ctx.saveText);
    }
}
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-body']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8, __VLS_11 = __VLS_10;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
