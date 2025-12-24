import { getAccessToken } from "../api/tokenStore";

export const getAuth = () => {
    const token = getAccessToken(); // ✅ token real (memoria/sessionStorage)
    const rol =
        localStorage.getItem("userRole") || localStorage.getItem("userRol"); // fallback legacy
    return { token, rol };
};

export const isLoggedIn = () => {
    const { token, rol } = getAuth();
    return Boolean(token && rol);
};

export const getHomeByRole = (rol) => {
    switch (String(rol || "").toUpperCase()) {
        case "ADMINISTRADOR":
            return "/dashboard-admin";
        case "PROFESOR":
            return "/pantalla-docente";
        case "ALUMNO":
            return "/pantalla-estudiante";
        default:
            return "/";
    }
};
