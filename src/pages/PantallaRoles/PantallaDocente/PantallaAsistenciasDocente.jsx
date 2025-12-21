// src/pages/PantallaRoles/PantallaDocente/PantallaAsistenciasDocente.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../../api/api";

import LogoutButton from "../../../components/login/LogoutButton";
import "../../../styles/RolesStyle/DocenteStyle/SeccionDocente.css";

const opcionesEstado = ["ASISTIO", "FALTA", "TARDANZA", "JUSTIFICADA"];

export default function PantallaAsistenciasDocente() {
    const { seccionId, sesionId } = useParams();
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");

    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    // Cargar asistencias ya registradas (o lista de alumnos)
    useEffect(() => {
        const cargarAsistencias = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No estás autenticado.");

                const response = await api.get(`/asistencias/sesion/${sesionId}`);
                setAsistencias(response.data || []);
            } catch (err) {
                console.error("Error al cargar asistencias:", err);
                setError(
                    err.response?.data?.message ||
                    "No se pudieron cargar las asistencias de la sesión."
                );
            } finally {
                setLoading(false);
            }
        };

        cargarAsistencias();
    }, [sesionId]);

    const handleCambioEstado = (index, nuevoEstado) => {
        setAsistencias((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, estado: nuevoEstado || null } : item
            )
        );
    };

    const handleCambioObservaciones = (index, nuevoTexto) => {
        setAsistencias((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, observaciones: nuevoTexto } : item
            )
        );
    };

    const handleGuardar = async () => {
        try {
            // 1) Validar antes de enviar
            const sinEstado = asistencias.filter((a) => !a.estado);

            if (sinEstado.length > 0) {
                alert("Debes seleccionar un estado de asistencia para TODOS los alumnos antes de guardar.");
                return;
            }

            setGuardando(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const payload = {
                sesionId: Number(sesionId),
                registros: asistencias.map((a) => ({
                    alumnoId: a.alumnoId,
                    estado: a.estado,           // aquí ya sabemos que NO es null
                    observaciones: a.observaciones || null,
                })),
            };

            await api.post("/asistencias/registrar-sesion", payload);

            alert("✅ Asistencias guardadas correctamente.");
        } catch (err) {
            console.error("Error al guardar asistencias:", err);
            setError(
                err.response?.data?.message ||
                "No se pudieron guardar las asistencias."
            );
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="docente-layout">
                <div className="docente-right-area">
                    <header className="docente-header">
                        <h1>Cargando asistencias...</h1>
                    </header>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="docente-layout">
                <div className="docente-right-area">
                    <header className="docente-header">
                        <h1>Tomar Asistencia</h1>
                    </header>
                    <main className="docente-main">
                        <p className="error-message">❌ {error}</p>
                        <button className="btn-volver" onClick={() => navigate(-1)}>
                            Volver
                        </button>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="docente-layout">
            <aside className="docente-sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-role">Docente</span>
                </div>
                <nav className="sidebar-menu">
                    <ul>
                        <li>
                            <button
                                className="link-sidebar"
                                onClick={() => navigate(`/docente/seccion/${seccionId}`)}
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

            <div className="docente-right-area">
                <header className="docente-header">
                    <div className="header-content">
                        <h1>Tomar asistencia</h1>
                        <div className="header-right">
                            <p>
                                Profesor: <strong>{userName}</strong>
                            </p>
                            <LogoutButton />
                        </div>
                    </div>
                    <p className="subtitulo-seccion">
                        Sección ID: {seccionId} | Sesión / Semana: {sesionId}
                    </p>
                </header>

                <main className="docente-main">
                    <section className="contenido-semana-section">
                        <h3>Listado de alumnos</h3>

                        {asistencias.length === 0 ? (
                            <p>No hay alumnos matriculados en esta sección.</p>
                        ) : (
                            <>
                                <table className="styled-table-seccion">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Alumno</th>
                                            <th>Estado</th>
                                            <th>Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asistencias.map((a, index) => (
                                            <tr key={a.alumnoId}>
                                                <td>{a.codigoEstudiante || "-"}</td>
                                                <td>{a.nombreAlumno}</td>
                                                <td>
                                                    <select
                                                        value={a.estado || ""}
                                                        onChange={(e) =>
                                                            handleCambioEstado(index, e.target.value)
                                                        }
                                                    >
                                                        <option value="">-- Seleccionar --</option>
                                                        {opcionesEstado.map((op) => (
                                                            <option key={op} value={op}>
                                                                {op}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={a.observaciones || ""}
                                                        onChange={(e) =>
                                                            handleCambioObservaciones(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Observación (opcional)"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <button
                                    className="btn-course"
                                    onClick={handleGuardar}
                                    disabled={guardando}
                                >
                                    {guardando ? "Guardando..." : "Guardar asistencias"}
                                </button>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
