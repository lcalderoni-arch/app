import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../../api/api";

import icon from "../../../assets/logo.png";
import LogoutButton from "../../../components/login/LogoutButton";

import "../../../styles/RolesStyle/Progreso/ProgresoDocente.css";

import { useAuthReady } from "../../../api/useAuthReady";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faUser,
} from "@fortawesome/free-solid-svg-icons";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function PantallaProgresoDocente() {
    const userName = localStorage.getItem("userName");

    const [dataResumen, setDataResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authReady = useAuthReady();

    const COLORS = [
        "#f87171",
        "#60a5fa",
        "#34d399",
        "#fbbf24",
        "#a78bfa",
        "#fb7185",
        "#4ade80",
    ]

    useEffect(() => {
        const cargarProgreso = async () => {
            try {
                setLoading(true);
                setError(null);

                const resp = await api.get("/docente/progreso");
                setDataResumen(resp.data || null);
            } catch (err) {
                console.error("Error al cargar progreso docente:", err);

                // Si el backend responde 401, lo mostramos claro
                if (err.response?.status === 401) {
                    setError("No estás autenticado.");
                } else {
                    setError(
                        err.response?.data?.message ||
                        "No se pudo cargar el progreso del docente."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        if (!authReady) return;
    cargarProgreso();
}, [authReady]);


    const secciones = dataResumen?.secciones || [];

    // === Gráfico: alumnos por sección ===
    const barDataAlumnos = {
        labels: secciones.map(
            (s) => s.cursoTitulo || s.seccionNombre || `Sección ${s.seccionId}`
        ),
        datasets: [
            {
                label: "Alumnos activos",
                data: secciones.map((s) => s.alumnosActivos || 0),
                backgroundColor: COLORS.slice(0, secciones.length),
                borderColor: "#ffffff22",
                borderWidth: 1,
            },
        ],
    };

    // === Gráfico: promedio por sección ===
    const barDataPromedios = {
        labels: secciones.map(
            (s) => s.cursoTitulo || s.seccionNombre || `Sección ${s.seccionId}`
        ),
        datasets: [
            {
                label: "Promedio de la sección",
                data: secciones.map((s) => s.notaPromedioSeccion ?? 0),
                backgroundColor: COLORS.slice(0, secciones.length),
                borderColor: "#ffffff22",
                borderWidth: 1,
            },
        ],
    };

    // === Donut: distribución de alumnos por sección ===
    const doughnutData = {
        labels: secciones.map(
            (s) => s.cursoTitulo || s.seccionNombre || `Sección ${s.seccionId}`
        ),
        datasets: [
            {
                data: secciones.map((s) => s.alumnosActivos || 0),
                backgroundColor: COLORS.slice(0, secciones.length),
                borderColor: "#ffffff22",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="docente-layout">
            {/* SIDEBAR IZQUIERDO */}
            <aside className="docente-sidebar">
                <div className="sidebar-header">
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className="sidebar-role">Docente</span>
                </div>

                <nav className="sidebar-menu">
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-docente">
                                <FontAwesomeIcon icon={faBook} className="icon-text" />
                                Mis Cursos
                            </Link>
                        </li>
                        <li>
                            <Link to="/docente/horario">
                                <FontAwesomeIcon icon={faCalendar} className="icon-text" />
                                Horario
                            </Link>
                        </li>
                        <li>
                            <Link to="/docente/progreso" className="active">
                                <FontAwesomeIcon icon={faChartLine} className="icon-text" />
                                Progreso
                            </Link>
                        </li>
                        <li>
                            <a href="#notificaciones">
                                <FontAwesomeIcon icon={faBell} className="icon-text" />
                                Notificaciones
                            </a>
                        </li>
                    </ul>
                </nav>

                <nav className="sidebar-menu">
                    <h3>Cuenta</h3>
                    <ul>
                        <li>
                            <Link to="/mi-perfil">
                                <FontAwesomeIcon icon={faUser} className="icon-text" />
                                Mi Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* COLUMNA DERECHA */}
            <div className="docente-right-area">
                <header className="docente-header">
                    <div className="header-content">
                        <div className="name-header">
                            <p>
                                Bienvenido, <strong>{userName}</strong>
                            </p>
                            <h1>Progreso de mis secciones</h1>
                        </div>
                        <div className="header-right">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className="docente-main">
                    <div className="progreso-wrapper">
                        {loading && <p className="loading-text">Cargando resumen...</p>}
                        {error && <p className="error-text">❌ {error}</p>}

                        {dataResumen && (
                            <>
                                {/* Título */}
                                <h2 className="progreso-title">Resumen general</h2>

                                {/* CARDS RESUMEN */}
                                <div className="progreso-cards">
                                    <div className="progreso-card">
                                        <h3>Total de secciones</h3>
                                        <p>{dataResumen.totalSecciones ?? 0}</p>
                                    </div>
                                    <div className="progreso-card">
                                        <h3>Total de alumnos</h3>
                                        <p>{dataResumen.totalAlumnos ?? 0}</p>
                                    </div>
                                    <div className="progreso-card">
                                        <h3>Promedio global</h3>
                                        <p>
                                            {dataResumen.calificacionPromedioGlobal != null
                                                ? dataResumen.calificacionPromedioGlobal.toFixed(2)
                                                : "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* GRAFICOS */}
                                <div className="progreso-charts">
                                    <div className="chart-box">
                                        <h4>Alumnos activos por sección</h4>
                                        {secciones.length > 0 ? (
                                            <Bar data={barDataAlumnos} />
                                        ) : (
                                            <p>No hay secciones con alumnos activos.</p>
                                        )}
                                    </div>

                                    <div className="chart-box">
                                        <h4>Promedio de notas por sección</h4>
                                        {secciones.length > 0 ? (
                                            <Bar data={barDataPromedios} />
                                        ) : (
                                            <p>Aún no hay promedios registrados.</p>
                                        )}
                                    </div>

                                    <div className="chart-box">
                                        <h4>Distribución de alumnos por sección</h4>
                                        {secciones.length > 0 ? (
                                            <Doughnut data={doughnutData} />
                                        ) : (
                                            <p>No hay datos suficientes.</p>
                                        )}
                                    </div>
                                </div>

                                {/* TABLA DETALLE */}
                                <div className="progreso-table">
                                    <h4>Detalle de secciones</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Curso</th>
                                                <th>Sección</th>
                                                <th>Alumnos activos</th>
                                                <th>Promedio</th>
                                                <th>Exámenes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {secciones.map((s) => (
                                                <tr key={s.seccionId}>
                                                    <td>{s.cursoTitulo}</td>
                                                    <td>{s.seccionNombre}</td>
                                                    <td>{s.alumnosActivos ?? 0}</td>
                                                    <td>
                                                        {s.notaPromedioSeccion != null
                                                            ? s.notaPromedioSeccion.toFixed(2)
                                                            : "-"}
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/docente/seccion/${s.seccionId}/examenes`}
                                                            style={{ fontSize: "12px", color: "#60a5fa" }}
                                                        >
                                                            Ver exámenes →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                            {secciones.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: "center" }}>
                                                        No tienes secciones registradas aún.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
