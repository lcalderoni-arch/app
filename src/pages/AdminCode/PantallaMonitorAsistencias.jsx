// src/pages/AdminCode/PantallaMonitorAsistencias.jsx
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../api/api"; // 
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionAsistencia.css";

import { useAuthReady } from "../../api/useAuthReady";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faAngleDown } from "@fortawesome/free-solid-svg-icons";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function PantallaMonitorAsistencias() {
    const [resumen, setResumen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtro por curso (valor)
    const [cursoFiltro, setCursoFiltro] = useState("");

    // Estado y ref para dropdown de curso
    const [isCursoOpen, setIsCursoOpen] = useState(false);
    const cursoSelectRef = useRef(null);

    // Dashboard por sesión
    const [sesionDashboardId, setSesionDashboardId] = useState("");
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorStats, setErrorStats] = useState(null);

    // Estado y ref para dropdown de sesión
    const [isSesionOpen, setIsSesionOpen] = useState(false);
    const sesionSelectRef = useRef(null);

    const authReady = useAuthReady();

    const navigate = useNavigate();

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

    // ==============================
    //   CARGAR MONITOR (HOY)
    // ==============================
    const cargarMonitor = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/monitor/asistencias/hoy");

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
    }, []);

    useEffect(() => {
        if (!authReady) return;

        cargarMonitor();

        const interval = setInterval(() => {
            cargarMonitor();
        }, 60000);

        return () => clearInterval(interval);
    }, [authReady, cargarMonitor]);

    // ==============================
    //   CERRAR DROPDOWNS FUERA
    // ==============================
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cursoSelectRef.current && !cursoSelectRef.current.contains(event.target)) {
                setIsCursoOpen(false);
            }
            if (sesionSelectRef.current && !sesionSelectRef.current.contains(event.target)) {
                setIsSesionOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ==============================
    //   CURSOS DISPONIBLES (FILTRO)
    // ==============================
    const cursosDisponibles = useMemo(() => {
        const setCursos = new Set();
        resumen.forEach((r) => {
            if (r.curso) setCursos.add(r.curso);
        });
        return Array.from(setCursos);
    }, [resumen]);

    // ==============================
    //   SESIONES FILTRADAS
    // ==============================
    const sesionesFiltradas = useMemo(() => {
        if (!cursoFiltro) return resumen;
        return resumen.filter((r) => r.curso === cursoFiltro);
    }, [resumen, cursoFiltro]);

    // Opciones de sesiones para el dashboard: sección + hora
    const sesionesDashboardOptions = useMemo(() => {
        return sesionesFiltradas.map((r) => ({
            sesionId: r.sesionId,
            label: `${r.nombreSeccion}${r.horaInicio ? ` - ${r.horaInicio}` : ""}`.trim(),
        }));
    }, [sesionesFiltradas]);

    // Texto a mostrar en el trigger del select de sesión
    const sesionSeleccionadaLabel = useMemo(() => {
        if (!sesionDashboardId) return "Selecciona una sesión";
        const found = sesionesDashboardOptions.find(
            (opt) => String(opt.sesionId) === String(sesionDashboardId)
        );
        return found ? found.label : "Selecciona una sesión";
    }, [sesionDashboardId, sesionesDashboardOptions]);

    // ==============================
    //   CARGAR STATS DE SESIÓN
    // ==============================
    useEffect(() => {
        const cargarStatsSesion = async () => {
            if (!sesionDashboardId) {
                setStats(null);
                setErrorStats(null);
                return;
            }

            try {
                setLoadingStats(true);
                setErrorStats(null);

                const response = await api.get(`/asistencias/sesion/${sesionDashboardId}`);
                const asistencias = response.data || [];

                const total = asistencias.length;
                const asistio = asistencias.filter((a) => a.estado === "ASISTIO").length;
                const falta = asistencias.filter((a) => a.estado === "FALTA").length;
                const tardanza = asistencias.filter((a) => a.estado === "TARDANZA").length;
                const justificada = asistencias.filter((a) => a.estado === "JUSTIFICADA").length;
                const sinEstado = asistencias.filter((a) => !a.estado).length;

                setStats({
                    total,
                    asistio,
                    falta,
                    tardanza,
                    justificada,
                    sinEstado,
                });
            } catch (err) {
                console.error("Error al cargar resumen de sesión:", err);
                setErrorStats(
                    err.response?.data?.message ||
                    "No se pudo cargar el resumen de la sesión seleccionada."
                );
                setStats(null);
            } finally {
                setLoadingStats(false);
            }
        };

        cargarStatsSesion();
    }, [sesionDashboardId]);

    // ==============================
    //   PIE DATA
    // ==============================
    const pieData = useMemo(() => {
        if (!stats) return [];

        const total = stats.total || 1;

        const items = [
            { key: "asistio", label: "Asistió", value: stats.asistio, color: "#22c55e" },
            { key: "falta", label: "Falta", value: stats.falta, color: "#f97373" },
            { key: "tardanza", label: "Tardanza", value: stats.tardanza, color: "#facc15" },
            { key: "justificada", label: "Justificada", value: stats.justificada, color: "#6366f1" },
            { key: "sinEstado", label: "Sin registro", value: stats.sinEstado, color: "#9ca3af" },
        ];

        return items
            .filter((item) => item.value > 0)
            .map((item) => ({
                ...item,
                percent: Math.round((item.value / total) * 100),
            }));
    }, [stats]);

    return (
        <div className="general-box-gestionusuarios">
            {/* Header */}
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionusuarios">
                <div className="alinear-al-centro">
                    <h2>Monitor de Asistencias (Hoy)</h2>
                </div>
                <p>Visualiza el estado de las asistencias de las sesiones programadas para el día de hoy.</p>

                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {loading && <p>Cargando monitor...</p>}
            </div>

            <div className="box-formulario-gestionusuarios">
                <div className="centrar-tercer-titulo">
                    <h3>
                        <FontAwesomeIcon className="icon" icon={faSquarePlus} />
                        Lista Actual de Asistencias
                    </h3>
                    <p>Vea los cursos y las asistencias de los estudiantes</p>
                </div>

                {/* Filtro por curso */}
                <div className="auth-form-gestionasistencia">
                    <div className="auth-form-gestionusuarios-area-rol">
                        <label className="rol-text">
                            Curso:
                            <div className="monitor-select-container" ref={cursoSelectRef}>
                                <div
                                    className={`monitor-select-trigger ${cursoFiltro !== "" ? "selected" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCursoOpen(!isCursoOpen);
                                    }}
                                >
                                    <span>{cursoFiltro === "" ? "Todos los cursos" : cursoFiltro}</span>
                                    <FontAwesomeIcon className="icon-increment" icon={faAngleDown} />
                                </div>

                                {isCursoOpen && (
                                    <div className="custom-select-dropdown">
                                        <div
                                            className={`monitor-select-option ${cursoFiltro === "" ? "active" : ""}`}
                                            onClick={() => {
                                                setCursoFiltro("");
                                                setSesionDashboardId("");
                                                setStats(null);
                                                setIsCursoOpen(false);
                                            }}
                                        >
                                            Todos los cursos
                                        </div>

                                        {cursosDisponibles.map((curso) => (
                                            <div
                                                key={curso}
                                                className={`monitor-select-option ${cursoFiltro === curso ? "active" : ""}`}
                                                onClick={() => {
                                                    setCursoFiltro(curso);
                                                    setSesionDashboardId("");
                                                    setStats(null);
                                                    setIsCursoOpen(false);
                                                }}
                                            >
                                                {curso}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    <div className="filtros-resultado">
                        <p>
                            Mostrando <strong>{sesionesFiltradas.length}</strong> de{" "}
                            <strong>{resumen.length}</strong> sesiones de hoy
                        </p>
                    </div>

                    {!loading && !error && resumen.length === 0 && (
                        <p style={{
                            padding: "10px 35px",
                        }}>No hay sesiones programadas para hoy.</p>
                    )}

                    {!loading && !error && sesionesFiltradas.length > 0 && (
                        <div className="table-users-gestionusuarios">
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th>Sección</th>
                                        <th>Curso</th>
                                        <th>Grado</th>
                                        <th>Nivel</th>
                                        <th>Hora Inicio</th>
                                        <th>Total</th>
                                        <th>Con asistencia</th>
                                        <th>Sin registrar</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sesionesFiltradas.map((r) => (
                                        <tr key={r.sesionId}>
                                            <td>{r.nombreSeccion}</td>
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
                                            <td>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() =>
                                                        navigate(
                                                            `/dashboard-admin/monitor-asistencias/${r.seccionId}/${r.sesionId}`
                                                        )
                                                    }
                                                >
                                                    Ver detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* DASHBOARD POR SESIÓN */}
            <div className="box-formulario-gestionasistencia">
                <div className="centrar-tercer-titulo">
                    <h3>Resumen por sesión</h3>
                    <p>Datos de asistencia, tardanza, falta o sin registrar</p>
                </div>

                <div className="auth-form-gestionasistencia">
                    <div className="auth-form-gestionusuarios-area-rol">
                        <label className="rol-text">
                            Sesión (sección + hora):
                            <div className="monitor-select-container" ref={sesionSelectRef}>
                                <div
                                    className={`monitor-select-trigger ${sesionDashboardId !== "" ? "selected" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSesionOpen(!isSesionOpen);
                                    }}
                                >
                                    <span>{sesionSeleccionadaLabel}</span>
                                    <FontAwesomeIcon className="icon-increment" icon={faAngleDown} />
                                </div>

                                {isSesionOpen && (
                                    <div className="custom-select-dropdown">
                                        <div
                                            className={`custom-select-option ${sesionDashboardId === "" ? "active" : ""}`}
                                            onClick={() => {
                                                setSesionDashboardId("");
                                                setStats(null);
                                                setIsSesionOpen(false);
                                            }}
                                        >
                                            Selecciona una sesión
                                        </div>

                                        {sesionesDashboardOptions.map((opt) => (
                                            <div
                                                key={opt.sesionId}
                                                className={`custom-select-option ${String(sesionDashboardId) === String(opt.sesionId) ? "active" : ""}`}
                                                onClick={() => {
                                                    setSesionDashboardId(opt.sesionId);
                                                    setIsSesionOpen(false);
                                                }}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    {loadingStats && <p>Cargando resumen de la sesión...</p>}
                    {errorStats && <p style={{ color: "red" }}>Error: {errorStats}</p>}

                    {stats && !loadingStats && !errorStats && (
                        <div className="sesion-dashboard-wrapper">
                            <div className="sesion-dashboard">
                                {/* IZQUIERDA */}
                                <div className="sesion-dashboard-chart-wrapper">
                                    <div className="donut-center-label">
                                        <span className="donut-total">{stats.total}</span>
                                        <span className="donut-subtitle">Alumnos</span>
                                    </div>

                                    <PieChart width={260} height={260}>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="label"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            cx="50%"
                                            cy="50%"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            formatter={(value, name, props) => [
                                                `${value} alumnos`,
                                                props?.payload?.label || name,
                                            ]}
                                        />
                                    </PieChart>
                                </div>

                                {/* DERECHA */}
                                <div className="sesion-dashboard-details">
                                    <h4>Detalle de asistencias</h4>
                                    <p className="details-subtitle">
                                        Distribución de estados para la sesión seleccionada.
                                    </p>

                                    <ul className="sesion-dashboard-list">
                                        {pieData.map((item) => (
                                            <li key={item.key} className="sesion-dashboard-list-item">
                                                <span
                                                    className="sesion-dashboard-dot"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <div className="sesion-dashboard-text">
                                                    <span className="sesion-dashboard-label">{item.label}</span>
                                                    <span className="sesion-dashboard-values">
                                                        {item.value} alumnos · {item.percent}%
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
