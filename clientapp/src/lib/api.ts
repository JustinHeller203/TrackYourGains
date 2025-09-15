// src/lib/api.ts
import axios from "axios";

const TOKEN_KEY = "auth_token";

export const api = axios.create({
    baseURL: "http://localhost:5054/api",
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

export function setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
