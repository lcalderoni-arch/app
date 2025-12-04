// src/pages/AdminCode/PantallaMonitorAsistencias.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api.js";
import icon from "../../assets/logo.png";

export default function PantallaMonitorAsistencias() {
    const [resumen, setResumen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarMonitor = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const url = `${API_BASE_URL}/monitor/asistencias/hoy`;
            const response = await axios.get(url, config);
            setResumen(response.data || []);
        } catch (err) {
            console.error("Error al cargar monitor:", err);
            setError(
                err.response?.data?.message ||
                "No se pudo cargar el monitor de asistencias."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // primera carga
        cargarMonitor();

        // refrescar cada 60 segundos
        const interval = setInterval(() => {
            cargarMonitor();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const getClaseEstado = (estado) => {
        switch (estado) {
            case "ALERTA":
                return "estado-alerta";
            case "EN_CURSO":
                return "estado-en-curso";
            case "OK":
                return "estado-ok";
            case "PROXIMA":
                return "estado-proxima";
            default:
                return "estado-desconocido";
        }
    };

    return (
        <div className="general-box-gestionusuarios">
            {/* Header igual al de Gestión de Usuarios */}
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionusuarios">
                <div className="alinear-al-centro">
                    <h2>Monitor de Asistencias (Hoy)</h2>
                </div>
                <p>Visualiza el estado de las asistencias de las sesiones programadas para hoy.</p>

                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {loading && <p>Cargando monitor...</p>}
            </div>

            <div className="filtros-container">
                {/* Aquí podrías poner filtros por nivel, grado, turno, etc. si luego quieres */}
                <div className="filtros-resultado">
                    <p>
                        Mostrando <strong>{resumen.length}</strong> sesiones de hoy
                    </p>
                </div>

                {!loading && !error && resumen.length === 0 && (
                    <p>No hay sesiones programadas para hoy.</p>
                )}

                {!loading && !error && resumen.length > 0 && (
                    <div className="table-users-gestionusuarios">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Grado</th>
                                    <th>Nivel</th>
                                    <th>Hora Inicio</th>
                                    <th>Total</th>
                                    <th>Con asistencia</th>
                                    <th>Sin registrar</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumen.map((r) => (
                                    <tr key={r.sesionId}>
                                        <td>{r.curso}</td>
                                        <td>{r.gradoSeccion}</td>
                                        <td>{r.nivelSeccion}</td>
                                        <td>{r.horaInicio}</td>
                                        <td>{r.totalAlumnos}</td>
                                        <td>{r.conAsistencia}</td>
                                        <td>{r.sinAsistencia}</td>
                                        <td>
                                            <span className={`badge-estado ${getClaseEstado(r.estadoSemaforo)}`}>
                                                {r.estadoSemaforo}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
