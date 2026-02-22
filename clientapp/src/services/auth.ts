// src/services/auth.ts
import { api, setToken } from "@/lib/api";

type AuthResponse = { id: string; email: string; token: string };

export async function register(email: string, username: string, password: string, confirmPassword: string) {
    const { data } = await api.post<AuthResponse>("/auth/register", {
        email,
        username,
        password,
        confirmPassword,
    });
    setToken(data.token);
    return data;
}

export async function login(username: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { username, password });
    setToken(data.token);
    return data;
}

export async function refresh() {
    const { data } = await api.post<AuthResponse>("/auth/refresh");
    setToken(data.token);
    return data;
}

export async function logout() {
    try {
        await api.post("/auth/logout");
    } finally {
        setToken(null);
    }
}

/** E-Mail �ndern */
export async function changeEmail(newEmail: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/change-email", { newEmail, password });
    setToken(data.token);
    return data;
}

/** ?? Passwort �ndern */
export async function changePassword(current: string, next: string) {
    const { data } = await api.post<AuthResponse>("/auth/change-password", {
        currentPassword: current,
        newPassword: next,
    });
    setToken(data.token);
    return data;
}

/** ??? Konto l�schen (best�tigt mit Passwort) */
export async function deleteAccount(password: string) {
    await api.post("/auth/delete-account", { password });
    setToken(null);
    return { ok: true };
}
