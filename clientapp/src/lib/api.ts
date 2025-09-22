// src/lib/api.ts
import axios from "axios";
import type { AxiosRequestHeaders } from "axios";

const TOKEN_KEY = "auth_token";

function buildBaseUrl(): string {
    const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;

    if (!raw) return "/api";

    let host = raw.trim().replace(/\/+$/u, "");
    host = host.replace(/\/api$/iu, "");
    return `${host}/api`;
}

export const api = axios.create({
    baseURL: buildBaseUrl(),
    withCredentials: false,
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

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
