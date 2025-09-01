import { ref, computed, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import DashboardCard from '@/components/ui/DashboardCard.vue';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import ExportPopup from '@/components/ui/popups/ExportPopup.vue';
import GoalPopup from '@/components/ui/popups/GoalPopup.vue';
import Toast from '@/components/ui/Toast.vue';
const meals = ref([]);
const meal = ref({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
const showMealPopup = ref(false);
const editingIndex = ref(null);
const calorieGoal = ref(2500);
const search = ref('');
const filter = ref('');
const totalCalories = computed(() => meals.value.reduce((s, m) => s + m.calories, 0));
const totalProtein = computed(() => meals.value.reduce((s, m) => s + m.protein, 0));
const totalCarbs = computed(() => meals.value.reduce((s, m) => s + m.carbs, 0));
const totalFat = computed(() => meals.value.reduce((s, m) => s + m.fat, 0));
// Quick Meals
const quickMeals = [
    { name: 'Proteinshake', calories: 300, protein: 30, carbs: 10, fat: 3 },
    { name: 'Chicken & Rice', calories: 550, protein: 40, carbs: 60, fat: 8 },
    { name: 'Nuts Mix', calories: 250, protein: 8, carbs: 10, fat: 20 },
];
function quickAdd(q) { meals.value.unshift({ ...q }); addToast(`${q.name} hinzugefügt`, 'add'); updateChart(); }
// Filter + Suche
const filteredMeals = computed(() => {
    return meals.value.filter(m => {
        if (search.value && !m.name.toLowerCase().includes(search.value.toLowerCase()))
            return false;
        if (filter.value === 'protein' && m.protein < 30)
            return false;
        if (filter.value === 'carbs' && m.carbs < 50)
            return false;
        return true;
    });
});
// Chart
let macroChart = null;
function updateChart() {
    const ctx = document.getElementById('macroChart');
    if (!ctx)
        return;
    if (macroChart)
        macroChart.destroy();
    macroChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fett'],
            datasets: [{ data: [totalProtein.value, totalCarbs.value, totalFat.value], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'] }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-primary)' } } } }
    });
}
watch([totalProtein, totalCarbs, totalFat], () => nextTick(updateChart));
// Meals Handling
function openMealPopup() { resetMeal(); showMealPopup.value = true; editingIndex.value = null; }
function closeMealPopup() { showMealPopup.value = false; }
function saveMeal() {
    if (!meal.value.name || meal.value.calories <= 0)
        return;
    if (editingIndex.value !== null) {
        meals.value[editingIndex.value] = { ...meal.value };
        addToast('Mahlzeit aktualisiert', 'add');
    }
    else {
        meals.value.unshift({ ...meal.value });
        addToast('Mahlzeit hinzugefügt', 'add');
    }
    resetMeal();
    showMealPopup.value = false;
    updateChart();
}
function editMeal(i) { meal.value = { ...meals.value[i] }; editingIndex.value = i; showMealPopup.value = true; }
function deleteMeal(i) { meals.value.splice(i, 1); addToast('Mahlzeit gelöscht', 'delete'); updateChart(); }
function resetMeal() { meal.value = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }; }
// Goal
const showGoalPopup = ref(false);
function openGoalPopup() { showGoalPopup.value = true; }
function closeGoalPopup() { showGoalPopup.value = false; }
// Export
const showExportPopup = ref(false);
const exportFormat = ref('html');
function openExportPopup() { showExportPopup.value = true; }
function closeExportPopup() { showExportPopup.value = false; }
function confirmExport() {
    const data = { meals: meals.value, totals: { cal: totalCalories.value, protein: totalProtein.value, carbs: totalCarbs.value, fat: totalFat.value } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition.${exportFormat.value}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Daten exportiert', 'save');
    closeExportPopup();
}
// Toast
const toast = ref(null);
let toastId = 0;
let timeout = null;
function addToast(msg, type = 'default') {
    if (timeout)
        clearTimeout(timeout);
    const emojis = { add: '✅', delete: '🗑️', save: '💾', default: '📋' };
    const classes = { add: 'toast-add', delete: 'toast-delete', save: 'toast-save', default: 'toast-default' };
    toast.value = { id: toastId++, message: msg, emoji: emojis[type], type: classes[type], exiting: false };
    timeout = setTimeout(() => toast.value = null, 3000);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['meal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-add']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-add']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nutrition" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtext" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard-grid" },
});
/** @type {[typeof DashboardCard, typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    ...{ 'onClick': {} },
    title: "Kalorien",
    clickable: true,
}));
const __VLS_1 = __VLS_0({
    ...{ 'onClick': {} },
    title: "Kalorien",
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onClick: (__VLS_ctx.openGoalPopup)
};
__VLS_2.slots.default;
(__VLS_ctx.totalCalories);
(__VLS_ctx.calorieGoal);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-bar-fill" },
    ...{ style: ({ width: `${Math.min((__VLS_ctx.totalCalories / __VLS_ctx.calorieGoal) * 100, 100)}%` }) },
});
var __VLS_2;
/** @type {[typeof DashboardCard, typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    title: "Protein",
}));
const __VLS_8 = __VLS_7({
    title: "Protein",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
(__VLS_ctx.totalProtein);
var __VLS_9;
/** @type {[typeof DashboardCard, typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    title: "Carbs",
}));
const __VLS_11 = __VLS_10({
    title: "Carbs",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
(__VLS_ctx.totalCarbs);
var __VLS_12;
/** @type {[typeof DashboardCard, typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    title: "Fett",
}));
const __VLS_14 = __VLS_13({
    title: "Fett",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
(__VLS_ctx.totalFat);
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    id: "macroChart",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openMealPopup) },
    ...{ class: "btn-ghost" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openExportPopup) },
    ...{ class: "btn-ghost" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.filter),
    ...{ class: "filter-select" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "protein",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "carbs",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Mahlzeit suchen...",
    ...{ class: "search-input" },
});
(__VLS_ctx.search);
if (__VLS_ctx.filteredMeals.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meal-list" },
    });
    for (const [m, index] of __VLS_getVForSourceType((__VLS_ctx.filteredMeals))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "meal-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meal-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (m.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (m.protein);
        (m.carbs);
        (m.fat);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meal-kcal" },
        });
        (m.calories);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "entry-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filteredMeals.length))
                        return;
                    __VLS_ctx.editMeal(index);
                } },
            ...{ class: "edit-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.filteredMeals.length))
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
/** @type {[typeof BasePopup, typeof BasePopup, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(BasePopup, new BasePopup({
    ...{ 'onCancel': {} },
    ...{ 'onSave': {} },
    show: (__VLS_ctx.showMealPopup),
    title: (__VLS_ctx.editingIndex !== null ? 'Mahlzeit bearbeiten' : 'Neue Mahlzeit'),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onCancel': {} },
    ...{ 'onSave': {} },
    show: (__VLS_ctx.showMealPopup),
    title: (__VLS_ctx.editingIndex !== null ? 'Mahlzeit bearbeiten' : 'Neue Mahlzeit'),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_19;
let __VLS_20;
let __VLS_21;
const __VLS_22 = {
    onCancel: (__VLS_ctx.closeMealPopup)
};
const __VLS_23 = {
    onSave: (__VLS_ctx.saveMeal)
};
__VLS_18.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "edit-input" },
});
(__VLS_ctx.meal.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    ...{ class: "edit-input" },
});
(__VLS_ctx.meal.calories);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    ...{ class: "edit-input" },
});
(__VLS_ctx.meal.protein);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    ...{ class: "edit-input" },
});
(__VLS_ctx.meal.carbs);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    ...{ class: "edit-input" },
});
(__VLS_ctx.meal.fat);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-add" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
for (const [q] of __VLS_getVForSourceType((__VLS_ctx.quickMeals))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.quickAdd(q);
            } },
        ...{ class: "btn-ghost mini" },
        key: (q.name),
    });
    (q.name);
}
var __VLS_18;
/** @type {[typeof ExportPopup, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(ExportPopup, new ExportPopup({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showExportPopup),
    modelValue: (__VLS_ctx.exportFormat),
}));
const __VLS_25 = __VLS_24({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showExportPopup),
    modelValue: (__VLS_ctx.exportFormat),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_27;
let __VLS_28;
let __VLS_29;
const __VLS_30 = {
    onConfirm: (__VLS_ctx.confirmExport)
};
const __VLS_31 = {
    onCancel: (__VLS_ctx.closeExportPopup)
};
var __VLS_26;
/** @type {[typeof GoalPopup, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(GoalPopup, new GoalPopup({
    ...{ 'onSave': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showGoalPopup),
    modelValue: (__VLS_ctx.calorieGoal),
    placeholder: "z. B. 2500",
}));
const __VLS_33 = __VLS_32({
    ...{ 'onSave': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showGoalPopup),
    modelValue: (__VLS_ctx.calorieGoal),
    placeholder: "z. B. 2500",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_35;
let __VLS_36;
let __VLS_37;
const __VLS_38 = {
    onSave: (__VLS_ctx.closeGoalPopup)
};
const __VLS_39 = {
    onCancel: (__VLS_ctx.closeGoalPopup)
};
var __VLS_34;
if (__VLS_ctx.toast) {
    /** @type {[typeof Toast, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(Toast, new Toast({
        toast: (__VLS_ctx.toast),
    }));
    const __VLS_41 = __VLS_40({
        toast: (__VLS_ctx.toast),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
}
/** @type {__VLS_StyleScopedClasses['nutrition']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-list']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-info']} */ ;
/** @type {__VLS_StyleScopedClasses['meal-kcal']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['no-meals']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['mini']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DashboardCard: DashboardCard,
            BasePopup: BasePopup,
            ExportPopup: ExportPopup,
            GoalPopup: GoalPopup,
            Toast: Toast,
            meal: meal,
            showMealPopup: showMealPopup,
            editingIndex: editingIndex,
            calorieGoal: calorieGoal,
            search: search,
            filter: filter,
            totalCalories: totalCalories,
            totalProtein: totalProtein,
            totalCarbs: totalCarbs,
            totalFat: totalFat,
            quickMeals: quickMeals,
            quickAdd: quickAdd,
            filteredMeals: filteredMeals,
            openMealPopup: openMealPopup,
            closeMealPopup: closeMealPopup,
            saveMeal: saveMeal,
            editMeal: editMeal,
            deleteMeal: deleteMeal,
            showGoalPopup: showGoalPopup,
            openGoalPopup: openGoalPopup,
            closeGoalPopup: closeGoalPopup,
            showExportPopup: showExportPopup,
            exportFormat: exportFormat,
            openExportPopup: openExportPopup,
            closeExportPopup: closeExportPopup,
            confirmExport: confirmExport,
            toast: toast,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
