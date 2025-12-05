// src/pages/AdminCode/PantallaMonitorDetalleAsistencias.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { API_BASE_URL } from "../../config/api";
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionDetalleAsistencia.css";

const opcionesEstado = ["ASISTIO", "FALTA", "TARDANZA", "JUSTIFICADA"];

export default function PantallaMonitorDetalleAsistencias() {
    const { sesionId } = useParams();
    const navigate = useNavigate();

    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarAsistencias = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No estás autenticado.");

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const url = `${API_BASE_URL}/asistencias/sesion/${sesionId}`;
                const response = await axios.get(url, config);

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
            const sinEstado = asistencias.filter((a) => !a.estado);

            if (sinEstado.length > 0) {
                alert("Debes seleccionar un estado de asistencia para TODOS los alumnos antes de guardar.");
                return;
            }

            setGuardando(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const payload = {
                sesionId: Number(sesionId),
                registros: asistencias.map((a) => ({
                    alumnoId: a.alumnoId,
                    estado: a.estado,
                    observaciones: a.observaciones || null,
                })),
            };

            const url = `${API_BASE_URL}/asistencias/registrar-sesion`;
            await axios.post(url, payload, config);

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
                        <h1>Detalle de Asistencia (Admin)</h1>
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
        <div className="general-box-gestionusuarios">
            {/* Header igual al de Gestión de Usuarios */}
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionusuarios">
                <div className="alinear-al-centro">
                    <h2>Lista de Estudiantes (Hoy)</h2>
                </div>
                <p>Visualiza y Edita el panel de las asistencias de los estudiantes.</p>

                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {loading && <p>Cargando monitor...</p>}
            </div>

            <main className="docente-main-area">
                <section className="contenido-semana-section">
                    <button
                        className="link-sidebar"
                        onClick={() => navigate("/dashboard-admin/monitor-asistencias")}
                    >
                        Volver a Gestion Asistencia
                    </button>

                    <div className="detalle-asistencia-card">
                        <div className="detalle-asistencia-header">
                            <h3>Listado de alumnos</h3>
                            <p>Modifica el estado de asistencia y agrega observaciones antes de guardar.</p>
                        </div>

                        {asistencias.length === 0 ? (
                            <p>No hay alumnos matriculados en esta sección.</p>
                        ) : (
                            <>
                                <div className="detalle-tabla-wrapper">
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
                                                            className="estado-select"
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
                                                            className="observacion-input"
                                                            type="text"
                                                            value={a.observaciones || ""}
                                                            onChange={(e) =>
                                                                handleCambioObservaciones(index, e.target.value)
                                                            }
                                                            placeholder="Observación (opcional)"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="detalle-acciones">
                                    <button
                                        className="btn-guardar-asistencias"
                                        onClick={handleGuardar}
                                        disabled={guardando}
                                    >
                                        {guardando ? "Guardando..." : "Guardar asistencias"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

        </div>
    );
}
