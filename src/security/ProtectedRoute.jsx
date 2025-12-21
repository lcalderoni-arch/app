import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protege rutas por autenticación y rol
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    //  No autenticado
    if (!token || !role) {
        console.error("⛔ Sesión inválida o expirada");
        return <Navigate to="/" replace />;
    }

    //  No autorizado
    if (allowedRoles && !allowedRoles.includes(role)) {
        console.error(`⛔ Rol '${role}' no autorizado`);
        return <Navigate to="/" replace />;
    }

    return children;
}
