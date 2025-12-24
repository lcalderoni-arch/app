import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import icon from "../../../assets/logo.png";
import LogoutButton from "../../../components/login/LogoutButton";

import { useAuthReady } from "../../../api/useAuthReady";

import "../../../styles/RolesStyle/Progreso/ProgresoAlumno.css";

import { api } from "../../../api/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faPenToSquare,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function PantallaProgresoAlumno() {
    const userName = localStorage.getItem("userName");

    const [dataResumen, setDataResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authReady = useAuthReady();

    const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185", "#4ade80"];

    useEffect(() => {
        if (!authReady) return;

        let alive = true;

        const cargarProgreso = async () => {
            try {
                setLoading(true);
                setError(null);

                const resp = await api.get("/alumno/progreso");

                if (!alive) return;
                setDataResumen(resp.data || null);
            } catch (err) {
                console.error("Error al cargar progreso alumno:", err);
                if (!alive) return;

                setError(err?.response?.data?.message || "No se pudo cargar tu progreso académico.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        cargarProgreso();

        return () => {
            alive = false;
        };
    }, [authReady]);


    const cursos = dataResumen?.cursos || [];

    const barDataNotas = {
        labels: cursos.map((c) => c.cursoTitulo || c.seccionNombre || `Sección ${c.seccionId}`),
        datasets: [
            {
                label: "Nota final",
                data: cursos.map((c) => c.notaFinal ?? 0),
                backgroundColor: COLORS.slice(0, cursos.length),
                borderColor: "#ffffff22",
                borderWidth: 1,
            },
        ],
    };

    const barDataAvance = {
        labels: cursos.map((c) => c.cursoTitulo || c.seccionNombre || `Sección ${c.seccionId}`),
        datasets: [
            {
                label: "Avance (%)",
                data: cursos.map((c) => c.avancePorcentaje ?? 0),
                backgroundColor: COLORS.slice(0, cursos.length),
                borderColor: "#ffffff22",
                borderWidth: 1,
            },
        ],
    };

    let aprobados = 0;
    let desaprobados = 0;
    let sinNota = 0;

    cursos.forEach((c) => {
        if (c.notaFinal == null) sinNota++;
        else if (c.notaFinal >= 10.5) aprobados++;
        else desaprobados++;
    });

    const donutEstadoCursos = {
        labels: ["Aprobados", "Desaprobados", "Sin nota"],
        datasets: [
            {
                data: [aprobados, desaprobados, sinNota],
                backgroundColor: COLORS.slice(0, 3),
                borderColor: "#ffffff22",
                borderWidth: 1,
            },
        ],
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
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-estudiante">
                                <FontAwesomeIcon icon={faBook} className="icon-text" />
                                Mis Cursos
                            </Link>
                        </li>
                        <li>
                            <Link to="/pantalla-alumno/horario">
                                <FontAwesomeIcon icon={faCalendar} className="icon-text" />
                                Horario
                            </Link>
                        </li>
                        <li>
                            <Link to="/pantalla-alumno/progreso" className="active">
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
                    <h3>Otros campos</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-alumno/matricula">
                                <FontAwesomeIcon icon={faPenToSquare} className="icon-text" />
                                Matricúlate Aquí
                            </Link>
                        </li>
                        <li>
                            <Link to="/mi-perfil" className="desactive">
                                <FontAwesomeIcon icon={faUser} className="icon-text" />
                                Mi Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* COLUMNA DERECHA */}
            <div className="student-right-area">
                <header className="docente-header">
                    <div className="header-content">
                        <div className="name-header">
                            <p>
                                Bienvenido, <strong>{userName}</strong>
                            </p>
                            <h1>Mi progreso académico</h1>
                        </div>
                        <div className="header-right">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className="perfil-main">
                    <div className="progreso-wrapper">
                        {loading && <p className="loading-text">Cargando progreso...</p>}
                        {error && <p className="error-text">❌ {error}</p>}

                        {dataResumen && (
                            <>
                                <h2 className="progreso-title">Resumen general</h2>

                                <div className="progreso-cards">
                                    <div className="progreso-card">
                                        <h3>Cursos activos</h3>
                                        <p>{dataResumen.totalCursosActivos ?? 0}</p>
                                    </div>
                                    <div className="progreso-card">
                                        <h3>Nota promedio</h3>
                                        <p>{dataResumen.notaPromedio != null ? dataResumen.notaPromedio.toFixed(2) : "-"}</p>
                                    </div>
                                    <div className="progreso-card">
                                        <h3>Avance promedio</h3>
                                        <p>
                                            {dataResumen.avancePromedio != null
                                                ? `${dataResumen.avancePromedio.toFixed(0)}%`
                                                : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="progreso-charts">
                                    <div className="chart-box">
                                        <h4>Notas finales por curso</h4>
                                        {cursos.length > 0 ? <Bar data={barDataNotas} /> : <p>Aún no tienes notas registradas.</p>}
                                    </div>

                                    <div className="chart-box">
                                        <h4>Avance por curso</h4>
                                        {cursos.length > 0 ? <Bar data={barDataAvance} /> : <p>Aún no hay información de avance.</p>}
                                    </div>

                                    <div className="chart-box">
                                        <h4>Estado de mis cursos</h4>
                                        {cursos.length > 0 ? <Doughnut data={donutEstadoCursos} /> : <p>No hay cursos para mostrar.</p>}
                                    </div>
                                </div>

                                <div className="progreso-table">
                                    <h4>Detalle por curso</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Curso</th>
                                                <th>Sección</th>
                                                <th>Nota final</th>
                                                <th>Avance</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cursos.map((c) => {
                                                let estado = "Sin nota";
                                                if (c.notaFinal != null) estado = c.notaFinal >= 10.5 ? "Aprobado" : "Desaprobado";

                                                return (
                                                    <tr key={c.seccionId}>
                                                        <td>{c.cursoTitulo}</td>
                                                        <td>{c.seccionNombre}</td>
                                                        <td>{c.notaFinal != null ? c.notaFinal.toFixed(2) : "-"}</td>
                                                        <td>{c.avancePorcentaje != null ? `${c.avancePorcentaje.toFixed(0)}%` : "-"}</td>
                                                        <td>{estado}</td>
                                                    </tr>
                                                );
                                            })}
                                            {cursos.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: "center" }}>
                                                        No estás matriculado en ningún curso todavía.
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
