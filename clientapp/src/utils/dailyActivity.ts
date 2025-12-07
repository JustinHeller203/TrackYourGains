// src/utils/dailyActivity.ts
const ACTIVITY_KEY = 'profile_activity';
const LAST_VISIT_KEY = 'profile_last_visit_day';

function loadJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key: string, val: unknown) {
    localStorage.setItem(key, JSON.stringify(val));
}

export function ensureDailyAutoActivity() {
    // "Tag" als Ganzzahl → egal welche Uhrzeit
    const todayDay = Math.floor(Date.now() / 86400000);

    const rawLast = localStorage.getItem(LAST_VISIT_KEY);
    const lastDay = rawLast ? Number(rawLast) : NaN;

    let activity = loadJSON<number[]>(ACTIVITY_KEY, []);

    // Wenn für heute schon geloggt → raus
    if (lastDay === todayDay) return;

    if (!activity.length) {
        // erste Historie → heute erster Tag
        activity = [1];
    } else if (!Number.isFinite(lastDay)) {
        // Historie existiert, aber noch kein letzter Besuch abgespeichert
        activity = activity.concat(1);
    } else {
        const diff = todayDay - lastDay;

        if (diff <= 0) {
            // Uhr zurückgestellt oder irgendwas komisch → letzten Tag min. 1
            const idx = activity.length - 1;
            activity[idx] = Math.max(1, activity[idx] ?? 0);
        } else {
            // diff > 0 → seit letztem Besuch sind diff Tage vergangen
            // diff-1 Tage als 0 einfügen + heute als 1
            const zeros = Array(Math.max(0, diff - 1)).fill(0);
            activity = activity.concat(zeros, 1);
        }
    }

    saveJSON(ACTIVITY_KEY, activity);
    localStorage.setItem(LAST_VISIT_KEY, String(todayDay));
}
