import { ref, onMounted, onUnmounted } from 'vue';
const unitRef = ref('kg');
// Umrechnungsfaktoren
export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 1 / KG_PER_LB;
function setUnit(u) {
    unitRef.value = u;
    localStorage.setItem('preferredUnit', u);
}
// kg -> Anzeigeeinheit
function kgToDisplay(kg) {
    return unitRef.value === 'kg' ? kg : kg * LB_PER_KG;
}
// Eingabe (Anzeigeeinheit) -> kg
function displayToKg(val) {
    return unitRef.value === 'kg' ? val : val * KG_PER_LB;
}
// Sch�ne Formatierung mit Suffix
function formatWeight(kg, digits = 1) {
    return unitRef.value === 'kg'
        ? `${kg.toFixed(digits)} kg`
        : `${(kg * LB_PER_KG).toFixed(digits)} lbs`;
}
export function useUnits() {
    const onStorage = (e) => {
        if (e.key === 'preferredUnit' && e.newValue) {
            unitRef.value = e.newValue;
        }
    };
    const onCustom = (e) => {
        const ce = e;
        if (ce.detail)
            unitRef.value = ce.detail;
    };
    onMounted(() => {
        const saved = (localStorage.getItem('preferredUnit') || 'kg').toLowerCase();
        if (saved === 'kg' || saved === 'lbs')
            unitRef.value = saved;
        window.addEventListener('storage', onStorage);
        window.addEventListener('preferred-unit-changed', onCustom);
    });
    onUnmounted(() => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('preferred-unit-changed', onCustom);
    });
    return { unit: unitRef, setUnit, kgToDisplay, displayToKg, formatWeight };
}
