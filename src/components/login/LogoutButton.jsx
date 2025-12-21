// src/components/login/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutBackend } from "../../api/authActions";

export default function LogoutButton() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");

    const handleLogout = async () => {
        await logoutBackend();
        navigate("/");
        window.location.reload();
    };

    return (
        <button
            className="btn-logout"
            onClick={handleLogout}
            title={`Sesión de ${userName || "Usuario"}`}
            style={{
                padding: "10px 20px",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
            }}
        >
            Cerrar sesión
        </button>
    );
}
