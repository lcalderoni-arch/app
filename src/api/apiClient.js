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

        // Si ya estamos en login / público, no hagas cosas raras
        const isPublicPath =
            window.location.pathname === "/" || window.location.pathname === "/nosotros";

        // Evita loop infinito si refresh falla
        if (original.url?.includes("/auth/refresh")) {
            forceLogout("Tu sesión expiró. Inicia sesión nuevamente.");
            return Promise.reject(error);
        }

        const status = error.response.status;

        // ✅ IMPORTANTE: intenta refresh tanto en 401 como en 403
        // (403 a veces lo usa Spring Security cuando el token es inválido o no autorizado)
        if ((status === 401 || status === 403) && !original._retry && !isPublicPath) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                });
            }

            isRefreshing = true;

            try {
                const refreshResp = await api.post("/auth/refresh", {});
                const newToken =
                    refreshResp.data?.token || refreshResp.data?.accessToken || refreshResp.data?.jwt;

                if (!newToken) throw new Error("Refresh no devolvió token");

                setAccessToken(newToken);
                processQueue(null, newToken);

                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                forceLogout("Tu sesión expiró por seguridad. Vuelve a iniciar sesión.");
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// 👇 Logout “definitivo” + mensaje
function forceLogout(message) {
    limpiarSesion();
    try {
        sessionStorage.setItem("logoutReason", message);
    } catch { }
    if (window.location.pathname !== "/") {
        window.location.href = "/";
    }
}

// Limpieza centralizada
function limpiarSesion() {
    clearAccessToken();
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userDni");
    localStorage.removeItem("userNivel");
    localStorage.removeItem("userGrado");
}
