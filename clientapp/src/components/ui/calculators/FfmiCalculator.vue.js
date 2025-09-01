import { computed } from 'vue';
const props = defineProps();
const emit = defineEmits();
const weight = computed(() => props.ffmiWeight);
const height = computed(() => props.ffmiHeight);
const bodyFat = computed(() => props.ffmiBodyFat);
const result = computed(() => props.ffmiResult);
function onWeightInput(e) {
    const raw = e.target.value;
    emit('update:ffmiWeight', raw === '' ? null : Number(raw));
}
function onHeightInput(e) {
    const raw = e.target.value;
    emit('update:ffmiHeight', raw === '' ? null : Number(raw));
}
function onBodyFatInput(e) {
    const raw = e.target.value;
    emit('update:ffmiBodyFat', raw === '' ? null : Number(raw));
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['calculator-card']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-text']} */ ;
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
(__VLS_ctx.title || 'FFMI-Rechner');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tooltip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tooltip-text" },
});
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onBodyFatInput) },
    value: (__VLS_ctx.bodyFat ?? ''),
    type: "number",
    placeholder: "z.B. 15",
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
if (__VLS_ctx.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.result.value.toFixed(1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.result))
                    return;
                __VLS_ctx.$emit('copy');
            } },
        ...{ class: "btn-ghost mini" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.result.category);
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
            weight: weight,
            height: height,
            bodyFat: bodyFat,
            result: result,
            onWeightInput: onWeightInput,
            onHeightInput: onHeightInput,
            onBodyFatInput: onBodyFatInput,
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
