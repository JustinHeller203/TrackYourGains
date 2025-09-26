// src/services/auth.ts
import { api, setToken } from "@/lib/api";

type AuthResponse = { id: string; email: string; token: string };

export async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    setToken(data.token);                 // JWT im LocalStorage sichern
    return data;
}

export async function register(email: string, password: string, confirmPassword: string) {
    const { data } = await api.post("/auth/register", {
        email: email,
        password: password,
        confirmPassword: confirmPassword   
    });

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
        await api.post("/auth/logout");     // Session auch auf Server killen
    } finally {
        setToken(null);
    }
}
