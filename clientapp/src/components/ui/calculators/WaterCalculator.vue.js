import { computed } from 'vue';
const props = defineProps();
const emit = defineEmits();
const weight = computed(() => props.waterWeight);
const activity = computed(() => props.waterActivity);
const climate = computed(() => props.waterClimate);
const result = computed(() => props.waterResult);
function onWeightInput(e) {
    const raw = e.target.value;
    emit('update:waterWeight', raw === '' ? null : Number(raw));
}
function onActivityChange(e) {
    emit('update:waterActivity', e.target.value);
}
function onClimateChange(e) {
    emit('update:waterClimate', e.target.value);
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
(__VLS_ctx.title || 'Wasserbedarfsrechner');
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.onActivityChange) },
    value: (__VLS_ctx.activity),
    ...{ class: "edit-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "low",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "moderate",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "high",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.onClimateChange) },
    value: (__VLS_ctx.climate),
    ...{ class: "edit-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "temperate",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "hot",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "very_hot",
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
if (__VLS_ctx.result !== null) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.result.toFixed(1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.result !== null))
                    return;
                __VLS_ctx.$emit('copy');
            } },
        ...{ class: "btn-ghost mini" },
    });
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
            activity: activity,
            climate: climate,
            result: result,
            onWeightInput: onWeightInput,
            onActivityChange: onActivityChange,
            onClimateChange: onClimateChange,
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
