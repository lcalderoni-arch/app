// src/components/Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { logoutBackend } from "../api/authActions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faHouse, faBookOpen, faChalkboard, faPenToSquare, faCalendar } from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    // ✅ soporta ambos keys para no romper si quedó data vieja
    const userRole = localStorage.getItem("userRol") || localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    const handleLogout = async () => {
        console.warn("🔒 Cerrando sesión...");
        await logoutBackend();

        onClose?.();
        navigate("/");
        window.location.reload();
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <nav className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Menú principal">
                <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
                    ×
                </button>

                <h2>Menú Principal</h2>

                {userName && (
                    <div
                        style={{
                            padding: "10px",
                            borderRadius: "4px",
                            marginBottom: "15px",
                            marginLeft: "5px",
                            fontSize: "0.9em",
                            color: "#8f8f8fff",
                        }}
                    >
                        {userName}
                    </div>
                )}

                <Link to="/dashboard-admin" className="text-nav" onClick={onClose}>
                    <FontAwesomeIcon className="icon-nav" icon={faHouse} />
                    Inicio
                </Link>

                {userRole === "ADMINISTRADOR" && (
                    <>
                        <Link to="/dashboard-admin/usuarios" className="text-nav" onClick={onClose}>
                            <FontAwesomeIcon className="icon-nav" icon={faUsers} />
                            Gestión de Usuarios
                        </Link>

                        <Link to="/dashboard-admin/cursos" className="text-nav" onClick={onClose}>
                            <FontAwesomeIcon className="icon-nav" icon={faBookOpen} />
                            Gestión de Cursos
                        </Link>

                        <Link to="/dashboard-admin/secciones" className="text-nav" onClick={onClose}>
                            <FontAwesomeIcon className="icon-nav" icon={faChalkboard} />
                            Gestión de Secciones
                        </Link>

                        <Link to="/dashboard-admin/matriculas" className="text-nav" onClick={onClose}>
                            <FontAwesomeIcon icon={faPenToSquare} className="icon-nav" />
                            Gestión de Matrículas
                        </Link>

                        <Link to="/dashboard-admin/monitor-asistencias" className="text-nav" onClick={onClose}>
                            <FontAwesomeIcon className="icon-nav" icon={faCalendar} />
                            Apartado de Asistencias
                        </Link>

                        {/* ✅ antes estaba como "calidad-datos" (relativo) */}
                        <Link to="/dashboard-admin/calidad-datos" className="text-nav" onClick={onClose}>
                            <FontAwesomeIcon className="icon-nav" icon={faCalendar} />
                            Gestión Datos
                        </Link>
                    </>
                )}

                <button onClick={handleLogout} className="btn-logout" style={{
                    marginBottom:"20px",
                }}>
                    Cerrar sesión
                </button>
            </nav>
        </>
    );
}
