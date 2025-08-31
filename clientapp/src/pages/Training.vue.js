import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { jsPDF } from 'jspdf';
// Refs
const plans = ref([]);
const favoritePlans = ref([]);
const planName = ref('');
const newExercise = ref('');
const customPlanExercise = ref('');
const newReps = ref(null);
const newSets = ref(null);
const editingPlanId = ref(null);
const selectedPlanExercises = ref([]);
const selectedPlan = ref(null);
const showTimerPopup = ref(false);
const showDeletePopup = ref(false);
const showEditPopup = ref(false);
const showAddTimerPopup = ref(false);
const showAddStopwatchPopup = ref(false);
const showDownloadPopup = ref(false);
const showValidationPopup = ref(false);
const validationErrorMessages = ref([]);
const validationOkButton = ref(null);
const downloadPlan = ref(null);
const downloadFormat = ref('html');
const newTimerName = ref('');
const newStopwatchName = ref('');
const deleteAction = ref(null);
const predefinedExercises = ref([
    'Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Liegestütze', 'Klimmzüge', 'Latzug', 'Rudern',
    'Bizepscurls', 'Trizepsdrücken', 'Beinpresse', 'Ausfallschritte', 'Butterfly', 'Seitheben', 'Wadenheben',
    'Bauchpresse', 'Rückenstrecker', 'Beinstrecker', 'Beinbeuger', 'Brustpresse', 'Dips'
]);
const muscleGroups = ref({
    Brust: ['Bankdrücken', 'Liegestütze', 'Butterfly', 'Brustpresse'],
    Rücken: ['Klimmzüge', 'Latzug', 'Rudern', 'Rückenstrecker'],
    Beine: ['Kniebeugen', 'Kreuzheben', 'Beinpresse', 'Ausfallschritte', 'Wadenheben'],
    Schultern: ['Schulterdrücken', 'Seitheben'],
    Arme: ['Bizepscurls', 'Trizepsdrücken', 'Dips'],
    Bauch: ['Bauchpresse']
});
const exerciseFilter = ref('');
const trainingGoals = ref(['Muskelaufbau', 'Abnehmen', 'Ausdauer', 'Kraft']);
const selectedGoal = ref('');
const showExtras = ref(false);
const timers = ref([]);
const stopwatches = ref([]);
const isTimerSticky = ref(false);
const isStopwatchSticky = ref(false);
const columnWidths = ref([50, 25, 25]);
const rowHeights = ref([]);
const planSearch = ref('');
const editValue = ref('');
const editType = ref('table');
const editIndex = ref(null);
const editCellIndex = ref(null);
const editInput = ref(null);
const newTimerInput = ref(null);
const newStopwatchInput = ref(null);
const showCustomExercises = ref(false);
const exerciseEditIndex = ref(null);
const exerciseEditField = ref(null);
const customExercises = ref([]);
const toast = ref(null);
let toastId = 0;
let toastTimeout = null;
const audioPaths = {
    standard: '/sounds/standard.mp3',
    alarm: '/sounds/alarm.mp3',
    beep: '/sounds/beep.mp3',
    dong: '/sounds/dong.mp3',
    decide: '/sounds/decide.mp3'
};
const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
        if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300]);
        }
    }
};
const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('🔔 Benachrichtigungen aktiviert!');
            }
        });
    }
};
// Computed properties
const filteredPlans = computed(() => {
    const searchTerm = planSearch.value.toLowerCase();
    return sortedPlans.value.filter(plan => {
        const planNameMatch = plan.name.toLowerCase().includes(searchTerm);
        const goalMatch = plan.exercises.some(ex => ex.goal?.toLowerCase().includes(searchTerm));
        return planNameMatch || goalMatch;
    });
});
const filteredExercises = computed(() => {
    const filter = exerciseFilter.value.toLowerCase();
    const predefined = predefinedExercises.value.filter(ex => ex.toLowerCase().includes(filter) ||
        Object.entries(muscleGroups.value).some(([group, exercises]) => group.toLowerCase().includes(filter) && exercises.includes(ex)));
    const custom = customExercises.value
        .filter(ex => ex.name.toLowerCase().includes(filter) ||
        ex.muscle.toLowerCase().includes(filter))
        .map(ex => ex.name);
    return [...new Set([...predefined, ...custom])];
});
const selectedPlanGoal = computed(() => {
    if (selectedPlan.value?.exercises.length) {
        const goals = new Set(selectedPlan.value.exercises.map(ex => ex.goal).filter(g => g));
        return goals.size === 1 ? goals.values().next().value : null;
    }
    return null;
});
const editPopupTitle = computed(() => {
    if (editType.value === 'planName' || editType.value === 'selectedPlanName')
        return 'Planname bearbeiten';
    if (editType.value === 'timerName')
        return 'Timername bearbeiten';
    if (editType.value === 'stopwatchName')
        return 'Stoppuhrname bearbeiten';
    if (editType.value === 'customExerciseName')
        return 'Übungsname bearbeiten';
    if (editType.value === 'customExerciseMuscle')
        return 'Muskelgruppe bearbeiten';
    if (editCellIndex.value === 0)
        return 'Übung bearbeiten';
    if (editCellIndex.value === 1)
        return 'Sätze bearbeiten';
    if (editCellIndex.value === 2)
        return 'Wiederholungen bearbeiten';
    return 'Bearbeiten';
});
const editInputType = computed(() => {
    if (editCellIndex.value === 0 || editType.value === 'planName' || editType.value === 'selectedPlanName' || editType.value === 'timerName' || editType.value === 'stopwatchName' || editType.value === 'customExerciseName' || editType.value === 'customExerciseMuscle')
        return 'text';
    return 'number';
});
const editPlaceholder = computed(() => {
    if (editType.value === 'planName' || editType.value === 'selectedPlanName')
        return 'Neuer Planname (3-20 Zeichen)';
    if (editType.value === 'timerName')
        return 'Neuer Timername';
    if (editType.value === 'stopwatchName')
        return 'Neuer Stoppuhrname (max. 30 Zeichen)';
    if (editType.value === 'customExerciseName')
        return 'Neuer Übungsname (max. 50 Zeichen)';
    if (editType.value === 'customExerciseMuscle')
        return 'Neue Muskelgruppe (max. 50 Zeichen)';
    if (editCellIndex.value === 0)
        return 'Neue Übung';
    if (editCellIndex.value === 1)
        return 'Neue Sätze (1-20)';
    if (editCellIndex.value === 2)
        return 'Neue Wiederholungen (1-50)';
    return 'Neuer Wert';
});
const sortedPlans = computed(() => {
    return [...plans.value].sort((a, b) => {
        const aIsFavorite = favoritePlans.value.includes(a.id);
        const bIsFavorite = favoritePlans.value.includes(b.id);
        if (aIsFavorite && !bIsFavorite)
            return -1;
        if (!aIsFavorite && bIsFavorite)
            return 1;
        return a.name.localeCompare(b.name);
    });
});
const formatTimerDisplay = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
const formatStopwatchDisplay = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};
const formatLapTime = (lapTime) => formatStopwatchDisplay(lapTime);
const loadFromStorage = () => {
    try {
        const data = localStorage.getItem('trainingData');
        if (data) {
            const parsed = JSON.parse(data);
            plans.value = Array.isArray(parsed.plans) ? parsed.plans : [];
            favoritePlans.value = Array.isArray(parsed.favoritePlans) ? parsed.favoritePlans : [];
            customExercises.value = Array.isArray(parsed.customExercises)
                ? parsed.customExercises.filter(ex => ex && typeof ex === 'object' && typeof ex.name === 'string' && typeof ex.muscle === 'string')
                : [];
            timers.value = Array.isArray(parsed.timers) ? parsed.timers.map((t) => ({ ...t, interval: null, isRunning: false })) : [];
            stopwatches.value = Array.isArray(parsed.stopwatches) ? parsed.stopwatches.map((s) => ({ ...s, interval: null, isRunning: false })) : [];
        }
    }
    catch (e) {
        console.error('Fehler beim Laden:', e);
        plans.value = [];
        favoritePlans.value = [];
        customExercises.value = [];
        timers.value = [];
        stopwatches.value = [];
        addToast('Fehler beim Laden der Daten', 'delete');
    }
};
const saveToStorage = () => {
    try {
        const data = {
            plans: plans.value,
            favoritePlans: favoritePlans.value,
            customExercises: customExercises.value,
            timers: timers.value.map(t => ({ ...t, interval: null, isRunning: false })),
            stopwatches: stopwatches.value.map(s => ({ ...s, interval: null, isRunning: false }))
        };
        localStorage.setItem('trainingData', JSON.stringify(data));
    }
    catch (e) {
        console.error('Fehler beim Speichern:', e);
        addToast('Fehler beim Speichern der Daten', 'delete');
    }
};
const toggleCustomExercises = () => {
    showCustomExercises.value = !showCustomExercises.value;
};
const editCell = (index, field) => {
    openEditPopup(`customExercise${field.charAt(0).toUpperCase() + field.slice(1)}`, index);
};
const finishEdit = () => {
    exerciseEditIndex.value = null;
    exerciseEditField.value = null;
};
const validateReps = (reps) => {
    if (reps == null || isNaN(reps))
        return 'Wiederholungen müssen eine Zahl sein';
    if (reps < 1 || reps > 50)
        return 'Wiederholungen müssen zwischen 1 und 50 liegen';
    if (!Number.isInteger(reps))
        return 'Wiederholungen müssen eine Ganzzahl sein';
    return null;
};
const validateSets = (sets) => {
    if (sets == null || isNaN(sets))
        return 'Sätze müssen eine Zahl sein';
    if (sets < 1 || sets > 20)
        return 'Sätze müssen zwischen 1 und 20 liegen';
    if (!Number.isInteger(sets))
        return 'Sätze müssen eine Ganzzahl sein';
    return null;
};
const validateCustomExercise = (name, muscle, editIndex = null) => {
    const trimmedName = name.trim();
    const trimmedMuscle = muscle.trim();
    if (!trimmedName)
        return 'Übungsname ist erforderlich';
    if (!trimmedMuscle)
        return 'Muskelgruppe ist erforderlich';
    if (trimmedName.length > 50)
        return 'Übungsname darf maximal 50 Zeichen lang sein';
    if (trimmedMuscle.length > 50)
        return 'Muskelgruppe darf maximal 50 Zeichen lang sein';
    const exists = customExercises.value.some((ex, i) => ex.name.toLowerCase() === trimmedName.toLowerCase() && (editIndex === null || i !== editIndex));
    if (exists)
        return 'Übungsname existiert bereits';
    return { name: trimmedName, muscle: trimmedMuscle };
};
const validatePlanName = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3)
        return false;
    if (trimmedName.length > 20)
        return false;
    return trimmedName;
};
const validateStopwatchName = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length > 30)
        return 'Stoppuhr darf maximal 30 Zeichen lang sein';
    return trimmedName || 'Stoppuhr';
};
const collectValidationErrors = () => {
    const errors = [];
    const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value;
    if (!exerciseToAdd)
        errors.push('Übung auswählen oder benutzerdefinierte Übung eingeben');
    else if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
        errors.push('Übung bereits im Plan vorhanden');
    }
    const setsError = validateSets(newSets.value);
    if (setsError)
        errors.push(setsError);
    const repsError = validateReps(newReps.value);
    if (repsError)
        errors.push(repsError);
    if (newExercise.value === 'custom' && customPlanExercise.value) {
        const muscleGroup = exerciseFilter.value || '';
        const validated = validateCustomExercise(customPlanExercise.value, muscleGroup);
        if (typeof validated === 'string')
            errors.push(validated);
    }
    return errors;
};
const openValidationPopup = (errors) => {
    console.log('openValidationPopup aufgerufen mit Fehlern:', errors);
    validationErrorMessages.value = errors;
    showValidationPopup.value = true;
    nextTick(() => {
        if (validationOkButton.value) {
            validationOkButton.value.focus();
            console.log('Fokus auf OK-Button im Validierungspopup gesetzt');
        }
    });
};
const closeValidationPopup = () => {
    showValidationPopup.value = false;
    validationErrorMessages.value = [];
};
const toggleFavoritePlan = (planId) => {
    if (favoritePlans.value.includes(planId)) {
        favoritePlans.value = favoritePlans.value.filter(id => id !== planId);
        addToast('Plan aus Favoriten entfernt', 'delete');
    }
    else {
        favoritePlans.value.push(planId);
        addToast('Plan zu Favoriten hinzugefügt', 'add');
    }
    saveToStorage();
};
const createOrUpdatePlan = () => {
    const validatedPlanName = validatePlanName(planName.value);
    if (validatedPlanName === false || !selectedPlanExercises.value.length) {
        const errors = [];
        if (validatedPlanName === false) {
            errors.push(planName.value.trim().length < 3
                ? 'Planname muss mindestens 3 Zeichen lang sein'
                : 'Planname darf maximal 20 Zeichen lang sein');
        }
        if (!selectedPlanExercises.value.length) {
            errors.push('Mindestens eine Übung ist erforderlich');
        }
        openValidationPopup(errors);
        return;
    }
    const plan = {
        id: editingPlanId.value || Date.now().toString(),
        name: validatedPlanName,
        exercises: [...selectedPlanExercises.value]
    };
    if (editingPlanId.value) {
        const index = plans.value.findIndex(p => p.id === editingPlanId.value);
        if (index !== -1)
            plans.value[index] = plan;
        addToast('Plan gespeichert', 'save');
        editingPlanId.value = null;
    }
    else {
        plans.value.push(plan);
        addToast('Plan erstellt', 'add');
    }
    planName.value = '';
    newExercise.value = '';
    customPlanExercise.value = '';
    newReps.value = null;
    newSets.value = null;
    selectedGoal.value = '';
    selectedPlanExercises.value = [];
    rowHeights.value = [];
    saveToStorage();
};
const addExerciseToPlan = () => {
    const errors = collectValidationErrors();
    if (errors.length > 0) {
        openValidationPopup(errors);
        return;
    }
    const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value;
    if (newExercise.value === 'custom' && customPlanExercise.value) {
        const muscleGroup = exerciseFilter.value || '';
        const validated = validateCustomExercise(customPlanExercise.value, muscleGroup);
        if (typeof validated !== 'string') {
            customExercises.value.push({ name: validated.name, muscle: validated.muscle });
            saveToStorage();
            addToast('Benutzerdefinierte Übung gespeichert', 'add');
        }
    }
    selectedPlanExercises.value.push({
        exercise: exerciseToAdd,
        sets: newSets.value,
        reps: newReps.value,
        goal: selectedGoal.value || undefined
    });
    rowHeights.value.push(40);
    addToast('Übung hinzugefügt', 'add');
    newExercise.value = '';
    customPlanExercise.value = '';
    newReps.value = null;
    newSets.value = null;
    selectedGoal.value = '';
};
const removeExerciseFromPlan = (index) => {
    selectedPlanExercises.value.splice(index, 1);
    rowHeights.value.splice(index, 1);
    addToast('Übung entfernt', 'delete');
};
const editPlan = (planId) => {
    const plan = plans.value.find(p => p.id === planId);
    if (plan) {
        planName.value = plan.name;
        selectedPlanExercises.value = [...plan.exercises];
        editingPlanId.value = planId;
        rowHeights.value = Array(plan.exercises.length).fill(40);
        addToast('Plan wird bearbeitet', 'save');
    }
    else {
        addToast('Plan nicht gefunden', 'delete');
    }
};
const deletePlan = (planId) => {
    plans.value = plans.value.filter(p => p.id !== planId);
    favoritePlans.value = favoritePlans.value.filter(id => id !== planId);
    if (selectedPlan.value?.id === planId)
        selectedPlan.value = null;
    saveToStorage();
    addToast('Trainingsplan gelöscht', 'delete');
};
const loadPlan = (planId) => {
    const plan = plans.value.find(p => p.id === planId);
    if (plan) {
        selectedPlan.value = { ...plan };
        rowHeights.value = Array(plan.exercises.length).fill(40);
        columnWidths.value = [50, 25, 25];
        addToast('Plan geladen', 'load');
    }
    else {
        addToast('Plan nicht gefunden', 'delete');
    }
};
const closePlan = () => {
    selectedPlan.value = null;
    columnWidths.value = [50, 25, 25];
    rowHeights.value = [];
    addToast('Plan geschlossen', 'load');
};
const openDownloadPopup = (plan) => {
    downloadPlan.value = plan;
    downloadFormat.value = 'html';
    showDownloadPopup.value = true;
};
const closeDownloadPopup = () => {
    showDownloadPopup.value = false;
    downloadPlan.value = null;
    downloadFormat.value = 'html';
};
const confirmDownload = () => {
    if (!downloadPlan.value)
        return;
    const plan = downloadPlan.value;
    const goal = [...new Set(plan.exercises.map(ex => ex.goal).filter(g => g))][0] || '';
    const fileName = goal ? `${plan.name}` : plan.name;
    const title = goal ? `${plan.name}` : plan.name;
    if (downloadFormat.value === 'html') {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                        h1 { color: #4B6CB7; text-align: left; }
                        table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                        th { background: #333; color: #ffffff; }
                        tr:nth-child(even) { background: #f9fafb; }
                        tr:hover { background: #e2e8f0; }
                        td { color: #4b5563; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <table>
                        <tr>
                            <th>Übung</th>
                            <th>Sätze</th>
                            <th>Wiederholungen</th>
                        </tr>
                        ${plan.exercises.map(ex => `
                            <tr>
                                <td>${ex.exercise}</td>
                                <td>${ex.sets}</td>
                                <td>${ex.reps}</td>
                            </tr>
                        `).join('')}
                    </table>
                </body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}_Trainingsplan.html`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    else if (downloadFormat.value === 'pdf') {
        const doc = new jsPDF();
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(16);
        doc.text(title, 20, 20);
        doc.setFontSize(12);
        let yOffset = 40;
        doc.text(['Übung', 'Sätze', 'Wiederholungen'].join(', '), 20, yOffset);
        yOffset += 10;
        plan.exercises.forEach(ex => {
            doc.text([ex.exercise, `${ex.sets}`, `${ex.reps}`].join(', '), 20, yOffset);
            yOffset += 10;
        });
        doc.save(`${fileName}_Trainingsplan.pdf`);
    }
    else if (downloadFormat.value === 'csv') {
        const csvContent = ['Übung', 'Sätze', 'Wiederholungen'].join(',') + '\n' +
            plan.exercises.map(ex => `"${ex.exercise}",${ex.sets},${ex.reps}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}_Trainingsplan.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    else if (downloadFormat.value === 'json') {
        const jsonContent = JSON.stringify(plan.exercises.map(({ exercise, sets, reps }) => ({ exercise, sets, reps })), null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}_Trainingsplan.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    addToast('Plan heruntergeladen', 'load');
    closeDownloadPopup();
};
const toggleExtras = () => {
    showExtras.value = !showExtras.value;
};
const openAddTimerPopup = () => {
    newTimerName.value = '';
    showAddTimerPopup.value = true;
    nextTick(() => {
        if (newTimerInput.value)
            newTimerInput.value.focus();
    });
};
const closeAddTimerPopup = () => {
    showAddTimerPopup.value = false;
    newTimerName.value = '';
};
const addTimer = () => {
    console.log('addTimer aufgerufen mit Name:', newTimerName.value);
    const newTimer = {
        id: Date.now().toString(),
        name: newTimerName.value.trim(), // Korrektur: Keine Validierung, nur trimmen
        seconds: '60',
        customSeconds: null,
        time: 60,
        isRunning: false,
        interval: null,
        isFavorite: false,
        sound: 'standard'
    };
    timers.value.push(newTimer);
    addToast('Timer hinzugefügt', 'add');
    saveToStorage();
    closeAddTimerPopup();
};
const openDeleteTimerPopup = (id) => {
    if (timers.value.length <= 1) {
        openValidationPopup(['Mindestens ein Timer muss geöffnet bleiben']);
        return;
    }
    openDeletePopup(() => removeTimer(id));
};
const removeTimer = (id) => {
    const timer = timers.value.find(t => t.id === id);
    if (timer?.interval)
        clearInterval(timer.interval);
    timers.value = timers.value.filter(t => t.id !== id);
    addToast('Timer entfernt', 'timer');
    saveToStorage();
};
const toggleFavoriteTimer = (id) => {
    const timer = timers.value.find(t => t.id === id);
    if (timer) {
        timer.isFavorite = !timer.isFavorite;
        addToast(timer.isFavorite ? 'Timer zu Favoriten hinzugefügt' : 'Timer aus Favoriten entfernt', // Korrektur: Angepasste Nachrichten
        timer.isFavorite ? 'add' : 'delete' // Korrektur: Typen an Stoppuhr angepasst
        );
        saveToStorage();
    }
};
const openAddStopwatchPopup = () => {
    newStopwatchName.value = '';
    showAddStopwatchPopup.value = true;
    nextTick(() => {
        if (newStopwatchInput.value)
            newStopwatchInput.value.focus();
    });
};
const closeAddStopwatchPopup = () => {
    showAddStopwatchPopup.value = false;
    newStopwatchName.value = ''; // Korrektur: Tippfehler behoben
};
const addStopwatch = () => {
    console.log('addStopwatch aufgerufen mit Name:', newStopwatchName.value);
    const validatedName = validateStopwatchName(newStopwatchName.value);
    if (typeof validatedName !== 'string') {
        openValidationPopup([validatedName]);
        console.error('Stoppuhr Validierungsfehler:', validatedName);
        return;
    }
    const newStopwatch = {
        id: Date.now().toString(),
        name: validatedName,
        time: 0,
        isRunning: false,
        interval: null,
        laps: [],
        isFavorite: false
    };
    stopwatches.value.push(newStopwatch);
    addToast('Stoppuhr hinzugefügt', 'add');
    saveToStorage();
    closeAddStopwatchPopup();
};
const openDeleteStopwatchPopup = (id) => {
    if (stopwatches.value.length <= 1) {
        openValidationPopup(['Mindestens eine Stoppuhr muss geöffnet bleiben']);
        return;
    }
    openDeletePopup(() => removeStopwatch(id));
};
const removeStopwatch = (id) => {
    const stopwatch = stopwatches.value.find(s => s.id === id);
    if (stopwatch?.interval)
        clearInterval(stopwatch.interval);
    stopwatches.value = stopwatches.value.filter(s => s.id !== id);
    addToast('Stoppuhr entfernt', 'timer');
    saveToStorage();
};
const toggleFavoriteStopwatch = (id) => {
    const stopwatch = stopwatches.value.find(s => s.id === id);
    if (stopwatch) {
        stopwatch.isFavorite = !stopwatch.isFavorite;
        addToast(stopwatch.isFavorite ? 'Stoppuhr zu Favoriten hinzugefügt' : 'Stoppuhr aus Favoriten entfernt', stopwatch.isFavorite ? 'add' : 'delete' // Korrektur: Typ 'delete'
        );
        saveToStorage();
    }
};
const updateCustomSeconds = (timer) => {
    if (timer.customSeconds != null && !isNaN(timer.customSeconds)) { // Korrektur: Validierung entfernt
        timer.seconds = timer.customSeconds.toString();
        timer.time = timer.customSeconds;
    }
    else {
        timer.customSeconds = null;
    }
};
const playTimerSound = (sound) => {
    if (sound === 'nothing')
        return;
    const audio = document.getElementById(`audio-${sound}`);
    if (audio && audio.src) {
        audio.play().catch(e => {
            console.error('Fehler beim Abspielen des Sounds:', e);
            addToast('Sound konnte nicht abgespielt werden', 'delete');
        });
    }
    else {
        console.warn(`Audio-Element für ${sound} nicht gefunden oder kein gültiger Pfad`);
        addToast(`Sound "${sound}" nicht verfügbar`, 'delete');
    }
};
const startTimerInstance = (timer) => {
    if ((timer.seconds || timer.customSeconds) && !timer.isRunning) {
        timer.time = Number(timer.seconds) || Number(timer.customSeconds) || 0;
        if (timer.time >= 0 && !isNaN(timer.time)) { // Korrektur: Validierung entfernt
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.time > 0) {
                    timer.time--;
                }
                else {
                    clearInterval(timer.interval);
                    timer.interval = null;
                    timer.isRunning = false;
                    showTimerPopup.value = true;
                    playTimerSound(timer.sound);
                    sendNotification(timer.name || 'Timer', 'Deine Satzpause ist vorbei! 💪');
                }
            }, 1000);
            addToast('Timer gestartet', 'timer');
        }
    }
};
const stopTimerInstance = (timer) => {
    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
    }
    timer.isRunning = false;
    addToast('Timer gestoppt', 'timer');
};
const resetTimerInstance = (timer) => {
    stopTimerInstance(timer);
    timer.time = Number(timer.seconds) || Number(timer.customSeconds) || 60;
    addToast('Timer zurückgesetzt', 'timer');
};
const startStopwatchInstance = (stopwatch) => {
    if (!stopwatch.isRunning) {
        stopwatch.isRunning = true;
        const startTime = Date.now() - (stopwatch.time * 1000);
        stopwatch.interval = setInterval(() => {
            stopwatch.time = (Date.now() - startTime) / 1000;
        }, 10);
        addToast('Stoppuhr gestartet', 'timer');
    }
};
const pauseStopwatchInstance = (stopwatch) => {
    if (stopwatch.interval) {
        clearInterval(stopwatch.interval);
        stopwatch.interval = null;
    }
    stopwatch.isRunning = false;
    addToast('Stoppuhr pausiert', 'timer');
};
const resetStopwatchInstance = (stopwatch) => {
    pauseStopwatchInstance(stopwatch);
    stopwatch.time = 0;
    stopwatch.laps = [];
    addToast('Stoppuhr zurückgesetzt', 'timer');
};
const addLapTime = (stopwatch) => {
    if (stopwatch.isRunning) {
        stopwatch.laps.push(stopwatch.time);
        addToast('Runde aufgezeichnet', 'timer');
    }
};
const resetCustomSeconds = (timer) => {
    if (timer.seconds !== 'custom') {
        timer.customSeconds = null;
        timer.time = Number(timer.seconds) || 60;
    }
};
const toggleStopwatchInstance = (stopwatch) => {
    if (stopwatch.isRunning) {
        pauseStopwatchInstance(stopwatch);
    }
    else {
        startStopwatchInstance(stopwatch);
    }
};
const openDeletePopup = (action) => {
    deleteAction.value = action;
    showDeletePopup.value = true;
};
const closeDeletePopup = () => {
    showDeletePopup.value = false;
    deleteAction.value = null;
};
const confirmDeleteAction = () => {
    if (deleteAction.value)
        deleteAction.value();
    closeDeletePopup();
};
const addToast = (message, type = 'load') => {
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
        load: '📋'
    };
    const types = {
        delete: 'toast-delete',
        add: 'toast-add',
        save: 'toast-save',
        timer: 'toast-timer',
        load: 'toast-default'
    };
    toast.value = { id, message, emoji: emojis[type], type: types[type], exiting: false };
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
const openEditPopup = (type, index, event) => {
    console.log('openEditPopup aufgerufen:', { type, index });
    editType.value = type;
    editIndex.value = index;
    editCellIndex.value = null;
    if (type === 'table' || type === 'selectedPlan') {
        if (!event)
            return;
        const target = event.target;
        editCellIndex.value = Array.from(target.parentElement.children).indexOf(target);
        if (editCellIndex.value > 2)
            return;
        const exercise = type === 'table' ? selectedPlanExercises.value[index] : selectedPlan.value.exercises[index];
        if (editCellIndex.value === 0)
            editValue.value = exercise.exercise;
        else if (editCellIndex.value === 1)
            editValue.value = String(exercise.sets);
        else if (editCellIndex.value === 2)
            editValue.value = String(exercise.reps);
    }
    else if (type === 'planName') {
        const plan = plans.value.find(p => p.id === index);
        editValue.value = plan ? plan.name : '';
    }
    else if (type === 'selectedPlanName') {
        editValue.value = selectedPlan.value ? selectedPlan.value.name : '';
    }
    else if (type === 'timerName') {
        const timer = timers.value.find(t => t.id === index);
        editValue.value = timer ? timer.name : '';
    }
    else if (type === 'stopwatchName') {
        const stopwatch = stopwatches.value.find(s => s.id === index);
        editValue.value = stopwatch ? stopwatch.name : '';
    }
    else if (type === 'customExerciseName') {
        const exercise = customExercises.value[index];
        editValue.value = exercise ? exercise.name : '';
    }
    else if (type === 'customExerciseMuscle') {
        const exercise = customExercises.value[index];
        editValue.value = exercise ? exercise.muscle : '';
    }
    showEditPopup.value = true;
    nextTick(() => {
        if (editInput.value) {
            editInput.value.focus();
            console.log('Fokus auf Edit-Input gesetzt');
        }
    });
};
const saveEdit = () => {
    console.log('saveEdit aufgerufen mit:', { editType: editType.value, editValue: editValue.value });
    if (editType.value === 'table' && typeof editIndex.value === 'number') {
        const exercise = selectedPlanExercises.value[editIndex.value];
        if (!exercise)
            return;
        if (editCellIndex.value === 0 && editValue.value) {
            if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === editValue.value.trim().toLowerCase() && ex !== exercise)) {
                openValidationPopup(['Übung existiert bereits im Plan']);
                return;
            }
            exercise.exercise = editValue.value.trim();
            addToast('Übung aktualisiert', 'save');
        }
        else if (editCellIndex.value === 1) {
            const sets = Number(editValue.value);
            const setsError = validateSets(sets);
            if (setsError) {
                openValidationPopup([setsError]);
                return;
            }
            exercise.sets = sets;
            addToast('Sätze aktualisiert', 'save');
        }
        else if (editCellIndex.value === 2) {
            const reps = Number(editValue.value);
            const repsError = validateReps(reps);
            if (repsError) {
                openValidationPopup([repsError]);
                return;
            }
            exercise.reps = reps;
            addToast('Wiederholungen aktualisiert', 'save');
        }
    }
    else if (editType.value === 'selectedPlan' && typeof editIndex.value === 'number' && selectedPlan.value) {
        const exercise = selectedPlan.value.exercises[editIndex.value];
        if (!exercise)
            return;
        if (editCellIndex.value === 0 && editValue.value) {
            if (selectedPlan.value.exercises.some(ex => ex.exercise.toLowerCase() === editValue.value.trim().toLowerCase() && ex !== exercise)) {
                openValidationPopup(['Übung existiert bereits im Plan']);
                return;
            }
            exercise.exercise = editValue.value.trim();
            updatePlanInStorage();
            addToast('Übung aktualisiert', 'save');
        }
        else if (editCellIndex.value === 1) {
            const sets = Number(editValue.value);
            const setsError = validateSets(sets);
            if (setsError) {
                openValidationPopup([setsError]);
                return;
            }
            exercise.sets = sets;
            updatePlanInStorage();
            addToast('Sätze aktualisiert', 'save');
        }
        else if (editCellIndex.value === 2) {
            const reps = Number(editValue.value);
            const repsError = validateReps(reps);
            if (repsError) {
                openValidationPopup([repsError]);
                return;
            }
            exercise.reps = reps;
            updatePlanInStorage();
            addToast('Wiederholungen aktualisiert', 'save');
        }
    }
    else if (editType.value === 'planName' && typeof editIndex.value === 'string') {
        const validatedName = validatePlanName(editValue.value);
        if (validatedName === false) {
            openValidationPopup([
                editValue.value.trim().length < 3
                    ? 'Planname muss mindestens 3 Zeichen lang sein'
                    : 'Planname darf maximal 20 Zeichen lang sein'
            ]);
            return;
        }
        const plan = plans.value.find(p => p.id === editIndex.value);
        if (plan) {
            plan.name = validatedName;
            saveToStorage();
            addToast('Planname aktualisiert', 'save');
        }
    }
    else if (editType.value === 'selectedPlanName' && selectedPlan.value) {
        const validatedName = validatePlanName(editValue.value);
        if (validatedName === false) {
            openValidationPopup([
                editValue.value.trim().length < 3
                    ? 'Planname muss mindestens 3 Zeichen lang sein'
                    : 'Planname darf maximal 20 Zeichen lang sein'
            ]);
            return;
        }
        selectedPlan.value.name = validatedName;
        updatePlanInStorage();
        addToast('Planname aktualisiert', 'save');
    }
    else if (editType.value === 'timerName' && typeof editIndex.value === 'string') {
        const timer = timers.value.find(t => t.id === editIndex.value);
        if (timer) {
            timer.name = editValue.value.trim(); // Korrektur: Keine Validierung
            saveToStorage();
            addToast('Timername aktualisiert', 'timer');
        }
    }
    else if (editType.value === 'stopwatchName' && typeof editIndex.value === 'string') {
        const validatedName = validateStopwatchName(editValue.value);
        if (typeof validatedName !== 'string') {
            openValidationPopup([validatedName]);
            return;
        }
        const stopwatch = stopwatches.value.find(s => s.id === editIndex.value);
        if (stopwatch) {
            stopwatch.name = validatedName;
            saveToStorage();
            addToast('Stoppuhrname aktualisiert', 'timer');
        }
    }
    else if (editType.value === 'customExerciseName' && typeof editIndex.value === 'number') {
        const exercise = customExercises.value[editIndex.value];
        if (!exercise)
            return;
        const validated = validateCustomExercise(editValue.value, exercise.muscle, editIndex.value);
        if (typeof validated === 'string') {
            openValidationPopup([validated]);
            return;
        }
        exercise.name = validated.name;
        saveToStorage();
        addToast('Übungsname aktualisiert', 'save');
    }
    else if (editType.value === 'customExerciseMuscle' && typeof editIndex.value === 'number') {
        const exercise = customExercises.value[editIndex.value];
        if (!exercise)
            return;
        const validated = validateCustomExercise(exercise.name, editValue.value, editIndex.value);
        if (typeof validated === 'string') {
            openValidationPopup([validated]);
            return;
        }
        exercise.muscle = validated.muscle;
        saveToStorage();
        addToast('Muskelgruppe aktualisiert', 'save');
    }
    closeEditPopup();
};
const updatePlanInStorage = () => {
    if (selectedPlan.value) {
        const index = plans.value.findIndex(p => p.id === selectedPlan.value.id);
        if (index !== -1) {
            plans.value[index] = { ...selectedPlan.value };
            saveToStorage();
        }
    }
};
const removeCustomExercise = (index) => {
    customExercises.value.splice(index, 1);
    if (customExercises.value.length === 0)
        showCustomExercises.value = false;
    saveToStorage();
    addToast('Benutzerdefinierte Übung gelöscht', 'delete');
};
const closeEditPopup = () => {
    showEditPopup.value = false;
    editValue.value = '';
    editType.value = 'table';
    editIndex.value = null;
    editCellIndex.value = null;
};
const closeTimerPopup = () => {
    showTimerPopup.value = false; // Korrektur: Syntaxfehler behoben
};
const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
        closeEditPopup();
        closeDeletePopup();
        closeTimerPopup();
        closeAddTimerPopup();
        closeAddStopwatchPopup(); // Korrektur: Falscher Funktionsname
        closeDownloadPopup();
        closeValidationPopup();
    }
};
const handleKeydown = (event) => {
    console.log('Keydown erkannt:', event.key);
    if (event.key === 'Escape') {
        if (showValidationPopup.value) {
            console.log('Escape im Validierungspopup');
            closeValidationPopup();
        }
        else {
            closeEditPopup();
            closeDeletePopup();
            closeTimerPopup();
            closeAddTimerPopup();
            closeAddStopwatchPopup();
            closeDownloadPopup();
        }
    }
    else if (event.key === 'Enter') {
        if (showValidationPopup.value) {
            console.log('Enter im Validierungspopup');
            event.preventDefault();
            closeValidationPopup();
        }
        else if (showEditPopup.value) {
            console.log('Enter im Bearbeitungspopup');
            event.preventDefault();
            saveEdit();
        }
        else if (showDeletePopup.value) {
            console.log('Enter im Löschpopup');
            event.preventDefault();
            confirmDeleteAction();
        }
        else if (showAddTimerPopup.value) {
            console.log('Enter im Timer-Popup');
            event.preventDefault();
            addTimer();
        }
        else if (showAddStopwatchPopup.value) {
            console.log('Enter im Stoppuhr-Popup');
            event.preventDefault();
            addStopwatch();
        }
    }
};
const checkScroll = () => {
    const timerContainer = document.querySelector('.timer-container');
    const stopwatchContainer = document.querySelector('.stopwatch-top'); // Korrektur: Klasse angepasst
    if (timerContainer)
        isTimerSticky.value = timerContainer.getBoundingClientRect().top <= 0;
    if (stopwatchContainer)
        isStopwatchSticky.value = stopwatchContainer.getBoundingClientRect().top <= 0;
};
const initResizeTable = () => {
    const table = document.querySelector('.exercise-table.full-width table'); // Korrektur: Typisierung
    if (!table)
        return;
    const ths = table.querySelectorAll('th.resizable');
    const resizers = []; // Korrektur: Typisierung
    ths.forEach((th, colIndex) => {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.style.width = '10px';
        resizer.style.height = '100%';
        resizer.style.position = 'absolute';
        resizer.style.right = '0';
        resizer.style.top = '0';
        resizer.style.cursor = 'col-resize';
        th.style.position = 'relative';
        th.appendChild(resizer);
        resizers.push(resizer);
        let startX;
        let startWidths;
        const onMouseDown = (e) => {
            e.preventDefault();
            startX = e.pageX;
            startWidths = [...columnWidths.value];
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        const onMouseMove = (e) => {
            requestAnimationFrame(() => {
                const tableWidth = table.getBoundingClientRect().width;
                const diffX = e.pageX - startX;
                const currentColWidth = (startWidths[colIndex] / 100) * tableWidth;
                const nextColWidth = colIndex < startWidths.length - 1 ? (startWidths[colIndex + 1] / 100) * tableWidth : 0;
                const newCurrentColWidth = Math.max(50, currentColWidth + diffX);
                const newNextColWidth = colIndex < startWidths.length - 1 ? Math.max(50, nextColWidth - diffX) : 0;
                const totalWidth = tableWidth;
                const newCurrentColPercent = (newCurrentColWidth / totalWidth) * 100;
                const newNextColPercent = colIndex < startWidths.length - 1 ? (newNextColWidth / totalWidth) * 100 : startWidths[colIndex + 1];
                const newWidths = [...startWidths];
                newWidths[colIndex] = newCurrentColPercent;
                if (colIndex < startWidths.length - 1)
                    newWidths[colIndex + 1] = newNextColPercent;
                const totalPercent = newWidths.reduce((sum, w) => sum + w, 0);
                newWidths.forEach((_, i) => newWidths[i] = (newWidths[i] / totalPercent) * 100);
                columnWidths.value = newWidths;
            });
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        resizer.addEventListener('mousedown', onMouseDown);
    });
    const rows = table.querySelectorAll('tr.resizable-row');
    rows.forEach((row, rowIndex) => {
        const resizer = document.createElement('div');
        resizer.className = 'resizer row-resizer';
        resizer.style.width = '100%';
        resizer.style.height = '10px';
        resizer.style.position = 'absolute';
        resizer.style.bottom = '0';
        resizer.style.left = '0';
        resizer.style.cursor = 'row-resize';
        row.style.position = 'relative';
        row.appendChild(resizer);
        resizers.push(resizer);
        let startY;
        let startHeight;
        const onMouseDown = (e) => {
            e.preventDefault();
            startY = e.pageY;
            startHeight = rowHeights.value[rowIndex] || 40;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        const onMouseMove = (e) => {
            requestAnimationFrame(() => {
                const diffY = e.pageY - startY;
                const newHeight = Math.max(30, startHeight + diffY);
                rowHeights.value[rowIndex] = newHeight;
            });
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        resizer.addEventListener('mousedown', onMouseDown);
    });
    const cleanupResizers = () => {
        resizers.forEach(resizer => {
            resizer.removeEventListener('mousedown', () => { });
            resizer.remove();
        });
    };
    onUnmounted(() => cleanupResizers());
};
const initAudioElements = () => {
    Object.entries(audioPaths).forEach(([key, path]) => {
        const audio = document.getElementById(`audio-${key}`); // Korrektur: Typisierung
        if (audio)
            audio.src = path;
    });
};
onMounted(() => {
    loadFromStorage();
    requestNotificationPermission();
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('keydown', handleKeydown);
    initResizeTable();
    initAudioElements();
});
onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll);
    window.removeEventListener('keydown', handleKeydown);
    timers.value.forEach(timer => {
        if (timer.interval)
            clearInterval(timer.interval);
    });
    stopwatches.value.forEach(stopwatch => {
        if (stopwatch.interval)
            clearInterval(stopwatch.interval);
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['training']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-header']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-header']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['extras-container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-exercise-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-exercise-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-exercise-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['extras-button-group']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['table-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['table-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['table-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['table-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['open-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['open-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['open-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-plan-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-plan-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-plan-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['add-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stopwatch-top']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercise-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-display']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['timer']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-display']} */ ;
/** @type {__VLS_StyleScopedClasses['timer']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-select']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-input']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-select']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-input']} */ ;
/** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stop-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lap-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['laps-container']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['lap-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-confirm-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['toast']} */ ;
/** @type {__VLS_StyleScopedClasses['resizer']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "training" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "workout-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.createOrUpdatePlan) },
    ...{ class: "form-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Planname (z.B. Push Day)",
    required: true,
    ...{ class: "plan-name-input" },
});
(__VLS_ctx.planName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "exercise-input-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Muskelgruppe",
});
(__VLS_ctx.exerciseFilter);
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.newExercise),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [ex] of __VLS_getVForSourceType((__VLS_ctx.filteredExercises))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (ex),
        value: (ex),
    });
    (ex);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "custom",
});
if (__VLS_ctx.newExercise === 'custom') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "Eigene Übung eingeben",
    });
    (__VLS_ctx.customPlanExercise);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Wiederholungen",
    type: "number",
    min: "1",
});
(__VLS_ctx.newReps);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "Sätze",
    type: "number",
    min: "1",
});
(__VLS_ctx.newSets);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addExerciseToPlan) },
    type: "button",
    ...{ class: "add-exercise-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleExtras) },
    type: "button",
    ...{ class: "extras-toggle-btn" },
});
(__VLS_ctx.showExtras ? 'Extras ausblenden' : 'Extras einblenden');
if (__VLS_ctx.showExtras) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "extras-container show" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "extras-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.selectedGoal),
        ...{ class: "goal-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    for (const [goal] of __VLS_getVForSourceType((__VLS_ctx.trainingGoals))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (goal),
            value: (goal),
        });
        (goal);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    disabled: (!__VLS_ctx.selectedPlanExercises.length || !__VLS_ctx.planName),
});
(__VLS_ctx.editingPlanId ? 'Plan speichern' : 'Plan erstellen');
if (__VLS_ctx.selectedPlanExercises.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "exercise-table full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    if (__VLS_ctx.selectedPlanExercises.some(ex => ex.goal)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [ex, index] of __VLS_getVForSourceType((__VLS_ctx.selectedPlanExercises))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedPlanExercises.length))
                        return;
                    __VLS_ctx.openEditPopup('table', index, $event);
                } },
            key: (index),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (ex.exercise);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (ex.sets);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (ex.reps);
        if (__VLS_ctx.selectedPlanExercises.some(ex => ex.goal)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (ex.goal || '-');
        }
    }
}
if (__VLS_ctx.plans.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "workout-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "Nach Planname oder Trainingsziel suchen",
        ...{ class: "plan-search-input" },
    });
    (__VLS_ctx.planSearch);
    for (const [plan] of __VLS_getVForSourceType((__VLS_ctx.filteredPlans))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (plan.id),
            ...{ class: "list-item plan-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.loadPlan(plan.id);
                } },
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.openEditPopup('planName', plan.id);
                } },
        });
        (plan.name);
        (plan.exercises.length);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "list-item-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.toggleFavoritePlan(plan.id);
                } },
            ...{ class: "favorite-btn" },
            title: (__VLS_ctx.favoritePlans.includes(plan.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'),
        });
        (__VLS_ctx.favoritePlans.includes(plan.id) ? '★' : '☆');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.editPlan(plan.id);
                } },
            ...{ class: "edit-btn" },
            title: "Plan bearbeiten",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.openDeletePopup(() => __VLS_ctx.deletePlan(plan.id));
                } },
            ...{ class: "delete-btn" },
            title: "Plan löschen",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.openDownloadPopup(plan);
                } },
            ...{ class: "download-btn" },
            title: "Plan herunterladen",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.plans.length))
                        return;
                    __VLS_ctx.loadPlan(plan.id);
                } },
            ...{ class: "open-btn" },
            title: "Plan öffnen",
        });
    }
}
if (__VLS_ctx.customExercises.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleCustomExercises) },
        ...{ class: "toggle-exercise-btn" },
    });
    (__VLS_ctx.showCustomExercises ? ' Benutzerdefinierte Übungen ausblenden' : ' Benutzerdefinierte Übungen anzeigen');
}
if (__VLS_ctx.showCustomExercises) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "custom-exercises-table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "exercise-table full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [ex, i] of __VLS_getVForSourceType((__VLS_ctx.customExercises))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (i),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.showCustomExercises))
                        return;
                    __VLS_ctx.openEditPopup('customExerciseName', i);
                } },
        });
        if (__VLS_ctx.exerciseEditIndex === i && __VLS_ctx.exerciseEditField === 'name') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onBlur: (__VLS_ctx.finishEdit) },
                ...{ onKeyup: (__VLS_ctx.finishEdit) },
            });
            (ex.name);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (ex.name);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.showCustomExercises))
                        return;
                    __VLS_ctx.openEditPopup('customExerciseMuscle', i);
                } },
        });
        if (__VLS_ctx.exerciseEditIndex === i && __VLS_ctx.exerciseEditField === 'muscle') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                ...{ onBlur: (__VLS_ctx.finishEdit) },
                ...{ onKeyup: (__VLS_ctx.finishEdit) },
            });
            (ex.muscle);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (ex.muscle);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showCustomExercises))
                        return;
                    __VLS_ctx.removeCustomExercise(i);
                } },
            ...{ class: "table-delete-btn" },
        });
    }
}
if (__VLS_ctx.selectedPlan) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "workout-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ onDblclick: (...[$event]) => {
                if (!(__VLS_ctx.selectedPlan))
                    return;
                __VLS_ctx.openEditPopup('selectedPlanName', __VLS_ctx.selectedPlan.id);
            } },
        ...{ class: "section-title" },
    });
    (__VLS_ctx.selectedPlan.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closePlan) },
        ...{ class: "close-plan-btn" },
        title: "Plan schließen",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "exercise-table full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ref: "resizeTable",
    });
    /** @type {typeof __VLS_ctx.resizeTable} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "resizable" },
        ...{ style: ({ width: __VLS_ctx.columnWidths[0] + '%' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "resizable" },
        ...{ style: ({ width: __VLS_ctx.columnWidths[1] + '%' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "resizable" },
        ...{ style: ({ width: __VLS_ctx.columnWidths[2] + '%' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [ex, index] of __VLS_getVForSourceType((__VLS_ctx.selectedPlan.exercises))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            ...{ onDblclick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedPlan))
                        return;
                    __VLS_ctx.openEditPopup('selectedPlan', index, $event);
                } },
            key: (index),
            ...{ class: "resizable-row" },
            ...{ style: ({ height: __VLS_ctx.rowHeights[index] + 'px' }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ style: ({ width: __VLS_ctx.columnWidths[0] + '%' }) },
        });
        (ex.exercise);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ style: ({ width: __VLS_ctx.columnWidths[1] + '%' }) },
        });
        (ex.sets);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ style: ({ width: __VLS_ctx.columnWidths[2] + '%' }) },
        });
        (ex.reps);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "workout-list timer-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plan-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openAddTimerPopup) },
    ...{ class: "add-timer-btn" },
    title: "Neuen Timer hinzufügen",
});
for (const [timer] of __VLS_getVForSourceType((__VLS_ctx.timers))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (timer.id),
        ...{ class: "timer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onDblclick: (...[$event]) => {
                __VLS_ctx.openEditPopup('timerName', timer.id);
            } },
        ...{ class: "timer-name" },
    });
    (timer.name || 'Doppelklick für Namenänderung');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleFavoriteTimer(timer.id);
            } },
        ...{ class: "favorite-btn" },
        title: (timer.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'),
    });
    (timer.isFavorite ? '★' : '☆');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openDeleteTimerPopup(timer.id);
            } },
        ...{ class: "close-timer-btn" },
        title: "Timer schließen",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-controls" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "timer-display" },
    });
    (__VLS_ctx.formatTimerDisplay(timer.time));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (...[$event]) => {
                __VLS_ctx.resetCustomSeconds(timer);
            } },
        value: (timer.seconds),
        ...{ class: "timer-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "60",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "90",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "120",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "custom",
    });
    if (timer.seconds === 'custom') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onBlur: (...[$event]) => {
                    if (!(timer.seconds === 'custom'))
                        return;
                    __VLS_ctx.updateCustomSeconds(timer);
                } },
            ...{ onKeyup: (...[$event]) => {
                    if (!(timer.seconds === 'custom'))
                        return;
                    __VLS_ctx.updateCustomSeconds(timer);
                } },
            placeholder: "Sekunden",
            type: "number",
            min: "1",
            ...{ class: "timer-input" },
        });
        (timer.customSeconds);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (timer.sound),
        ...{ class: "timer-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "nothing",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "standard",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "alarm",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "beep",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "dong",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "decide",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-buttons" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.startTimerInstance(timer);
            } },
        ...{ class: "timer-btn start-btn" },
        disabled: (timer.isRunning),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.stopTimerInstance(timer);
            } },
        ...{ class: "timer-btn stop-btn" },
        disabled: (!timer.isRunning),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.resetTimerInstance(timer);
            } },
        ...{ class: "timer-btn reset-btn" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "workout-list stopwatch-top" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plan-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openAddStopwatchPopup) },
    ...{ class: "add-timer-btn" },
    title: "Neue Stoppuhr hinzufügen",
});
for (const [stopwatch] of __VLS_getVForSourceType((__VLS_ctx.stopwatches))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (stopwatch.id),
        ...{ class: "timer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onDblclick: (...[$event]) => {
                __VLS_ctx.openEditPopup('stopwatchName', stopwatch.id);
            } },
        ...{ class: "timer-name" },
    });
    (stopwatch.name || 'Stoppuhr');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleFavoriteStopwatch(stopwatch.id);
            } },
        ...{ class: "favorite-btn" },
        title: (stopwatch.isFavorite ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzufügen'),
    });
    (stopwatch.isFavorite ? '★' : '☆');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openDeleteStopwatchPopup(stopwatch.id);
            } },
        ...{ class: "close-timer-btn" },
        title: "Stoppuhr schließen",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-controls" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "timer" },
    });
    (__VLS_ctx.formatStopwatchDisplay(stopwatch.time));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timer-buttons" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleStopwatchInstance(stopwatch);
            } },
        ...{ class: "timer-btn start-btn" },
    });
    (stopwatch.isRunning ? 'Pause' : 'Start');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.resetStopwatchInstance(stopwatch);
            } },
        ...{ class: "timer-btn reset-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.addLapTime(stopwatch);
            } },
        ...{ class: "timer-btn lap-btn" },
        disabled: (!stopwatch.isRunning),
    });
    if (stopwatch.laps.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "laps-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "laps-list" },
        });
        for (const [lap, index] of __VLS_getVForSourceType((stopwatch.laps))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
                ...{ class: "lap-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (index + 1);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.formatLapTime(lap));
        }
    }
}
if (__VLS_ctx.isTimerSticky) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sticky-timer" },
    });
    for (const [timer] of __VLS_getVForSourceType((__VLS_ctx.timers))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (timer.id),
            ...{ class: "sticky-timer-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (timer.name || 'Timer');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "timer-display" },
        });
        (__VLS_ctx.formatTimerDisplay(timer.time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "timer-buttons" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isTimerSticky))
                        return;
                    __VLS_ctx.startTimerInstance(timer);
                } },
            ...{ class: "timer-btn start-btn" },
            disabled: (timer.isRunning),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isTimerSticky))
                        return;
                    __VLS_ctx.stopTimerInstance(timer);
                } },
            ...{ class: "timer-btn stop-btn" },
            disabled: (!timer.isRunning),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isTimerSticky))
                        return;
                    __VLS_ctx.resetTimerInstance(timer);
                } },
            ...{ class: "timer-btn reset-btn" },
        });
    }
}
if (__VLS_ctx.isStopwatchSticky) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sticky-stopwatch" },
    });
    for (const [stopwatch] of __VLS_getVForSourceType((__VLS_ctx.stopwatches))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (stopwatch.id),
            ...{ class: "sticky-timer-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (stopwatch.name || 'Stoppuhr');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "timer" },
        });
        (__VLS_ctx.formatStopwatchDisplay(stopwatch.time));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "timer-buttons" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isStopwatchSticky))
                        return;
                    __VLS_ctx.toggleStopwatchInstance(stopwatch);
                } },
            ...{ class: "timer-btn start-btn" },
        });
        (stopwatch.isRunning ? 'Pause' : 'Start');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isStopwatchSticky))
                        return;
                    __VLS_ctx.resetStopwatchInstance(stopwatch);
                } },
            ...{ class: "timer-btn reset-btn" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isStopwatchSticky))
                        return;
                    __VLS_ctx.addLapTime(stopwatch);
                } },
            ...{ class: "timer-btn lap-btn" },
            disabled: (!stopwatch.isRunning),
        });
    }
}
if (__VLS_ctx.showEditPopup) {
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
    (__VLS_ctx.editPopupTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.saveEdit) },
        ...{ onKeydown: (__VLS_ctx.closeEditPopup) },
        type: (__VLS_ctx.editInputType),
        placeholder: (__VLS_ctx.editPlaceholder),
        min: (__VLS_ctx.editInputType === 'number' ? 1 : undefined),
        ...{ class: "edit-input" },
        ref: "editInput",
    });
    (__VLS_ctx.editValue);
    /** @type {typeof __VLS_ctx.editInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.saveEdit) },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeEditPopup) },
        ...{ class: "popup-btn cancel-btn" },
    });
}
if (__VLS_ctx.showDeletePopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup delete-popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmDeleteAction) },
        ...{ onKeydown: (__VLS_ctx.confirmDeleteAction) },
        ...{ class: "popup-btn delete-confirm-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeDeletePopup) },
        ...{ onKeydown: (__VLS_ctx.closeDeletePopup) },
        ...{ class: "popup-btn cancel-btn" },
    });
}
if (__VLS_ctx.showTimerPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeTimerPopup) },
        ...{ onKeydown: (__VLS_ctx.closeTimerPopup) },
        ...{ onKeydown: (__VLS_ctx.closeTimerPopup) },
        ...{ class: "popup-btn save-btn" },
    });
}
if (__VLS_ctx.showAddTimerPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.addTimer) },
        ...{ onKeydown: (__VLS_ctx.closeAddTimerPopup) },
        value: (__VLS_ctx.newTimerName),
        type: "text",
        placeholder: "Timer Name (optional)",
        ...{ class: "edit-input" },
        ref: "newTimerInput",
    });
    /** @type {typeof __VLS_ctx.newTimerInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addTimer) },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeAddTimerPopup) },
        ...{ class: "popup-btn cancel-btn" },
    });
}
if (__VLS_ctx.showAddStopwatchPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.addStopwatch) },
        ...{ onKeydown: (__VLS_ctx.closeAddStopwatchPopup) },
        value: (__VLS_ctx.newStopwatchName),
        type: "text",
        placeholder: "Stoppuhr Name (optional)",
        ...{ class: "edit-input" },
        ref: "newStopwatchInput",
    });
    /** @type {typeof __VLS_ctx.newStopwatchInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addStopwatch) },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeAddStopwatchPopup) },
        ...{ class: "popup-btn cancel-btn" },
    });
}
if (__VLS_ctx.showDownloadPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "downloaddistance" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.downloadFormat),
        ...{ class: "edit-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "html",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "pdf",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "csv",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "json",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmDownload) },
        ...{ class: "popup-btn save-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeDownloadPopup) },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.audio, __VLS_intrinsicElements.audio)({
    id: "audio-standard",
    preload: "auto",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.audio, __VLS_intrinsicElements.audio)({
    id: "audio-alarm",
    preload: "auto",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.audio, __VLS_intrinsicElements.audio)({
    id: "audio-beep",
    preload: "auto",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.audio, __VLS_intrinsicElements.audio)({
    id: "audio-dong",
    preload: "auto",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.audio, __VLS_intrinsicElements.audio)({
    id: "audio-decide",
    preload: "auto",
});
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
/** @type {__VLS_StyleScopedClasses['training']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['workout-list']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-name-input']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['add-exercise-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['extras-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['extras-container']} */ ;
/** @type {__VLS_StyleScopedClasses['show']} */ ;
/** @type {__VLS_StyleScopedClasses['extras-content']} */ ;
/** @type {__VLS_StyleScopedClasses['goal-select']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['workout-list']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-item']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['open-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-exercise-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-exercises-table']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['table-delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['workout-list']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['close-plan-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['exercise-table']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['resizable']} */ ;
/** @type {__VLS_StyleScopedClasses['resizable']} */ ;
/** @type {__VLS_StyleScopedClasses['resizable']} */ ;
/** @type {__VLS_StyleScopedClasses['resizable-row']} */ ;
/** @type {__VLS_StyleScopedClasses['workout-list']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-container']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['add-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-name']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-display']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-select']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-input']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-select']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stop-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['workout-list']} */ ;
/** @type {__VLS_StyleScopedClasses['stopwatch-top']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['add-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-name']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['close-timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['timer']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lap-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['laps-container']} */ ;
/** @type {__VLS_StyleScopedClasses['laps-list']} */ ;
/** @type {__VLS_StyleScopedClasses['lap-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-display']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stop-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timer']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['start-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['timer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lap-btn']} */ ;
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
/** @type {__VLS_StyleScopedClasses['delete-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-confirm-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
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
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['downloaddistance']} */ ;
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
            plans: plans,
            favoritePlans: favoritePlans,
            planName: planName,
            newExercise: newExercise,
            customPlanExercise: customPlanExercise,
            newReps: newReps,
            newSets: newSets,
            editingPlanId: editingPlanId,
            selectedPlanExercises: selectedPlanExercises,
            selectedPlan: selectedPlan,
            showTimerPopup: showTimerPopup,
            showDeletePopup: showDeletePopup,
            showEditPopup: showEditPopup,
            showAddTimerPopup: showAddTimerPopup,
            showAddStopwatchPopup: showAddStopwatchPopup,
            showDownloadPopup: showDownloadPopup,
            showValidationPopup: showValidationPopup,
            validationErrorMessages: validationErrorMessages,
            validationOkButton: validationOkButton,
            downloadFormat: downloadFormat,
            newTimerName: newTimerName,
            newStopwatchName: newStopwatchName,
            exerciseFilter: exerciseFilter,
            trainingGoals: trainingGoals,
            selectedGoal: selectedGoal,
            showExtras: showExtras,
            timers: timers,
            stopwatches: stopwatches,
            isTimerSticky: isTimerSticky,
            isStopwatchSticky: isStopwatchSticky,
            columnWidths: columnWidths,
            rowHeights: rowHeights,
            planSearch: planSearch,
            editValue: editValue,
            editInput: editInput,
            newTimerInput: newTimerInput,
            newStopwatchInput: newStopwatchInput,
            showCustomExercises: showCustomExercises,
            exerciseEditIndex: exerciseEditIndex,
            exerciseEditField: exerciseEditField,
            customExercises: customExercises,
            toast: toast,
            filteredPlans: filteredPlans,
            filteredExercises: filteredExercises,
            editPopupTitle: editPopupTitle,
            editInputType: editInputType,
            editPlaceholder: editPlaceholder,
            formatTimerDisplay: formatTimerDisplay,
            formatStopwatchDisplay: formatStopwatchDisplay,
            formatLapTime: formatLapTime,
            toggleCustomExercises: toggleCustomExercises,
            finishEdit: finishEdit,
            closeValidationPopup: closeValidationPopup,
            toggleFavoritePlan: toggleFavoritePlan,
            createOrUpdatePlan: createOrUpdatePlan,
            addExerciseToPlan: addExerciseToPlan,
            editPlan: editPlan,
            deletePlan: deletePlan,
            loadPlan: loadPlan,
            closePlan: closePlan,
            openDownloadPopup: openDownloadPopup,
            closeDownloadPopup: closeDownloadPopup,
            confirmDownload: confirmDownload,
            toggleExtras: toggleExtras,
            openAddTimerPopup: openAddTimerPopup,
            closeAddTimerPopup: closeAddTimerPopup,
            addTimer: addTimer,
            openDeleteTimerPopup: openDeleteTimerPopup,
            toggleFavoriteTimer: toggleFavoriteTimer,
            openAddStopwatchPopup: openAddStopwatchPopup,
            closeAddStopwatchPopup: closeAddStopwatchPopup,
            addStopwatch: addStopwatch,
            openDeleteStopwatchPopup: openDeleteStopwatchPopup,
            toggleFavoriteStopwatch: toggleFavoriteStopwatch,
            updateCustomSeconds: updateCustomSeconds,
            startTimerInstance: startTimerInstance,
            stopTimerInstance: stopTimerInstance,
            resetTimerInstance: resetTimerInstance,
            resetStopwatchInstance: resetStopwatchInstance,
            addLapTime: addLapTime,
            resetCustomSeconds: resetCustomSeconds,
            toggleStopwatchInstance: toggleStopwatchInstance,
            openDeletePopup: openDeletePopup,
            closeDeletePopup: closeDeletePopup,
            confirmDeleteAction: confirmDeleteAction,
            openEditPopup: openEditPopup,
            saveEdit: saveEdit,
            removeCustomExercise: removeCustomExercise,
            closeEditPopup: closeEditPopup,
            closeTimerPopup: closeTimerPopup,
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
