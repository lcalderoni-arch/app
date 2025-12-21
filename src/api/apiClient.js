// src/api/apiClient.js
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Evita loops infinitos
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    refreshQueue = [];
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ✅ necesario para enviar refresh_token cookie
});

api.interceptors.request.use(
    (config) => {
        // ✅ asegura headers
        config.headers = config.headers || {};

        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (err) => Promise.reject(err)
);

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        // si no hay response, es un error de red
        if (!error.response) return Promise.reject(error);

        const original = error.config;

        // ✅ si por alguna razón no hay config
        if (!original) return Promise.reject(error);

        // ✅ MUY IMPORTANTE: si el endpoint que falló es /auth/refresh, NO intentes refrescar otra vez
        if (original.url?.includes("/auth/refresh")) {
            // limpieza de sesión
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userDni");
            return Promise.reject(error);
        }

        // Si es 401 y no hemos reintentado aún
        if (error.response.status === 401 && !original._retry) {
            original._retry = true;

            // Si ya se está refrescando, hacemos cola
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers = original.headers || {};
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                });
            }

            isRefreshing = true;

            try {
                // ✅ pide nuevo access token usando cookie refresh_token
                // IMPORTANTE: esta request también usa api, pero arriba bloqueamos loops para /auth/refresh
                const refreshResp = await api.post("/auth/refresh", {});
                const newToken =
                    refreshResp.data?.token ||
                    refreshResp.data?.accessToken || // por si tu backend lo llama distinto
                    refreshResp.data?.jwt;

                if (!newToken) throw new Error("Refresh no devolvió token");

                localStorage.setItem("authToken", newToken);

                processQueue(null, newToken);

                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${newToken}`;

                return api(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);

                // Limpieza de sesión
                localStorage.removeItem("authToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userDni");

                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    } 
);
