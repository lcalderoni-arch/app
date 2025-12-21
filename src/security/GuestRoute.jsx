import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth, getHomeByRole } from "../auth/auth"; // ajusta ruta

export default function GuestRoute({ children }) {
    const { token, rol } = getAuth();

    if (token && rol) {
        return <Navigate to={getHomeByRole(rol)} replace />;
    }

    return children;
}
