// src/lib/api.ts
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { LS_AUTH_TOKEN } from "../constants/storageKeys";
import type { AxiosRequestHeaders } from "axios";

function buildBaseUrl(): string {
    // .env(.local/.production):
    // VITE_API_URL=http://localhost:5054   (DEV)
    // VITE_API_URL=https://trackyourgains-production.up.railway.app   (PROD)
    const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;
    const base = (raw?.trim() || "").replace(/\/+$/u, "");
    const origin = base.length > 0 ? base : "https://trackyourgains-production.up.railway.app";
    return origin + "/api";
}

export const api = axios.create({
    baseURL: buildBaseUrl(),
    withCredentials: true, // wichtig f�rs HttpOnly-Refresh-Cookie "rt"
    headers: { "Content-Type": "application/json" },
});

// ---- Token Handling ----
let memoryToken: string | null = null;

export function setToken(token: string | null) {
    memoryToken = token;
    if (token) {
        localStorage.setItem(LS_AUTH_TOKEN, token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        localStorage.removeItem(LS_AUTH_TOKEN);
        delete api.defaults.headers.common["Authorization"];
    }
}

export function getToken(): string | null {
    if (memoryToken) return memoryToken;
    const t = localStorage.getItem(LS_AUTH_TOKEN);
    if (t) {
        memoryToken = t;
        api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    }
    return t;
}

// ---- Request Interceptor: h�nge Token an ----
api.interceptors.request.use((config) => {
    const t = getToken();
    if (t) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${t}`;
        config.headers = headers;
    }
    return config;
});

// ---- Response Interceptor: 401 -> /auth/refresh -> Retry ----
type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
    queue.forEach((cb) => cb(token));
    queue = [];
}

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as RetriableConfig | undefined;

        // Nur f�r 401, keine Endlosschleife, nicht f�r den Refresh-Call selbst
        const isAuthRefresh = original?.url?.includes("/auth/refresh");
        if (status === 401 && original && !original._retry && !isAuthRefresh) {
            original._retry = true;

            // Wenn bereits Refresh l�uft ? enqueue und warten
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    queue.push((newToken) => {
                        if (!newToken) return reject(error);
                        const headers = (original.headers ?? {}) as AxiosRequestHeaders;
                        headers.Authorization = `Bearer ${newToken}`;
                        original.headers = headers;
                        resolve(api.request(original));
                    });
                });
            }

            isRefreshing = true;
            try {
                const { data } = await api.post<{ id: string; email: string; token: string }>("/auth/refresh");
                setToken(data.token);
                flushQueue(data.token);

                const headers = (original.headers ?? {}) as AxiosRequestHeaders;
                headers.Authorization = `Bearer ${data.token}`;
                original.headers = headers;

                return api.request(original);
            } catch (e) {
                // Refresh failed ? alle wartenden Anfragen fehlschlagen lassen & Token droppen
                setToken(null);
                flushQueue(null);
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
