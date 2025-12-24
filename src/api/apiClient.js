// src/api/apiClient.js
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

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
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (err) => Promise.reject(err)
);

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (!error.response) return Promise.reject(error);

        const original = error.config;
        if (!original) return Promise.reject(error);

        const path = window.location.pathname;

        // Rutas públicas donde NO hacemos refresh
        const isPublicPath = path === "/" || path === "/nosotros";

        // Evitar refresh en endpoints auth (para no hacer cosas raras)
        const isAuthEndpoint =
            original.url?.includes("/auth/refresh") ||
            original.url?.includes("/auth/login") ||
            original.url?.includes("/auth/logout");

        // Si falló el refresh, cortamos (evita loops)
        if (original.url?.includes("/auth/refresh")) {
            forceLogout("EXPIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
            return Promise.reject(error);
        }

        // Si el request era auth/login/logout, no intentamos refresh
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        const status = error.response.status;

        // Intentar refresh en 401/403 (Spring a veces usa 403)
        if ((status === 401 || status === 403) && !original._retry && !isPublicPath) {
            original._retry = true;

            // Si ya hay refresh en curso, encolamos
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
                const refreshResp = await api.post("/auth/refresh", {});
                const newToken =
                    refreshResp.data?.token ||
                    refreshResp.data?.accessToken ||
                    refreshResp.data?.jwt;

                if (!newToken) throw new Error("Refresh no devolvió token");

                setAccessToken(newToken);
                processQueue(null, newToken);

                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                forceLogout("EXPIRED", "Tu sesión expiró por seguridad. Vuelve a iniciar sesión.");
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Logout definitivo + motivo/mensaje (para UX)
function forceLogout(reason, message) {
    limpiarSesion();

    try {
        sessionStorage.setItem("logoutReason", reason || "EXPIRED");
        if (message) sessionStorage.setItem("logoutMessage", message);
    } catch { }

    if (window.location.pathname !== "/") {
        window.location.href = "/";
    }
}

// Limpieza centralizada (front)
function limpiarSesion() {
    clearAccessToken();
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userDni");
    localStorage.removeItem("userNivel");
    localStorage.removeItem("userGrado");
}
