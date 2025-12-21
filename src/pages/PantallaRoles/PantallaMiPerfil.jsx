// src/pages/PantallaRoles/PantallaMiPerfil.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import icon from "../../assets/logo.png";
import HistorialMatriculasAlumno from "../../components/alumno/HistorialMatriculasAlumno.jsx";

import "../../styles/RolesStyle/Perfil/MiPerfil.css";

import { api } from "../../api/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faIdCard,
    faPhone,
    faGraduationCap,
    faChalkboardTeacher,
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

function PantallaMiPerfil() {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const rol = perfil?.rol;

    useEffect(() => {
        let alive = true;

        const fetchPerfil = async () => {
            setLoading(true);
            setError(null);

            try {
                // Antes: axios + Bearer token
                const { data } = await api.get("/usuarios/me");

                if (!alive) return;
                setPerfil(data);
            } catch (err) {
                console.error("Error al cargar perfil:", err);
                if (!alive) return;

                setError(err?.response?.data?.message || err?.message || "Error al cargar perfil.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        fetchPerfil();

        return () => {
            alive = false;
        };
    }, []);

    if (loading) return <p>Cargando datos de tu perfil...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!perfil) return <p>No se encontraron datos de perfil.</p>;

    const esAlumno = rol === "ALUMNO";
    const esProfesor = rol === "PROFESOR";

    // Campos comunes
    const nombre = perfil.nombre || "Sin nombre";
    const email = perfil.email || "Sin correo";
    const id = perfil.id;
    const fechaRegistro = perfil.fechaCreacion || perfil.fechaRegistro;

    // Datos ALUMNO
    const dniAlumno = perfil.dniAlumno || perfil.alumno?.dni || perfil.alumno?.dniAlumno;
    const nivelAlumno = perfil.nivel || perfil.alumno?.nivel;
    const gradoAlumno = perfil.grado || perfil.alumno?.grado;
    const telEmergencia = perfil.telefonoEmergencia || perfil.alumno?.telefonoEmergencia;
    const codigoEstudiante = perfil.codigoEstudiante || perfil.alumno?.codigoEstudiante;

    // Datos PROFESOR
    const dniProfesor = perfil.dniProfesor || perfil.profesor?.dni || perfil.profesor?.dniProfesor;
    const telefonoProfesor = perfil.telefono || perfil.profesor?.telefono;
    const experiencia = perfil.experiencia || perfil.profesor?.experiencia;

    return (
        <div className={esAlumno ? "student-layout" : esProfesor ? "docente-layout" : "perfil-layout"}>
            {/* ===== SIDEBAR IZQUIERDO SEGÚN ROL ===== */}
            {esAlumno && (
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
                                <Link to="/mi-perfil" className="active">
                                    <FontAwesomeIcon icon={faUser} className="icon-text" />
                                    Mi Perfil
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
            )}

            {esProfesor && (
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
                                <Link to="/mi-perfil" className="active">
                                    <FontAwesomeIcon icon={faUser} className="icon-text" />
                                    Mi Perfil
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
            )}

            {/* ===== COLUMNA DERECHA ===== */}
            <div className={esAlumno ? "student-right-area" : "docente-right-area"}>
                <header className="docente-header-perfil">
                    <div className="header-left">
                        <div className="header-text">
                            <h1>Mi Perfil</h1>
                            <p>Revisa tus datos personales y académicos.</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <span className="pill-rol">
                            {rol === "ALUMNO" ? "Estudiante" : rol === "PROFESOR" ? "Docente" : rol}
                        </span>
                    </div>
                </header>

                <main className="perfil-main">
                    <section className="perfil-card">
                        <h2>
                            <FontAwesomeIcon icon={faUser} className="icon-section" />
                            Datos generales
                        </h2>
                        <div className="perfil-grid">
                            <div className="perfil-item">
                                <span className="label">Nombre completo</span>
                                <span className="value">{nombre}</span>
                            </div>
                            <div className="perfil-item">
                                <span className="label">Correo electrónico</span>
                                <span className="value">
                                    <FontAwesomeIcon icon={faEnvelope} className="inline-icon" /> {email}
                                </span>
                            </div>
                            <div className="perfil-item">
                                <span className="label">Rol</span>
                                <span className="value value-pill">
                                    {rol === "ALUMNO" ? "Estudiante" : rol === "PROFESOR" ? "Docente" : rol}
                                </span>
                            </div>
                            {id && (
                                <div className="perfil-item">
                                    <span className="label">ID de usuario</span>
                                    <span className="value">#{id}</span>
                                </div>
                            )}
                            {fechaRegistro && (
                                <div className="perfil-item">
                                    <span className="label">Fecha de registro</span>
                                    <span className="value small">{fechaRegistro}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {esAlumno && (
                        <section className="perfil-card">
                            <h2>
                                <FontAwesomeIcon icon={faGraduationCap} className="icon-section" />
                                Datos de estudiante
                            </h2>

                            <div className="perfil-grid">
                                <div className="perfil-item">
                                    <span className="label">DNI</span>
                                    <span className="value">
                                        <FontAwesomeIcon icon={faIdCard} className="inline-icon" />{" "}
                                        {dniAlumno || "No registrado"}
                                    </span>
                                </div>

                                <div className="perfil-item">
                                    <span className="label">Nivel</span>
                                    <span className="value">
                                        {nivelAlumno
                                            ? nivelAlumno.charAt(0) + nivelAlumno.slice(1).toLowerCase()
                                            : "No registrado"}
                                    </span>
                                </div>

                                <div className="perfil-item">
                                    <span className="label">Grado</span>
                                    <span className="value">{gradoAlumno || "No registrado"}</span>
                                </div>

                                <div className="perfil-item">
                                    <span className="label">Teléfono de emergencia</span>
                                    <span className="value">
                                        <FontAwesomeIcon icon={faPhone} className="inline-icon" />{" "}
                                        {telEmergencia || "No registrado"}
                                    </span>
                                </div>

                                <div className="perfil-item">
                                    <span className="label">Código de estudiante</span>
                                    <span className="value">{codigoEstudiante || "No registrado"}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {esAlumno && (
                        <section className="perfil-card">
                            <HistorialMatriculasAlumno />
                        </section>
                    )}

                    {esProfesor && (
                        <section className="perfil-card">
                            <h2>
                                <FontAwesomeIcon icon={faChalkboardTeacher} className="icon-section" />
                                Datos de docente
                            </h2>

                            <div className="perfil-grid">
                                <div className="perfil-item">
                                    <span className="label">DNI</span>
                                    <span className="value">
                                        <FontAwesomeIcon icon={faIdCard} className="inline-icon" />{" "}
                                        {dniProfesor || "No registrado"}
                                    </span>
                                </div>

                                <div className="perfil-item">
                                    <span className="label">Teléfono</span>
                                    <span className="value">
                                        <FontAwesomeIcon icon={faPhone} className="inline-icon" />{" "}
                                        {telefonoProfesor || "No registrado"}
                                    </span>
                                </div>

                                <div className="perfil-item perfil-item-full">
                                    <span className="label">Experiencia / Especialización</span>
                                    <span className="value">
                                        {experiencia || "No se ha registrado la experiencia aún."}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {!esAlumno && !esProfesor && (
                        <section className="perfil-card">
                            <h2>Información adicional</h2>
                            <p>
                                Tu rol actual es: <strong>{rol}</strong>. Aún no hay datos específicos configurados
                                para este tipo de usuario.
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default PantallaMiPerfil;
