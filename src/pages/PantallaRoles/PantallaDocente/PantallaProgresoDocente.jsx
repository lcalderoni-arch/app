import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../../config/api.js";
import icon from "../../../assets/logo.png";


import LogoutButton from '../../../components/login/LogoutButton';
import "../../../styles/RolesStyle/Progreso/ProgresoDocente.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
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

function PantallaProgresoDocente() {
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
                if (!token) {
                    throw new Error("No hay token de autenticación.");
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const resp = await axios.get(`${API_BASE_URL}/docente/progreso`, config);
                setResumen(resp.data);
            } catch (err) {
                console.error("Error cargando progreso del docente:", err);
                setError("No se pudo cargar el progreso.");
            } finally {
                setLoading(false);
            }
        };

        fetchProgreso();
    }, []);

    // Datos para gráficos cuando ya hay resumen
    let donutData = null;
    let barData = null;

    if (resumen) {
        donutData = {
            labels: ["Total Secciones", "Alumnos Activos"],
            datasets: [
                {
                    data: [resumen.totalSecciones, resumen.totalAlumnos],
                    backgroundColor: ["#4ade80", "#60a5fa"],
                    borderWidth: 1,
                },
            ],
        };

        barData = {
            labels: resumen.secciones.map((s) => s.seccionNombre),
            datasets: [
                {
                    label: "Promedio",
                    data: resumen.secciones.map((s) => s.notaPromedioSeccion ?? 0),
                    backgroundColor: "#fb923c",
                },
            ],
        };
    }

    return (
        <div className="docente-layout">
            {/* SIDEBAR DOCENTE */}
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
                <main className="docente-main">
                    {loading && <p className="loading-text">Cargando progreso...</p>}
                    {error && <p className="error-text" style={{ color: "salmon" }}>{error}</p>}

                    {resumen && (
                        <div className="progreso-wrapper">
                            <h2 className="progreso-title">📊 Resumen general</h2>

                            <div className="progreso-cards">
                                <div className="progreso-card">
                                    <h3>Total Secciones</h3>
                                    <p>{resumen.totalSecciones}</p>
                                </div>
                                <div className="progreso-card">
                                    <h3>Total Alumnos</h3>
                                    <p>{resumen.totalAlumnos}</p>
                                </div>
                                <div className="progreso-card">
                                    <h3>Promedio Global</h3>
                                    <p>{resumen.calificacionPromedioGlobal ?? "—"}</p>
                                </div>
                            </div>

                            <div className="progreso-charts">
                                <div className="chart-box">
                                    <h3>Distribución General</h3>
                                    <Doughnut data={donutData} />
                                </div>

                                <div className="chart-box">
                                    <h3>Promedio por Sección</h3>
                                    <Bar data={barData} />
                                </div>
                            </div>

                            <div className="progreso-table">
                                <h3>📚 Detalle por Sección</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Sección</th>
                                            <th>Alumnos Activos</th>
                                            <th>Promedio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumen.secciones.map((s) => (
                                            <tr key={s.seccionId}>
                                                <td>{s.cursoTitulo}</td>
                                                <td>{s.seccionNombre}</td>
                                                <td>{s.alumnosActivos}</td>
                                                <td>{s.notaPromedioSeccion ?? "—"}</td>
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

export default PantallaProgresoDocente;
