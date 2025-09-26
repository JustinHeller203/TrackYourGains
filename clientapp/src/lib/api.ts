// src/lib/api.ts
import axios from "axios";
import type { AxiosRequestHeaders } from "axios";

const TOKEN_KEY = "auth_token";

function buildBaseUrl(): string {
    // Nutze VITE_API_BASE (volle Origin), fallback auf Railway
    const env = (import.meta as any).env;
    const raw = (env?.VITE_API_BASE as string | undefined)?.trim();

    const base = raw && /^https?:\/\//i.test(raw)
        ? raw.replace(/\/+$/u, "")               // z.B. https://…railway.app
        : "https://trackyourgains-production.up.railway.app";

    return base + "/api"; // Backend hängt unter /api
}

export const api = axios.create({
    baseURL: buildBaseUrl(),
    withCredentials: true,                      // <<< MUSS true sein (rt-Cookie)
    headers: { "Content-Type": "application/json" },
});

// Token aus localStorage als Bearer mitschicken
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
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
