import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

import { api } from "../../../api/api";

export default function PantallaExamenesAlumno() {
    const [examenes, setExamenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userName = localStorage.getItem("userName");

    useEffect(() => {
        let alive = true;

        const fetchExamenes = async () => {
            try {
                setLoading(true);
                setError(null);

                // Antes: axios + Bearer
                const { data } = await api.get("/alumno/examenes");

                if (!alive) return;
                setExamenes(data || []);
            } catch (err) {
                console.error("Error al cargar exámenes del alumno:", err);

                if (!alive) return;
                setError(
                    err?.response?.data?.message ||
                    "No se pudieron cargar las notas de exámenes."
                );
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        fetchExamenes();

        return () => {
            alive = false;
        };
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

    const formatFecha = (value) => {
        if (!value) return "-";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
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
                                {examenes.map((ex, idx) => (
                                    <tr key={ex.examenId ?? `${ex.seccionId ?? "s"}-${idx}`}>
                                        <td>{ex.cursoTitulo || "-"}</td>
                                        <td>{ex.seccionNombre || "-"}</td>
                                        <td>{ex.tituloExamen || "-"}</td>
                                        <td>{formatFecha(ex.fecha)}</td>
                                        <td>{ex.pesoPorcentual != null ? `${ex.pesoPorcentual}%` : "-"}</td>
                                        <td>
                                            {ex.nota != null
                                                ? `${Number(ex.nota).toFixed(2)} / ${ex.notaMaxima ?? 20}`
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
