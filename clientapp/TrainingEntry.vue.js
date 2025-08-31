import { ref } from 'vue';
const emit = defineEmits();
const exercise = ref('');
const weight = ref(0);
const reps = ref(0);
const sets = ref(0);
const submit = () => {
    if (exercise.value && weight.value && reps.value && sets.value) {
        emit('save', {
            exercise: exercise.value,
            weight: weight.value,
            reps: reps.value,
            sets: sets.value,
            date: new Date().toISOString()
        });
        exercise.value = '';
        weight.value = 0;
        reps.value = 0;
        sets.value = 0;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.submit) },
    ...{ class: "form-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Übung (z.B. Bankdrücken)",
});
(__VLS_ctx.exercise);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Gewicht (kg)",
    type: "number",
});
(__VLS_ctx.weight);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Wdh",
    type: "number",
});
(__VLS_ctx.reps);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Sätze",
    type: "number",
});
(__VLS_ctx.sets);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
});
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            exercise: exercise,
            weight: weight,
            reps: reps,
            sets: sets,
            submit: submit,
        };
    },
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */
