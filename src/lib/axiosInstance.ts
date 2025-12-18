import axios, { AxiosRequestHeaders } from "axios";

// HOTFIX: Force baseURL to 6060 to avoid env caching issues until server restart
// TODO: revert to env-based after confirming connectivity and restarting dev server
// const baseURL: string = "http://124.123.18.19:6060/api";
const baseURL: string = import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL || "https://dealscraper.rohans.uno/api";
// eslint-disable-next-line no-console
console.warn("[axios] Using forced baseURL:", baseURL);

export const AUTH_TOKEN_KEY = "auth:token";

const instance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    // timeout: 15000,
});

// Attach token automatically
instance.interceptors.request.use((config) => {
    // Read token from localStorage (remember me) or sessionStorage (session only)
    const token =
        localStorage.getItem(AUTH_TOKEN_KEY) ||
        sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        const headers = (config.headers || {}) as any;
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        // Some backends are strict about scheme casing; set both forms
        headers["Authorization"] = `Bearer ${token}`;
        headers["authorization"] = `bearer ${token}`;
        config.headers = headers as AxiosRequestHeaders;
        try {
            // eslint-disable-next-line no-console
            console.log("[axios][auth] token len:", token?.length ?? 0);
        } catch {}
    }
    // Debug request in console
    try {
        // Avoid logging huge payloads in production
        // eslint-disable-next-line no-console
        console.log("[axios][request]", {
            baseURL: config.baseURL,
            url: config.url,
            method: config.method,
            headers: config.headers,
        });
    } catch {}
    return config;
});

// Log responses and errors for easier debugging
instance.interceptors.response.use(
    (response) => {
        try {
            // eslint-disable-next-line no-console
            console.log("[axios][response]", {
                url: response.config?.url,
                status: response.status,
            });
        } catch {}
        return response;
    },
    (error) => {
        try {
            // eslint-disable-next-line no-console
            console.error("[axios][error]", {
                message: error?.message,
                code: error?.code,
                url: error?.config?.url,
                baseURL: error?.config?.baseURL,
                status: error?.response?.status,
                data: error?.response?.data,
            });
            const status = error?.response?.status;
            if (status === 401) {
                try {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    sessionStorage.removeItem(AUTH_TOKEN_KEY);
                    localStorage.removeItem("auth:user");
                } catch {}
                // Redirect to login
                if (typeof window !== "undefined") {
                    window.location.assign("/login");
                }
            }
        } catch {}
        return Promise.reject(error);
    }
);

export default instance;
