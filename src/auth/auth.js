export const getAuth = () => {
    const token = localStorage.getItem("authToken");
    const rol = localStorage.getItem("userRol"); // ej: "ADMINISTRADOR" | "PROFESOR" | "ALUMNO"
    return { token, rol };
};

export const isLoggedIn = () => {
    const { token, rol } = getAuth();
    return Boolean(token && rol);
};

export const getHomeByRole = (rol) => {
    switch ((rol || "").toUpperCase()) {
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
