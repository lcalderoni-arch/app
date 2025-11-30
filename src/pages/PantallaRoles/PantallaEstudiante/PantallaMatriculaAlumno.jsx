// src/pages/Roles/Student/PantallaMatriculaAlumno.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import icon from "../../../assets/logo.png";
import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function PantallaMatriculaAlumno() {
    const userName = localStorage.getItem("userName");
    const userNivel = localStorage.getItem("userNivel");
    const userGrado = localStorage.getItem("userGrado");

    const token = localStorage.getItem("authToken");

    const [seccionesDisponibles, setSeccionesDisponibles] = useState([]);
    const [misMatriculas, setMisMatriculas] = useState([]);
    const [loadingSecciones, setLoadingSecciones] = useState(false);
    const [loadingMatriculas, setLoadingMatriculas] = useState(false);
    const [matriculandoId, setMatriculandoId] = useState(null);
    const [errorMatricula, setErrorMatricula] = useState(null);

    const cargarSeccionesDisponibles = useCallback(async () => {
        if (!token) return;
        setLoadingSecciones(true);
        setErrorMatricula(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(API_ENDPOINTS.secciones, config);
            const todasSecciones = response.data || [];

            const filtradas = todasSecciones.filter((s) => {
                const nivelSeccion = (s.nivelSeccion || "").trim().toUpperCase();
                const gradoSeccion = (s.gradoSeccion || "").trim().toUpperCase();
                const nivelAlumno = (userNivel || "").trim().toUpperCase();
                const gradoAlumno = (userGrado || "").trim().toUpperCase();

                const mismoNivel = nivelSeccion === nivelAlumno;
                const mismoGrado = gradoSeccion === gradoAlumno;
                const activa = s.activa === true;
                const conCupo = s.tieneCupo !== false;

                return mismoNivel && mismoGrado && activa && conCupo;
            });

            console.log("Alumno nivel:", userNivel, "grado:", userGrado);
            todasSecciones.forEach(s => {
                console.log(
                    "Sección:",
                    s.nombre,
                    "| nivel:", s.nivelSeccion,
                    "| grado:", s.gradoSeccion
                );
            });

            setSeccionesDisponibles(filtradas);
        } catch (err) {
            console.error("Error al cargar secciones para alumno:", err);
            setErrorMatricula("No se pudieron cargar las secciones disponibles.");
        } finally {
            setLoadingSecciones(false);
        }
    }, [token, userNivel, userGrado]);

    const cargarMisMatriculas = useCallback(async () => {
        if (!token) return;
        setLoadingMatriculas(true);
        setErrorMatricula(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const url = `${API_BASE_URL}/matriculas/mis-matriculas`; // ajusta al endpoint real
            const response = await axios.get(url, config);
            setMisMatriculas(response.data || []);
        } catch (err) {
            console.error("Error al cargar mis matrículas:", err);
            setErrorMatricula("No se pudieron cargar tus cursos matriculados.");
        } finally {
            setLoadingMatriculas(false);
        }
    }, [token]);

    useEffect(() => {
        cargarSeccionesDisponibles();
        cargarMisMatriculas();
    }, [cargarSeccionesDisponibles, cargarMisMatriculas]);

    const handleMatricular = async (seccion) => {
        if (!token) {
            alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
            return;
        }

        setErrorMatricula(null);
        setMatriculandoId(seccion.id);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const payload = {
                seccionId: seccion.id, // ajusta a tu MatriculaRequestDTO
            };

            const url = `${API_BASE_URL}/matriculas`;
            await axios.post(url, payload, config);

            alert(`Te has matriculado en "${seccion.nombre}" correctamente.`);

            await cargarSeccionesDisponibles();
            await cargarMisMatriculas();
        } catch (err) {
            console.error("Error al matricularse en la sección:", err);
            if (err.response) {
                const data = err.response.data;
                const msg = data?.message || "No se pudo completar la matrícula.";
                setErrorMatricula(msg);
                alert(msg);
            } else {
                setErrorMatricula("No se pudo conectar con el servidor.");
            }
        } finally {
            setMatriculandoId(null);
        }
    };

    const formatoPeriodo = (ini, fin) =>
        !ini || !fin ? "-" : `${ini} al ${fin}`;

    const capacidadRestante = (seccion) => {
        const matriculados = seccion.estudiantesMatriculados || 0;
        return `${matriculados}/${seccion.capacidad} (${seccion.tieneCupo ? "Disponible" : "Completo"})`;
    };

    // Agrupa secciones por curso (código + título)
    const agruparSeccionesPorCurso = (secciones) => {
        const mapa = new Map();

        secciones.forEach((s) => {
            const key = `${s.codigoCurso || ""}__${s.tituloCurso || ""}`;

            if (!mapa.has(key)) {
                mapa.set(key, {
                    codigoCurso: s.codigoCurso,
                    tituloCurso: s.tituloCurso,
                    secciones: [],
                });
            }

            mapa.get(key).secciones.push(s);
        });

        return Array.from(mapa.values()); // array de { codigoCurso, tituloCurso, secciones: [] }
    };

    const [filtroTurno, setFiltroTurno] = useState("TODOS");

    const seccionesFiltradas = seccionesDisponibles.filter((s) =>
        filtroTurno === "TODOS" ? true : s.turno === filtroTurno
    );

    // Agrupar por curso
    const cursosAgrupados = agruparSeccionesPorCurso(seccionesFiltradas);

    const [cursoExpandido, setCursoExpandido] = useState(null);

    const toggleCursoExpandido = (key) => {
        setCursoExpandido((actual) => (actual === key ? null : key));
    };

    return (
        <div className="student-layout">
            <div className="student-right-area">
                <header className="student-header">
                    <div className="header-content">
                        <div className="header-left">
                            <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                            <h1>Matriculación de Cursos</h1>
                        </div>
                        <div className="header-right">
                            <p>
                                Alumno: <strong>{userName}</strong>
                            </p>
                            <Link to="/pantalla-estudiante" className="btn-back">
                                <FontAwesomeIcon icon={faArrowLeft} /> Volver al inicio
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="student-main">
                    <section className="content-section">
                        <h2>Matricúlate Aquí</h2>
                        <p>
                            Nivel: <strong>{userNivel || "No definido"}</strong> &nbsp; | &nbsp;
                            Grado: <strong>{userGrado || "No definido"}</strong>
                        </p>

                        {errorMatricula && (
                            <p style={{ color: "red", marginBottom: "1rem" }}>{errorMatricula}</p>
                        )}

                        <div style={{ marginBottom: "1rem" }}>
                            <label>
                                Filtrar por turno:&nbsp;
                                <select
                                    value={filtroTurno}
                                    onChange={(e) => setFiltroTurno(e.target.value)}
                                >
                                    <option value="TODOS">Todos</option>
                                    <option value="MAÑANA">Mañana</option>
                                    <option value="TARDE">Tarde</option>
                                    <option value="NOCHE">Noche</option>
                                </select>
                            </label>
                        </div>

                        {/* Tabla 1: Secciones disponibles */}
                        <div className="matricula-table-wrapper">
                            <h3>Secciones disponibles para ti</h3>
                            {loadingSecciones ? (
                                <p>Cargando secciones disponibles...</p>
                            ) : cursosAgrupados.length === 0 ? (
                                <p>No hay secciones disponibles que coincidan con tu nivel y grado.</p>
                            ) : (
                                <table className="styled-table-seccion">
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Secciones / Turnos</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cursosAgrupados.map((curso) => {
                                            const key = `${curso.codigoCurso || ""}__${curso.tituloCurso || ""}`;

                                            // Turnos distintos para mostrar un resumen
                                            const turnosUnicos = [
                                                ...new Set(curso.secciones.map((s) => s.turno)),
                                            ];

                                            return (
                                                <React.Fragment key={key}>
                                                    {/* Fila principal del curso */}
                                                    <tr>
                                                        <td>
                                                            <div className="curso-info">
                                                                <strong>{curso.codigoCurso}</strong>
                                                                <span>{curso.tituloCurso}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {curso.secciones.length} secciones <br />
                                                            <small>
                                                                Turnos: {turnosUnicos.join(", ")}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn-course"
                                                                onClick={() => toggleCursoExpandido(key)}
                                                            >
                                                                {cursoExpandido === key
                                                                    ? "Ocultar horarios"
                                                                    : "Ver horarios"}
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* Fila expandida con la tabla interna de secciones */}
                                                    {cursoExpandido === key && (
                                                        <tr>
                                                            <td colSpan={3}>
                                                                <table className="styled-table-seccion inner-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Sección</th>
                                                                            <th>Docente</th>
                                                                            <th>Turno</th>
                                                                            <th>Aula</th>
                                                                            <th>Periodo</th>
                                                                            <th>Cupo</th>
                                                                            <th>Acción</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {curso.secciones.map((seccion) => (
                                                                            <tr key={seccion.id}>
                                                                                <td>{seccion.nombre}</td>
                                                                                <td>{seccion.nombreProfesor}</td>
                                                                                <td>{seccion.turno}</td>
                                                                                <td>{seccion.aula || "-"}</td>
                                                                                <td>
                                                                                    {formatoPeriodo(
                                                                                        seccion.fechaInicio,
                                                                                        seccion.fechaFin
                                                                                    )}
                                                                                </td>
                                                                                <td>
                                                                                    {capacidadRestante(seccion)}
                                                                                </td>
                                                                                <td>
                                                                                    <button
                                                                                        className="btn-course"
                                                                                        onClick={() =>
                                                                                            handleMatricular(seccion)
                                                                                        }
                                                                                        disabled={
                                                                                            matriculandoId ===
                                                                                            seccion.id ||
                                                                                            !seccion.tieneCupo
                                                                                        }
                                                                                    >
                                                                                        {matriculandoId === seccion.id
                                                                                            ? "Matriculando..."
                                                                                            : "Matricularme"}
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Tabla 2: Mis cursos matriculados */}
                        <div className="matricula-table-wrapper">
                            <h3>Mis cursos matriculados</h3>
                            {loadingMatriculas ? (
                                <p>Cargando tus cursos matriculados...</p>
                            ) : misMatriculas.length === 0 ? (
                                <p>Aún no estás matriculado en ningún curso.</p>
                            ) : (
                                <table className="styled-table-seccion">
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Sección</th>
                                            <th>Docente</th>
                                            <th>Turno</th>
                                            <th>Aula</th>
                                            <th>Periodo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {misMatriculas.map((mat) => (
                                            <tr key={mat.id}>
                                                <td>
                                                    <div className="curso-info">
                                                        <strong>{mat.codigoCurso}</strong>
                                                        <span>{mat.tituloCurso}</span>
                                                    </div>
                                                </td>
                                                <td>{mat.nombreSeccion}</td>
                                                <td>{mat.nombreProfesor}</td>
                                                <td>{mat.turno}</td>
                                                <td>{mat.aula || "-"}</td>
                                                <td>{formatoPeriodo(mat.fechaInicio, mat.fechaFin)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
