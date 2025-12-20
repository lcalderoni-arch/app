import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import icon from "../../../assets/logo.png";

import { API_BASE_URL } from "../../../config/api.js";

import LogoutButton from '../../../components/login/LogoutButton.jsx';
import "../../../styles/RolesStyle/DocenteStyle/DocentePageFirst.css"
import { formatDateLocal, getDayOfWeek } from '../../../utils/dateUtils.js';

import { registrarEvento } from "../../../services/eventosService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faUser,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function PantallaDocente() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userDni = localStorage.getItem('userDni'); // NECESARIO para buscar secciones

    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Cargar secciones del profesor ---
    useEffect(() => {
        const cargarSeccionesProfesor = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No estás autenticado.");

                if (!userDni) {
                    throw new Error("No se encontró el DNI del profesor.");
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const response = await axios.get(
                    `${API_BASE_URL}/secciones/profesor/dni/${userDni}`,
                    config
                );

                setSecciones(response.data);
            } catch (err) {
                console.error("Error al cargar secciones:", err);
                setError(err.response?.data?.message || "No se pudieron cargar las secciones");
            } finally {
                setLoading(false);
            }
        };

        cargarSeccionesProfesor();
    }, [userDni]);

    // --- Función para obtener horario según turno ---
    const obtenerHorario = (turno) => {
        const horarios = {
            MAÑANA: "7:00 AM - 11:30 AM",
            TARDE: "12:00 PM - 4:30 PM",
            NOCHE: "5:00 PM - 9:30 PM"
        };
        return horarios[turno] || "Horario no definido";
    };

    // --- Función para determinar si la sección está activa ---
    const obtenerEstadoSeccion = (seccion) => {
        if (!seccion.activa) {
            return { texto: "Inactiva", clase: "estado-inactivo" };
        }

        const hoy = new Date();
        const inicio = new Date(seccion.fechaInicio);
        const fin = new Date(seccion.fechaFin);

        if (hoy < inicio) {
            return { texto: "Próximamente", clase: "estado-proximamente" };
        } else if (hoy > fin) {
            return { texto: "Finalizado", clase: "estado-finalizado" };
        } else {
            return { texto: "Activo", clase: "estado-activo" };
        }
    };

    // --- Función para manejar ingreso a sección ---
    const handleIngresarSeccion = (seccion) => {
        navigate(`/docente/seccion/${seccion.id}`, {
            state: { seccion }, // enviamos el objeto completo
        });
    };

    useEffect(() => {
        registrarEvento("VER_PANTALLA_DOCENTE", {
            origen: "PantallaDocente",
        });
    }, []);


    return (
        <div className='docente-layout'>
            {/* ========== SIDEBAR IZQUIERDO ========== */}
            <aside className='docente-sidebar'>
                <div className='sidebar-header'>
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className='sidebar-role'>Docente</span>
                </div>

                <nav className='sidebar-menu'>
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <a href="#cursos" className='active'>
                                <FontAwesomeIcon icon={faBook} className='icon-text' />
                                Mis Cursos
                            </a>
                        </li>
                        <li>
                            <Link to="/docente/horario">
                                <FontAwesomeIcon icon={faCalendar} className='icon-text' />
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
                                <FontAwesomeIcon icon={faBell} className='icon-text' />
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

            {/* ========== ÁREA DERECHA ========== */}
            <div className='docente-right-area'>
                {/* HEADER */}
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

                {/* CONTENIDO PRINCIPAL */}
                <main className='docente-main'>
                    <section className='content-section'>
                        <h2>Mis Cursos</h2>
                        <p>Visualiza y gestiona tus cursos asignados</p>

                        {/* LOADING */}
                        {loading && (
                            <div className='loading-container'>
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p>Cargando tus cursos...</p>
                            </div>
                        )}

                        {/* ERROR */}
                        {error && (
                            <div className='error-container'>
                                <p className='error-message'>❌ {error}</p>
                            </div>
                        )}

                        {/* SIN SECCIONES */}
                        {!loading && !error && secciones.length === 0 && (
                            <div className='no-courses-container'>
                                <FontAwesomeIcon icon={faBook} size="3x" className='no-courses-icon' />
                                <h3>No tienes cursos asignados</h3>
                                <p>Contacta con administración para obtener tus asignaciones</p>
                            </div>
                        )}

                        {/* GRID DE CURSOS */}
                        {!loading && !error && secciones.length > 0 && (
                            <div className='courses-grid'>
                                {secciones.map((seccion) => {
                                    const estado = obtenerEstadoSeccion(seccion);

                                    return (
                                        <div key={seccion.id} className='course-card'>
                                            {/* HEADER */}
                                            <div className='header-card'>
                                                <h3>{seccion.nombre}</h3>
                                                <div className='content-grado'>
                                                    <p className='text-nivel'>
                                                        Nivel: <strong>{seccion.nivelSeccion}</strong>
                                                    </p>
                                                    <p className='text-grado'>
                                                        Grado: <strong>{seccion.gradoSeccion}</strong>
                                                    </p>
                                                </div>
                                                {/* INFORMACIÓN */}
                                                <div className='information-card'>
                                                    <span>Nombre: <strong>{userName}</strong></span>
                                                    <span>Email: <strong>{userEmail}</strong></span>
                                                    <span className='datos-fecha'><strong>{getDayOfWeek(seccion.fechaInicio)}</strong><strong> - {seccion.turno}:</strong>{' '}
                                                        {obtenerHorario(seccion.turno)} <br></br>  <strong>  ({seccion.aula || 'No asignado'})</strong></span>
                                                </div>
                                            </div>


                                            <div className='cupo-information'>
                                                <span>
                                                    Estudiantes: <strong>{seccion.estudiantesMatriculados || 0}</strong> / {seccion.capacidad}
                                                </span>
                                                <span>
                                                    Semanas: <strong>{seccion.numeroSemanas}</strong>
                                                </span>
                                            </div>

                                            {/* FOOTER */}
                                            <div className='footer-card'>
                                                <div className='estado-information'>
                                                    <span className={`badge-estado ${estado.clase}`}>
                                                        {estado.texto}
                                                    </span>
                                                </div>
                                                <div className='fecha-information'>
                                                    <span>Inicio: <strong>{formatDateLocal(seccion.fechaInicio)}</strong></span>
                                                    <span>Fin: <strong>{formatDateLocal(seccion.fechaFin)}</strong></span>
                                                    {seccion.semanaActual > 0 && (
                                                        <span className='semana-actual-badge'>
                                                            Semana {seccion.semanaActual}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className='btn-course'
                                                onClick={() => handleIngresarSeccion(seccion)}
                                                disabled={!seccion.activa}
                                            >
                                                Ingresar
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}