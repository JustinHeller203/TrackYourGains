// src/services/auth.ts
import { api, setToken } from "@/lib/api";

export async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    return data;
}

export async function register(email: string, password: string) {
    const { data } = await api.post("/auth/register", { email, password });
    setToken(data.token);
    return data;
}

export async function changePassword(current: string, next: string) {
    const { data } = await api.post("/auth/change-password", {
        currentPassword: current,
        newPassword: next,
    });
    setToken(data.token);
    return data;
}

export async function changeEmail(newEmail: string, password: string) {
    const { data } = await api.post("/auth/change-email", {
        newEmail,
        password,
    });
    setToken(data.token); // neues JWT enthält neue E-Mail
    return data;
}

export function logout() {
    setToken(null);
}

export async function deleteAccount(password: string) {
    const { data } = await api.post("/auth/delete-account", { password });
    return data; // { ok: true }
}
