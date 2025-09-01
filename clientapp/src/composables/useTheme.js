// src/composables/useTheme.ts
import { ref } from 'vue';
const THEME_KEY = 'theme';
export const isDark = ref(false);
function apply(theme) {
    isDark.value = theme === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark.value);
    document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light';
}
export function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
        apply(saved);
        return;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    apply(prefersDark ? 'dark' : 'light');
}
export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    apply(theme);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
}
// 👉 NEU: Nur visuell anwenden, nichts speichern, isDark NICHT anfassen.
export function previewTheme(theme) {
    const on = theme === 'dark';
    document.documentElement.classList.toggle('dark-mode', on);
    document.documentElement.style.colorScheme = on ? 'dark' : 'light';
}
// Sync bei Änderungen in anderen Tabs
window.addEventListener('storage', (e) => {
    if (e.key === THEME_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        apply(e.newValue);
    }
});
export function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark');
}
