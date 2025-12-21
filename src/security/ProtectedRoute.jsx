import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRol"); // 👈 unificado

    // 1) Autenticación
    if (!token || !role) {
        return <Navigate to="/" replace />;
    }

    // 2) Autorización
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(role)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
