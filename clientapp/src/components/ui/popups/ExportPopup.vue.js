import { computed, nextTick, ref, watch } from 'vue';
import BasePopup from './BasePopup.vue';
const props = defineProps();
const emit = defineEmits();
const proxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
});
const sel = ref(null);
watch(() => props.show, async (open) => { if (open) {
    await nextTick();
    sel.value?.focus();
} });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof BasePopup, typeof BasePopup, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(BasePopup, new BasePopup({
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.show),
    title: "Daten exportieren",
    variant: "export-popup",
}));
const __VLS_1 = __VLS_0({
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.show),
    title: "Daten exportieren",
    variant: "export-popup",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.$emit('cancel');
    }
};
var __VLS_7 = {};
__VLS_2.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "downloaddistance" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ref: "sel",
        value: (__VLS_ctx.proxy),
        ...{ class: "edit-input" },
    });
    /** @type {typeof __VLS_ctx.sel} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "html",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "pdf",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "csv",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "json",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "txt",
    });
}
{
    const { actions: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('confirm');
            } },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('cancel');
            } },
        ...{ class: "popup-btn cancel-btn" },
    });
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['downloaddistance']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BasePopup: BasePopup,
            proxy: proxy,
            sel: sel,
        };
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
