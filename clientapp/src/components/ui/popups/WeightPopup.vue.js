import { ref, watch, nextTick } from 'vue';
import BasePopup from './BasePopup.vue';
const props = defineProps();
const emit = defineEmits();
const inputRef = ref(null);
watch(() => props.show, async (open) => {
    if (open) {
        await nextTick();
        inputRef.value?.focus();
    }
});
function onInput(e) {
    const t = e.target;
    const val = t.value === '' ? null : (isNaN(t.valueAsNumber) ? Number(t.value) : t.valueAsNumber);
    emit('update:modelValue', val);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof BasePopup, typeof BasePopup, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(BasePopup, new BasePopup({
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.show),
    title: "Neues Gewicht eintragen",
    variant: "weight-goal-popup",
}));
const __VLS_1 = __VLS_0({
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.show),
    title: "Neues Gewicht eintragen",
    variant: "weight-goal-popup",
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onInput) },
    ...{ onKeydown: (...[$event]) => {
            __VLS_ctx.$emit('save');
        } },
    ref: "inputRef",
    value: (__VLS_ctx.modelValue),
    type: "number",
    placeholder: (__VLS_ctx.placeholder),
    ...{ class: "edit-input" },
});
/** @type {typeof __VLS_ctx.inputRef} */ ;
{
    const { actions: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('cancel');
            } },
        ...{ class: "popup-btn cancel-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('save');
            } },
        ...{ class: "popup-btn save-btn" },
    });
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BasePopup: BasePopup,
            inputRef: inputRef,
            onInput: onInput,
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
