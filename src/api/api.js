// src/api/api.js
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Access token (memoria + sessionStorage)
let accessToken = sessionStorage.getItem("accessToken") || null;

export function setAccessToken(token) {
    accessToken = token;
    if (token) sessionStorage.setItem("accessToken", token);
    else sessionStorage.removeItem("accessToken");
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    // ❌ NO withCredentials aquí
});

// Adjunta Authorization automáticamente
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});
