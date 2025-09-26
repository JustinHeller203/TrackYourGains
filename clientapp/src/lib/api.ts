// src/lib/api.ts
import axios from "axios";
import type { AxiosRequestHeaders } from "axios";

const TOKEN_KEY = "auth_token";

function buildBaseUrl(): string {
    // deine Variable heißt VITE_API_URL → wir normalisieren sie
    const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;
    const base = raw?.trim().replace(/\/+$/u, "") || "https://trackyourgains-production.up.railway.app";
    return base + "/api";
}

export const api = axios.create({
    baseURL: buildBaseUrl(),
    withCredentials: true,                    // <<< MUSS true sein
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${t}`;
        config.headers = headers;
    }
    return config;
});

export function setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}
