import { apiAuth } from "./apiAuth";
import { clearAccessToken } from "./tokenStore";

export async function logoutBackend() {
    try {
        await apiAuth.post("/auth/logout");
    } catch (e) {
        console.error("Logout backend error:", e);
    } finally {
        clearAccessToken();
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userDni");
        localStorage.removeItem("userNivel");
        localStorage.removeItem("userGrado");
    }
}
