import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Importaciones de tu proyecto
import LogoutButton from "../../../components/login/LogoutButton";
import icon from "../../../assets/logo.png";
import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";

import { registrarEvento } from "../../../services/eventosService";
import { api } from "../../../api/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faPenToSquare,
    faSpinner,
    faChalkboardTeacher,
    faUser,
    faBell,
} from "@fortawesome/free-solid-svg-icons";

const formatDateLocal = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const getDayOfWeek = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", { weekday: "long" });
};

const obtenerHorario = (turno) => {
    const horarios = {
        MAÑANA: "7:00 AM - 11:30 AM",
        TARDE: "12:00 PM - 4:30 PM",
        NOCHE: "5:00 PM - 9:30 PM",
    };
    return horarios[turno] || "Horario no definido";
};

const obtenerEstadoMatricula = (matricula) => {
    const hoy = new Date();

    const inicio = matricula.fechaInicioSeccion
        ? new Date(matricula.fechaInicioSeccion)
        : null;
    const fin = matricula.fechaFinSeccion
        ? new Date(matricula.fechaFinSeccion)
        : null;

    if (!inicio || !fin) {
        return { texto: "Sin fechas", clase: "estado-sin-fecha" };
    }

    if (hoy < inicio) {
        return { texto: "Próximamente", clase: "estado-proximamente" };
    } else if (hoy > fin) {
        return { texto: "Finalizado", clase: "estado-finalizado" };
    } else {
        return { texto: "Activo", clase: "estado-activo" };
    }
};

export default function PantallaEstudiante() {
    const userName = localStorage.getItem("userName");
    const userGrado = localStorage.getItem("userGrado");
    const navigate = useNavigate();

    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar cursos (con apiClient)
    useEffect(() => {
        let alive = true;

        const cargarMisCursos = async () => {
            setLoading(true);
            setError(null);

            try {
                // Endpoint de matrículas activas
                const { data } = await api.get("/matriculas/mis-matriculas/activas");
                if (!alive) return;
                setCursos(data || []);
            } catch (err) {
                console.error("Error al cargar cursos en dashboard:", err);
                if (!alive) return;

                // Si backend responde 404 por "sin cursos", lo tratamos como lista vacía
                if (err?.response?.status === 404) {
                    setCursos([]);
                    setError(null);
                } else {
                    setError("No se pudieron cargar tus cursos.");
                }
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        cargarMisCursos();

        return () => {
            alive = false;
        };
    }, []);

    // Telemetría / evento (no bloquea UX)
    useEffect(() => {
        registrarEvento("VER_PANTALLA_ESTUDIANTE", { origen: "PantallaEstudiante" });
    }, []);

    return (
        <div className="student-layout">
            {/* ========== SIDEBAR IZQUIERDO ========== */}
            <aside className="student-sidebar">
                <div className="sidebar-header">
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className="sidebar-role">Estudiante</span>
                </div>

                <nav className="sidebar-menu">
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <a href="#cursos" className="active">
                                <FontAwesomeIcon icon={faBook} className="icon-text" />
                                Mis Cursos
                            </a>
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
                            <Link to="/mi-perfil" className="desactive">
                                <FontAwesomeIcon icon={faUser} className="icon-text" />
                                Mi Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* ========== ÁREA DERECHA ========== */}
            <div className="student-right-area">
                <header className="docente-header">
                    <div className="header-content">
                        <div className="name-header">
                            <p>
                                Bienvenido, <strong>{userName}</strong>
                            </p>
                            <h1>Campus Virtual</h1>
                        </div>
                        <div className="header-right">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className="docente-main">
                    <section className="content-section" id="cursos">
                        <h2>Mis Cursos Activos</h2>
                        <p>
                            Visualiza tus asignaturas del grado: <strong>{userGrado}</strong>
                        </p>

                        {/* --- LOADING --- */}
                        {loading && (
                            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p style={{ marginTop: "10px" }}>Cargando tus cursos...</p>
                            </div>
                        )}

                        {/* --- ERROR --- */}
                        {error && (
                            <div
                                style={{
                                    color: "red",
                                    background: "#ffebee",
                                    padding: "1rem",
                                    borderRadius: "5px",
                                    marginBottom: "1rem",
                                }}
                            >
                                <p>❌ {error}</p>
                            </div>
                        )}

                        {/* --- SIN CURSOS --- */}
                        {!loading && !error && cursos.length === 0 && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "3rem",
                                    background: "#f9f9f9",
                                    borderRadius: "8px",
                                    border: "1px dashed #ccc",
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faBook}
                                    size="3x"
                                    style={{ color: "#ccc", marginBottom: "1rem" }}
                                />
                                <h3>No tienes cursos inscritos actualmente</h3>
                                <p>Dirígete a la sección de "Matricúlate Aquí" para inscribir tus asignaturas.</p>
                            </div>
                        )}

                        {/* --- GRID DE CURSOS DINÁMICO --- */}
                        {!loading && !error && cursos.length > 0 && (
                            <div className="courses-grid">
                                {cursos.map((matricula) => {
                                    const estado = obtenerEstadoMatricula(matricula);

                                    return (
                                        <div key={matricula.id} className="course-card">
                                            <div className="header-card">
                                                <h3>{matricula.tituloCurso}</h3>

                                                <div className="content-grado-student">
                                                    <span className="text-nivel">Cód: {matricula.codigoCurso}</span>
                                                    <span className="matricula">{matricula.nombreSeccion}</span>
                                                </div>

                                                <div className="content-grado-student-two">
                                                    <span className="text-nivel">Grado: {userGrado}</span>
                                                </div>

                                                <div className="information-card">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faChalkboardTeacher}
                                                            style={{ marginRight: "8px", color: "#555" }}
                                                        />
                                                        Prof. <strong>{matricula.nombreProfesor}</strong>
                                                    </span>
                                                    <span>
                                                        Correo: <strong>{matricula.correoProfesor || "No registrado"}</strong>
                                                    </span>
                                                    <span className="datos-fecha">
                                                        <strong>{getDayOfWeek(matricula.fechaInicioSeccion)}</strong>
                                                        <strong> - {matricula.turnoSeccion || "Turno no definido"}:</strong>{" "}
                                                        {obtenerHorario(matricula.turnoSeccion)} <br />
                                                        <strong>({matricula.aulaSeccion || "No asignado"})</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="footer-card">
                                                <div className="estado-information">
                                                    <span className={`badge-estado ${estado.clase}`}>{estado.texto}</span>
                                                </div>
                                                <div className="fecha-information">
                                                    <span>
                                                        Inicio: <strong>{formatDateLocal(matricula.fechaInicioSeccion)}</strong>
                                                    </span>
                                                    <span>
                                                        Fin: <strong>{formatDateLocal(matricula.fechaFinSeccion)}</strong>
                                                    </span>
                                                    {Number(matricula.semanaActual) > 0 && (
                                                        <span className="semana-actual-badge">Semana {matricula.semanaActual}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                className="btn-course"
                                                style={{ justifyContent: "center", width: "100%", cursor: "pointer" }}
                                                onClick={() => navigate(`/pantalla-estudiante/seccion/${matricula.seccionId}`)}
                                            >
                                                Ver contenido
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
