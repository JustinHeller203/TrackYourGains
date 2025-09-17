// src/lib/api.ts
import axios from "axios";
import type { AxiosRequestHeaders } from "axios";

const TOKEN_KEY = "auth_token";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // <-- kommt aus Env-Variable
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
