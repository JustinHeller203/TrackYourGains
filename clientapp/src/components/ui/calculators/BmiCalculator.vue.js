import { computed } from 'vue';
const props = defineProps();
const emit = defineEmits();
const gender = computed(() => props.bmiGender);
const weight = computed(() => props.bmiWeight);
const height = computed(() => props.bmiHeight);
function onGenderChange(ev) {
    const val = ev.target.value;
    emit('update:bmiGender', val);
}
function onWeightInput(ev) {
    const raw = ev.target.value;
    emit('update:bmiWeight', raw === '' ? null : Number(raw));
}
function onHeightInput(ev) {
    const raw = ev.target.value;
    emit('update:bmiHeight', raw === '' ? null : Number(raw));
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['calculator-card']} */ ;
/** @type {__VLS_StyleScopedClasses['fav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['calculator-card']} */ ;
/** @type {__VLS_StyleScopedClasses['calculator-card']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-text']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calculator-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
(__VLS_ctx.title || 'BMI-Rechner');
if (__VLS_ctx.info) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tooltip-text" },
    });
    (__VLS_ctx.info);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('toggleFavorite');
        } },
    ...{ class: "fav-btn" },
    'aria-pressed': (__VLS_ctx.isFavorite),
    title: (__VLS_ctx.isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'),
});
(__VLS_ctx.isFavorite ? '⭐' : '☆');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.onGenderChange) },
    value: (__VLS_ctx.gender),
    ...{ class: "edit-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "male",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "female",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
(__VLS_ctx.unit === 'kg' ? 'kg' : 'lbs');
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onWeightInput) },
    value: (__VLS_ctx.weight ?? ''),
    type: "number",
    placeholder: (__VLS_ctx.unit === 'kg' ? 'z.B. 70' : 'z.B. 155'),
    ...{ class: "edit-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onHeightInput) },
    value: (__VLS_ctx.height ?? ''),
    type: "number",
    placeholder: "z.B. 175",
    ...{ class: "edit-input" },
});
if (!__VLS_ctx.autoCalcEnabled) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.autoCalcEnabled))
                    return;
                __VLS_ctx.$emit('calculate');
            } },
        ...{ class: "popup-btn save-btn" },
    });
}
if (__VLS_ctx.bmiResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.bmiResult.value.toFixed(1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.bmiResult))
                    return;
                __VLS_ctx.$emit('copy');
            } },
        ...{ class: "btn-ghost mini" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.bmiResult.category);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-spacer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('export');
        } },
    ...{ class: "btn-ghost" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "btn-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('reset');
        } },
    ...{ class: "btn-danger-ghost" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "btn-icon" },
});
/** @type {__VLS_StyleScopedClasses['calculator-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['fav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            gender: gender,
            weight: weight,
            height: height,
            onGenderChange: onGenderChange,
            onWeightInput: onWeightInput,
            onHeightInput: onHeightInput,
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
