import { apiAuth } from "./apiAuth";
import { setAccessToken } from "./api";

export async function logoutBackend() {
    try {
        await apiAuth.post("/auth/logout");
    } catch (e) {
        // aunque falle, igual limpiamos sesión local
        console.error("Logout backend error:", e);
    } finally {
        setAccessToken(null);
        localStorage.clear();
        sessionStorage.removeItem("accessToken");
    }
}
