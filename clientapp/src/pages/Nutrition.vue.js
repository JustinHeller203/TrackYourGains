import { ref, computed } from 'vue';
const meals = ref([]);
const meal = ref({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
});
const addMeal = () => {
    if (!meal.value.name || meal.value.calories <= 0)
        return;
    meals.value.unshift({ ...meal.value });
    meal.value = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 };
};
const deleteMeal = (index) => {
    meals.value.splice(index, 1);
};
const totalCalories = computed(() => meals.value.reduce((sum, m) => sum + m.calories, 0));
const totalProtein = computed(() => meals.value.reduce((sum, m) => sum + m.protein, 0));
const totalCarbs = computed(() => meals.value.reduce((sum, m) => sum + m.carbs, 0));
const totalFat = computed(() => meals.value.reduce((sum, m) => sum + m.fat, 0));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nutrition']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nutrition" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
if (__VLS_ctx.meals.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "macro-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.totalCalories);
    (__VLS_ctx.totalProtein);
    (__VLS_ctx.totalCarbs);
    (__VLS_ctx.totalFat);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meal-entry" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Mahlzeit",
});
(__VLS_ctx.meal.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Kalorien",
    type: "number",
});
(__VLS_ctx.meal.calories);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Protein (g)",
    type: "number",
});
(__VLS_ctx.meal.protein);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Kohlenhydrate (g)",
    type: "number",
});
(__VLS_ctx.meal.carbs);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Fett (g)",
    type: "number",
});
(__VLS_ctx.meal.fat);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addMeal) },
    disabled: (!__VLS_ctx.meal.name || __VLS_ctx.meal.calories <= 0),
});
if (__VLS_ctx.meals.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meal-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    for (const [m, index] of __VLS_getVForSourceType((__VLS_ctx.meals))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "list-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meal-info" },
        });
        (m.name);
        (m.calories);
        (m.protein);
        (m.carbs);
        (m.fat);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.meals.length))
                        return;
                    __VLS_ctx.deleteMeal(index);
                } },
            ...{ class: "delete-btn" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "no-meals" },
    });
}
/** @type {__VLS_StyleScopedClasses['nutrition']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['macro-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-list']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-info']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['no-meals']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            meals: meals,
            meal: meal,
            addMeal: addMeal,
            deleteMeal: deleteMeal,
            totalCalories: totalCalories,
            totalProtein: totalProtein,
            totalCarbs: totalCarbs,
            totalFat: totalFat,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
