import { apiAuth } from "./apiAuth";

/**
 * Cierra sesión en backend y limpia la sesión local
 */
export async function logoutBackend() {
    try {
        await apiAuth.post("/auth/logout");
    } catch (e) {
        console.error("Logout backend error:", e);
    } finally {
        // Limpieza segura (NO usar clear)
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userDni");
        localStorage.removeItem("userNivel");
        localStorage.removeItem("userGrado");
    }
}
