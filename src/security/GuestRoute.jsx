import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthReady } from "../api/authState";

export default function GuestRoute({ children }) {
    const [ready, setReady] = useState(isAuthReady());

    useEffect(() => {
        const handler = () => setReady(isAuthReady());
        window.addEventListener("auth-ready-changed", handler);
        return () => window.removeEventListener("auth-ready-changed", handler);
    }, []);

    if (!ready) return <div style={{ padding: 16 }}>Cargando...</div>;

    const role = localStorage.getItem("userRole");
    if (role === "ADMINISTRADOR") return <Navigate to="/dashboard-admin" replace />;
    if (role === "ALUMNO") return <Navigate to="/pantalla-estudiante" replace />;
    if (role === "PROFESOR") return <Navigate to="/pantalla-docente" replace />;

    return children;
}
