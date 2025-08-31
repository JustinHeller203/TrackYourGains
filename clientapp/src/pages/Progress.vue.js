import { ref, computed, onMounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';
const weightHistory = ref([
    { date: '2025-05-28', weight: 76.4 },
    { date: '2025-05-27', weight: 76.2 }
]);
const workouts = ref([
    { exercise: 'Bankdrücken', weight: 80, reps: 8, date: new Date().toISOString() },
    { exercise: 'Kniebeuge', weight: 100, reps: 10, date: new Date().toISOString() }
]);
const meals = ref([
    { name: 'Frühstück', calories: 600 },
    { name: 'Mittagessen', calories: 850 },
    { name: 'Snack', calories: 300 }
]);
const newWeight = ref(null);
const goal = ref('Lean Bulk bis 80 kg 💪');
const newGoal = ref('');
const showWeightPopup = ref(false);
const showGoalPopup = ref(false);
const showValidationPopup = ref(false);
const validationErrorMessages = ref([]);
const validationOkButton = ref(null);
const weightInput = ref(null);
const goalInput = ref(null);
const toast = ref(null);
let toastId = 0;
let toastTimeout = null;
const lastWorkout = computed(() => workouts.value.length
    ? `${workouts.value[0].exercise} – ${workouts.value[0].weight}kg x ${workouts.value[0].reps}`
    : null);
const totalCalories = computed(() => meals.value.reduce((sum, meal) => sum + meal.calories, 0));
const currentWeight = computed(() => weightHistory.value.length ? weightHistory.value[0].weight.toString() : 'N/A');
const validateWeight = (weight) => {
    if (weight === null || isNaN(weight))
        return 'Gewicht muss eine Zahl sein';
    if (weight <= 0)
        return 'Gewicht muss größer als 0 sein';
    if (weight > 200)
        return 'Gewicht darf maximal 200 kg sein';
    return null;
};
const validateGoal = (goal) => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal)
        return 'Ziel darf nicht leer sein';
    if (trimmedGoal.length > 50)
        return 'Ziel darf maximal 50 Zeichen lang sein';
    return null;
};
const openWeightPopup = () => {
    newWeight.value = null;
    showWeightPopup.value = true;
    nextTick(() => {
        if (weightInput.value)
            weightInput.value.focus();
    });
};
const saveWeight = () => {
    const error = validateWeight(newWeight.value);
    if (error) {
        openValidationPopupError([error]);
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    weightHistory.value.unshift({ date: today, weight: Number(newWeight.value) });
    newWeight.value = null;
    updateWeightChart();
    addToast('Gewicht gespeichert', 'save');
    closeWeightPopup();
};
const closeWeightPopup = () => {
    showWeightPopup.value = false;
    newWeight.value = null;
};
const openGoalPopup = () => {
    newGoal.value = goal.value || '';
    showGoalPopup.value = true;
    nextTick(() => {
        if (goalInput.value)
            goalInput.value.focus();
    });
};
const saveGoal = () => {
    const error = validateGoal(newGoal.value);
    if (error) {
        openValidationPopupError([error]);
        return;
    }
    goal.value = newGoal.value.trim();
    addToast('Ziel gespeichert', 'save');
    closeGoalPopup();
};
const closeGoalPopup = () => {
    showGoal.value = false;
    newGoal.value = '';
};
const openValidationPopupError = (errors) => {
    validationErrorMessages.value = errors;
    showValidationPopup.value = true;
    nextTick(() => {
        if (validationOkButton.value)
            validationOkButton.value.focus();
    });
};
const closeValidationPopup = () => {
    showValidationPopup.value = false;
    validationErrorMessages.value = [];
};
const addToast = (message, type = 'default') => {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.value = null;
    }
    const emojis = { save: '💾', add: '✅', delete: '🗑️', default: 'ℹ️' };
    const types = {
        save: 'toast-save',
        add: 'toast-add',
        delete: 'toast-delete',
        default: 'toast-default'
    };
    toast.value = { id: toastId++, message, emoji: emojis[type], type: types[type], exiting: false };
    toastTimeout = setTimeout(() => {
        if (toast.value) {
            toast.value.exiting = true;
            setTimeout(() => {
                toast.value = null;
                toastTimeout = null;
            }, 300);
        }
    }, 3000);
};
let weightChart;
let workoutChart;
const updateWeightChart = () => {
    if (weightChart)
        weightChart.destroy();
    weightChart = new Chart(document.getElementById('weightChart'), {
        type: 'line',
        data: {
            labels: weightHistory.value.map(entry => entry.date).reverse(),
            datasets: [{
                    label: 'Gewicht (kg)',
                    data: weightHistory.value.map(entry => entry.weight).reverse(),
                    borderColor: '#4B6CB7',
                    backgroundColor: 'rgba(75, 108, 183, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: { backgroundColor: '#ffffff', titleColor: '#1a202c', bodyColor: '#4a5568' },
                legend: { labels: { color: '#1a202c' } }
            },
            scales: {
                x: { ticks: { color: '#4a5568' } },
                y: { beginAtZero: false, ticks: { color: '#4a5568' } }
            }
        }
    });
    if (document.documentElement.classList.contains('dark-mode')) {
        weightChart.options.plugins.tooltip.backgroundColor = '#21262d';
        weightChart.options.plugins.tooltip.titleColor = '#f0f6fc';
        weightChart.options.plugins.tooltip.bodyColor = '#c9d1d9';
        weightChart.options.plugins.legend.labels.color = '#f0f6fc';
        weightChart.options.scales.x.ticks.color = '#c9d1d9';
        weightChart.options.scales.y.ticks.color = '#c9d1d9';
        weightChart.data.datasets[0].borderColor = '#6B8DD6';
        weightChart.data.datasets[0].backgroundColor = 'rgba(107, 141, 214, 0.2)';
        weightChart.update();
    }
};
const updateWorkoutChart = () => {
    if (workoutChart)
        workoutChart.destroy();
    workoutChart = new Chart(document.getElementById('workoutChart'), {
        type: 'bar',
        data: {
            labels: workouts.value.map(w => w.exercise),
            datasets: [{
                    label: 'Gewicht (kg)',
                    data: workouts.value.map(w => w.weight),
                    backgroundColor: '#4B6CB7',
                    borderColor: '#182848',
                    borderWidth: 1
                }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: { backgroundColor: '#ffffff', titleColor: '#1a202c', bodyColor: '#4a5568' },
                legend: { labels: { color: '#1a202c' } }
            },
            scales: {
                x: { ticks: { color: '#4a5568' } },
                y: { beginAtZero: true, ticks: { color: '#4a5568' } }
            }
        }
    });
    if (document.documentElement.classList.contains('dark-mode')) {
        workoutChart.options.plugins.tooltip.backgroundColor = '#21262d';
        workoutChart.options.plugins.tooltip.titleColor = '#f0f6fc';
        workoutChart.options.plugins.tooltip.bodyColor = '#c9d1d9';
        workoutChart.options.plugins.legend.labels.color = '#f0f6fc';
        workoutChart.options.scales.x.ticks.color = '#c9d1d9';
        workoutChart.options.scales.y.ticks.color = '#c9d1d9';
        workoutChart.data.datasets[0].backgroundColor = '#6B8DD6';
        workoutChart.data.datasets[0].borderColor = '#4B6CB7';
        workoutChart.update();
    }
};
const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
        closeWeightPopup();
        closeGoalPopup();
        closeValidationPopup();
    }
};
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        closeWeightPopup();
        closeGoalPopup();
        closeValidationPopup();
    }
    else if (event.key === 'Enter') {
        if (showValidationPopup.value) {
            event.preventDefault();
            closeValidationPopup();
        }
        else if (showWeightPopup.value) {
            event.preventDefault();
            saveWeight();
        }
        else if (showGoalPopup.value) {
            event.preventDefault();
            saveGoal();
        }
    }
};
onMounted(() => {
    updateWeightChart();
    updateWorkoutChart();
    window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['progress']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
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
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-error-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress" },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "card-info" },
});
(__VLS_ctx.lastWorkout || 'Kein Training erfasst');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "card-info" },
});
(__VLS_ctx.totalCalories);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.openWeightPopup) },
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "card-info" },
});
(__VLS_ctx.currentWeight);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.openGoalPopup) },
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "card-info" },
});
(__VLS_ctx.goal || 'Kein Ziel gesetzt');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    id: "weightChart",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "card-info" },
});
(__VLS_ctx.workouts.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    id: "workoutChart",
});
if (__VLS_ctx.showWeightPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup edit-popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.saveWeight) },
        ...{ onKeydown: (__VLS_ctx.closeWeightPopup) },
        type: "number",
        placeholder: "Gewicht in kg",
        ...{ class: "edit-input" },
        ref: "weightInput",
    });
    (__VLS_ctx.newWeight);
    /** @type {typeof __VLS_ctx.weightInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.saveWeight) },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeWeightPopup) },
        ...{ class: "popup-btn cancel-btn" },
    });
}
if (__VLS_ctx.showGoalPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup edit-popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.saveGoal) },
        ...{ onKeydown: (__VLS_ctx.closeGoalPopup) },
        value: (__VLS_ctx.newGoal),
        type: "text",
        placeholder: "Ziel (z.B. Lean Bulk bis 80 kg)",
        ...{ class: "edit-input" },
        ref: "goalInput",
    });
    /** @type {typeof __VLS_ctx.goalInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.saveGoal) },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeGoalPopup) },
        ...{ class: "popup-btn cancel-btn" },
    });
}
if (__VLS_ctx.showValidationPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup edit-popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "validation-error-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "validation-error-list" },
    });
    for (const [error, index] of __VLS_getVForSourceType((__VLS_ctx.validationErrorMessages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (index),
        });
        (error);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeValidationPopup) },
        ...{ onKeydown: (__VLS_ctx.closeValidationPopup) },
        ...{ onKeydown: (__VLS_ctx.closeValidationPopup) },
        ...{ class: "popup-btn save-btn" },
        ref: "validationOkButton",
    });
    /** @type {typeof __VLS_ctx.validationOkButton} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toast-container" },
});
if (__VLS_ctx.toast) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ([__VLS_ctx.toast.type, { 'toast-exit': __VLS_ctx.toast.exiting }]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toast-emoji" },
    });
    (__VLS_ctx.toast.emoji);
    (__VLS_ctx.toast.message);
}
/** @type {__VLS_StyleScopedClasses['progress']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-error-list']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-container']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-exit']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-emoji']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            workouts: workouts,
            newWeight: newWeight,
            goal: goal,
            newGoal: newGoal,
            showWeightPopup: showWeightPopup,
            showGoalPopup: showGoalPopup,
            showValidationPopup: showValidationPopup,
            validationErrorMessages: validationErrorMessages,
            validationOkButton: validationOkButton,
            weightInput: weightInput,
            goalInput: goalInput,
            toast: toast,
            lastWorkout: lastWorkout,
            totalCalories: totalCalories,
            currentWeight: currentWeight,
            openWeightPopup: openWeightPopup,
            saveWeight: saveWeight,
            closeWeightPopup: closeWeightPopup,
            openGoalPopup: openGoalPopup,
            saveGoal: saveGoal,
            closeGoalPopup: closeGoalPopup,
            closeValidationPopup: closeValidationPopup,
            handleOverlayClick: handleOverlayClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
