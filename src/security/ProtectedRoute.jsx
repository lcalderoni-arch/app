//src/security/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles }) {
    const role = localStorage.getItem("userRole");

    // Validación de autenticación
    if (!role) {
        console.error("⛔ ACCESO DENEGADO: No se encontró 'userRole' en localStorage. Redirigiendo al inicio.");
        return <Navigate to="/" replace />;
    }

    // Validación de autorización (si se especifican roles)
    if (roles && roles.length > 0) {
        if (!roles.includes(role)) {
            console.error(`⛔ AUTORIZACIÓN DENEGADA: El rol '${role}' no tiene permisos para acceder. Redirigiendo al inicio.`);
            return <Navigate to="/" replace />;
        }
    }

    // Si pasa todas las validaciones, renderiza el componente
    return children;
}