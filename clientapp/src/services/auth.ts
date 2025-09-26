// src/services/auth.ts
import { api, setToken } from "@/lib/api";

type AuthResponse = { id: string; email: string; token: string };

export async function register(email: string, password: string, confirmPassword: string) {
    const { data } = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        confirmPassword,
    });
    setToken(data.token);
    return data;
}

export async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
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
