// src/pages/Roles/Docente/Horario/PantallaHorarioDocente.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { API_BASE_URL } from "../../../config/api.js";
import icon from "../../../assets/logo.png";

import "../../../styles/RolesStyle/Horario/HorarioSemanal.css";

import LogoutButton from "../../../components/login/LogoutButton.jsx";
import WeeklyCalendar from "../../../components/WeeklyCalendar.jsx";

import { api } from "../../../api/api"; // ✅ axios centralizado (Bearer + refresh cookie)

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faUser,
} from "@fortawesome/free-solid-svg-icons";

function mapDiaSemanaToIndex(dia) {
    if (!dia) return 0;
    const map = {
        DOMINGO: 0,
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        MIÉRCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6,
        SÁBADO: 6,
    };
    return map[dia.toUpperCase()] ?? 0;
}

export default function PantallaHorarioDocente() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userName = localStorage.getItem("userName");

    useEffect(() => {
        const fetchHorario = async () => {
            setLoading(true);
            setError(null);

            try {
                // ✅ SIN token manual: api se encarga
                const url = `${API_BASE_URL}/docente/horario`;
                const response = await api.get(url);

                const data = response.data || [];

                const mapped = data.map((sesion, index) => {
                    // 1) ID estable
                    const id = sesion.sesionId ?? sesion.id ?? index;

                    // 2) Calcular dayIndex
                    let dayIndex = 0;
                    if (sesion.diaSemana) {
                        dayIndex = mapDiaSemanaToIndex(sesion.diaSemana);
                    } else if (sesion.fecha) {
                        // ✅ Parse local (evita que cambie de día por UTC)
                        const [y, m, d] = sesion.fecha.split("-").map(Number);
                        const localDate = new Date(y, m - 1, d); // <- LOCAL
                        dayIndex = localDate.getDay();
                    }

                    // 3) Horas por defecto
                    const startTime = sesion.horaInicio || "08:00";
                    const endTime = sesion.horaFin || "10:00";

                    return {
                        id,
                        title: sesion.tituloCurso || sesion.nombreSeccion || "Sesión",
                        subtitle: sesion.nombreSeccion
                            ? `${sesion.codigoSeccion || ""} - ${sesion.nombreSeccion}`.trim()
                            : sesion.codigoSeccion || "",
                        aula: sesion.aula || "",
                        dayIndex,
                        startTime,
                        endTime,
                    };
                });

                setEventos(mapped);
            } catch (err) {
                console.error("Error al cargar horario del docente:", err);

                // ✅ manejo estándar
                if (err.response) {
                    const msg = err.response.data?.message || "Error en el servidor";
                    setError(`Error ${err.response.status}: ${msg}`);
                } else if (err.request) {
                    setError("No se pudo conectar al servidor.");
                } else {
                    setError(err.message || "Error al cargar horario.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHorario();
    }, []);

    const weekLabel = "Secciones asignadas esta semana";

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
                            <Link to="/docente/horario" className="active">
                                <FontAwesomeIcon icon={faCalendar} className="icon-text" />
                                Horario
                            </Link>
                        </li>
                        <li>
                            <Link to="/docente/progreso">
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
                <header className='docente-header'>
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

                <main className="perfil-main">
                    {loading && <p>Cargando horario...</p>}
                    {error && <p style={{ color: "red" }}>Error: {error}</p>}
                    {!loading && !error && (
                        <WeeklyCalendar events={eventos} weekLabel={weekLabel} />
                    )}
                </main>
            </div>
        </div>
    );
}
