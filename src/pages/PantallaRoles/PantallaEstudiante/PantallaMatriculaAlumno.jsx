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
    const [errorMatricula, setErrorMatricula] = useState(null);

    // “Carrito” de secciones seleccionadas
    const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([]);
    const [confirmando, setConfirmando] = useState(false);

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
            todasSecciones.forEach((s) => {
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

            // ✅ endpoint correcto del backend
            const url = `${API_BASE_URL}/matriculas/mis-matriculas`;
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

    // Agrupar por curso
    const cursosAgrupados = agruparSeccionesPorCurso(seccionesFiltradas);

    const [cursoExpandido, setCursoExpandido] = useState(null);

    const toggleCursoExpandido = (key) => {
        setCursoExpandido((actual) => (actual === key ? null : key));
    };

    const agregarSeccionSeleccionada = (seccion) => {
        setSeccionesSeleccionadas((prev) => {
            // Evitar duplicados
            if (prev.some((s) => s.id === seccion.id)) return prev;
            return [...prev, seccion];
        });
    };

    const quitarSeccionSeleccionada = (seccionId) => {
        setSeccionesSeleccionadas((prev) =>
            prev.filter((s) => s.id !== seccionId)
        );
    };

    // ✅ Función auxiliar que SÍ existe y hace el POST real al backend
    const matricularSeccion = async (seccion) => {
        if (!token) {
            throw new Error("Token no disponible");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };

        const payload = {
            seccionId: seccion.id, // MatriculaRequestDTO
        };

        const url = `${API_BASE_URL}/matriculas/matricularse`;
        return axios.post(url, payload, config);
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
                                                                                            agregarSeccionSeleccionada(seccion)
                                                                                        }
                                                                                        disabled={
                                                                                            !seccion.tieneCupo ||
                                                                                            seccionesSeleccionadas.some(
                                                                                                (s) => s.id === seccion.id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {seccionesSeleccionadas.some(
                                                                                            (s) => s.id === seccion.id
                                                                                        )
                                                                                            ? "Agregada"
                                                                                            : "Agregar"}
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

                        {/* Tabla 2: Cursos seleccionados (carrito) */}
                        <div className="matricula-table-wrapper">
                            <h3>Cursos seleccionados para matriculación</h3>

                            {seccionesSeleccionadas.length === 0 ? (
                                <p>Aún no has seleccionado ninguna sección.</p>
                            ) : (
                                <>
                                    <table className="styled-table-seccion">
                                        <thead>
                                            <tr>
                                                <th>Curso</th>
                                                <th>Sección</th>
                                                <th>Docente</th>
                                                <th>Turno</th>
                                                <th>Aula</th>
                                                <th>Periodo</th>
                                                <th>Quitar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {seccionesSeleccionadas.map((s) => (
                                                <tr key={s.id}>
                                                    <td>
                                                        <div className="curso-info">
                                                            <strong>{s.codigoCurso}</strong>
                                                            <span>{s.tituloCurso}</span>
                                                        </div>
                                                    </td>
                                                    <td>{s.nombre}</td>
                                                    <td>{s.nombreProfesor}</td>
                                                    <td>{s.turno}</td>
                                                    <td>{s.aula || "-"}</td>
                                                    <td>{formatoPeriodo(s.fechaInicio, s.fechaFin)}</td>
                                                    <td>
                                                        <button
                                                            className="btn-course"
                                                            onClick={() => quitarSeccionSeleccionada(s.id)}
                                                        >
                                                            Quitar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button
                                        className="btn-course"
                                        onClick={async () => {
                                            if (!token) {
                                                alert("Tu sesión ha expirado. Vuelve a iniciar sesión.");
                                                return;
                                            }
                                            setConfirmando(true);
                                            setErrorMatricula(null);

                                            try {
                                                for (const seccion of seccionesSeleccionadas) {
                                                    try {
                                                        const resp = await matricularSeccion(seccion);
                                                        console.log("Matriculado:", resp.data);
                                                    } catch (err) {
                                                        console.error(
                                                            "Error matriculando sección",
                                                            seccion.id,
                                                            err
                                                        );
                                                        if (err.response?.data?.message) {
                                                            alert(
                                                                `Error en sección "${seccion.nombre}": ${err.response.data.message}`
                                                            );
                                                        }
                                                    }
                                                }

                                                // Vaciar carrito
                                                setSeccionesSeleccionadas([]);

                                                // Refrescar lo que hay en BD
                                                await cargarSeccionesDisponibles();
                                                await cargarMisMatriculas();

                                                alert("Matrícula confirmada.");
                                            } finally {
                                                setConfirmando(false);
                                            }
                                        }}
                                        disabled={confirmando}
                                    >
                                        {confirmando ? "Confirmando..." : "Confirmar matrícula"}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Tabla 3: Mis cursos matriculados (desde la BD) */}
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
                                                <td>{mat.turnoSeccion}</td>
                                                <td>{mat.aulaSeccion || "-"}</td>
                                                <td>
                                                    {formatoPeriodo(
                                                        mat.fechaInicioSeccion,
                                                        mat.fechaFinSeccion
                                                    )}
                                                </td>
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