// src/api/api.js
// Alias único hacia el cliente real con refresh cookie

export { api } from "./apiClient";

// Mantengo la función para compatibilidad con LoginForm
export function setAccessToken(token) {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
}
