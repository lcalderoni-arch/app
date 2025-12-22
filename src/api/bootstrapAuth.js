import { api } from "./apiClient";
import { getAccessToken, setAccessToken } from "./tokenStore";
import { setAuthReady } from "./authState";

export async function bootstrapAuth() {
    console.log("🟦 bootstrapAuth: iniciando...");

    try {
        // ✅ Si ya hay token en memoria, no refrescamos
        const existing = getAccessToken();
        if (existing) {
            console.log("🟩 bootstrapAuth: token ya existe en memoria, skip refresh");
            return;
        }

        console.log("🟦 bootstrapAuth: llamando /auth/refresh ...");
        const resp = await api.post("/auth/refresh", {});

        console.log("🟩 bootstrapAuth: refresh OK", resp?.data);

        const token = resp.data?.token || resp.data?.accessToken || resp.data?.jwt;
        if (token) {
            setAccessToken(token);
            console.log("🟩 bootstrapAuth: token seteado en memoria");

            // UI sync (solo si hay valor real)
            if (resp.data?.nombre) localStorage.setItem("userName", resp.data.nombre);
            if (resp.data?.rol) localStorage.setItem("userRole", resp.data.rol);
            if (resp.data?.email) localStorage.setItem("userEmail", resp.data.email || "");
            if (resp.data?.dni) localStorage.setItem("userDni", resp.data.dni);
            if (resp.data?.nivelAlumno) localStorage.setItem("userNivel", resp.data.nivelAlumno);
            if (resp.data?.gradoAlumno) localStorage.setItem("userGrado", resp.data.gradoAlumno);
        } else {
            console.warn("🟨 bootstrapAuth: refresh respondió sin token");
        }
    } catch (e) {
        console.log("🟨 bootstrapAuth: refresh falló (normal si no hay sesión)", e?.response?.status);
    } finally {
        setAuthReady(true);
        console.log("✅ bootstrapAuth: authReady = true");
    }
}
