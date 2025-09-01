import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import Chart from 'chart.js/auto';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { useUnits, KG_PER_LB } from '@/composables/useUnits';
import Toast from '@/components/ui/Toast.vue';
import DashboardCard from '@/components/ui/DashboardCard.vue';
import WeightPopup from '@/components/ui/popups/WeightPopup.vue';
import GoalPopup from '@/components/ui/popups/GoalPopup.vue';
import ExportPopup from '@/components/ui/popups/ExportPopup.vue';
import TabsBar from '@/components/ui/TabsBar.vue';
import ChartCard from '@/components/ui/charts/ChartCard.vue';
import BmiCalculator from '@/components/ui/calculators/BmiCalculator.vue';
import CaloriesCalculator from '@/components/ui/calculators/CaloriesCalculator.vue';
import OneRmCalculator from '@/components/ui/calculators/OneRmCalculator.vue';
import BodyFatCalculator from '@/components/ui/calculators/BodyFatCalculator.vue';
import FfmiCalculator from '@/components/ui/calculators/FfmiCalculator.vue';
import WaterCalculator from '@/components/ui/calculators/WaterCalculator.vue';
import ProteinCalculator from '@/components/ui/calculators/ProteinCalculator.vue';
import CaffeineSafeDoseCalculator from '@/components/ui/calculators/CaffeineSafeDoseCalculator.vue';
import GlycemicLoadCalculator from '@/components/ui/calculators/GlycemicLoadCalculator.vue';
// Refs
const { unit, kgToDisplay, displayToKg, formatWeight } = useUnits();
const trainingPlans = ref([]);
const weightHistory = ref([
    { date: '2025-05-28', weight: 76.4 },
    { date: '2025-05-27', weight: 76.2 },
]);
const workouts = ref([
    { exercise: 'Bankdrücken', weight: 80, reps: 8, date: new Date().toISOString(), planId: undefined },
    { exercise: 'Kniebeuge', weight: 100, reps: 10, date: new Date().toISOString(), planId: undefined },
]);
const meals = ref([
    { name: 'Frühstück', calories: 600 },
    { name: 'Mittagessen', calories: 850 },
    { name: 'Snack', calories: 300 },
]);
// Glykämische Last
const glFood = ref('');
const glServing = ref(null);
const glCarbs100 = ref(null);
const glGi = ref(null);
const glResult = ref(null);
const newWeight = ref(null);
const goal = ref(null);
const newGoal = ref(null);
const showWeightPopup = ref(false);
const showGoalPopup = ref(false);
const showProgressPopup = ref(false);
const showValidationPopup = ref(false);
const showDownloadPopup = ref(false);
const validationErrorMessages = ref([]);
const toast = ref(null);
const weightInput = ref(null);
const goalInput = ref(null);
const progressExerciseInput = ref(null);
const progressWeightInput = ref(null);
const downloadFormatInput = ref(null);
const validationOkButton = ref(null);
const downloadFormat = ref('html');
const downloadCalculator = ref(null);
const downloadPlanId = ref(null);
const searchQuery = ref('');
const currentPlanId = ref(null);
const currentExercise = ref('');
const newProgressWeight = ref(null);
const newProgressReps = ref(null);
let toastId = 0;
let toastTimeout = null;
const activeTab = ref('stats');
// Calculator Data
const bmiGender = ref('male');
const bmiWeight = ref(null);
const bmiHeight = ref(null);
const bmiResult = ref(null);
const proteinActivity = ref('low');
const proteinMeals = ref(null);
const calorieAge = ref(null);
const calorieGender = ref('male');
const calorieWeight = ref(null);
const calorieHeight = ref(null);
const calorieActivity = ref('1.2');
const calorieGoal = ref(0);
const calorieResult = ref(null);
const proteinWeight = ref(null);
const proteinGoal = ref('maintain');
const proteinResult = ref(null);
// Abgeleitete Liste für das Template-Header-Check
const favoriteCalcs = computed(() => Array.from(favoriteCalculators.value));
const cafWeight = ref(null);
const cafSensitivity = ref('normal');
const cafStatus = ref('none');
const cafResult = ref(null);
const isFavorite = (id) => isFavCalculator(id);
const toggleFavorite = (id) => toggleFavCalculator(id);
const oneRmExercise = ref('');
const oneRmWeight = ref(null);
const oneRmReps = ref(null);
const oneRmResult = ref(null);
const bodyFatGender = ref('male');
const bodyFatWaist = ref(null);
const bodyFatNeck = ref(null);
const bodyFatHip = ref(null);
const bodyFatHeight = ref(null);
const bodyFatResult = ref(null);
const toastsEnabled = ref(true);
const ffmiWeight = ref(null);
const ffmiHeight = ref(null);
const ffmiBodyFat = ref(null);
const ffmiResult = ref(null);
const waterWeight = ref(null);
const waterActivity = ref('low');
const waterClimate = ref('temperate');
const waterResult = ref(null);
const planSearchQuery = ref('');
const maxEntries = ref(3);
const editingEntry = ref(null);
// Zustand für "Mehr anzeigen"
const showMore = ref({});
const autoCalcEnabled = ref(false);
function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        if (t)
            clearTimeout(t);
        t = window.setTimeout(() => fn(...args), wait);
    };
}
const editProgressEntry = (planId, entry) => {
    currentPlanId.value = planId;
    currentExercise.value = entry.exercise;
    newProgressWeight.value = kgToDisplay(entry.weight);
    newProgressReps.value = entry.reps;
    editingEntry.value = entry;
    showProgressPopup.value = true;
};
const matchesPlanSearch = (name) => {
    if (!planSearchQuery.value)
        return true;
    return name.toLowerCase().includes(planSearchQuery.value.toLowerCase());
};
const deleteProgressEntry = (planId, date) => {
    workouts.value = workouts.value.filter(w => !(w.planId === planId && w.date === date));
    showToast({ message: 'Eintrag gelöscht!', type: 'success', emoji: '🗑️' });
};
const calculateProgress = (planId) => {
    const today = new Date().toISOString().split('T')[0];
    const progressEntries = getProgressForPlan(planId).filter(entry => entry.date.startsWith(today));
    const totalExercises = trainingPlans.value.find(p => p.id === planId)?.exercises.length || 1;
    return Math.min((progressEntries.length / totalExercises) * 100, 100);
};
const currentWeightDisplay = computed(() => weightHistory.value.length ? formatWeight(weightHistory.value[0].weight, 1) : 'N/A');
// Begrenzt die angezeigten Einträge
const displayedEntries = (planId) => {
    const entries = getProgressForPlan(planId);
    if (showMore.value[planId]) {
        return entries;
    }
    return entries.slice(0, maxEntries.value);
};
const toggleShowMore = (planId) => {
    showMore.value[planId] = !showMore.value[planId];
};
// Computed Properties
const lastWorkout = computed(() => workouts.value.length
    ? `${workouts.value[0].exercise} – ${formatWeight(workouts.value[0].weight, 0)} x ${workouts.value[0].reps}`
    : null);
const totalCalories = computed(() => meals.value.reduce((sum, meal) => sum + meal.calories, 0));
const currentWeight = computed(() => weightHistory.value.length ? weightHistory.value[0].weight.toString() : 'N/A');
const initialWeight = computed(() => weightHistory.value.length ? weightHistory.value[weightHistory.value.length - 1].weight : null);
const matchesSearch = (calculatorName) => {
    if (!searchQuery.value)
        return true;
    return calculatorName.toLowerCase().includes(searchQuery.value.toLowerCase());
};
const validateProtein = () => {
    const errors = [];
    const w = Number(proteinWeight.value);
    if (!Number.isFinite(w) || w <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    if (!proteinGoal.value)
        errors.push('Ziel muss ausgewählt sein');
    return errors;
};
const calculateProtein = () => {
    const errors = validateProtein();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const weightKg = unit.value === 'kg' ? Number(proteinWeight.value) : Number(proteinWeight.value) * KG_PER_LB;
    let factor = 1.6;
    let range = {};
    if (proteinGoal.value === 'maintain') {
        factor = 1.6;
        range = { min: 1.4 * weightKg, max: 1.8 * weightKg };
    }
    else if (proteinGoal.value === 'bulk') {
        factor = 2.0;
        range = { min: 1.8 * weightKg, max: 2.2 * weightKg };
    }
    else if (proteinGoal.value === 'cut') {
        factor = 2.2;
        range = { min: 2.0 * weightKg, max: 2.6 * weightKg };
    }
    const recommend = factor * weightKg;
    proteinResult.value = {
        recommend,
        min: range.min,
        max: range.max,
        factor,
        weightDisplay: `${proteinWeight.value} ${unit.value}`
    };
    addToast('Proteinbedarf berechnet', 'default');
    saveToLocalStorage('protein', {
        weight: proteinWeight.value,
        goal: proteinGoal.value,
        result: proteinResult.value
    });
};
const copyProtein = () => {
    if (!proteinResult.value)
        return;
    const r = proteinResult.value;
    const rangeLine = (r.min && r.max) ? `\n- Range: ${r.min.toFixed(0)}–${r.max.toFixed(0)} g/Tag` : '';
    const txt = `Proteinbedarf
- Empfehlung: ${r.recommend.toFixed(0)} g/Tag${rangeLine}
- Faktor: ${r.factor.toFixed(2)} g/kg
- Gewicht: ${r.weightDisplay}
- Ziel: ${proteinGoal.value}`;
    copyText(txt);
};
const getProgressForPlan = (planId) => {
    return workouts.value.filter((workout) => workout.planId === planId);
};
const getExercisesForPlan = (planId) => {
    if (!planId)
        return [];
    const plan = trainingPlans.value.find((p) => p.id === planId);
    return plan ? plan.exercises : [];
};
const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
// Validation Functions
const validateWeight = (weight) => {
    if (weight === null || isNaN(weight))
        return 'Gewicht muss eine Zahl sein';
    if (weight <= 0)
        return 'Gewicht muss größer als 0 sein';
    const kg = displayToKg(Number(weight));
    if (kg > 200)
        return 'Gewicht darf maximal 200 kg sein';
    return null;
};
const validateGoal = (g) => {
    if (g === null || isNaN(g))
        return 'Zielgewicht muss eine Zahl sein';
    if (g <= 0)
        return 'Zielgewicht muss größer als 0 sein';
    const kg = displayToKg(Number(g));
    if (kg > 200)
        return 'Zielgewicht darf maximal 200 kg sein';
    return null;
};
const validateProgress = () => {
    const errors = [];
    if (!currentExercise.value)
        errors.push('Eine Übung muss ausgewählt sein');
    if (newProgressWeight.value === null || isNaN(newProgressWeight.value) || newProgressWeight.value <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    if (newProgressReps.value === null || isNaN(newProgressReps.value) || newProgressReps.value <= 0)
        errors.push('Wiederholungen müssen größer als 0 sein');
    return errors;
};
const validateBMI = () => {
    const errors = [];
    if (!bmiGender.value)
        errors.push('Geschlecht muss ausgewählt sein');
    if (bmiWeight.value === null || isNaN(bmiWeight.value) || bmiWeight.value <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    if (bmiHeight.value === null || isNaN(bmiHeight.value) || bmiHeight.value <= 0)
        errors.push('Größe muss größer als 0 sein');
    return errors;
};
function startToastExit(id) {
    if (!toast.value || toast.value.id !== id)
        return;
    toast.value.exiting = true;
    setTimeout(() => { toast.value = null; }, 300);
}
const resetWeightStats = () => {
    weightHistory.value = [];
    if (weightChart)
        weightChart.destroy();
    updateWeightChart();
    addToast('Gewichtsverlauf zurückgesetzt', 'default');
};
const resetWorkoutStats = () => {
    workouts.value = [];
    localStorage.setItem('progress_workouts', JSON.stringify(workouts.value));
    if (workoutChart)
        workoutChart.destroy();
    updateWorkoutChart();
    addToast('Trainingsstatistik zurückgesetzt', 'default');
};
const validateCalories = () => {
    const errors = [];
    if (calorieAge.value === null || isNaN(calorieAge.value) || calorieAge.value <= 0)
        errors.push('Alter muss größer als 0 sein');
    if (calorieWeight.value === null || isNaN(calorieWeight.value) || calorieWeight.value <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    if (calorieHeight.value === null || isNaN(calorieHeight.value) || calorieHeight.value <= 0)
        errors.push('Größe muss größer als 0 sein');
    return errors;
};
const validateOneRm = () => {
    const errors = [];
    if (oneRmWeight.value === null || isNaN(oneRmWeight.value) || oneRmWeight.value <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    if (oneRmReps.value === null || isNaN(oneRmReps.value) || oneRmReps.value <= 0)
        errors.push('Wiederholungen müssen größer als 0 sein');
    return errors;
};
const validateBodyFat = () => {
    const errors = [];
    if (bodyFatWaist.value === null || isNaN(bodyFatWaist.value) || bodyFatWaist.value <= 0)
        errors.push('Bauchumfang muss größer als 0 sein');
    if (bodyFatNeck.value === null || isNaN(bodyFatNeck.value) || bodyFatNeck.value <= 0)
        errors.push('Halsumfang muss größer als 0 sein');
    if (bodyFatHeight.value === null || isNaN(bodyFatHeight.value) || bodyFatHeight.value <= 0)
        errors.push('Größe muss größer als 0 sein');
    if (bodyFatGender.value === 'female' && (bodyFatHip.value === null || isNaN(bodyFatHip.value) || bodyFatHip.value <= 0))
        errors.push('Hüftumfang muss größer als 0 sein');
    return errors;
};
const validateFFMI = () => {
    const errors = [];
    if (ffmiWeight.value === null || isNaN(ffmiWeight.value) || ffmiWeight.value <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    if (ffmiHeight.value === null || isNaN(ffmiHeight.value) || ffmiHeight.value <= 0)
        errors.push('Größe muss größer als 0 sein');
    if (ffmiBodyFat.value === null || isNaN(ffmiBodyFat.value) || ffmiBodyFat.value < 0 || ffmiBodyFat.value > 100)
        errors.push('Körperfettanteil muss zwischen 0 und 100% liegen');
    return errors;
};
const validateWater = () => {
    const errors = [];
    if (waterWeight.value === null || isNaN(waterWeight.value) || waterWeight.value <= 0)
        errors.push('Gewicht muss größer als 0 sein');
    return errors;
};
// Calculator Logic
const calculateBMI = () => {
    const errors = validateBMI();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const weightKg = unit.value === 'kg' ? Number(bmiWeight.value) : Number(bmiWeight.value) * KG_PER_LB;
    const heightM = Number(bmiHeight.value) / 100;
    const bmi = weightKg / (heightM * heightM);
    let category = '';
    if (bmiGender.value === 'male') {
        if (bmi < 18.5)
            category = 'Untergewicht';
        else if (bmi < 25)
            category = 'Normalgewicht';
        else if (bmi < 30)
            category = 'Übergewicht';
        else
            category = 'Adipositas';
    }
    else {
        if (bmi < 19)
            category = 'Untergewicht';
        else if (bmi < 26)
            category = 'Normalgewicht';
        else if (bmi < 31)
            category = 'Übergewicht';
        else
            category = 'Adipositas';
    }
    bmiResult.value = { value: bmi, category };
    addToast('BMI berechnet', 'default');
    saveToLocalStorage('bmi', {
        gender: bmiGender.value,
        weight: bmiWeight.value,
        height: bmiHeight.value,
        result: bmiResult.value,
    });
};
const calculateCalories = () => {
    const errors = validateCalories();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    let bmr = 0;
    const weightKg = unit.value === 'kg' ? Number(calorieWeight.value) : Number(calorieWeight.value) * KG_PER_LB;
    const height = Number(calorieHeight.value);
    const age = Number(calorieAge.value);
    if (calorieGender.value === 'male') {
        bmr = 88.362 + 13.397 * weightKg + 4.799 * height - 5.677 * age;
    }
    else {
        bmr = 447.593 + 9.247 * weightKg + 3.098 * height - 4.330 * age;
    }
    const activityFactor = Number(calorieActivity.value);
    const maintenance = bmr * activityFactor;
    const total = maintenance + Number(calorieGoal.value);
    const macros = {
        carbs: (total * 0.5) / 4,
        protein: (total * 0.3) / 4,
        fat: (total * 0.2) / 9,
    };
    calorieResult.value = { total, macros };
    updateMacroChart();
    addToast('Kalorienbedarf berechnet', 'default');
    saveToLocalStorage('calories', {
        age,
        gender: calorieGender.value,
        weight: calorieWeight.value,
        height: calorieHeight.value,
        activity: calorieActivity.value,
        goal: calorieGoal.value,
        result: calorieResult.value,
    });
};
const calculators = ref([
    { key: 'BMI', name: 'BMI-Rechner', isFavorite: false },
    { key: 'Kalorienbedarf', name: 'Kalorienbedarfsrechner', isFavorite: false },
    { key: '1RM', name: '1RM-Rechner', isFavorite: false },
    { key: 'Körperfett', name: 'Körperfett-Rechner', isFavorite: false },
    { key: 'FFMI', name: 'FFMI-Rechner', isFavorite: false },
    { key: 'Wasserbedarf', name: 'Wasserbedarfsrechner', isFavorite: false },
    { key: 'Proteinbedarf', name: 'Proteinbedarfsrechner', isFavorite: false },
    { key: 'Glykämische Last', name: 'GL-Rechner', isFavorite: false },
    { key: 'Koffein', name: 'Koffein – sichere Dosis', isFavorite: false },
]);
const sortedCalculators = computed(() => {
    return calculators.value
        .filter(c => matchesSearch(c.key))
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
});
const getCalculatorComponent = (key) => {
    switch (key) {
        case 'BMI': return 'BmiCalculator';
        case 'Kalorienbedarf': return 'CaloriesCalculator';
        case '1RM': return 'OneRmCalculator';
        case 'Körperfett': return 'BodyFatCalculator';
        case 'FFMI': return 'FfmiCalculator';
        case 'Wasserbedarf': return 'WaterCalculator';
        default: return 'div';
    }
};
const calculateOneRm = () => {
    const errors = validateOneRm();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const weightKg = unit.value === 'kg' ? Number(oneRmWeight.value) : Number(oneRmWeight.value) * KG_PER_LB;
    const reps = Number(oneRmReps.value);
    const oneRmKg = weightKg * (1 + reps / 30);
    oneRmResult.value = oneRmKg;
    addToast('1RM berechnet', 'default');
    saveToLocalStorage('oneRm', {
        exercise: oneRmExercise.value,
        weight: oneRmWeight.value,
        reps,
        result: oneRmResult.value,
    });
};
const calcCategory = ref('alle');
const CALC_CATEGORY = {
    'BMI': 'gesundheit',
    'Kalorienbedarf': 'ernaehrung',
    '1RM': 'kraft',
    'Körperfett': 'gesundheit',
    'FFMI': 'gesundheit',
    'Wasserbedarf': 'alltag',
    'Proteinbedarf': 'ernaehrung',
    'Koffein': 'alltag',
    'Glykämische Last': 'ernaehrung',
};
const validateCaffeine = () => {
    const errors = [];
    if (cafWeight.value === null || isNaN(cafWeight.value) || cafWeight.value <= 0) {
        errors.push('Gewicht muss größer als 0 sein');
    }
    return errors;
};
const validateGlyLoad = () => {
    const errors = [];
    if (!glFood.value.trim())
        errors.push('Lebensmittel muss angegeben werden');
    if (glServing.value === null || isNaN(glServing.value) || glServing.value <= 0)
        errors.push('Portionsgröße muss größer als 0 g sein');
    if (glCarbs100.value === null || isNaN(glCarbs100.value) || glCarbs100.value < 0)
        errors.push('Kohlenhydrate pro 100 g müssen ≥ 0 g sein');
    if (glGi.value === null || isNaN(glGi.value) || glGi.value < 0 || glGi.value > 110)
        errors.push('Glykämischer Index muss zwischen 0 und 110 liegen');
    return errors;
};
const calculateGlyLoad = () => {
    const errors = validateGlyLoad();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const serving = Number(glServing.value);
    const carbs100 = Number(glCarbs100.value);
    const gi = Number(glGi.value);
    const carbsPerServing = (carbs100 * serving) / 100;
    const gl = (gi / 100) * carbsPerServing;
    let category = 'niedrig';
    if (gl >= 20)
        category = 'hoch';
    else if (gl >= 10)
        category = 'mittel';
    glResult.value = { gl, category };
    addToast('Glykämische Last berechnet', 'default');
    saveToLocalStorage('glyload', {
        food: glFood.value,
        serving: serving,
        carbs100: carbs100,
        gi: gi,
        result: glResult.value,
    });
};
const copyGlyLoad = () => {
    if (!glResult.value)
        return;
    const r = glResult.value;
    const txt = `Glykämische Last
- Lebensmittel: ${glFood.value || '-'}
- Portion: ${glServing.value ?? '-'} g
- KH (pro 100 g): ${glCarbs100.value ?? '-'} g
- GI: ${glGi.value ?? '-'}
- GL (Portion): ${r.gl.toFixed(1)} (${r.category})`;
    copyText(txt);
};
const calculateCaffeine = () => {
    const errors = validateCaffeine();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const kg = unit.value === 'kg'
        ? Number(cafWeight.value)
        : Number(cafWeight.value) * KG_PER_LB;
    let mgPerKg = 4;
    if (cafSensitivity.value === 'low')
        mgPerKg = 3;
    if (cafSensitivity.value === 'high')
        mgPerKg = 6;
    let dayCap = 400;
    if (cafStatus.value === 'pregnant')
        dayCap = 200;
    const perDay = Math.min(Math.round(mgPerKg * kg), dayCap);
    const perDose = Math.min(Math.round(perDay / 2), 200);
    cafResult.value = { perDose, perDay };
    addToast('Koffein-Empfehlung berechnet', 'default');
    saveToLocalStorage('caffeine', {
        weight: cafWeight.value,
        sensitivity: cafSensitivity.value,
        status: cafStatus.value,
        result: cafResult.value,
    });
};
const copyCaffeine = () => {
    if (!cafResult.value)
        return;
    const r = cafResult.value;
    const txt = `Koffein – sichere Dosis
- Max. pro Tag: ${r.perDay} mg
- Empfehlung je Einzeldosis: ${r.perDose} mg
- Gewicht: ${cafWeight.value ?? '-'} ${unit.value}
- Empfindlichkeit: ${cafSensitivity.value}
- Status: ${cafStatus.value}`;
    copyText(txt);
};
const matchesCalc = (key) => {
    const searchOk = matchesSearch(key);
    const category = CALC_CATEGORY[key] ?? 'alle';
    const categoryOk = calcCategory.value === 'alle' || category === calcCategory.value;
    return searchOk && categoryOk;
};
const calculateBodyFat = () => {
    const errors = validateBodyFat();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const waist = Number(bodyFatWaist.value);
    const neck = Number(bodyFatNeck.value);
    const height = Number(bodyFatHeight.value);
    let bodyFat = 0;
    if (bodyFatGender.value === 'male') {
        bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    }
    else {
        const hip = Number(bodyFatHip.value);
        bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    }
    bodyFatResult.value = Math.max(0, bodyFat);
    addToast('Körperfett berechnet', 'default');
    saveToLocalStorage('bodyFat', {
        gender: bodyFatGender.value,
        waist,
        neck,
        hip: bodyFatHip.value,
        height,
        result: bodyFatResult.value,
    });
};
const calculateFFMI = () => {
    const errors = validateFFMI();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const weightKg = unit.value === 'kg' ? Number(ffmiWeight.value) : Number(ffmiWeight.value) * KG_PER_LB;
    const heightM = Number(ffmiHeight.value) / 100;
    const bodyFat = Number(ffmiBodyFat.value) / 100;
    const leanMass = weightKg * (1 - bodyFat);
    const ffmi = leanMass / (heightM * heightM) + 6.1 * (1.8 - heightM);
    let category = '';
    if (ffmi < 18)
        category = 'Unterdurchschnittlich';
    else if (ffmi < 20)
        category = 'Durchschnittlich';
    else if (ffmi < 22)
        category = 'Überdurchschnittlich';
    else if (ffmi < 25)
        category = 'Sehr muskulös';
    else
        category = 'Extrem muskulös';
    ffmiResult.value = { value: ffmi, category };
    addToast('FFMI berechnet', 'default');
    saveToLocalStorage('ffmi', {
        weight: ffmiWeight.value,
        height: ffmiHeight.value,
        bodyFat: ffmiBodyFat.value,
        result: ffmiResult.value,
    });
};
const calculateWater = () => {
    const errors = validateWater();
    if (errors.length) {
        openValidationPopupError(errors);
        return;
    }
    const weightKg = unit.value === 'kg' ? Number(waterWeight.value) : Number(waterWeight.value) * KG_PER_LB;
    let baseWater = weightKg * 0.035;
    if (waterActivity.value === 'moderate')
        baseWater += 0.5;
    else if (waterActivity.value === 'high')
        baseWater += 1.0;
    if (waterClimate.value === 'hot')
        baseWater += 0.5;
    if (waterClimate.value === 'very_hot')
        baseWater += 1.0;
    waterResult.value = Math.max(1.5, baseWater);
    addToast('Wasserbedarf berechnet', 'default');
    saveToLocalStorage('water', {
        weight: waterWeight.value,
        activity: waterActivity.value,
        climate: waterClimate.value,
        result: waterResult.value,
    });
};
const resetCalculator = (calculator) => {
    switch (calculator) {
        case 'bmi':
            bmiGender.value = 'male';
            bmiWeight.value = null;
            bmiHeight.value = null;
            bmiResult.value = null;
            localStorage.removeItem('progress_bmi');
            addToast('BMI-Rechner zurückgesetzt', 'reset');
            break;
        case 'calories':
            calorieAge.value = null;
            calorieGender.value = 'male';
            calorieWeight.value = null;
            calorieHeight.value = null;
            calorieActivity.value = '1.2';
            calorieGoal.value = 0;
            calorieResult.value = null;
            localStorage.removeItem('progress_calories');
            addToast('Kalorienbedarfsrechner zurückgesetzt', 'reset');
            break;
        case 'oneRm':
            oneRmExercise.value = '';
            oneRmWeight.value = null;
            oneRmReps.value = null;
            oneRmResult.value = null;
            localStorage.removeItem('progress_oneRm');
            addToast('1RM-Rechner zurückgesetzt', 'reset');
            break;
        case 'bodyFat':
            bodyFatGender.value = 'male';
            bodyFatWaist.value = null;
            bodyFatNeck.value = null;
            bodyFatHip.value = null;
            bodyFatHeight.value = null;
            bodyFatResult.value = null;
            localStorage.removeItem('progress_bodyFat');
            addToast('Körperfett-Rechner zurückgesetzt', 'reset');
            break;
        case 'ffmi':
            ffmiWeight.value = null;
            ffmiHeight.value = null;
            ffmiBodyFat.value = null;
            ffmiResult.value = null;
            localStorage.removeItem('progress_ffmi');
            addToast('FFMI-Rechner zurückgesetzt', 'reset');
            break;
        case 'water':
            waterWeight.value = null;
            waterActivity.value = 'low';
            waterClimate.value = 'temperate';
            waterResult.value = null;
            localStorage.removeItem('progress_water');
            addToast('Wasserbedarfsrechner zurückgesetzt', 'reset');
            break;
        case 'protein':
            proteinWeight.value = null;
            proteinGoal.value = 'maintain';
            proteinResult.value = null;
            localStorage.removeItem('progress_protein');
            addToast('Proteinbedarf-Rechner zurückgesetzt', 'reset');
            break;
        case 'caffeine':
            cafWeight.value = null;
            cafSensitivity.value = 'normal';
            cafStatus.value = 'none';
            cafResult.value = null;
            localStorage.removeItem('progress_caffeine');
            addToast('Koffein-Rechner zurückgesetzt', 'reset');
            break;
        case 'glyload':
            glFood.value = '';
            glServing.value = null;
            glCarbs100.value = null;
            glGi.value = null;
            glResult.value = null;
            localStorage.removeItem('progress_glyload');
            addToast('GL-Rechner zurückgesetzt', 'reset');
            break;
    }
};
const openProgressPopup = (planId) => {
    currentPlanId.value = planId;
    currentExercise.value = getExercisesForPlan(planId)[0]?.exercise || '';
    newProgressWeight.value = null;
    newProgressReps.value = null;
    showProgressPopup.value = true;
    nextTick(() => {
        if (progressExerciseInput.value)
            progressExerciseInput.value.focus();
    });
};
const saveProgress = () => {
    if (!currentExercise.value || !newProgressWeight.value || !newProgressReps.value) {
        validationErrorMessages.value = ['Bitte alle Felder ausfüllen.'];
        showValidationPopup.value = true;
        return;
    }
    if (editingEntry.value) {
        const index = workouts.value.findIndex(w => w.planId === currentPlanId.value && w.date === editingEntry.value.date);
        if (index !== -1) {
            workouts.value[index] = {
                planId: currentPlanId.value,
                exercise: currentExercise.value,
                weight: displayToKg(Number(newProgressWeight.value)),
                reps: Number(newProgressReps.value),
                date: editingEntry.value.date,
            };
            showToast({ message: 'Fortschritt aktualisiert!', type: 'success', emoji: '✅' });
        }
        editingEntry.value = null;
    }
    else {
        const weightKg = displayToKg(Number(newProgressWeight.value));
        workouts.value.push({
            planId: currentPlanId.value,
            exercise: currentExercise.value,
            weight: weightKg,
            reps: Number(newProgressReps.value),
            date: new Date().toISOString(),
        });
        checkMilestones(currentPlanId.value, currentExercise.value, newProgressWeight.value, newProgressReps.value);
        showToast({ message: 'Fortschritt gespeichert!', type: 'success', emoji: '✅' });
    }
    closeProgressPopup();
};
function showToast(opts) {
    const mapped = opts.type === 'success' ? 'add' : (opts.type ?? 'default');
    addToast(opts.message, mapped);
}
const closeProgressPopup = () => {
    showProgressPopup.value = false;
    currentPlanId.value = null;
    currentExercise.value = '';
    newProgressWeight.value = null;
    newProgressReps.value = null;
};
// clean version
const openDownloadPopup = (calculator, planId) => {
    downloadCalculator.value = calculator;
    downloadPlanId.value = planId || null;
    downloadFormat.value = 'html';
    showDownloadPopup.value = true;
};
const closeDownloadPopup = () => {
    showDownloadPopup.value = false;
    downloadCalculator.value = null;
    downloadPlanId.value = null;
    downloadFormat.value = 'html';
};
const confirmDownload = () => {
    if (!downloadCalculator.value)
        return;
    let data = {};
    let filename = '';
    let content = '';
    let type = '';
    switch (downloadCalculator.value) {
        case 'bmi':
            if (!bmiResult.value) {
                addToast('Kein BMI-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                gender: bmiGender.value,
                weight: bmiWeight.value,
                height: bmiHeight.value,
                bmi: bmiResult.value.value.toFixed(1),
                category: bmiResult.value.category,
            };
            filename = 'bmi_result';
            break;
        case 'calories':
            if (!calorieResult.value) {
                addToast('Kein Kalorienbedarf-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                age: calorieAge.value,
                gender: calorieGender.value,
                weight: calorieWeight.value,
                height: calorieHeight.value,
                activity: calorieActivity.value,
                goal: calorieGoal.value,
                total: calorieResult.value.total.toFixed(0),
                macros: {
                    carbs: calorieResult.value.macros.carbs.toFixed(0),
                    protein: calorieResult.value.macros.protein.toFixed(0),
                    fat: calorieResult.value.macros.fat.toFixed(0),
                },
            };
            filename = 'calorie_result';
            break;
        case 'oneRm':
            if (!oneRmResult.value) {
                addToast('Kein 1RM-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                exercise: oneRmExercise.value,
                weight: oneRmWeight.value,
                reps: oneRmReps.value,
                oneRm: oneRmResult.value.toFixed(1),
            };
            filename = 'one_rm_result';
            break;
        case 'bodyFat':
            if (!bodyFatResult.value) {
                addToast('Kein Körperfett-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                gender: bodyFatGender.value,
                waist: bodyFatWaist.value,
                neck: bodyFatNeck.value,
                hip: bodyFatHip.value,
                height: bodyFatHeight.value,
                bodyFat: bodyFatResult.value.toFixed(1),
            };
            filename = 'bodyFat_result';
            break;
        case 'ffmi':
            if (!ffmiResult.value) {
                addToast('Kein FFMI-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                weight: ffmiWeight.value,
                height: ffmiHeight.value,
                bodyFat: ffmiBodyFat.value,
                ffmi: ffmiResult.value.value.toFixed(1),
                category: ffmiResult.value.category,
            };
            filename = 'ffmi_result';
            break;
        case 'water':
            if (!waterResult.value) {
                addToast('Kein Wasserbedarf-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                weight: waterWeight.value,
                activity: waterActivity.value,
                climate: waterClimate.value,
                water: waterResult.value.toFixed(1),
            };
            filename = 'water_result';
            break;
        case 'protein':
            if (!proteinResult.value) {
                addToast('Kein Protein-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                weight: proteinWeight.value,
                unit: unit.value,
                goal: proteinGoal.value,
                recommend_g_per_day: proteinResult.value.recommend.toFixed(0),
                range_g_per_day: proteinResult.value.min && proteinResult.value.max
                    ? `${proteinResult.value.min.toFixed(0)}–${proteinResult.value.max.toFixed(0)}`
                    : null,
                factor_g_per_kg: proteinResult.value.factor.toFixed(2),
            };
            filename = 'protein_result';
            break;
        case 'caffeine':
            if (!cafResult.value) {
                addToast('Kein Koffein-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                weight: cafWeight.value,
                unit: unit.value,
                sensitivity: cafSensitivity.value,
                status: cafStatus.value,
                per_dose_mg: cafResult.value.perDose,
                per_day_mg: cafResult.value.perDay,
            };
            filename = 'caffeine_result';
            break;
        case 'progress': {
            if (!downloadPlanId.value) {
                addToast('Kein Plan ausgewählt', 'default');
                closeDownloadPopup();
                return;
            }
            const plan = trainingPlans.value.find(p => p.id === downloadPlanId.value);
            const progress = getProgressForPlan(downloadPlanId.value);
            if (!progress.length) {
                addToast('Kein Fortschritt zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                planName: plan?.name || 'Unbekannter Plan',
                progress: progress.map((entry) => ({
                    exercise: entry.exercise,
                    weight: entry.weight,
                    reps: entry.reps,
                    date: formatDate(entry.date),
                })),
            };
            filename = `progress_${(plan?.name || 'plan').toLowerCase().replace(/\s+/g, '_')}`;
            break;
        }
        case 'glyload':
            if (!glResult.value) {
                addToast('Kein GL-Ergebnis zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                food: glFood.value,
                serving_g: glServing.value,
                carbs_per_100g_g: glCarbs100.value,
                gi: glGi.value,
                gl_per_serving: glResult.value.gl.toFixed(1),
                category: glResult.value.category,
            };
            filename = 'glycemic_load_result';
            break;
        case 'weightStats': {
            if (!weightHistory.value.length) {
                addToast('Kein Gewichtsverlauf zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                series: weightHistory.value.map(e => ({
                    date: formatDate(e.date),
                    weight_display: formatWeight(e.weight, 1),
                    weight_raw_kg: e.weight
                }))
            };
            filename = 'weight_stats';
            break;
        }
        case 'workoutStats': {
            if (!workouts.value.length) {
                addToast('Keine Trainingsdaten zum Herunterladen', 'default');
                closeDownloadPopup();
                return;
            }
            data = {
                totalWorkouts: workouts.value.length,
                entries: workouts.value.map(w => ({
                    exercise: w.exercise,
                    weight_display: formatWeight(w.weight, 1),
                    weight_raw_kg: w.weight,
                    reps: w.reps,
                    date: formatDate(w.date)
                }))
            };
            filename = 'workout_stats';
            break;
        }
        case 'plans':
        case 'nutrition':
            addToast('Export für diesen Bereich ist noch nicht implementiert', 'default');
            closeDownloadPopup();
            return;
        default:
            addToast('Unbekannter Exporttyp', 'default');
            closeDownloadPopup();
            return;
    }
    // 2) PDF direkt mit jsPDF
    if (downloadFormat.value === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        const title = (downloadCalculator.value === 'progress' ? 'Fortschritt' : downloadCalculator.value.toUpperCase()) + ' Ergebnis';
        doc.text(title, 20, 20);
        doc.setFontSize(12);
        let y = 30;
        const writeKV = (k, v) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(`${k}: ${v}`, 20, y);
            y += 8;
        };
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (y > 275) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`${key}:`, 20, y);
                y += 8;
                value.forEach((item, idx) => {
                    if (y > 275) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`Eintrag ${idx + 1}:`, 25, y);
                    y += 8;
                    Object.entries(item).forEach(([k, v]) => writeKV(`  ${k}`, v));
                    y += 4;
                });
            }
            else if (typeof value === 'object' && value !== null) {
                if (y > 275) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`${key}:`, 20, y);
                y += 8;
                Object.entries(value).forEach(([k, v]) => writeKV(`  ${k}`, v));
            }
            else {
                writeKV(key, value);
            }
        });
        doc.save(`${filename}.pdf`);
        addToast('PDF heruntergeladen', 'save');
        closeDownloadPopup();
        return;
    }
    switch (downloadFormat.value) {
        case 'html':
            content = `
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>${downloadCalculator.value === 'progress' ? 'Fortschritt' : String(downloadCalculator.value).toUpperCase()} Ergebnis</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; color:#111827; }
  h1 { margin-top:0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
  th { background-color: #f3f4f6; }
  code { white-space: pre-wrap; }
</style>
</head>
<body>
  <h1>${downloadCalculator.value === 'progress' ? 'Fortschritt' : String(downloadCalculator.value).toUpperCase()} Ergebnis</h1>
  <table>
    ${Object.entries(data).map(([key, value]) => {
                if (Array.isArray(value)) {
                    return `<tr><th>${key}</th><td>${value.map((item, i) => `Eintrag ${i + 1}:<br>${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join('<br>')}`).join('<br><br>')}</td></tr>`;
                }
                else if (typeof value === 'object' && value !== null) {
                    return `<tr><th>${key}</th><td>${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('<br>')}</td></tr>`;
                }
                return `<tr><th>${key}</th><td>${value}</td></tr>`;
            }).join('')}
  </table>
</body>
</html>`;
            type = 'text/html';
            filename += '.html';
            break;
        case 'csv':
            if (downloadCalculator.value === 'progress') {
                content = `exercise,weight,reps,date\n${data.progress.map((e) => `${e.exercise},${e.weight},${e.reps},${e.date}`).join('\n')}`;
            }
            else {
                content = Object.entries(data).map(([k, v]) => {
                    if (typeof v === 'object' && v !== null) {
                        return `${k},"${Object.entries(v).map(([kk, vv]) => `${kk}:${vv}`).join(';')}"`;
                    }
                    return `${k},${v}`;
                }).join('\n');
            }
            type = 'text/csv';
            filename += '.csv';
            break;
        case 'json':
            content = JSON.stringify(data, null, 2);
            type = 'application/json';
            filename += '.json';
            break;
        case 'txt':
            if (downloadCalculator.value === 'progress') {
                content = `Plan: ${data.planName}\n\n` + data.progress.map((e, i) => `#${i + 1}\nÜbung: ${e.exercise}\nGewicht: ${e.weight}\nWdh: ${e.reps}\nDatum: ${e.date}\n`).join('\n');
            }
            else {
                const toLines = (obj, indent = '') => {
                    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                        return Object.entries(obj).map(([k, v]) => `${indent}${k}:\n${toLines(v, indent + '  ')}`).join('');
                    }
                    if (Array.isArray(obj)) {
                        return obj.map((v, i) => `${indent}- (${i + 1}) ${typeof v === 'object' ? '\n' + toLines(v, indent + '  ') : v}\n`).join('');
                    }
                    return `${indent}${obj}\n`;
                };
                content = toLines(data);
            }
            type = 'text/plain';
            filename += '.txt';
            break;
        default:
            addToast('Unbekanntes Exportformat', 'default');
            closeDownloadPopup();
            return;
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Ergebnis heruntergeladen', 'save');
    closeDownloadPopup();
};
const checkMilestones = (planId, exercise, weight, reps) => {
    // 1) Generisches Workout-Milestone
    if (workouts.value.length >= 10) {
        celebrateMilestone('Meilenstein: 10 Workouts erreicht! 🎉');
    }
    // 2) Gewichts-Meilenstein
    if (initialWeight.value && currentWeight.value) {
        const weightChange = Math.abs(Number(currentWeight.value) - initialWeight.value);
        if (weightChange >= 5) {
            celebrateMilestone('Meilenstein: 5 kg Gewichtsveränderung! 🎉');
        }
    }
    // 3) Übungsspezifischer Meilenstein
    if (planId && exercise && typeof weight === 'number' && typeof reps === 'number') {
        const progressEntries = getProgressForPlan(planId);
        const lastEntry = progressEntries
            .filter(e => e.exercise === exercise)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (lastEntry) {
            if (weight > lastEntry.weight || (weight === lastEntry.weight && reps > lastEntry.reps)) {
                showToast({
                    message: `Meilenstein erreicht! ${exercise}: ${weight} kg x ${reps} Wdh. 🎉`,
                    type: 'success',
                    emoji: '🎉',
                });
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        }
    }
};
const debouncedCalcGlyLoad = debounce(() => {
    if (!validateGlyLoad().length)
        calculateGlyLoad();
});
watch([glFood, glServing, glCarbs100, glGi], () => {
    if (autoCalcEnabled.value)
        debouncedCalcGlyLoad();
});
watch(autoCalcEnabled, (on) => {
    if (!on)
        return;
    debouncedCalcGlyLoad();
});
const glyloadData = localStorage.getItem('progress_glyload');
if (glyloadData) {
    const parsed = JSON.parse(glyloadData);
    glFood.value = parsed.food;
    glServing.value = parsed.serving;
    glCarbs100.value = parsed.carbs100;
    glGi.value = parsed.gi;
    glResult.value = parsed.result;
}
const caffeineData = localStorage.getItem('progress_caffeine');
if (caffeineData) {
    const parsed = JSON.parse(caffeineData);
    cafWeight.value = parsed.weight;
    cafSensitivity.value = parsed.sensitivity;
    cafStatus.value = parsed.status;
    cafResult.value = parsed.result;
}
const celebrateMilestone = (message) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    addToast(message, 'default');
};
const debouncedCalcCaffeine = debounce(() => {
    if (!validateCaffeine().length)
        calculateCaffeine();
});
watch([cafWeight, cafSensitivity, cafStatus], () => {
    if (autoCalcEnabled.value)
        debouncedCalcCaffeine();
});
watch(autoCalcEnabled, (on) => {
    if (!on)
        return;
    debouncedCalcCaffeine();
});
const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(`progress_${key}`, JSON.stringify(data));
    }
    catch (err) {
        console.error(`Error saving ${key} to localStorage:`, err);
    }
};
const loadFromLocalStorage = () => {
    try {
        // Load Progress data
        const bmiData = localStorage.getItem('progress_bmi');
        if (bmiData) {
            const parsed = JSON.parse(bmiData);
            bmiGender.value = parsed.gender;
            bmiWeight.value = parsed.weight;
            bmiHeight.value = parsed.height;
            bmiResult.value = parsed.result;
        }
        const calorieData = localStorage.getItem('progress_calories');
        if (calorieData) {
            const parsed = JSON.parse(calorieData);
            calorieAge.value = parsed.age;
            calorieGender.value = parsed.gender;
            calorieWeight.value = parsed.weight;
            calorieHeight.value = parsed.height;
            calorieActivity.value = parsed.activity;
            calorieGoal.value = parsed.goal;
            calorieResult.value = parsed.result;
        }
        const oneRmData = localStorage.getItem('progress_oneRm');
        if (oneRmData) {
            const parsed = JSON.parse(oneRmData);
            oneRmExercise.value = parsed.exercise;
            oneRmWeight.value = parsed.weight;
            oneRmReps.value = parsed.reps;
            oneRmResult.value = parsed.result;
        }
        const bodyFatData = localStorage.getItem('progress_bodyFat');
        if (bodyFatData) {
            const parsed = JSON.parse(bodyFatData);
            bodyFatGender.value = parsed.gender;
            bodyFatWaist.value = parsed.waist;
            bodyFatNeck.value = parsed.neck;
            bodyFatHip.value = parsed.hip;
            bodyFatHeight.value = parsed.height;
            bodyFatResult.value = parsed.result;
        }
        const ffmiData = localStorage.getItem('progress_ffmi');
        if (ffmiData) {
            const parsed = JSON.parse(ffmiData);
            ffmiWeight.value = parsed.weight;
            ffmiHeight.value = parsed.height;
            ffmiBodyFat.value = parsed.bodyFat;
            ffmiResult.value = parsed.result;
        }
        const waterData = localStorage.getItem('progress_water');
        if (waterData) {
            const parsed = JSON.parse(waterData);
            waterWeight.value = parsed.weight;
            waterActivity.value = parsed.activity;
            waterClimate.value = parsed.climate;
            waterResult.value = parsed.result;
        }
        const goalData = localStorage.getItem('progress_goal');
        if (goalData) {
            const parsed = JSON.parse(goalData);
            goal.value = parsed.goal;
        }
        const workoutsData = localStorage.getItem('progress_workouts');
        if (workoutsData) {
            const parsed = JSON.parse(workoutsData);
            workouts.value = parsed;
        }
        const proteinData = localStorage.getItem('progress_protein');
        if (proteinData) {
            const parsed = JSON.parse(proteinData);
            proteinWeight.value = parsed.weight;
            proteinGoal.value = parsed.goal;
            proteinResult.value = parsed.result;
            if (autoCalcEnabled.value && !validateProtein().length) {
                calculateProtein();
            }
        }
        // Load Training Plans
        const trainingData = localStorage.getItem('trainingData');
        if (trainingData) {
            try {
                const parsedTraining = JSON.parse(trainingData);
                if (parsedTraining && Array.isArray(parsedTraining.plans)) {
                    trainingPlans.value = parsedTraining.plans;
                    console.log(`Geladene Trainingspläne: ${trainingPlans.value.length}`);
                }
                else {
                    console.warn("trainingData gefunden, aber 'plans' ist kein Array oder fehlt.");
                    trainingPlans.value = [];
                }
            }
            catch (e) {
                console.error('Error parsing trainingData:', e);
                trainingPlans.value = [];
            }
        }
        else {
            console.log("Keine trainingData im localStorage gefunden.");
            trainingPlans.value = [];
        }
    }
    catch (err) {
        console.error('Error loading from localStorage:', err);
        trainingPlans.value = [];
    }
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
    const weightKg = displayToKg(Number(newWeight.value));
    weightHistory.value.unshift({ date: today, weight: weightKg });
    newWeight.value = null;
    updateWeightChart();
    addToast('Gewicht gespeichert', 'save');
    checkMilestones();
    closeWeightPopup();
};
const downloadResult = (fmt) => {
    downloadFormat.value = fmt;
    confirmDownload();
};
const closeWeightPopup = () => {
    showWeightPopup.value = false;
    newWeight.value = null;
};
const openGoalPopup = () => {
    newGoal.value = null;
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
    goal.value = displayToKg(Number(newGoal.value));
    saveToLocalStorage('goal', { goal: goal.value });
    addToast('Zielgewicht gespeichert', 'default');
    closeGoalPopup();
};
const closeGoalPopup = () => {
    showGoalPopup.value = false;
    newGoal.value = null;
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
const addToast = (message, type = 'load') => {
    if (!toastsEnabled.value)
        return;
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.value = null;
    }
    const id = toastId++;
    const emojis = {
        delete: '🗑️',
        add: '✅',
        save: '💾',
        timer: '⏰',
        load: '📋',
        reset: '♻️',
        default: '📋',
    };
    const types = {
        delete: 'toast-delete',
        add: 'toast-add',
        save: 'toast-save',
        timer: 'toast-timer',
        load: 'toast-default',
        reset: 'toast-reset',
        default: 'toast-default',
    };
    const mapped = types[type];
    toast.value = { id, message, emoji: emojis[type], type: mapped, exiting: false };
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
const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
        closeWeightPopup();
        closeGoalPopup();
        closeProgressPopup();
        closeValidationPopup();
        closeDownloadPopup();
    }
};
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        closeWeightPopup();
        closeGoalPopup();
        closeProgressPopup();
        closeValidationPopup();
        closeDownloadPopup();
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
        else if (showProgressPopup.value) {
            event.preventDefault();
            saveProgress();
        }
        else if (showDownloadPopup.value) {
            event.preventDefault();
            confirmDownload();
        }
    }
};
let weightChart = null;
let workoutChart = null;
let macroChart = null;
const updateWeightChart = () => {
    const canvas = document.getElementById('weightChart');
    if (!canvas || activeTab.value !== 'stats')
        return;
    if (weightChart)
        weightChart.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weightHistory.value.map((entry) => formatDate(entry.date)).reverse(),
            datasets: [
                {
                    label: `Gewicht (${unit.value})`,
                    data: weightHistory.value.map((entry) => kgToDisplay(entry.weight)).reverse(),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: { backgroundColor: '#ffffff', titleColor: '#1f2937', bodyColor: '#6b7280' },
                legend: { labels: { color: '#1f2937' } },
            },
            scales: {
                x: { ticks: { color: '#6b7280' } },
                y: { beginAtZero: false, ticks: { color: '#6b7280' } },
            },
        },
    });
    // Dark-Mode-Anpassungen
    if (document.documentElement.classList.contains('dark-mode') && weightChart) {
        weightChart.options.plugins.tooltip.backgroundColor = '#1f2937';
        weightChart.options.plugins.tooltip.titleColor = '#e5e7eb';
        weightChart.options.plugins.tooltip.bodyColor = '#9ca3af';
        weightChart.options.plugins.legend.labels.color = '#e5e7eb';
        weightChart.options.scales.x.ticks.color = '#9ca3af';
        weightChart.options.scales.y.ticks.color = '#9ca3af';
        weightChart.data.datasets[0].borderColor = '#818cf8';
        weightChart.data.datasets[0].backgroundColor = 'rgba(129, 140, 248, 0.2)';
        weightChart.update();
    }
};
const copyText = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        }
        else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        addToast('In Zwischenablage kopiert', 'save');
    }
    catch (e) {
        console.error(e);
        addToast('Kopieren fehlgeschlagen', 'default');
    }
};
const copyBMI = () => {
    if (!bmiResult.value)
        return;
    const txt = `BMI-Ergebnis
- BMI: ${bmiResult.value.value.toFixed(1)}
- Kategorie: ${bmiResult.value.category}
- Gewicht: ${bmiWeight.value ?? '-'} ${unit.value}
- Größe: ${bmiHeight.value ?? '-'} cm`;
    copyText(txt);
};
const copyCalories = () => {
    if (!calorieResult.value)
        return;
    const r = calorieResult.value;
    const txt = `Kalorienbedarf
- Gesamt: ${r.total.toFixed(0)} kcal
- Makros: KH ${r.macros.carbs.toFixed(0)}g, Protein ${r.macros.protein.toFixed(0)}g, Fett ${r.macros.fat.toFixed(0)}g
- Alter: ${calorieAge.value ?? '-'} J, Geschlecht: ${calorieGender.value}
- Gewicht: ${calorieWeight.value ?? '-'} ${unit.value}, Größe: ${calorieHeight.value ?? '-'} cm
- Aktivität: ${calorieActivity.value}, Ziel: ${calorieGoal.value > 0 ? '+' : ''}${calorieGoal.value} kcal`;
    copyText(txt);
};
const copyOneRm = () => {
    if (!oneRmResult.value)
        return;
    const txt = `1RM-Schätzung
- Übung: ${oneRmExercise.value || '-'}
- 1RM: ${formatWeight(oneRmResult.value, 1)}
- Eingabe: ${oneRmWeight.value ?? '-'} ${unit.value} x ${oneRmReps.value ?? '-'}`;
    copyText(txt);
};
const copyBodyFat = () => {
    if (!bodyFatResult.value)
        return;
    const txt = `Körperfett (US Navy)
- Körperfett: ${bodyFatResult.value.toFixed(1)}%
- Geschlecht: ${bodyFatGender.value}
- Maße: Bauch ${bodyFatWaist.value ?? '-'} cm, Hals ${bodyFatNeck.value ?? '-'} cm${bodyFatGender.value === 'female' ? `, Hüfte ${bodyFatHip.value ?? '-'} cm` : ''}
- Größe: ${bodyFatHeight.value ?? '-'} cm`;
    copyText(txt);
};
const copyFFMI = () => {
    if (!ffmiResult.value)
        return;
    const txt = `FFMI
- FFMI: ${ffmiResult.value.value.toFixed(1)} (${ffmiResult.value.category})
- Gewicht: ${ffmiWeight.value ?? '-'} ${unit.value}
- Größe: ${ffmiHeight.value ?? '-'} cm
- KFA: ${ffmiBodyFat.value ?? '-'}%`;
    copyText(txt);
};
const copyWater = () => {
    if (!waterResult.value)
        return;
    const txt = `Wasserbedarf
- Empfehlung: ${waterResult.value.toFixed(1)} Liter/Tag
- Gewicht: ${waterWeight.value ?? '-'} ${unit.value}
- Aktivität: ${waterActivity.value}
- Klima: ${waterClimate.value}`;
    copyText(txt);
};
const updateWorkoutChart = () => {
    const canvas = document.getElementById('workoutChart');
    if (!canvas || activeTab.value !== 'stats')
        return;
    if (workoutChart)
        workoutChart.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    workoutChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: workouts.value.map((w) => w.exercise),
            datasets: [
                {
                    label: `Gewicht (${unit.value})`,
                    data: workouts.value.map((w) => kgToDisplay(w.weight)),
                    backgroundColor: '#6366f1',
                    borderColor: '#4338ca',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: { backgroundColor: '#ffffff', titleColor: '#1f2937', bodyColor: '#6b7280' },
                legend: { labels: { color: '#1f2937' } },
            },
            scales: {
                x: { ticks: { color: '#6b7280' } },
                y: { beginAtZero: true, ticks: { color: '#6b7280' } },
            },
        },
    });
    // Dark-Mode-Anpassungen
    if (document.documentElement.classList.contains('dark-mode') && workoutChart) {
        workoutChart.options.plugins.tooltip.backgroundColor = '#1f2937';
        workoutChart.options.plugins.tooltip.titleColor = '#e5e7eb';
        workoutChart.options.plugins.tooltip.bodyColor = '#9ca3af';
        workoutChart.options.plugins.legend.labels.color = '#e5e7eb';
        workoutChart.options.scales.x.ticks.color = '#9ca3af';
        workoutChart.options.scales.y.ticks.color = '#9ca3af';
        workoutChart.data.datasets[0].backgroundColor = '#818cf8';
        workoutChart.data.datasets[0].borderColor = '#4b5563';
        workoutChart.update();
    }
};
const updateMacroChart = () => {
    const canvas = document.getElementById('macroChart');
    if (!canvas || activeTab.value !== 'calculators' || !calorieResult.value)
        return;
    if (macroChart)
        macroChart.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    macroChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kohlenhydrate', 'Eiweiß', 'Fett'],
            datasets: [{
                    data: [
                        calorieResult.value.macros.carbs,
                        calorieResult.value.macros.protein,
                        calorieResult.value.macros.fat,
                    ],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderWidth: 1,
                }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#1f2937' } },
                tooltip: { backgroundColor: '#ffffff', titleColor: '#1f2937', bodyColor: '#6b7280' },
            },
        },
    });
    if (document.documentElement.classList.contains('dark-mode') && macroChart) {
        macroChart.options.plugins.legend.labels.color = '#e5e7eb';
        macroChart.options.plugins.tooltip.backgroundColor = '#1f2937';
        macroChart.options.plugins.tooltip.titleColor = '#e5e7eb';
        macroChart.options.plugins.tooltip.bodyColor = '#9ca3af';
        macroChart.update();
    }
};
onMounted(() => {
    const flag = localStorage.getItem('autoCalcEnabled');
    autoCalcEnabled.value = flag === 'true';
    loadFavoriteCalculators();
    const stored = localStorage.getItem('toastsEnabled');
    toastsEnabled.value = stored === null ? true : stored === 'true';
    // Live-Updates aus Settings.vue
    window.addEventListener('toasts-enabled-changed', handleToastsSetting);
});
function handleToastsSetting(e) {
    const enabled = Boolean(e.detail);
    toastsEnabled.value = enabled;
    if (!enabled && toast.value) {
        toast.value = null;
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
    }
}
// ===== Favoriten-Rechner =====
const favoriteCalculators = ref(new Set());
const FAVORITES_KEY = 'progress_favorite_calculators';
const loadFavoriteCalculators = () => {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        if (!raw)
            return;
        const arr = JSON.parse(raw);
        favoriteCalculators.value = new Set(arr);
    }
    catch (e) {
        console.error('Fehler beim Laden der Lieblings-Rechner:', e);
    }
};
const saveFavoriteCalculators = () => {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteCalculators.value]));
    }
    catch (e) {
        console.error('Fehler beim Speichern der Lieblings-Rechner:', e);
    }
};
const toggleFavCalculator = (id) => {
    if (favoriteCalculators.value.has(id)) {
        favoriteCalculators.value.delete(id);
        addToast('Favorit entfernt', 'default');
    }
    else {
        favoriteCalculators.value.add(id);
        addToast('Als Favorit markiert', 'default');
    }
    saveFavoriteCalculators();
};
const isFavCalculator = (id) => favoriteCalculators.value.has(id);
// ===== Auto-BMI =====
const debouncedCalcBMI = debounce(() => {
    if (!validateBMI().length)
        calculateBMI();
});
watch([bmiGender, bmiWeight, bmiHeight], () => {
    if (autoCalcEnabled.value)
        debouncedCalcBMI();
});
// ===== Auto-Kalorien =====
const debouncedCalcCalories = debounce(() => {
    if (!validateCalories().length)
        calculateCalories();
});
watch([calorieAge, calorieGender, calorieWeight, calorieHeight, calorieActivity, calorieGoal], () => {
    if (autoCalcEnabled.value)
        debouncedCalcCalories();
});
// ===== Auto-1RM =====
const debouncedCalc1RM = debounce(() => {
    if (!validateOneRm().length)
        calculateOneRm();
});
watch([oneRmWeight, oneRmReps, oneRmExercise], () => {
    if (autoCalcEnabled.value)
        debouncedCalc1RM();
});
// ===== Auto-Körperfett =====
const debouncedCalcBodyFat = debounce(() => {
    if (!validateBodyFat().length)
        calculateBodyFat();
});
watch([bodyFatGender, bodyFatWaist, bodyFatNeck, bodyFatHip, bodyFatHeight], () => {
    if (autoCalcEnabled.value)
        debouncedCalcBodyFat();
});
// ===== Auto-FFMI =====
const debouncedCalcFFMI = debounce(() => {
    if (!validateFFMI().length)
        calculateFFMI();
});
watch([ffmiWeight, ffmiHeight, ffmiBodyFat], () => {
    if (autoCalcEnabled.value)
        debouncedCalcFFMI();
});
// ===== Auto-Wasser =====
const debouncedCalcWater = debounce(() => {
    if (!validateWater().length)
        calculateWater();
});
watch([waterWeight, waterActivity, waterClimate], () => {
    if (autoCalcEnabled.value)
        debouncedCalcWater();
});
watch(autoCalcEnabled, (on) => {
    if (!on)
        return;
    debouncedCalcBMI();
    debouncedCalcCalories();
    debouncedCalc1RM();
    debouncedCalcBodyFat();
    debouncedCalcFFMI();
    debouncedCalcWater();
});
const debouncedCalcProtein = debounce(() => {
    if (!validateProtein().length)
        calculateProtein();
}, 300);
watch([proteinWeight, proteinGoal, unit], () => {
    if (autoCalcEnabled.value)
        debouncedCalcProtein();
}, { flush: 'post' });
watch(autoCalcEnabled, (on) => {
    if (on)
        debouncedCalcProtein();
});
watch([proteinWeight, proteinGoal], () => {
    if (autoCalcEnabled.value && !validateProtein().length)
        calculateProtein();
}, { immediate: true, flush: 'post' });
watch(activeTab, (newValue) => {
    nextTick(() => {
        if (newValue === 'stats') {
            updateWeightChart();
            updateWorkoutChart();
            if (macroChart)
                macroChart.destroy();
            macroChart = null;
        }
        else if (newValue === 'calculators' && calorieResult.value) {
            updateMacroChart();
            if (weightChart)
                weightChart.destroy();
            if (workoutChart)
                workoutChart.destroy();
            weightChart = null;
            workoutChart = null;
        }
        else {
            if (weightChart)
                weightChart.destroy();
            if (workoutChart)
                workoutChart.destroy();
            if (macroChart)
                macroChart.destroy();
            weightChart = null;
            workoutChart = null;
            macroChart = null;
        }
    });
}, { immediate: true });
watch(unit, () => {
    if (activeTab.value === 'stats') {
        updateWeightChart();
        updateWorkoutChart();
    }
});
onMounted(() => {
    loadFromLocalStorage();
    checkMilestones();
    window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('toasts-enabled-changed', handleToastsSetting);
    if (weightChart)
        weightChart.destroy();
    if (workoutChart)
        workoutChart.destroy();
    if (macroChart)
        macroChart.destroy();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['calc-filterselect']} */ ;
/** @type {__VLS_StyleScopedClasses['fav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-list']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['progress']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-charts']} */ ;
/** @type {__VLS_StyleScopedClasses['plans-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plans-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-description']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-entries']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
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
    ...{ class: "dashboard-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard-grid" },
});
/** @type {[typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    ...{ 'onClick': {} },
    title: "Aktuelles Gewicht",
    info: (__VLS_ctx.currentWeightDisplay),
    clickable: true,
}));
const __VLS_1 = __VLS_0({
    ...{ 'onClick': {} },
    title: "Aktuelles Gewicht",
    info: (__VLS_ctx.currentWeightDisplay),
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onClick: (__VLS_ctx.openWeightPopup)
};
var __VLS_2;
/** @type {[typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    title: "Kalorien heute",
    info: (__VLS_ctx.totalCalories + ' / 2500 kcal'),
}));
const __VLS_8 = __VLS_7({
    title: "Kalorien heute",
    info: (__VLS_ctx.totalCalories + ' / 2500 kcal'),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {[typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    title: "Letztes Training",
    info: (__VLS_ctx.lastWorkout || 'Kein Training erfasst'),
}));
const __VLS_11 = __VLS_10({
    title: "Letztes Training",
    info: (__VLS_ctx.lastWorkout || 'Kein Training erfasst'),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
/** @type {[typeof DashboardCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(DashboardCard, new DashboardCard({
    ...{ 'onClick': {} },
    title: "Zielgewicht",
    info: (__VLS_ctx.goal ? __VLS_ctx.formatWeight(__VLS_ctx.goal, 1) : 'Kein Ziel gesetzt'),
    clickable: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    title: "Zielgewicht",
    info: (__VLS_ctx.goal ? __VLS_ctx.formatWeight(__VLS_ctx.goal, 1) : 'Kein Ziel gesetzt'),
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.openGoalPopup)
};
var __VLS_15;
/** @type {[typeof TabsBar, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(TabsBar, new TabsBar({
    ...{ 'onUpdate:searchQuery': {} },
    ...{ 'onUpdate:planSearchQuery': {} },
    modelValue: (__VLS_ctx.activeTab),
    searchQuery: (__VLS_ctx.searchQuery),
    planSearchQuery: (__VLS_ctx.planSearchQuery),
}));
const __VLS_21 = __VLS_20({
    ...{ 'onUpdate:searchQuery': {} },
    ...{ 'onUpdate:planSearchQuery': {} },
    modelValue: (__VLS_ctx.activeTab),
    searchQuery: (__VLS_ctx.searchQuery),
    planSearchQuery: (__VLS_ctx.planSearchQuery),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_23;
let __VLS_24;
let __VLS_25;
const __VLS_26 = {
    'onUpdate:searchQuery': (val => (__VLS_ctx.searchQuery = val))
};
const __VLS_27 = {
    'onUpdate:planSearchQuery': (val => (__VLS_ctx.planSearchQuery = val))
};
var __VLS_22;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-charts" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'stats') }, null, null);
/** @type {[typeof ChartCard, typeof ChartCard, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(ChartCard, new ChartCard({
    ...{ 'onExport': {} },
    ...{ 'onReset': {} },
    title: "Gewichtsverlauf",
    exportable: true,
}));
const __VLS_29 = __VLS_28({
    ...{ 'onExport': {} },
    ...{ 'onReset': {} },
    title: "Gewichtsverlauf",
    exportable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
let __VLS_31;
let __VLS_32;
let __VLS_33;
const __VLS_34 = {
    onExport: (...[$event]) => {
        __VLS_ctx.openDownloadPopup('weightStats');
    }
};
const __VLS_35 = {
    onReset: (__VLS_ctx.resetWeightStats)
};
__VLS_30.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    id: "weightChart",
});
var __VLS_30;
/** @type {[typeof ChartCard, typeof ChartCard, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(ChartCard, new ChartCard({
    ...{ 'onExport': {} },
    ...{ 'onReset': {} },
    title: "Trainingsstatistik",
    exportable: true,
}));
const __VLS_37 = __VLS_36({
    ...{ 'onExport': {} },
    ...{ 'onReset': {} },
    title: "Trainingsstatistik",
    exportable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_39;
let __VLS_40;
let __VLS_41;
const __VLS_42 = {
    onExport: (...[$event]) => {
        __VLS_ctx.openDownloadPopup('workoutStats');
    }
};
const __VLS_43 = {
    onReset: (__VLS_ctx.resetWorkoutStats)
};
__VLS_38.slots.default;
{
    const { subtitle: __VLS_thisSlot } = __VLS_38.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "card-info" },
    });
    (__VLS_ctx.workouts.length);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    id: "workoutChart",
});
var __VLS_38;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calc-filterbar" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'calculators') }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "calc-filterlabel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.calcCategory),
    ...{ class: "calc-filterselect" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "alle",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "gesundheit",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "kraft",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "ernaehrung",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "alltag",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calculators-grid" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'calculators') }, null, null);
if (__VLS_ctx.favoriteCalcs.length) {
    if (!__VLS_ctx.isFavorite('BMI') && __VLS_ctx.matchesCalc('BMI')) {
        /** @type {[typeof BmiCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent(BmiCalculator, new BmiCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:bmiGender': {} },
            ...{ 'onUpdate:bmiWeight': {} },
            ...{ 'onUpdate:bmiHeight': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            title: "BMI-Rechner",
            info: "Der BMI (Body-Mass-Index) misst das Verhältnis von Gewicht zu Größe.",
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            bmiGender: (__VLS_ctx.bmiGender),
            bmiWeight: (__VLS_ctx.bmiWeight),
            bmiHeight: (__VLS_ctx.bmiHeight),
            bmiResult: (__VLS_ctx.bmiResult),
            isFavorite: (false),
        }));
        const __VLS_45 = __VLS_44({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:bmiGender': {} },
            ...{ 'onUpdate:bmiWeight': {} },
            ...{ 'onUpdate:bmiHeight': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            title: "BMI-Rechner",
            info: "Der BMI (Body-Mass-Index) misst das Verhältnis von Gewicht zu Größe.",
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            bmiGender: (__VLS_ctx.bmiGender),
            bmiWeight: (__VLS_ctx.bmiWeight),
            bmiHeight: (__VLS_ctx.bmiHeight),
            bmiResult: (__VLS_ctx.bmiResult),
            isFavorite: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        let __VLS_47;
        let __VLS_48;
        let __VLS_49;
        const __VLS_50 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('BMI'))
        };
        const __VLS_51 = {
            'onUpdate:bmiGender': (val => (__VLS_ctx.bmiGender = val))
        };
        const __VLS_52 = {
            'onUpdate:bmiWeight': (val => (__VLS_ctx.bmiWeight = val))
        };
        const __VLS_53 = {
            'onUpdate:bmiHeight': (val => (__VLS_ctx.bmiHeight = val))
        };
        const __VLS_54 = {
            onCalculate: (__VLS_ctx.calculateBMI)
        };
        const __VLS_55 = {
            onCopy: (__VLS_ctx.copyBMI)
        };
        const __VLS_56 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(!__VLS_ctx.isFavorite('BMI') && __VLS_ctx.matchesCalc('BMI')))
                    return;
                __VLS_ctx.openDownloadPopup('bmi');
            }
        };
        const __VLS_57 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(!__VLS_ctx.isFavorite('BMI') && __VLS_ctx.matchesCalc('BMI')))
                    return;
                __VLS_ctx.resetCalculator('bmi');
            }
        };
        var __VLS_46;
    }
    if (__VLS_ctx.isFavorite('Kalorienbedarf') && __VLS_ctx.matchesCalc('Kalorienbedarf')) {
        /** @type {[typeof CaloriesCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(CaloriesCalculator, new CaloriesCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:calorieAge': {} },
            ...{ 'onUpdate:calorieGender': {} },
            ...{ 'onUpdate:calorieWeight': {} },
            ...{ 'onUpdate:calorieHeight': {} },
            ...{ 'onUpdate:calorieActivity': {} },
            ...{ 'onUpdate:calorieGoal': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            calorieAge: (__VLS_ctx.calorieAge),
            calorieGender: (__VLS_ctx.calorieGender),
            calorieWeight: (__VLS_ctx.calorieWeight),
            calorieHeight: (__VLS_ctx.calorieHeight),
            calorieActivity: (__VLS_ctx.calorieActivity),
            calorieGoal: (__VLS_ctx.calorieGoal),
            calorieResult: (__VLS_ctx.calorieResult),
            isFavorite: (true),
        }));
        const __VLS_59 = __VLS_58({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:calorieAge': {} },
            ...{ 'onUpdate:calorieGender': {} },
            ...{ 'onUpdate:calorieWeight': {} },
            ...{ 'onUpdate:calorieHeight': {} },
            ...{ 'onUpdate:calorieActivity': {} },
            ...{ 'onUpdate:calorieGoal': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            calorieAge: (__VLS_ctx.calorieAge),
            calorieGender: (__VLS_ctx.calorieGender),
            calorieWeight: (__VLS_ctx.calorieWeight),
            calorieHeight: (__VLS_ctx.calorieHeight),
            calorieActivity: (__VLS_ctx.calorieActivity),
            calorieGoal: (__VLS_ctx.calorieGoal),
            calorieResult: (__VLS_ctx.calorieResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        let __VLS_61;
        let __VLS_62;
        let __VLS_63;
        const __VLS_64 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Kalorienbedarf'))
        };
        const __VLS_65 = {
            'onUpdate:calorieAge': (v => __VLS_ctx.calorieAge = v)
        };
        const __VLS_66 = {
            'onUpdate:calorieGender': (v => __VLS_ctx.calorieGender = v)
        };
        const __VLS_67 = {
            'onUpdate:calorieWeight': (v => __VLS_ctx.calorieWeight = v)
        };
        const __VLS_68 = {
            'onUpdate:calorieHeight': (v => __VLS_ctx.calorieHeight = v)
        };
        const __VLS_69 = {
            'onUpdate:calorieActivity': (v => __VLS_ctx.calorieActivity = v)
        };
        const __VLS_70 = {
            'onUpdate:calorieGoal': (v => __VLS_ctx.calorieGoal = v)
        };
        const __VLS_71 = {
            onCalculate: (__VLS_ctx.calculateCalories)
        };
        const __VLS_72 = {
            onCopy: (__VLS_ctx.copyCalories)
        };
        const __VLS_73 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Kalorienbedarf') && __VLS_ctx.matchesCalc('Kalorienbedarf')))
                    return;
                __VLS_ctx.openDownloadPopup('calories');
            }
        };
        const __VLS_74 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Kalorienbedarf') && __VLS_ctx.matchesCalc('Kalorienbedarf')))
                    return;
                __VLS_ctx.resetCalculator('calories');
            }
        };
        var __VLS_60;
    }
    if (__VLS_ctx.isFavorite('Proteinbedarf') && __VLS_ctx.matchesCalc('Proteinbedarf')) {
        /** @type {[typeof ProteinCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(ProteinCalculator, new ProteinCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:proteinWeight': {} },
            ...{ 'onUpdate:proteinGoal': {} },
            ...{ 'onUpdate:proteinActivity': {} },
            ...{ 'onUpdate:proteinMeals': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            proteinWeight: (__VLS_ctx.proteinWeight),
            proteinGoal: (__VLS_ctx.proteinGoal),
            proteinActivity: (__VLS_ctx.proteinActivity),
            proteinMeals: (__VLS_ctx.proteinMeals),
            proteinResult: (__VLS_ctx.proteinResult),
            isFavorite: (true),
        }));
        const __VLS_76 = __VLS_75({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:proteinWeight': {} },
            ...{ 'onUpdate:proteinGoal': {} },
            ...{ 'onUpdate:proteinActivity': {} },
            ...{ 'onUpdate:proteinMeals': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            proteinWeight: (__VLS_ctx.proteinWeight),
            proteinGoal: (__VLS_ctx.proteinGoal),
            proteinActivity: (__VLS_ctx.proteinActivity),
            proteinMeals: (__VLS_ctx.proteinMeals),
            proteinResult: (__VLS_ctx.proteinResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        let __VLS_78;
        let __VLS_79;
        let __VLS_80;
        const __VLS_81 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Proteinbedarf'))
        };
        const __VLS_82 = {
            'onUpdate:proteinWeight': (v => __VLS_ctx.proteinWeight = v)
        };
        const __VLS_83 = {
            'onUpdate:proteinGoal': (v => __VLS_ctx.proteinGoal = v)
        };
        const __VLS_84 = {
            'onUpdate:proteinActivity': (v => __VLS_ctx.proteinActivity = v)
        };
        const __VLS_85 = {
            'onUpdate:proteinMeals': (v => __VLS_ctx.proteinMeals = v)
        };
        const __VLS_86 = {
            onCalculate: (__VLS_ctx.calculateProtein)
        };
        const __VLS_87 = {
            onCopy: (__VLS_ctx.copyProtein)
        };
        const __VLS_88 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Proteinbedarf') && __VLS_ctx.matchesCalc('Proteinbedarf')))
                    return;
                __VLS_ctx.openDownloadPopup('protein');
            }
        };
        const __VLS_89 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Proteinbedarf') && __VLS_ctx.matchesCalc('Proteinbedarf')))
                    return;
                __VLS_ctx.resetCalculator('protein');
            }
        };
        var __VLS_77;
    }
    if (__VLS_ctx.isFavorite('1RM') && __VLS_ctx.matchesCalc('1RM')) {
        /** @type {[typeof OneRmCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(OneRmCalculator, new OneRmCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:oneRmExercise': {} },
            ...{ 'onUpdate:oneRmWeight': {} },
            ...{ 'onUpdate:oneRmReps': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            oneRmExercise: (__VLS_ctx.oneRmExercise),
            oneRmWeight: (__VLS_ctx.oneRmWeight),
            oneRmReps: (__VLS_ctx.oneRmReps),
            oneRmResult: (__VLS_ctx.oneRmResult),
            isFavorite: (true),
            formattedResult: (__VLS_ctx.oneRmResult !== null ? __VLS_ctx.formatWeight(__VLS_ctx.oneRmResult, 1) : ''),
        }));
        const __VLS_91 = __VLS_90({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:oneRmExercise': {} },
            ...{ 'onUpdate:oneRmWeight': {} },
            ...{ 'onUpdate:oneRmReps': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            oneRmExercise: (__VLS_ctx.oneRmExercise),
            oneRmWeight: (__VLS_ctx.oneRmWeight),
            oneRmReps: (__VLS_ctx.oneRmReps),
            oneRmResult: (__VLS_ctx.oneRmResult),
            isFavorite: (true),
            formattedResult: (__VLS_ctx.oneRmResult !== null ? __VLS_ctx.formatWeight(__VLS_ctx.oneRmResult, 1) : ''),
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        let __VLS_93;
        let __VLS_94;
        let __VLS_95;
        const __VLS_96 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('1RM'))
        };
        const __VLS_97 = {
            'onUpdate:oneRmExercise': (v => __VLS_ctx.oneRmExercise = v)
        };
        const __VLS_98 = {
            'onUpdate:oneRmWeight': (v => __VLS_ctx.oneRmWeight = v)
        };
        const __VLS_99 = {
            'onUpdate:oneRmReps': (v => __VLS_ctx.oneRmReps = v)
        };
        const __VLS_100 = {
            onCalculate: (__VLS_ctx.calculateOneRm)
        };
        const __VLS_101 = {
            onCopy: (__VLS_ctx.copyOneRm)
        };
        const __VLS_102 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('1RM') && __VLS_ctx.matchesCalc('1RM')))
                    return;
                __VLS_ctx.openDownloadPopup('oneRm');
            }
        };
        const __VLS_103 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('1RM') && __VLS_ctx.matchesCalc('1RM')))
                    return;
                __VLS_ctx.resetCalculator('oneRm');
            }
        };
        var __VLS_92;
    }
    if (__VLS_ctx.isFavorite('Körperfett') && __VLS_ctx.matchesCalc('Körperfett')) {
        /** @type {[typeof BodyFatCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent(BodyFatCalculator, new BodyFatCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:bodyFatGender': {} },
            ...{ 'onUpdate:bodyFatWaist': {} },
            ...{ 'onUpdate:bodyFatNeck': {} },
            ...{ 'onUpdate:bodyFatHip': {} },
            ...{ 'onUpdate:bodyFatHeight': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            bodyFatGender: (__VLS_ctx.bodyFatGender),
            bodyFatWaist: (__VLS_ctx.bodyFatWaist),
            bodyFatNeck: (__VLS_ctx.bodyFatNeck),
            bodyFatHip: (__VLS_ctx.bodyFatHip),
            bodyFatHeight: (__VLS_ctx.bodyFatHeight),
            bodyFatResult: (__VLS_ctx.bodyFatResult),
            isFavorite: (true),
        }));
        const __VLS_105 = __VLS_104({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:bodyFatGender': {} },
            ...{ 'onUpdate:bodyFatWaist': {} },
            ...{ 'onUpdate:bodyFatNeck': {} },
            ...{ 'onUpdate:bodyFatHip': {} },
            ...{ 'onUpdate:bodyFatHeight': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            bodyFatGender: (__VLS_ctx.bodyFatGender),
            bodyFatWaist: (__VLS_ctx.bodyFatWaist),
            bodyFatNeck: (__VLS_ctx.bodyFatNeck),
            bodyFatHip: (__VLS_ctx.bodyFatHip),
            bodyFatHeight: (__VLS_ctx.bodyFatHeight),
            bodyFatResult: (__VLS_ctx.bodyFatResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        let __VLS_107;
        let __VLS_108;
        let __VLS_109;
        const __VLS_110 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Körperfett'))
        };
        const __VLS_111 = {
            'onUpdate:bodyFatGender': (v => __VLS_ctx.bodyFatGender = v)
        };
        const __VLS_112 = {
            'onUpdate:bodyFatWaist': (v => __VLS_ctx.bodyFatWaist = v)
        };
        const __VLS_113 = {
            'onUpdate:bodyFatNeck': (v => __VLS_ctx.bodyFatNeck = v)
        };
        const __VLS_114 = {
            'onUpdate:bodyFatHip': (v => __VLS_ctx.bodyFatHip = v)
        };
        const __VLS_115 = {
            'onUpdate:bodyFatHeight': (v => __VLS_ctx.bodyFatHeight = v)
        };
        const __VLS_116 = {
            onCalculate: (__VLS_ctx.calculateBodyFat)
        };
        const __VLS_117 = {
            onCopy: (__VLS_ctx.copyBodyFat)
        };
        const __VLS_118 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Körperfett') && __VLS_ctx.matchesCalc('Körperfett')))
                    return;
                __VLS_ctx.openDownloadPopup('bodyFat');
            }
        };
        const __VLS_119 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Körperfett') && __VLS_ctx.matchesCalc('Körperfett')))
                    return;
                __VLS_ctx.resetCalculator('bodyFat');
            }
        };
        var __VLS_106;
    }
    if (__VLS_ctx.isFavorite('Koffein') && __VLS_ctx.matchesCalc('Koffein')) {
        /** @type {[typeof CaffeineSafeDoseCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent(CaffeineSafeDoseCalculator, new CaffeineSafeDoseCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:cafWeight': {} },
            ...{ 'onUpdate:cafSensitivity': {} },
            ...{ 'onUpdate:cafStatus': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            cafWeight: (__VLS_ctx.cafWeight),
            cafSensitivity: (__VLS_ctx.cafSensitivity),
            cafStatus: (__VLS_ctx.cafStatus),
            cafResult: (__VLS_ctx.cafResult),
            isFavorite: (true),
        }));
        const __VLS_121 = __VLS_120({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:cafWeight': {} },
            ...{ 'onUpdate:cafSensitivity': {} },
            ...{ 'onUpdate:cafStatus': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            cafWeight: (__VLS_ctx.cafWeight),
            cafSensitivity: (__VLS_ctx.cafSensitivity),
            cafStatus: (__VLS_ctx.cafStatus),
            cafResult: (__VLS_ctx.cafResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_120));
        let __VLS_123;
        let __VLS_124;
        let __VLS_125;
        const __VLS_126 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Koffein'))
        };
        const __VLS_127 = {
            'onUpdate:cafWeight': (v => __VLS_ctx.cafWeight = v)
        };
        const __VLS_128 = {
            'onUpdate:cafSensitivity': (v => __VLS_ctx.cafSensitivity = v)
        };
        const __VLS_129 = {
            'onUpdate:cafStatus': (v => __VLS_ctx.cafStatus = v)
        };
        const __VLS_130 = {
            onCalculate: (__VLS_ctx.calculateCaffeine)
        };
        const __VLS_131 = {
            onCopy: (__VLS_ctx.copyCaffeine)
        };
        const __VLS_132 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Koffein') && __VLS_ctx.matchesCalc('Koffein')))
                    return;
                __VLS_ctx.openDownloadPopup('caffeine');
            }
        };
        const __VLS_133 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Koffein') && __VLS_ctx.matchesCalc('Koffein')))
                    return;
                __VLS_ctx.resetCalculator('caffeine');
            }
        };
        var __VLS_122;
    }
    if (__VLS_ctx.isFavorite('FFMI') && __VLS_ctx.matchesCalc('FFMI')) {
        /** @type {[typeof FfmiCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(FfmiCalculator, new FfmiCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:ffmiWeight': {} },
            ...{ 'onUpdate:ffmiHeight': {} },
            ...{ 'onUpdate:ffmiBodyFat': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            ffmiWeight: (__VLS_ctx.ffmiWeight),
            ffmiHeight: (__VLS_ctx.ffmiHeight),
            ffmiBodyFat: (__VLS_ctx.ffmiBodyFat),
            ffmiResult: (__VLS_ctx.ffmiResult),
            isFavorite: (true),
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:ffmiWeight': {} },
            ...{ 'onUpdate:ffmiHeight': {} },
            ...{ 'onUpdate:ffmiBodyFat': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            ffmiWeight: (__VLS_ctx.ffmiWeight),
            ffmiHeight: (__VLS_ctx.ffmiHeight),
            ffmiBodyFat: (__VLS_ctx.ffmiBodyFat),
            ffmiResult: (__VLS_ctx.ffmiResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_137;
        let __VLS_138;
        let __VLS_139;
        const __VLS_140 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('FFMI'))
        };
        const __VLS_141 = {
            'onUpdate:ffmiWeight': (v => __VLS_ctx.ffmiWeight = v)
        };
        const __VLS_142 = {
            'onUpdate:ffmiHeight': (v => __VLS_ctx.ffmiHeight = v)
        };
        const __VLS_143 = {
            'onUpdate:ffmiBodyFat': (v => __VLS_ctx.ffmiBodyFat = v)
        };
        const __VLS_144 = {
            onCalculate: (__VLS_ctx.calculateFFMI)
        };
        const __VLS_145 = {
            onCopy: (__VLS_ctx.copyFFMI)
        };
        const __VLS_146 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('FFMI') && __VLS_ctx.matchesCalc('FFMI')))
                    return;
                __VLS_ctx.openDownloadPopup('ffmi');
            }
        };
        const __VLS_147 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('FFMI') && __VLS_ctx.matchesCalc('FFMI')))
                    return;
                __VLS_ctx.resetCalculator('ffmi');
            }
        };
        var __VLS_136;
    }
    if (__VLS_ctx.isFavorite('Glykämische Last') && __VLS_ctx.matchesCalc('Glykämische Last')) {
        /** @type {[typeof GlycemicLoadCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_148 = __VLS_asFunctionalComponent(GlycemicLoadCalculator, new GlycemicLoadCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:glFood': {} },
            ...{ 'onUpdate:glServing': {} },
            ...{ 'onUpdate:glCarbs100': {} },
            ...{ 'onUpdate:glGi': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            glFood: (__VLS_ctx.glFood),
            glServing: (__VLS_ctx.glServing),
            glCarbs100: (__VLS_ctx.glCarbs100),
            glGi: (__VLS_ctx.glGi),
            glResult: (__VLS_ctx.glResult),
            isFavorite: (true),
        }));
        const __VLS_149 = __VLS_148({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:glFood': {} },
            ...{ 'onUpdate:glServing': {} },
            ...{ 'onUpdate:glCarbs100': {} },
            ...{ 'onUpdate:glGi': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            glFood: (__VLS_ctx.glFood),
            glServing: (__VLS_ctx.glServing),
            glCarbs100: (__VLS_ctx.glCarbs100),
            glGi: (__VLS_ctx.glGi),
            glResult: (__VLS_ctx.glResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_148));
        let __VLS_151;
        let __VLS_152;
        let __VLS_153;
        const __VLS_154 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Glykämische Last'))
        };
        const __VLS_155 = {
            'onUpdate:glFood': (v => __VLS_ctx.glFood = v)
        };
        const __VLS_156 = {
            'onUpdate:glServing': (v => __VLS_ctx.glServing = v)
        };
        const __VLS_157 = {
            'onUpdate:glCarbs100': (v => __VLS_ctx.glCarbs100 = v)
        };
        const __VLS_158 = {
            'onUpdate:glGi': (v => __VLS_ctx.glGi = v)
        };
        const __VLS_159 = {
            onCalculate: (__VLS_ctx.calculateGlyLoad)
        };
        const __VLS_160 = {
            onCopy: (__VLS_ctx.copyGlyLoad)
        };
        const __VLS_161 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Glykämische Last') && __VLS_ctx.matchesCalc('Glykämische Last')))
                    return;
                __VLS_ctx.openDownloadPopup('glyload');
            }
        };
        const __VLS_162 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Glykämische Last') && __VLS_ctx.matchesCalc('Glykämische Last')))
                    return;
                __VLS_ctx.resetCalculator('glyload');
            }
        };
        var __VLS_150;
    }
    if (__VLS_ctx.isFavorite('Wasserbedarf') && __VLS_ctx.matchesCalc('Wasserbedarf')) {
        /** @type {[typeof WaterCalculator, ]} */ ;
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(WaterCalculator, new WaterCalculator({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:waterWeight': {} },
            ...{ 'onUpdate:waterActivity': {} },
            ...{ 'onUpdate:waterClimate': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            waterWeight: (__VLS_ctx.waterWeight),
            waterActivity: (__VLS_ctx.waterActivity),
            waterClimate: (__VLS_ctx.waterClimate),
            waterResult: (__VLS_ctx.waterResult),
            isFavorite: (true),
        }));
        const __VLS_164 = __VLS_163({
            ...{ 'onToggleFavorite': {} },
            ...{ 'onUpdate:waterWeight': {} },
            ...{ 'onUpdate:waterActivity': {} },
            ...{ 'onUpdate:waterClimate': {} },
            ...{ 'onCalculate': {} },
            ...{ 'onCopy': {} },
            ...{ 'onExport': {} },
            ...{ 'onReset': {} },
            unit: (__VLS_ctx.unit),
            autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
            waterWeight: (__VLS_ctx.waterWeight),
            waterActivity: (__VLS_ctx.waterActivity),
            waterClimate: (__VLS_ctx.waterClimate),
            waterResult: (__VLS_ctx.waterResult),
            isFavorite: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        let __VLS_166;
        let __VLS_167;
        let __VLS_168;
        const __VLS_169 = {
            onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Wasserbedarf'))
        };
        const __VLS_170 = {
            'onUpdate:waterWeight': (v => __VLS_ctx.waterWeight = v)
        };
        const __VLS_171 = {
            'onUpdate:waterActivity': (v => __VLS_ctx.waterActivity = v)
        };
        const __VLS_172 = {
            'onUpdate:waterClimate': (v => __VLS_ctx.waterClimate = v)
        };
        const __VLS_173 = {
            onCalculate: (__VLS_ctx.calculateWater)
        };
        const __VLS_174 = {
            onCopy: (__VLS_ctx.copyWater)
        };
        const __VLS_175 = {
            onExport: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Wasserbedarf') && __VLS_ctx.matchesCalc('Wasserbedarf')))
                    return;
                __VLS_ctx.openDownloadPopup('water');
            }
        };
        const __VLS_176 = {
            onReset: (...[$event]) => {
                if (!(__VLS_ctx.favoriteCalcs.length))
                    return;
                if (!(__VLS_ctx.isFavorite('Wasserbedarf') && __VLS_ctx.matchesCalc('Wasserbedarf')))
                    return;
                __VLS_ctx.resetCalculator('water');
            }
        };
        var __VLS_165;
    }
}
if (__VLS_ctx.isFavorite('BMI') && __VLS_ctx.matchesCalc('BMI')) {
    /** @type {[typeof BmiCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(BmiCalculator, new BmiCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:bmiGender': {} },
        ...{ 'onUpdate:bmiWeight': {} },
        ...{ 'onUpdate:bmiHeight': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        title: "BMI-Rechner",
        info: "Der BMI (Body-Mass-Index) misst das Verhältnis von Gewicht zu Größe.",
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        bmiGender: (__VLS_ctx.bmiGender),
        bmiWeight: (__VLS_ctx.bmiWeight),
        bmiHeight: (__VLS_ctx.bmiHeight),
        bmiResult: (__VLS_ctx.bmiResult),
        isFavorite: (__VLS_ctx.isFavorite('BMI')),
    }));
    const __VLS_178 = __VLS_177({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:bmiGender': {} },
        ...{ 'onUpdate:bmiWeight': {} },
        ...{ 'onUpdate:bmiHeight': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        title: "BMI-Rechner",
        info: "Der BMI (Body-Mass-Index) misst das Verhältnis von Gewicht zu Größe.",
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        bmiGender: (__VLS_ctx.bmiGender),
        bmiWeight: (__VLS_ctx.bmiWeight),
        bmiHeight: (__VLS_ctx.bmiHeight),
        bmiResult: (__VLS_ctx.bmiResult),
        isFavorite: (__VLS_ctx.isFavorite('BMI')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    let __VLS_180;
    let __VLS_181;
    let __VLS_182;
    const __VLS_183 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('BMI'))
    };
    const __VLS_184 = {
        'onUpdate:bmiGender': (val => (__VLS_ctx.bmiGender = val))
    };
    const __VLS_185 = {
        'onUpdate:bmiWeight': (val => (__VLS_ctx.bmiWeight = val))
    };
    const __VLS_186 = {
        'onUpdate:bmiHeight': (val => (__VLS_ctx.bmiHeight = val))
    };
    const __VLS_187 = {
        onCalculate: (__VLS_ctx.calculateBMI)
    };
    const __VLS_188 = {
        onCopy: (__VLS_ctx.copyBMI)
    };
    const __VLS_189 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.isFavorite('BMI') && __VLS_ctx.matchesCalc('BMI')))
                return;
            __VLS_ctx.openDownloadPopup('bmi');
        }
    };
    const __VLS_190 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.isFavorite('BMI') && __VLS_ctx.matchesCalc('BMI')))
                return;
            __VLS_ctx.resetCalculator('bmi');
        }
    };
    var __VLS_179;
}
if (__VLS_ctx.matchesCalc('Kalorienbedarf') && !__VLS_ctx.isFavorite('Kalorienbedarf')) {
    /** @type {[typeof CaloriesCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(CaloriesCalculator, new CaloriesCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:calorieAge': {} },
        ...{ 'onUpdate:calorieGender': {} },
        ...{ 'onUpdate:calorieWeight': {} },
        ...{ 'onUpdate:calorieHeight': {} },
        ...{ 'onUpdate:calorieActivity': {} },
        ...{ 'onUpdate:calorieGoal': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        calorieAge: (__VLS_ctx.calorieAge),
        calorieGender: (__VLS_ctx.calorieGender),
        calorieWeight: (__VLS_ctx.calorieWeight),
        calorieHeight: (__VLS_ctx.calorieHeight),
        calorieActivity: (__VLS_ctx.calorieActivity),
        calorieGoal: (__VLS_ctx.calorieGoal),
        calorieResult: (__VLS_ctx.calorieResult),
        isFavorite: (__VLS_ctx.isFavorite('Kalorienbedarf')),
    }));
    const __VLS_192 = __VLS_191({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:calorieAge': {} },
        ...{ 'onUpdate:calorieGender': {} },
        ...{ 'onUpdate:calorieWeight': {} },
        ...{ 'onUpdate:calorieHeight': {} },
        ...{ 'onUpdate:calorieActivity': {} },
        ...{ 'onUpdate:calorieGoal': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        calorieAge: (__VLS_ctx.calorieAge),
        calorieGender: (__VLS_ctx.calorieGender),
        calorieWeight: (__VLS_ctx.calorieWeight),
        calorieHeight: (__VLS_ctx.calorieHeight),
        calorieActivity: (__VLS_ctx.calorieActivity),
        calorieGoal: (__VLS_ctx.calorieGoal),
        calorieResult: (__VLS_ctx.calorieResult),
        isFavorite: (__VLS_ctx.isFavorite('Kalorienbedarf')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    let __VLS_194;
    let __VLS_195;
    let __VLS_196;
    const __VLS_197 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Kalorienbedarf'))
    };
    const __VLS_198 = {
        'onUpdate:calorieAge': (v => __VLS_ctx.calorieAge = v)
    };
    const __VLS_199 = {
        'onUpdate:calorieGender': (v => __VLS_ctx.calorieGender = v)
    };
    const __VLS_200 = {
        'onUpdate:calorieWeight': (v => __VLS_ctx.calorieWeight = v)
    };
    const __VLS_201 = {
        'onUpdate:calorieHeight': (v => __VLS_ctx.calorieHeight = v)
    };
    const __VLS_202 = {
        'onUpdate:calorieActivity': (v => __VLS_ctx.calorieActivity = v)
    };
    const __VLS_203 = {
        'onUpdate:calorieGoal': (v => __VLS_ctx.calorieGoal = v)
    };
    const __VLS_204 = {
        onCalculate: (__VLS_ctx.calculateCalories)
    };
    const __VLS_205 = {
        onCopy: (__VLS_ctx.copyCalories)
    };
    const __VLS_206 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Kalorienbedarf') && !__VLS_ctx.isFavorite('Kalorienbedarf')))
                return;
            __VLS_ctx.openDownloadPopup('calories');
        }
    };
    const __VLS_207 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Kalorienbedarf') && !__VLS_ctx.isFavorite('Kalorienbedarf')))
                return;
            __VLS_ctx.resetCalculator('calories');
        }
    };
    var __VLS_193;
}
if (__VLS_ctx.matchesCalc('Proteinbedarf') && !__VLS_ctx.isFavorite('Proteinbedarf')) {
    /** @type {[typeof ProteinCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(ProteinCalculator, new ProteinCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:proteinWeight': {} },
        ...{ 'onUpdate:proteinActivity': {} },
        ...{ 'onUpdate:proteinMeals': {} },
        ...{ 'onUpdate:proteinGoal': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        proteinWeight: (__VLS_ctx.proteinWeight),
        proteinGoal: (__VLS_ctx.proteinGoal),
        proteinActivity: (__VLS_ctx.proteinActivity),
        proteinMeals: (__VLS_ctx.proteinMeals),
        proteinResult: (__VLS_ctx.proteinResult),
        isFavorite: (__VLS_ctx.isFavorite('Proteinbedarf')),
    }));
    const __VLS_209 = __VLS_208({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:proteinWeight': {} },
        ...{ 'onUpdate:proteinActivity': {} },
        ...{ 'onUpdate:proteinMeals': {} },
        ...{ 'onUpdate:proteinGoal': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        proteinWeight: (__VLS_ctx.proteinWeight),
        proteinGoal: (__VLS_ctx.proteinGoal),
        proteinActivity: (__VLS_ctx.proteinActivity),
        proteinMeals: (__VLS_ctx.proteinMeals),
        proteinResult: (__VLS_ctx.proteinResult),
        isFavorite: (__VLS_ctx.isFavorite('Proteinbedarf')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    let __VLS_211;
    let __VLS_212;
    let __VLS_213;
    const __VLS_214 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Proteinbedarf'))
    };
    const __VLS_215 = {
        'onUpdate:proteinWeight': (v => __VLS_ctx.proteinWeight = v)
    };
    const __VLS_216 = {
        'onUpdate:proteinActivity': (v => __VLS_ctx.proteinActivity = v)
    };
    const __VLS_217 = {
        'onUpdate:proteinMeals': (v => __VLS_ctx.proteinMeals = v)
    };
    const __VLS_218 = {
        'onUpdate:proteinGoal': (v => __VLS_ctx.proteinGoal = v)
    };
    const __VLS_219 = {
        onCalculate: (__VLS_ctx.calculateProtein)
    };
    const __VLS_220 = {
        onCopy: (__VLS_ctx.copyProtein)
    };
    const __VLS_221 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Proteinbedarf') && !__VLS_ctx.isFavorite('Proteinbedarf')))
                return;
            __VLS_ctx.openDownloadPopup('protein');
        }
    };
    const __VLS_222 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Proteinbedarf') && !__VLS_ctx.isFavorite('Proteinbedarf')))
                return;
            __VLS_ctx.resetCalculator('protein');
        }
    };
    var __VLS_210;
}
if (__VLS_ctx.matchesCalc('1RM') && !__VLS_ctx.isFavorite('1RM')) {
    /** @type {[typeof OneRmCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent(OneRmCalculator, new OneRmCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:oneRmExercise': {} },
        ...{ 'onUpdate:oneRmWeight': {} },
        ...{ 'onUpdate:oneRmReps': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        oneRmExercise: (__VLS_ctx.oneRmExercise),
        oneRmWeight: (__VLS_ctx.oneRmWeight),
        oneRmReps: (__VLS_ctx.oneRmReps),
        oneRmResult: (__VLS_ctx.oneRmResult),
        isFavorite: (__VLS_ctx.isFavorite('1RM')),
        formattedResult: (__VLS_ctx.oneRmResult !== null ? __VLS_ctx.formatWeight(__VLS_ctx.oneRmResult, 1) : ''),
    }));
    const __VLS_224 = __VLS_223({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:oneRmExercise': {} },
        ...{ 'onUpdate:oneRmWeight': {} },
        ...{ 'onUpdate:oneRmReps': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        oneRmExercise: (__VLS_ctx.oneRmExercise),
        oneRmWeight: (__VLS_ctx.oneRmWeight),
        oneRmReps: (__VLS_ctx.oneRmReps),
        oneRmResult: (__VLS_ctx.oneRmResult),
        isFavorite: (__VLS_ctx.isFavorite('1RM')),
        formattedResult: (__VLS_ctx.oneRmResult !== null ? __VLS_ctx.formatWeight(__VLS_ctx.oneRmResult, 1) : ''),
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    let __VLS_226;
    let __VLS_227;
    let __VLS_228;
    const __VLS_229 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('1RM'))
    };
    const __VLS_230 = {
        'onUpdate:oneRmExercise': (v => __VLS_ctx.oneRmExercise = v)
    };
    const __VLS_231 = {
        'onUpdate:oneRmWeight': (v => __VLS_ctx.oneRmWeight = v)
    };
    const __VLS_232 = {
        'onUpdate:oneRmReps': (v => __VLS_ctx.oneRmReps = v)
    };
    const __VLS_233 = {
        onCalculate: (__VLS_ctx.calculateOneRm)
    };
    const __VLS_234 = {
        onCopy: (__VLS_ctx.copyOneRm)
    };
    const __VLS_235 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('1RM') && !__VLS_ctx.isFavorite('1RM')))
                return;
            __VLS_ctx.openDownloadPopup('oneRm');
        }
    };
    const __VLS_236 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('1RM') && !__VLS_ctx.isFavorite('1RM')))
                return;
            __VLS_ctx.resetCalculator('oneRm');
        }
    };
    var __VLS_225;
}
if (__VLS_ctx.matchesCalc('Koffein') && !__VLS_ctx.isFavorite('Koffein')) {
    /** @type {[typeof CaffeineSafeDoseCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(CaffeineSafeDoseCalculator, new CaffeineSafeDoseCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:cafWeight': {} },
        ...{ 'onUpdate:cafSensitivity': {} },
        ...{ 'onUpdate:cafStatus': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        cafWeight: (__VLS_ctx.cafWeight),
        cafSensitivity: (__VLS_ctx.cafSensitivity),
        cafStatus: (__VLS_ctx.cafStatus),
        cafResult: (__VLS_ctx.cafResult),
        isFavorite: (__VLS_ctx.isFavorite('Koffein')),
    }));
    const __VLS_238 = __VLS_237({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:cafWeight': {} },
        ...{ 'onUpdate:cafSensitivity': {} },
        ...{ 'onUpdate:cafStatus': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        cafWeight: (__VLS_ctx.cafWeight),
        cafSensitivity: (__VLS_ctx.cafSensitivity),
        cafStatus: (__VLS_ctx.cafStatus),
        cafResult: (__VLS_ctx.cafResult),
        isFavorite: (__VLS_ctx.isFavorite('Koffein')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    let __VLS_240;
    let __VLS_241;
    let __VLS_242;
    const __VLS_243 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Koffein'))
    };
    const __VLS_244 = {
        'onUpdate:cafWeight': (v => __VLS_ctx.cafWeight = v)
    };
    const __VLS_245 = {
        'onUpdate:cafSensitivity': (v => __VLS_ctx.cafSensitivity = v)
    };
    const __VLS_246 = {
        'onUpdate:cafStatus': (v => __VLS_ctx.cafStatus = v)
    };
    const __VLS_247 = {
        onCalculate: (__VLS_ctx.calculateCaffeine)
    };
    const __VLS_248 = {
        onCopy: (__VLS_ctx.copyCaffeine)
    };
    const __VLS_249 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Koffein') && !__VLS_ctx.isFavorite('Koffein')))
                return;
            __VLS_ctx.openDownloadPopup('caffeine');
        }
    };
    const __VLS_250 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Koffein') && !__VLS_ctx.isFavorite('Koffein')))
                return;
            __VLS_ctx.resetCalculator('caffeine');
        }
    };
    var __VLS_239;
}
if (__VLS_ctx.matchesCalc('Körperfett') && !__VLS_ctx.isFavorite('Körperfett')) {
    /** @type {[typeof BodyFatCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(BodyFatCalculator, new BodyFatCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:bodyFatGender': {} },
        ...{ 'onUpdate:bodyFatWaist': {} },
        ...{ 'onUpdate:bodyFatNeck': {} },
        ...{ 'onUpdate:bodyFatHip': {} },
        ...{ 'onUpdate:bodyFatHeight': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        bodyFatGender: (__VLS_ctx.bodyFatGender),
        bodyFatWaist: (__VLS_ctx.bodyFatWaist),
        bodyFatNeck: (__VLS_ctx.bodyFatNeck),
        bodyFatHip: (__VLS_ctx.bodyFatHip),
        bodyFatHeight: (__VLS_ctx.bodyFatHeight),
        bodyFatResult: (__VLS_ctx.bodyFatResult),
        isFavorite: (__VLS_ctx.isFavorite('Körperfett')),
    }));
    const __VLS_252 = __VLS_251({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:bodyFatGender': {} },
        ...{ 'onUpdate:bodyFatWaist': {} },
        ...{ 'onUpdate:bodyFatNeck': {} },
        ...{ 'onUpdate:bodyFatHip': {} },
        ...{ 'onUpdate:bodyFatHeight': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        bodyFatGender: (__VLS_ctx.bodyFatGender),
        bodyFatWaist: (__VLS_ctx.bodyFatWaist),
        bodyFatNeck: (__VLS_ctx.bodyFatNeck),
        bodyFatHip: (__VLS_ctx.bodyFatHip),
        bodyFatHeight: (__VLS_ctx.bodyFatHeight),
        bodyFatResult: (__VLS_ctx.bodyFatResult),
        isFavorite: (__VLS_ctx.isFavorite('Körperfett')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    let __VLS_254;
    let __VLS_255;
    let __VLS_256;
    const __VLS_257 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Körperfett'))
    };
    const __VLS_258 = {
        'onUpdate:bodyFatGender': (v => __VLS_ctx.bodyFatGender = v)
    };
    const __VLS_259 = {
        'onUpdate:bodyFatWaist': (v => __VLS_ctx.bodyFatWaist = v)
    };
    const __VLS_260 = {
        'onUpdate:bodyFatNeck': (v => __VLS_ctx.bodyFatNeck = v)
    };
    const __VLS_261 = {
        'onUpdate:bodyFatHip': (v => __VLS_ctx.bodyFatHip = v)
    };
    const __VLS_262 = {
        'onUpdate:bodyFatHeight': (v => __VLS_ctx.bodyFatHeight = v)
    };
    const __VLS_263 = {
        onCalculate: (__VLS_ctx.calculateBodyFat)
    };
    const __VLS_264 = {
        onCopy: (__VLS_ctx.copyBodyFat)
    };
    const __VLS_265 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Körperfett') && !__VLS_ctx.isFavorite('Körperfett')))
                return;
            __VLS_ctx.openDownloadPopup('bodyFat');
        }
    };
    const __VLS_266 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Körperfett') && !__VLS_ctx.isFavorite('Körperfett')))
                return;
            __VLS_ctx.resetCalculator('bodyFat');
        }
    };
    var __VLS_253;
}
if (__VLS_ctx.matchesCalc('FFMI') && !__VLS_ctx.isFavorite('FFMI')) {
    /** @type {[typeof FfmiCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_267 = __VLS_asFunctionalComponent(FfmiCalculator, new FfmiCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:ffmiWeight': {} },
        ...{ 'onUpdate:ffmiHeight': {} },
        ...{ 'onUpdate:ffmiBodyFat': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        ffmiWeight: (__VLS_ctx.ffmiWeight),
        ffmiHeight: (__VLS_ctx.ffmiHeight),
        ffmiBodyFat: (__VLS_ctx.ffmiBodyFat),
        ffmiResult: (__VLS_ctx.ffmiResult),
        isFavorite: (__VLS_ctx.isFavorite('FFMI')),
    }));
    const __VLS_268 = __VLS_267({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:ffmiWeight': {} },
        ...{ 'onUpdate:ffmiHeight': {} },
        ...{ 'onUpdate:ffmiBodyFat': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        ffmiWeight: (__VLS_ctx.ffmiWeight),
        ffmiHeight: (__VLS_ctx.ffmiHeight),
        ffmiBodyFat: (__VLS_ctx.ffmiBodyFat),
        ffmiResult: (__VLS_ctx.ffmiResult),
        isFavorite: (__VLS_ctx.isFavorite('FFMI')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_267));
    let __VLS_270;
    let __VLS_271;
    let __VLS_272;
    const __VLS_273 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('FFMI'))
    };
    const __VLS_274 = {
        'onUpdate:ffmiWeight': (v => __VLS_ctx.ffmiWeight = v)
    };
    const __VLS_275 = {
        'onUpdate:ffmiHeight': (v => __VLS_ctx.ffmiHeight = v)
    };
    const __VLS_276 = {
        'onUpdate:ffmiBodyFat': (v => __VLS_ctx.ffmiBodyFat = v)
    };
    const __VLS_277 = {
        onCalculate: (__VLS_ctx.calculateFFMI)
    };
    const __VLS_278 = {
        onCopy: (__VLS_ctx.copyFFMI)
    };
    const __VLS_279 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('FFMI') && !__VLS_ctx.isFavorite('FFMI')))
                return;
            __VLS_ctx.openDownloadPopup('ffmi');
        }
    };
    const __VLS_280 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('FFMI') && !__VLS_ctx.isFavorite('FFMI')))
                return;
            __VLS_ctx.resetCalculator('ffmi');
        }
    };
    var __VLS_269;
}
if (__VLS_ctx.matchesCalc('Glykämische Last') && !__VLS_ctx.isFavorite('Glykämische Last')) {
    /** @type {[typeof GlycemicLoadCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(GlycemicLoadCalculator, new GlycemicLoadCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:glFood': {} },
        ...{ 'onUpdate:glServing': {} },
        ...{ 'onUpdate:glCarbs100': {} },
        ...{ 'onUpdate:glGi': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        glFood: (__VLS_ctx.glFood),
        glServing: (__VLS_ctx.glServing),
        glCarbs100: (__VLS_ctx.glCarbs100),
        glGi: (__VLS_ctx.glGi),
        glResult: (__VLS_ctx.glResult),
        isFavorite: (__VLS_ctx.isFavorite('Glykämische Last')),
    }));
    const __VLS_282 = __VLS_281({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:glFood': {} },
        ...{ 'onUpdate:glServing': {} },
        ...{ 'onUpdate:glCarbs100': {} },
        ...{ 'onUpdate:glGi': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        glFood: (__VLS_ctx.glFood),
        glServing: (__VLS_ctx.glServing),
        glCarbs100: (__VLS_ctx.glCarbs100),
        glGi: (__VLS_ctx.glGi),
        glResult: (__VLS_ctx.glResult),
        isFavorite: (__VLS_ctx.isFavorite('Glykämische Last')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    let __VLS_284;
    let __VLS_285;
    let __VLS_286;
    const __VLS_287 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Glykämische Last'))
    };
    const __VLS_288 = {
        'onUpdate:glFood': (v => __VLS_ctx.glFood = v)
    };
    const __VLS_289 = {
        'onUpdate:glServing': (v => __VLS_ctx.glServing = v)
    };
    const __VLS_290 = {
        'onUpdate:glCarbs100': (v => __VLS_ctx.glCarbs100 = v)
    };
    const __VLS_291 = {
        'onUpdate:glGi': (v => __VLS_ctx.glGi = v)
    };
    const __VLS_292 = {
        onCalculate: (__VLS_ctx.calculateGlyLoad)
    };
    const __VLS_293 = {
        onCopy: (__VLS_ctx.copyGlyLoad)
    };
    const __VLS_294 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Glykämische Last') && !__VLS_ctx.isFavorite('Glykämische Last')))
                return;
            __VLS_ctx.openDownloadPopup('glyload');
        }
    };
    const __VLS_295 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Glykämische Last') && !__VLS_ctx.isFavorite('Glykämische Last')))
                return;
            __VLS_ctx.resetCalculator('glyload');
        }
    };
    var __VLS_283;
}
if (__VLS_ctx.matchesCalc('Wasserbedarf') && !__VLS_ctx.isFavorite('Wasserbedarf')) {
    /** @type {[typeof WaterCalculator, ]} */ ;
    // @ts-ignore
    const __VLS_296 = __VLS_asFunctionalComponent(WaterCalculator, new WaterCalculator({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:waterWeight': {} },
        ...{ 'onUpdate:waterActivity': {} },
        ...{ 'onUpdate:waterClimate': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        waterWeight: (__VLS_ctx.waterWeight),
        waterActivity: (__VLS_ctx.waterActivity),
        waterClimate: (__VLS_ctx.waterClimate),
        waterResult: (__VLS_ctx.waterResult),
        isFavorite: (__VLS_ctx.isFavorite('Wasserbedarf')),
    }));
    const __VLS_297 = __VLS_296({
        ...{ 'onToggleFavorite': {} },
        ...{ 'onUpdate:waterWeight': {} },
        ...{ 'onUpdate:waterActivity': {} },
        ...{ 'onUpdate:waterClimate': {} },
        ...{ 'onCalculate': {} },
        ...{ 'onCopy': {} },
        ...{ 'onExport': {} },
        ...{ 'onReset': {} },
        unit: (__VLS_ctx.unit),
        autoCalcEnabled: (__VLS_ctx.autoCalcEnabled),
        waterWeight: (__VLS_ctx.waterWeight),
        waterActivity: (__VLS_ctx.waterActivity),
        waterClimate: (__VLS_ctx.waterClimate),
        waterResult: (__VLS_ctx.waterResult),
        isFavorite: (__VLS_ctx.isFavorite('Wasserbedarf')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_296));
    let __VLS_299;
    let __VLS_300;
    let __VLS_301;
    const __VLS_302 = {
        onToggleFavorite: (() => __VLS_ctx.toggleFavorite('Wasserbedarf'))
    };
    const __VLS_303 = {
        'onUpdate:waterWeight': (v => __VLS_ctx.waterWeight = v)
    };
    const __VLS_304 = {
        'onUpdate:waterActivity': (v => __VLS_ctx.waterActivity = v)
    };
    const __VLS_305 = {
        'onUpdate:waterClimate': (v => __VLS_ctx.waterClimate = v)
    };
    const __VLS_306 = {
        onCalculate: (__VLS_ctx.calculateWater)
    };
    const __VLS_307 = {
        onCopy: (__VLS_ctx.copyWater)
    };
    const __VLS_308 = {
        onExport: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Wasserbedarf') && !__VLS_ctx.isFavorite('Wasserbedarf')))
                return;
            __VLS_ctx.openDownloadPopup('water');
        }
    };
    const __VLS_309 = {
        onReset: (...[$event]) => {
            if (!(__VLS_ctx.matchesCalc('Wasserbedarf') && !__VLS_ctx.isFavorite('Wasserbedarf')))
                return;
            __VLS_ctx.resetCalculator('water');
        }
    };
    var __VLS_298;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plans-section" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'plans') }, null, null);
if (__VLS_ctx.matchesPlanSearch('Trainingsplan')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.matchesPlanSearch('Trainingsplan')))
                    return;
                __VLS_ctx.openDownloadPopup('plans');
            } },
        ...{ class: "action-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
if (__VLS_ctx.matchesPlanSearch('Ernährungsplan')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.matchesPlanSearch('Ernährungsplan')))
                    return;
                __VLS_ctx.openDownloadPopup('nutrition');
            } },
        ...{ class: "action-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {[typeof WeightPopup, ]} */ ;
// @ts-ignore
const __VLS_310 = __VLS_asFunctionalComponent(WeightPopup, new WeightPopup({
    ...{ 'onSave': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showWeightPopup),
    modelValue: (__VLS_ctx.newWeight),
    placeholder: (__VLS_ctx.unit === 'kg' ? 'Gewicht in kg' : 'Gewicht in lbs'),
}));
const __VLS_311 = __VLS_310({
    ...{ 'onSave': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showWeightPopup),
    modelValue: (__VLS_ctx.newWeight),
    placeholder: (__VLS_ctx.unit === 'kg' ? 'Gewicht in kg' : 'Gewicht in lbs'),
}, ...__VLS_functionalComponentArgsRest(__VLS_310));
let __VLS_313;
let __VLS_314;
let __VLS_315;
const __VLS_316 = {
    onSave: (__VLS_ctx.saveWeight)
};
const __VLS_317 = {
    onCancel: (__VLS_ctx.closeWeightPopup)
};
var __VLS_312;
/** @type {[typeof GoalPopup, ]} */ ;
// @ts-ignore
const __VLS_318 = __VLS_asFunctionalComponent(GoalPopup, new GoalPopup({
    ...{ 'onSave': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showGoalPopup),
    modelValue: (__VLS_ctx.newGoal),
    placeholder: (__VLS_ctx.unit === 'kg' ? 'Ziel in kg' : 'Ziel in lbs'),
}));
const __VLS_319 = __VLS_318({
    ...{ 'onSave': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showGoalPopup),
    modelValue: (__VLS_ctx.newGoal),
    placeholder: (__VLS_ctx.unit === 'kg' ? 'Ziel in kg' : 'Ziel in lbs'),
}, ...__VLS_functionalComponentArgsRest(__VLS_318));
let __VLS_321;
let __VLS_322;
let __VLS_323;
const __VLS_324 = {
    onSave: (__VLS_ctx.saveGoal)
};
const __VLS_325 = {
    onCancel: (__VLS_ctx.closeGoalPopup)
};
var __VLS_320;
/** @type {[typeof ExportPopup, ]} */ ;
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent(ExportPopup, new ExportPopup({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showDownloadPopup),
    modelValue: (__VLS_ctx.downloadFormat),
}));
const __VLS_327 = __VLS_326({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    show: (__VLS_ctx.showDownloadPopup),
    modelValue: (__VLS_ctx.downloadFormat),
}, ...__VLS_functionalComponentArgsRest(__VLS_326));
let __VLS_329;
let __VLS_330;
let __VLS_331;
const __VLS_332 = {
    onConfirm: (__VLS_ctx.confirmDownload)
};
const __VLS_333 = {
    onCancel: (__VLS_ctx.closeDownloadPopup)
};
var __VLS_328;
/** @type {[typeof Toast, ]} */ ;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent(Toast, new Toast({
    ...{ 'onDismiss': {} },
    toast: (__VLS_ctx.toast),
    position: "bottom-right",
    dismissible: (true),
}));
const __VLS_335 = __VLS_334({
    ...{ 'onDismiss': {} },
    toast: (__VLS_ctx.toast),
    position: "bottom-right",
    dismissible: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
let __VLS_337;
let __VLS_338;
let __VLS_339;
const __VLS_340 = {
    onDismiss: (__VLS_ctx.startToastExit)
};
var __VLS_336;
/** @type {__VLS_StyleScopedClasses['progress']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtext']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-container']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-charts']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['calc-filterbar']} */ ;
/** @type {__VLS_StyleScopedClasses['calc-filterlabel']} */ ;
/** @type {__VLS_StyleScopedClasses['calc-filterselect']} */ ;
/** @type {__VLS_StyleScopedClasses['calculators-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plans-section']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Toast: Toast,
            DashboardCard: DashboardCard,
            WeightPopup: WeightPopup,
            GoalPopup: GoalPopup,
            ExportPopup: ExportPopup,
            TabsBar: TabsBar,
            ChartCard: ChartCard,
            BmiCalculator: BmiCalculator,
            CaloriesCalculator: CaloriesCalculator,
            OneRmCalculator: OneRmCalculator,
            BodyFatCalculator: BodyFatCalculator,
            FfmiCalculator: FfmiCalculator,
            WaterCalculator: WaterCalculator,
            ProteinCalculator: ProteinCalculator,
            CaffeineSafeDoseCalculator: CaffeineSafeDoseCalculator,
            GlycemicLoadCalculator: GlycemicLoadCalculator,
            unit: unit,
            formatWeight: formatWeight,
            workouts: workouts,
            glFood: glFood,
            glServing: glServing,
            glCarbs100: glCarbs100,
            glGi: glGi,
            glResult: glResult,
            newWeight: newWeight,
            goal: goal,
            newGoal: newGoal,
            showWeightPopup: showWeightPopup,
            showGoalPopup: showGoalPopup,
            showDownloadPopup: showDownloadPopup,
            toast: toast,
            downloadFormat: downloadFormat,
            searchQuery: searchQuery,
            activeTab: activeTab,
            bmiGender: bmiGender,
            bmiWeight: bmiWeight,
            bmiHeight: bmiHeight,
            bmiResult: bmiResult,
            proteinActivity: proteinActivity,
            proteinMeals: proteinMeals,
            calorieAge: calorieAge,
            calorieGender: calorieGender,
            calorieWeight: calorieWeight,
            calorieHeight: calorieHeight,
            calorieActivity: calorieActivity,
            calorieGoal: calorieGoal,
            calorieResult: calorieResult,
            proteinWeight: proteinWeight,
            proteinGoal: proteinGoal,
            proteinResult: proteinResult,
            favoriteCalcs: favoriteCalcs,
            cafWeight: cafWeight,
            cafSensitivity: cafSensitivity,
            cafStatus: cafStatus,
            cafResult: cafResult,
            isFavorite: isFavorite,
            toggleFavorite: toggleFavorite,
            oneRmExercise: oneRmExercise,
            oneRmWeight: oneRmWeight,
            oneRmReps: oneRmReps,
            oneRmResult: oneRmResult,
            bodyFatGender: bodyFatGender,
            bodyFatWaist: bodyFatWaist,
            bodyFatNeck: bodyFatNeck,
            bodyFatHip: bodyFatHip,
            bodyFatHeight: bodyFatHeight,
            bodyFatResult: bodyFatResult,
            ffmiWeight: ffmiWeight,
            ffmiHeight: ffmiHeight,
            ffmiBodyFat: ffmiBodyFat,
            ffmiResult: ffmiResult,
            waterWeight: waterWeight,
            waterActivity: waterActivity,
            waterClimate: waterClimate,
            waterResult: waterResult,
            planSearchQuery: planSearchQuery,
            autoCalcEnabled: autoCalcEnabled,
            matchesPlanSearch: matchesPlanSearch,
            currentWeightDisplay: currentWeightDisplay,
            lastWorkout: lastWorkout,
            totalCalories: totalCalories,
            calculateProtein: calculateProtein,
            copyProtein: copyProtein,
            startToastExit: startToastExit,
            resetWeightStats: resetWeightStats,
            resetWorkoutStats: resetWorkoutStats,
            calculateBMI: calculateBMI,
            calculateCalories: calculateCalories,
            calculateOneRm: calculateOneRm,
            calcCategory: calcCategory,
            calculateGlyLoad: calculateGlyLoad,
            copyGlyLoad: copyGlyLoad,
            calculateCaffeine: calculateCaffeine,
            copyCaffeine: copyCaffeine,
            matchesCalc: matchesCalc,
            calculateBodyFat: calculateBodyFat,
            calculateFFMI: calculateFFMI,
            calculateWater: calculateWater,
            resetCalculator: resetCalculator,
            openDownloadPopup: openDownloadPopup,
            closeDownloadPopup: closeDownloadPopup,
            confirmDownload: confirmDownload,
            openWeightPopup: openWeightPopup,
            saveWeight: saveWeight,
            closeWeightPopup: closeWeightPopup,
            openGoalPopup: openGoalPopup,
            saveGoal: saveGoal,
            closeGoalPopup: closeGoalPopup,
            copyBMI: copyBMI,
            copyCalories: copyCalories,
            copyOneRm: copyOneRm,
            copyBodyFat: copyBodyFat,
            copyFFMI: copyFFMI,
            copyWater: copyWater,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
