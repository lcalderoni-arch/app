// src/pages/PantallaRoles/PantallaEstudiante/PantallaAsistenciasAlumno.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { API_BASE_URL } from "../../../config/api";
import LogoutButton from "../../../components/login/LogoutButton";
import icon from "../../../assets/logo.png";

import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";

export default function PantallaAsistenciasAlumno() {
    const { seccionId } = useParams();
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");

    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarAsistencias = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No estás autenticado.");

                const response = await axios.get(
                    `${API_BASE_URL}/asistencias/mis-asistencias`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { seccionId }, // 👈 AQUÍ VA EL seccionId
                    }
                );

                setAsistencias(response.data || []);
            } catch (err) {
                console.error("Error al cargar mis asistencias:", err);
                setError(
                    err.response?.data?.message ||
                    "No se pudieron cargar tus asistencias."
                );
            } finally {
                setLoading(false);
            }
        };

        cargarAsistencias();
    }, [seccionId]);

    const traducirEstado = (estado) => {
        switch (estado) {
            case "ASISTIO":
                return "Asistió";
            case "FALTA":
                return "Faltó";
            case "TARDANZA":
                return "Tardanza";
            case "JUSTIFICADA":
                return "Justificada";
            default:
                return "Sin registro";
        }
    };

    return (
        <div className="student-layout">
            {/* SIDEBAR */}
            <aside className="student-sidebar">
                <div className="sidebar-header">
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className="sidebar-role">Estudiante</span>
                </div>
                <nav className="sidebar-menu">
                    <ul>
                        <li>
                            <button
                                className="link-sidebar"
                                onClick={() =>
                                    navigate(`/pantalla-estudiante/seccion/${seccionId}`)
                                }
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "15px 20px",
                                    fontSize: "1rem",
                                    color: "#333",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                ← Volver al curso
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* AREA PRINCIPAL */}
            <div className="student-right-area">
                <header className="student-header">
                    <div className="header-content">
                        <div>
                            <h1>Mis asistencias</h1>
                            <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                                Sección ID: {seccionId}
                            </p>
                        </div>
                        <div className="header-right">
                            <p>
                                Hola, <strong>{userName}</strong>
                            </p>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className="student-main">
                    <section className="content-section">
                        <h2>Resumen de asistencias</h2>

                        {loading ? (
                            <p>Cargando asistencias...</p>
                        ) : error ? (
                            <p style={{ color: "red" }}>{error}</p>
                        ) : asistencias.length === 0 ? (
                            <p>Aún no hay registros de asistencia para esta sección.</p>
                        ) : (
                            <table className="styled-table-seccion">
                                <thead>
                                    <tr>
                                        <th>Semana</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistencias.map((a, index) => (
                                        <tr key={index}>
                                            <td>
                                                {a.semanaNumero != null
                                                    ? `Semana ${a.semanaNumero}`
                                                    : "-"}
                                            </td>
                                            <td>{traducirEstado(a.estado)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
