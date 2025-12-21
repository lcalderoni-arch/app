import axios from "axios";
import { API_BASE_URL } from "../config/api";

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
        if (!error.response) return Promise.reject(error);

        const original = error.config;
        if (!original) return Promise.reject(error);

        // ❌ Evita loop infinito
        if (original.url?.includes("/auth/refresh")) {
            limpiarSesion();
            return Promise.reject(error);
        }

        // 🔁 Intento de refresh
        if (error.response.status === 401 && !original._retry) {
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
                    refreshResp.data?.token ||
                    refreshResp.data?.accessToken ||
                    refreshResp.data?.jwt;

                if (!newToken) throw new Error("Refresh no devolvió token");

                localStorage.setItem("authToken", newToken);
                processQueue(null, newToken);

                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                limpiarSesion();
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// 🔒 Limpieza centralizada
function limpiarSesion() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userDni");
    localStorage.removeItem("userNivel");
    localStorage.removeItem("userGrado");
}
