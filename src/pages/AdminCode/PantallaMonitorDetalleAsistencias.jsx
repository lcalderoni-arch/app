// src/pages/AdminCode/PantallaMonitorDetalleAsistencias.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../api/api"; // ✅ axios centralizado
import icon from "../../assets/logo.png";

import { useAuthReady } from "../../api/useAuthReady";

import "../../styles/RolesStyle/AdminStyle/GestionDetalleAsistencia.css";

const opcionesEstado = ["ASISTIO", "FALTA", "TARDANZA", "JUSTIFICADA"];

export default function PantallaMonitorDetalleAsistencias() {
    const { sesionId } = useParams();
    const navigate = useNavigate();

    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    const authReady = useAuthReady();

    // ==============================
    //   CARGAR ASISTENCIAS
    // ==============================
    useEffect(() => {
        if (!authReady) return;

        const cargarAsistencias = async () => {
            try {
                setLoading(true);
                setError(null);

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
    }, [authReady, sesionId]);

    // ==============================
    //   MANEJO DE CAMBIOS
    // ==============================
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

    // ==============================
    //   GUARDAR ASISTENCIAS
    // ==============================
    const handleGuardar = async () => {
        try {
            const sinEstado = asistencias.filter((a) => !a.estado);
            if (sinEstado.length > 0) {
                alert("Debes seleccionar un estado para TODOS los alumnos.");
                return;
            }

            setGuardando(true);
            setError(null);

            const payload = {
                sesionId: Number(sesionId),
                registros: asistencias.map((a) => ({
                    alumnoId: a.alumnoId,
                    estado: a.estado,
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

    // ==============================
    //   RENDER
    // ==============================
    if (loading) {
        return <p>Cargando asistencias...</p>;
    }

    if (error) {
        return (
            <div className="general-box-gestionusuarios">
                <p style={{ color: "red" }}>❌ {error}</p>
                <button onClick={() => navigate(-1)}>Volver</button>
            </div>
        );
    }

    return (
        <div className="general-box-gestionusuarios">
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionusuarios">
                <h2>Detalle de Asistencia (Admin)</h2>
                <p>Visualiza y edita la asistencia de los estudiantes.</p>
            </div>

            <button
                className="link-sidebar"
                onClick={() => navigate("/dashboard-admin/monitor-asistencias")}
            >
                Volver
            </button>

            {asistencias.length === 0 ? (
                <p>No hay alumnos registrados.</p>
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
                                                handleCambioObservaciones(index, e.target.value)
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        className="btn-guardar-asistencias"
                        onClick={handleGuardar}
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : "Guardar asistencias"}
                    </button>
                </>
            )}
        </div>
    );
}
