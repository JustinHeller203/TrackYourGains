import { api } from "@/lib/api";

export type ProfileDto = {
    username: string;
    hasCreatedTrainingPlan: boolean;
    displayName: string;
    motto: string;
    avatarDataUrl?: string | null;
    favoriteTimers: number;
    memberSinceUtc: string;
    activity: number[];
    progress: Record<string, number>;
    goalOrder: string[];
    earnedBadges: string[];
    tutorialFavoriteIds: number[];
    tutorialRecentViewed: Record<string, string>;
};

export type UpdateProfileDto = {
    username?: string;
    hasCreatedTrainingPlan?: boolean;
    displayName?: string;
    motto?: string;
    avatarDataUrl?: string | null;
    favoriteTimers?: number;
    memberSinceUtc?: string;
    activity?: number[];
    progress?: Record<string, number>;
    goalOrder?: string[];
    earnedBadges?: string[];
    tutorialFavoriteIds?: number[];
    tutorialRecentViewed?: Record<string, string>;
};

export async function getProfile() {
    const { data } = await api.get<ProfileDto>("/profile");
    return data;
}

export async function updateProfile(payload: UpdateProfileDto) {
    const { data } = await api.put<ProfileDto>("/profile", payload);
    return data;
}
