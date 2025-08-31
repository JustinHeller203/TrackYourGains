import { ref } from 'vue';
const emit = defineEmits();
const name = ref('');
const calories = ref(0);
const protein = ref(0);
const carbs = ref(0);
const fat = ref(0);
const submit = () => {
    if (name.value && calories.value) {
        emit('save', {
            name: name.value,
            calories: calories.value,
            protein: protein.value,
            carbs: carbs.value,
            fat: fat.value,
            date: new Date().toISOString()
        });
        name.value = '';
        calories.value = 0;
        protein.value = 0;
        carbs.value = 0;
        fat.value = 0;
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
    placeholder: "Mahlzeit (z.B. Hähnchen mit Reis)",
});
(__VLS_ctx.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Kalorien",
    type: "number",
});
(__VLS_ctx.calories);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Protein (g)",
    type: "number",
});
(__VLS_ctx.protein);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Kohlenhydrate (g)",
    type: "number",
});
(__VLS_ctx.carbs);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Fett (g)",
    type: "number",
});
(__VLS_ctx.fat);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
});
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            name: name,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
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
