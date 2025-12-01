// src/pages/Roles/Student/PantallaMatriculaAlumno.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import icon from "../../../assets/logo.png";
import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrashCan } from "@fortawesome/free-solid-svg-icons";

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
    // Estado para bloquear botones mientras se retira un curso
    const [retirando, setRetirando] = useState(false);

    // --- CARGAR SECCIONES DISPONIBLES ---
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

            setSeccionesDisponibles(filtradas);
        } catch (err) {
            console.error("Error al cargar secciones para alumno:", err);
            setErrorMatricula("No se pudieron cargar las secciones disponibles.");
        } finally {
            setLoadingSecciones(false);
        }
    }, [token, userNivel, userGrado]);

    // --- CARGAR MIS MATRÍCULAS (Solo Activas) ---
    const cargarMisMatriculas = useCallback(async () => {
        if (!token) return;
        setLoadingMatriculas(true);
        setErrorMatricula(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            // Usamos endpoint de activas para que no salgan las retiradas
            const url = `${API_BASE_URL}/matriculas/mis-matriculas/activas`;
            
            const response = await axios.get(url, config);
            setMisMatriculas(response.data || []);
        } catch (err) {
            console.error("Error al cargar mis matrículas:", err);
            // Si no hay cursos, a veces da 404 o vacio, seteamos vacio para evitar error visual
            setMisMatriculas([]);
        } finally {
            setLoadingMatriculas(false);
        }
    }, [token]);

    useEffect(() => {
        cargarSeccionesDisponibles();
        cargarMisMatriculas();
    }, [cargarSeccionesDisponibles, cargarMisMatriculas]);

    // --- FUNCIONES AUXILIARES ---
    const formatoPeriodo = (ini, fin) =>
        !ini || !fin ? "-" : `${ini} al ${fin}`;

    const capacidadRestante = (seccion) => {
        const matriculados = seccion.estudiantesMatriculados || 0;
        return `${matriculados}/${seccion.capacidad} (${seccion.tieneCupo ? "Disponible" : "Completo"})`;
    };

    // Agrupa secciones por curso
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

        return Array.from(mapa.values());
    };

    const [filtroTurno, setFiltroTurno] = useState("TODOS");

    const seccionesFiltradas = seccionesDisponibles.filter((s) =>
        filtroTurno === "TODOS" ? true : s.turno === filtroTurno
    );

    const cursosAgrupados = agruparSeccionesPorCurso(seccionesFiltradas);

    const [cursoExpandido, setCursoExpandido] = useState(null);

    const toggleCursoExpandido = (key) => {
        setCursoExpandido((actual) => (actual === key ? null : key));
    };

    // --- LÓGICA DEL CARRITO ---
    const agregarSeccionSeleccionada = (seccion) => {
        setSeccionesSeleccionadas((prev) => {
            // Verificar si ya tiene el curso en el carrito
            const yaTieneCursoEnCarrito = prev.some(s => s.codigoCurso === seccion.codigoCurso);
            // Verificar si ya está matriculado (usando misMatriculas)
            const yaMatriculadoEnCurso = misMatriculas.some(m => m.codigoCurso === seccion.codigoCurso);

            if (yaTieneCursoEnCarrito || yaMatriculadoEnCurso) {
                alert("Ya has seleccionado o estás matriculado en una sección para este curso.");
                return prev;
            }
            return [...prev, seccion];
        });
    };

    const quitarSeccionSeleccionada = (seccionId) => {
        setSeccionesSeleccionadas((prev) =>
            prev.filter((s) => s.id !== seccionId)
        );
    };

    const matricularSeccion = async (seccion) => {
        if (!token) throw new Error("Token no disponible");

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };
        const payload = { seccionId: seccion.id };
        const url = `${API_BASE_URL}/matriculas/matricularse`;
        return axios.post(url, payload, config);
    };

    // ⭐ NUEVA LÓGICA DE CONFIRMACIÓN ROBUSTA
    const handleConfirmarMatricula = async () => {
        if (!token) {
            alert("Tu sesión ha expirado.");
            return;
        }
        setConfirmando(true);
        setErrorMatricula(null);

        const idsExitosos = []; // Para saber cuáles borrar del carrito

        try {
            // Procesar uno por uno
            for (const seccion of seccionesSeleccionadas) {
                try {
                    await matricularSeccion(seccion);
                    idsExitosos.push(seccion.id); // Si pasa aquí, fue éxito
                } catch (err) {
                    console.error("Error matriculando:", seccion.nombre, err);
                    const msg = err.response?.data?.message || 'Error desconocido';
                    // Mostramos el error pero NO detenemos el bucle completo,
                    // ni borramos este curso del carrito (para que el alumno vea cuál falló)
                    alert(`No se pudo matricular en "${seccion.nombre}": ${msg}`);
                }
            }

            // 1. Actualizar Carrito: Remover SOLO los que tuvieron éxito
            setSeccionesSeleccionadas((prev) => 
                prev.filter((s) => !idsExitosos.includes(s.id))
            );

            // 2. Refrescar tablas
            await cargarSeccionesDisponibles();
            await cargarMisMatriculas();

            if (idsExitosos.length > 0) {
                // Mensaje de éxito si al menos uno pasó
                // alert("Cursos matriculados correctamente.");
            }

        } finally {
            setConfirmando(false);
        }
    };

    // --- RETIRAR CURSO ---
    const handleRetirarCurso = async (seccionId, nombreCurso) => {
        if (!seccionId) {
            alert("Error: No se encontró el ID de la sección.");
            return;
        }
        if (!window.confirm(`¿Estás seguro de que deseas retirarte del curso "${nombreCurso}"?`)) {
            return;
        }

        setRetirando(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = `${API_BASE_URL}/matriculas/retirarse/${seccionId}`;
            
            await axios.delete(url, config);
            
            alert(`Te has retirado de ${nombreCurso} correctamente.`);
            
            await cargarMisMatriculas();
            await cargarSeccionesDisponibles(); 
            
        } catch (err) {
            console.error("Error al retirar curso:", err);
            const msg = err.response?.data?.message || "No se pudo realizar el retiro.";
            alert(`Error: ${msg}`);
        } finally {
            setRetirando(false);
        }
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

                        {/* ================= TABLA 1: SECCIONES DISPONIBLES ================= */}
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
                                            const turnosUnicos = [...new Set(curso.secciones.map((s) => s.turno))];

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
                                                            <small>Turnos: {turnosUnicos.join(", ")}</small>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn-course"
                                                                onClick={() => toggleCursoExpandido(key)}
                                                            >
                                                                {cursoExpandido === key ? "Ocultar horarios" : "Ver horarios"}
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* Fila expandida con detalle */}
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
                                                                        {curso.secciones.map((seccion) => {
                                                                            // Verificar estado
                                                                            const yaEnCarrito = seccionesSeleccionadas.some(s => s.id === seccion.id);
                                                                            const yaMatriculado = misMatriculas.some(m => m.codigoCurso === seccion.codigoCurso);
                                                                            const mismoCursoEnCarrito = seccionesSeleccionadas.some(s => s.codigoCurso === seccion.codigoCurso);

                                                                            return (
                                                                                <tr key={seccion.id}>
                                                                                    <td>{seccion.nombre}</td>
                                                                                    <td>{seccion.nombreProfesor}</td>
                                                                                    <td>{seccion.turno}</td>
                                                                                    <td>{seccion.aula || "-"}</td>
                                                                                    <td>{formatoPeriodo(seccion.fechaInicio, seccion.fechaFin)}</td>
                                                                                    <td>{capacidadRestante(seccion)}</td>
                                                                                    <td>
                                                                                        <button
                                                                                            className="btn-course"
                                                                                            onClick={() => agregarSeccionSeleccionada(seccion)}
                                                                                            disabled={!seccion.tieneCupo || yaEnCarrito || yaMatriculado || mismoCursoEnCarrito}
                                                                                        >
                                                                                            {yaMatriculado ? "Ya matriculado" : yaEnCarrito ? "En carrito" : "Agregar"}
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
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

                        {/* ================= TABLA 2: CARRITO DE SELECCIÓN ================= */}
                        {/* TABLA 2: CARRITO DE SELECCIÓN */}
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

                                    {/* BOTÓN CONFIRMAR CON LA NUEVA LÓGICA */}
                                    <button
                                        className="btn-course"
                                        onClick={handleConfirmarMatricula}
                                        disabled={confirmando}
                                    >
                                        {confirmando ? "Procesando..." : "Confirmar matrícula"}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* ================= TABLA 3: MIS CURSOS MATRICULADOS ================= */}
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
                                            <th>Acción</th>
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
                                                    {formatoPeriodo(mat.fechaInicioSeccion, mat.fechaFinSeccion)}
                                                </td>
                                                <td>
                                                    {/* BOTÓN PARA RETIRARSE */}
                                                    <button
                                                        className="btn-delete"
                                                        style={{
                                                            backgroundColor: "#dc3545",
                                                            color: "white",
                                                            border: "none",
                                                            padding: "5px 10px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer"
                                                        }}
                                                        // IMPORTANTE: pasamos mat.seccionId, no mat.id, porque el endpoint de Alumno pide seccionId
                                                        onClick={() => handleRetirarCurso(mat.seccionId, mat.tituloCurso)}
                                                        disabled={retirando}
                                                        title="Retirarse del curso"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                    </button>
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