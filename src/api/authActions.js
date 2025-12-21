// src/api/authActions.js
import { apiAuth } from "./apiAuth";
import { setAccessToken } from "./api";

export async function logoutBackend() {
    try {
        await apiAuth.post("/auth/logout"); // ✅ va a API_BASE_URL + /auth/logout
    } catch (e) {
        // si falla, igual limpiamos front para no dejar “sesión fantasma”
        console.error("Error logout backend:", e);
    } finally {
        setAccessToken(null); // limpia sessionStorage accessToken
        localStorage.clear(); // limpia userName, userRole, etc.
    }
}
