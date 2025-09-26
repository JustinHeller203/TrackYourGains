// src/lib/api.ts
import axios from "axios";
import type { AxiosRequestHeaders } from "axios";

const TOKEN_KEY = "auth_token";

function buildBaseUrl(): string {
    // aus .env(.local/.production):
    // VITE_API_URL=http://localhost:5054   (DEV)
    // VITE_API_URL=https://trackyourgains-production.up.railway.app   (PROD)
    const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;
    const base = (raw?.trim() || "").replace(/\/+$/u, "");
    // Fallback auf PROD-API, falls ENV fehlt
    const origin =
        base.length > 0 ? base : "https://trackyourgains-production.up.railway.app";
    return origin + "/api";
}

export const api = axios.create({
    baseURL: buildBaseUrl(),
    withCredentials: true, // <<< wichtig fürs HttpOnly-Refresh-Cookie
    headers: { "Content-Type": "application/json" },
});

// Authorization-Header aus LocalStorage anhängen
api.interceptors.request.use((config) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${t}`;
        config.headers = headers;
    }
    return config;
});

// Token-Helpers (dein Store erwartet diese Exports)
export function setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
