import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../../config/api";
import icon from "../../../assets/logo.png";

import "../../../styles/RolesStyle/StudentStyle/ExamenesAlumno.css";

import LogoutButton from "../../../components/login/LogoutButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faPenToSquare,
    faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function PantallaExamenesAlumno() {
    const [examenes, setExamenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userName = localStorage.getItem("userName");

    useEffect(() => {
        const fetchExamenes = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No estás autenticado.");

                const config = { headers: { Authorization: `Bearer ${token}` } };

                const resp = await axios.get(
                    `${API_BASE_URL}/alumno/examenes`,
                    config
                );

                setExamenes(resp.data || []);
            } catch (err) {
                console.error("Error al cargar exámenes del alumno:", err);
                setError(
                    err.response?.data?.message ||
                    "No se pudieron cargar las notas de exámenes."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchExamenes();
    }, []);

    const renderEstadoBadge = (estado) => {
        if (estado === "APROBADO") {
            return <span className="badge-estado badge-aprobado">Aprobado</span>;
        }
        if (estado === "DESAPROBADO") {
            return <span className="badge-estado badge-desaprobado">Desaprobado</span>;
        }
        return <span className="badge-estado badge-pendiente">Pendiente</span>;
    };

    return (
        <div className="student-layout">
            {/* SIDEBAR IZQUIERDO */}
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
                            <Link to="/pantalla-alumno/progreso">
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

            {/* COLUMNA DERECHA */}
            <div className="student-right-area">
                <header className="docente-header">
                    <div className="header-content">
                        <div className="name-header">
                            <p>
                                Bienvenido, <strong>{userName}</strong>
                            </p>
                            <h1>Mis notas de exámenes</h1>
                        </div>
                        <div className="header-right">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className="perfil-main">
                    {loading && <p>Cargando exámenes...</p>}
                    {error && <p className="error-message">❌ {error}</p>}

                    {!loading && !error && examenes.length === 0 && (
                        <p>No tienes notas de exámenes registradas todavía.</p>
                    )}

                    {!loading && !error && examenes.length > 0 && (
                        <table className="tabla-examenes-alumno">
                            <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Sección</th>
                                    <th>Examen</th>
                                    <th>Fecha</th>
                                    <th>Peso</th>
                                    <th>Nota</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examenes.map((ex) => (
                                    <tr key={ex.examenId}>
                                        <td>{ex.cursoTitulo}</td>
                                        <td>{ex.seccionNombre}</td>
                                        <td>{ex.tituloExamen}</td>
                                        <td>{ex.fecha || "-"}</td>
                                        <td>{ex.pesoPorcentual}%</td>
                                        <td>
                                            {ex.nota != null
                                                ? `${ex.nota.toFixed(2)} / ${
                                                    ex.notaMaxima ?? 20
                                                }`
                                                : "-"}
                                        </td>
                                        <td>{renderEstadoBadge(ex.estado)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>
        </div>
    );
}
