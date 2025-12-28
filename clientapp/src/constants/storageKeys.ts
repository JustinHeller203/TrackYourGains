// src/constants/storageKeys.ts

// Auth
export const LS_AUTH_EMAIL = 'auth_email' as const
export const LS_AUTH_TOKEN = 'auth_token' as const

// UI / Settings
export const LS_THEME = 'theme' as const
export const LS_PREFERRED_UNIT = 'preferredUnit' as const
export const LS_AUTO_CALC_ENABLED = 'autoCalcEnabled' as const
export const LS_CONFIRM_DELETE_ENABLED = 'confirmDeleteEnabled' as const
export const LS_BACK_TO_TOP_ENABLED = 'backToTopEnabled' as const
export const LS_TOAST_TYPES_REMINDER_COUNT = 'settings:toast-types-save-reminder-count' as const
export const LS_GUIDE_EXPLAIN_SEEN_VERSION = 'tyg_guide_explain_seen_version' as const
export const LS_STICKY_TIMER_ENABLED = 'stickyTimerEnabled' as const
export const LS_STICKY_STOPWATCH_ENABLED = 'stickyStopwatchEnabled' as const

// Training / App
export const LS_TRAINING_FOCUS_TYPE = 'trainingFocusType' as const
export const LS_TRAINING_FOCUS_ID = 'trainingFocusId' as const
export const LS_TRAINING_TIMERS_V1 = 'training_timers_v1' as const
export const LS_TRAINING_STOPWATCHES_V1 = 'training_stopwatches_v1' as const
export const LS_NEWS_SEEN_VERSION = 'tyg_news_seen_version' as const

// Training data / plans
export const LS_TRAINING_DATA = 'trainingData' as const
export const LS_TRAINING_OPEN_PLAN_ID = 'trainingOpenPlanId' as const
export const LS_OPEN_PLAN_ID = 'openPlanId' as const // ⚠️ doppelt/legacy (später migrieren)

// Progress
export const LS_PROGRESS_WEIGHTS = 'progress_weights' as const
export const LS_PROGRESS_WORKOUTS = 'progress_workouts' as const
export const LS_PROGRESS_MEALS = 'progress_meals' as const
export const LS_PROGRESS_GOAL = 'progress_goal' as const
export const LS_PROGRESS_FAVORITE_CALCULATORS = 'progress_favorite_calculators' as const

// Progress / Calculators (persisted state)
export const LS_PROGRESS_BMI = 'progress_bmi' as const
export const LS_PROGRESS_CALORIES = 'progress_calories' as const
export const LS_PROGRESS_ONE_RM = 'progress_oneRm' as const
export const LS_PROGRESS_BODY_FAT = 'progress_bodyFat' as const
export const LS_PROGRESS_BODY_FAT_INPUTS_V1 = 'tyg_bodyfat_inputs_v1' as const
export const LS_PROGRESS_FFMI = 'progress_ffmi' as const
export const LS_PROGRESS_WATER = 'progress_water' as const
export const LS_PROGRESS_WATER_INPUTS_V1 = 'tyg_water_inputs_v1' as const
export const LS_PROGRESS_PROTEIN = 'progress_protein' as const
export const LS_PROGRESS_CAFFEINE = 'progress_caffeine' as const
export const LS_PROGRESS_CAFFEINE_INPUTS_V1 = 'tyg_caffeine_inputs_v1' as const
export const LS_PROGRESS_GLYLOAD = 'progress_glyload' as const
export const LS_PROGRESS_BURN_RATE = 'progress_burnRate' as const

// Legacy
export const LS_LEGACY_TRAINING_PLANS = 'trainingPlans' as const
// Toasts
export const LS_TOAST_PREFS = 'tyg_toast_prefs' as const
export const LS_TOAST_TYPE_ENABLED = 'toastTypeEnabled' as const
export const LS_TOAST_DISABLED_TYPES = 'toastDisabledTypes' as const
export const LS_TOASTS_ENABLED = 'toastsEnabled' as const // legacy
export const LS_TOAST_DURATION_MS = 'toastDurationMs' as const // legacy

// Profile misc
export const LS_PROFILE_LAST_VISIT_DAY = 'profile_last_visit_day' as const
export const LS_PROFILE_GOAL_ORDER = 'profile_goal_order' as const
export const LS_PROFILE_DISPLAY_NAME = 'profile_display_name' as const
export const LS_PROFILE_ACTIVITY = 'profile_activity' as const
export const LS_PROFILE_PROGRESS = 'profile_progress' as const
export const LS_PROFILE_FAV_TIMERS = 'profile_fav_timers' as const
export const LS_PROFILE_MOTTO = 'profile_motto' as const
export const LS_PROFILE_MEMBER_SINCE = 'profile_member_since' as const
export const LS_PROFILE_AVATAR = 'profile_avatar' as const
export const LS_PROFILE_EARNED_BADGES = 'profile_earned_badges' as const

// === Key-Gruppen (Single Source of Truth) ===
// Diese Arrays nutzt du für "wipe local data", Migrationen und Debugging.

export const LS_AUTH_KEYS = [
    LS_AUTH_EMAIL,
    LS_AUTH_TOKEN,
] as const

export const LS_PROFILE_KEYS = [
    LS_PROFILE_LAST_VISIT_DAY,
    LS_PROFILE_GOAL_ORDER,
    LS_PROFILE_DISPLAY_NAME,
    LS_PROFILE_ACTIVITY,
    LS_PROFILE_PROGRESS,
    LS_PROFILE_FAV_TIMERS,
    LS_PROFILE_MOTTO,
    LS_PROFILE_MEMBER_SINCE,
    LS_PROFILE_AVATAR,
    LS_PROFILE_EARNED_BADGES,
] as const

export const LS_SETTINGS_KEYS = [
    LS_THEME,
    LS_PREFERRED_UNIT,
    LS_AUTO_CALC_ENABLED,
    LS_CONFIRM_DELETE_ENABLED,
    LS_BACK_TO_TOP_ENABLED,

    LS_STICKY_TIMER_ENABLED,
    LS_STICKY_STOPWATCH_ENABLED,

    LS_TOAST_TYPES_REMINDER_COUNT,
    LS_TOAST_PREFS,
    LS_TOAST_TYPE_ENABLED,
    LS_TOAST_DISABLED_TYPES,
    LS_TOASTS_ENABLED,
    LS_TOAST_DURATION_MS,
    LS_GUIDE_EXPLAIN_SEEN_VERSION,
] as const

export const LS_TRAINING_KEYS = [
    LS_TRAINING_FOCUS_TYPE,
    LS_TRAINING_FOCUS_ID,
    LS_TRAINING_TIMERS_V1,
    LS_TRAINING_STOPWATCHES_V1,
    LS_NEWS_SEEN_VERSION,
    LS_TRAINING_DATA,
    LS_TRAINING_OPEN_PLAN_ID,
    LS_OPEN_PLAN_ID, // legacy/dupe bewusst drin lassen bis Migration durch ist
] as const

export const LS_PROGRESS_KEYS = [
    LS_PROGRESS_WEIGHTS,
    LS_PROGRESS_WORKOUTS,
    LS_PROGRESS_MEALS,
    LS_PROGRESS_GOAL,
    LS_PROGRESS_FAVORITE_CALCULATORS,

    // calculator states
    LS_PROGRESS_BMI,
    LS_PROGRESS_CALORIES,
    LS_PROGRESS_ONE_RM,
    LS_PROGRESS_BODY_FAT,
    LS_PROGRESS_FFMI,
    LS_PROGRESS_WATER,
    LS_PROGRESS_WATER_INPUTS_V1,
    LS_PROGRESS_PROTEIN,
    LS_PROGRESS_CAFFEINE,
    LS_PROGRESS_CAFFEINE_INPUTS_V1,
    LS_PROGRESS_GLYLOAD,
    LS_PROGRESS_BURN_RATE,
    LS_PROGRESS_BODY_FAT_INPUTS_V1,

    // legacy
    LS_LEGACY_TRAINING_PLANS,
] as const

export const LS_ALL_KEYS = [
    ...LS_AUTH_KEYS,
    ...LS_SETTINGS_KEYS,
    ...LS_TRAINING_KEYS,
    ...LS_PROGRESS_KEYS,
    ...LS_PROFILE_KEYS,
] as const

export function wipeLocalStorage(keys: readonly string[]) {
    for (const k of keys) localStorage.removeItem(k)
}
