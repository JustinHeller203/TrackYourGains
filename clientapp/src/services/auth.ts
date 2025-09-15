// src/services/auth.ts
import { api, setToken } from "@/lib/api";

export async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    // Backend gibt { token, email } zurück
    setToken(data.token);
    return data;
}

export async function register(email: string, password: string) {
    const { data } = await api.post("/auth/register", { email, password });
    setToken(data.token); // du gibst beim Register auch token aus – gut für Auto-Login
    return data;
}

export function logout() {
    setToken(null);
}
