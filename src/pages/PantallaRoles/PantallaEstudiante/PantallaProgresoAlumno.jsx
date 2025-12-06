import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../../config/api.js";
import icon from "../../../assets/logo.png";

import LogoutButton from '../../../components/login/LogoutButton';

import "../../../styles/RolesStyle/Progreso/ProgresoAlumno.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faPenToSquare,
    faUser,
} from "@fortawesome/free-solid-svg-icons";

import { Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function PantallaProgresoAlumno() {
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userName = localStorage.getItem('userName');

    useEffect(() => {
        const fetchProgreso = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No hay token de autenticación.");

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const resp = await axios.get(`${API_BASE_URL}/alumno/progreso`, config);
                setResumen(resp.data);
            } catch (err) {
                console.error("Error cargando progreso del alumno:", err);
                setError("No se pudo cargar el progreso.");
            } finally {
                setLoading(false);
            }
        };

        fetchProgreso();
    }, []);

    let donutData = null;
    let barData = null;

    if (resumen) {
        donutData = {
            labels: ["Cursos Activos", "Avance Promedio"],
            datasets: [
                {
                    data: [
                        resumen.totalCursosActivos,
                        Math.round(resumen.avancePromedio ?? 0),
                    ],
                    backgroundColor: ["#34d399", "#60a5fa"],
                    borderWidth: 1,
                },
            ],
        };

        barData = {
            labels: resumen.cursos.map((c) => c.cursoTitulo),
            datasets: [
                {
                    label: "Nota Final",
                    data: resumen.cursos.map((c) => c.notaFinal ?? 0),
                    backgroundColor: "#fb7185",
                },
            ],
        };
    }

    return (
        <div className="student-layout">
            {/* SIDEBAR ESTUDIANTE */}
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
                            <Link to="/mi-perfil">
                                <FontAwesomeIcon icon={faUser} className="icon-text" />
                                Mi Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* CONTENIDO DERECHA */}
            <div className="student-right-area">
                <header className="docente-header">
                    <div className='header-content'>
                        <div className='name-header'>
                            <p>Bienvenido, <strong>{userName}</strong></p>
                            <h1>Campus Virtual</h1>
                        </div>
                        <div className='header-right'>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="student-main">
                    {loading && <p className="loading-text">Cargando progreso...</p>}
                    {error && <p className="error-text" style={{ color: "salmon" }}>{error}</p>}

                    {resumen && (
                        <div className="progreso-wrapper">
                            <h2 className="progreso-title">🎓 Resumen general</h2>

                            <div className="progreso-cards">
                                <div className="progreso-card">
                                    <h3>Cursos Activos</h3>
                                    <p>{resumen.totalCursosActivos}</p>
                                </div>
                                <div className="progreso-card">
                                    <h3>Nota Promedio</h3>
                                    <p>{resumen.notaPromedio ?? "—"}</p>
                                </div>
                                <div className="progreso-card">
                                    <h3>Avance Promedio</h3>
                                    <p>{Math.round(resumen.avancePromedio ?? 0)}%</p>
                                </div>
                            </div>

                            <div className="progreso-charts">
                                <div className="chart-box">
                                    <h3>Resumen General</h3>
                                    <Doughnut data={donutData} />
                                </div>

                                <div className="chart-box">
                                    <h3>Notas por Curso</h3>
                                    <Bar data={barData} />
                                </div>
                            </div>

                            <div className="progreso-table">
                                <h3>📘 Cursos Matriculados</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Sección</th>
                                            <th>Nota Final</th>
                                            <th>Avance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumen.cursos.map((c) => (
                                            <tr key={c.seccionId}>
                                                <td>{c.cursoTitulo}</td>
                                                <td>{c.seccionNombre}</td>
                                                <td>{c.notaFinal ?? "—"}</td>
                                                <td>{Math.round(c.avancePorcentaje ?? 0)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default PantallaProgresoAlumno;
