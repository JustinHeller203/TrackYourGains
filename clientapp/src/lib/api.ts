// src/lib/api.ts
import axios from "axios";

const TOKEN_KEY = "auth_token";

// ✅ Prod: über ENV (Vercel), Dev: Vite-Proxy (/api)
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
        config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` };
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
