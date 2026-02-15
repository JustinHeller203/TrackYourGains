import { api } from "@/lib/api";

export type SettingsDto = {
    theme: "dark" | "light";
    preferredUnit: "kg" | "lbs";
    autoCalcEnabled: boolean;
    confirmDeleteEnabled: boolean;
    backToTopEnabled: boolean;
    stickyTimerEnabled: boolean;
    stickyStopwatchEnabled: boolean;
    toastsEnabled: boolean;
    toastDurationMs: number;
    toastTypeEnabledJson: string;
};

export async function getSettings() {
    const { data } = await api.get<SettingsDto>("/settings");
    return data;
}

export async function saveSettings(dto: SettingsDto) {
    await api.put("/settings", dto);
}
