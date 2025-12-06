// src/pages/Roles/Student/PantallaMatriculaAlumno.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import icon from "../../../assets/logo.png";
import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";
import "../../../styles/RolesStyle/StudentStyle/StudentPageMatricula.css";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faPenToSquare,
    faArrowLeft,
    faTrashCan,
    faUser
} from '@fortawesome/free-solid-svg-icons';

export default function PantallaMatriculaAlumno() {
    const userName = localStorage.getItem("userName");
    const userNivel = localStorage.getItem("userNivel");
    const userGrado = localStorage.getItem("userGrado");

    const token = localStorage.getItem("authToken");

    // --- CONFIGURACIÓN DE MATRÍCULA (para saber si está abierta/cerrada) ---
    const [configMatricula, setConfigMatricula] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [errorConfig, setErrorConfig] = useState(null);

    // --- PERFIL DEL ALUMNO (para saber si está habilitado) ---
    const [habilitadoMatricula, setHabilitadoMatricula] = useState(null);
    const [loadingUsuario, setLoadingUsuario] = useState(false);
    const [errorUsuario, setErrorUsuario] = useState(null);

    // --- SECCIONES Y MATRÍCULAS ---
    const [seccionesDisponibles, setSeccionesDisponibles] = useState([]);
    const [misMatriculas, setMisMatriculas] = useState([]);
    const [loadingSecciones, setLoadingSecciones] = useState(false);
    const [loadingMatriculas, setLoadingMatriculas] = useState(false);
    const [errorMatricula, setErrorMatricula] = useState(null);

    // “Carrito” de secciones seleccionadas
    const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([]);
    const [confirmando, setConfirmando] = useState(false);
    const [retirando, setRetirando] = useState(false);

    // ================================
    //   CARGAR CONFIGURACIÓN MATRÍCULA
    // ================================
    const cargarConfigMatricula = useCallback(async () => {
        if (!token) return;
        setLoadingConfig(true);
        setErrorConfig(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(
                `${API_BASE_URL}/configuracion/matricula`,
                config
            );

            console.log("🟡 Configuración de matrícula (alumno):", response.data);

            if (response && response.data) {
                setConfigMatricula(response.data);
            } else {
                setConfigMatricula(null);
            }
        } catch (err) {
            console.error("Error al cargar configuración de matrícula:", err);
            setErrorConfig("No se pudo cargar la configuración de matrícula.");
            setConfigMatricula(null);
        } finally {
            setLoadingConfig(false);
        }
    }, [token]);

    // ================================
    //   CARGAR PERFIL DEL ALUMNO
    // ================================
    const cargarPerfilAlumno = useCallback(async () => {
        if (!token) return;
        setLoadingUsuario(true);
        setErrorUsuario(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(
                `${API_BASE_URL}/usuarios/me`,
                config
            );

            // UsuarioOutputDTO debe traer habilitadoMatricula
            setHabilitadoMatricula(
                typeof response.data.habilitadoMatricula === "boolean"
                    ? response.data.habilitadoMatricula
                    : null
            );
        } catch (err) {
            console.error("Error al cargar perfil del alumno:", err);
            setErrorUsuario("No se pudo cargar el estado de tu matrícula.");
            setHabilitadoMatricula(null);
        } finally {
            setLoadingUsuario(false);
        }
    }, [token]);

    // ================================
    //   CARGAR SECCIONES DISPONIBLES
    // ================================
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

    // ================================
    //   CARGAR MIS MATRÍCULAS (Activas)
    // ================================
    const cargarMisMatriculas = useCallback(async () => {
        if (!token) return;
        setLoadingMatriculas(true);
        setErrorMatricula(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const url = `${API_BASE_URL}/matriculas/mis-matriculas/activas`;
            const response = await axios.get(url, config);
            setMisMatriculas(response.data || []);
        } catch (err) {
            console.error("Error al cargar mis matrículas:", err);
            // Para evitar que reviente la UI, simplemente dejamos vacío
            setMisMatriculas([]);
        } finally {
            setLoadingMatriculas(false);
        }
    }, [token]);

    // ================================
    //   EFECTO INICIAL
    // ================================
    useEffect(() => {
        if (!token) return;
        cargarConfigMatricula();
        cargarPerfilAlumno();
        cargarSeccionesDisponibles();
        cargarMisMatriculas();
    }, [
        token,
        cargarConfigMatricula,
        cargarPerfilAlumno,
        cargarSeccionesDisponibles,
        cargarMisMatriculas,
    ]);

    // ================================
    //   HELPERS
    // ================================
    const formatoPeriodo = (ini, fin) =>
        !ini || !fin ? "-" : `${ini} al ${fin}`;

    const capacidadRestante = (seccion) => {
        const matriculados = seccion.estudiantesMatriculados || 0;
        return `${matriculados}/${seccion.capacidad} (${seccion.tieneCupo ? "Disponible" : "Completo"})`;
    };

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
            const yaTieneCursoEnCarrito = prev.some(
                (s) => s.codigoCurso === seccion.codigoCurso
            );
            const yaMatriculadoEnCurso = misMatriculas.some(
                (m) => m.codigoCurso === seccion.codigoCurso
            );

            if (yaTieneCursoEnCarrito || yaMatriculadoEnCurso) {
                alert(
                    "Ya has seleccionado o estás matriculado en una sección para este curso."
                );
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

    const handleConfirmarMatricula = async () => {
        if (!token) {
            alert("Tu sesión ha expirado.");
            return;
        }
        setConfirmando(true);
        setErrorMatricula(null);

        const idsExitosos = [];

        try {
            for (const seccion of seccionesSeleccionadas) {
                try {
                    await matricularSeccion(seccion);
                    idsExitosos.push(seccion.id);
                } catch (err) {
                    console.error("Error matriculando:", seccion.nombre, err);
                    const msg = err.response?.data?.message || "Error desconocido";
                    alert(
                        `No se pudo matricular en "${seccion.nombre}": ${msg}`
                    );
                }
            }

            setSeccionesSeleccionadas((prev) =>
                prev.filter((s) => !idsExitosos.includes(s.id))
            );

            await cargarSeccionesDisponibles();
            await cargarMisMatriculas();
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
        if (
            !window.confirm(
                `¿Estás seguro de que deseas retirarte del curso "${nombreCurso}"?`
            )
        ) {
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
            const msg =
                err.response?.data?.message || "No se pudo realizar el retiro.";
            alert(`Error: ${msg}`);
        } finally {
            setRetirando(false);
        }
    };

    // ================================
    //   REGLAS DE VISIBILIDAD
    // ================================

    // Determinar si la matrícula está cerrada según fechas + flag global
    const calcularMatriculaCerrada = () => {
        if (!configMatricula) return true;

        const { fechaInicio, fechaFin, matriculaHabilitada } = configMatricula;

        // Si el admin la bloqueó globalmente
        if (typeof matriculaHabilitada === "boolean" && !matriculaHabilitada) {
            return true;
        }

        if (!fechaInicio || !fechaFin) {
            return true; // sin fechas definidas => la consideramos cerrada
        }

        const hoy = new Date();
        const inicio = new Date(fechaInicio + "T00:00:00");
        const fin = new Date(fechaFin + "T23:59:59");

        return hoy < inicio || hoy > fin;
    };

    const isMatriculaCerrada = calcularMatriculaCerrada();
    const isAlumnoBloqueado = habilitadoMatricula === false;
    const puedeMatricular =
        !isMatriculaCerrada && habilitadoMatricula === true;

    // ================================
    //   RENDER
    // ================================

    if (!token) {
        return (
            <div className="student-layout">
                <div className="student-right-area">
                    <header className="student-header">
                        <div className="header-content">
                            <div className="header-left">
                                <img
                                    className="sidebar-icon"
                                    src={icon}
                                    alt="Logo Campus"
                                />
                                <h1>Matriculación de Cursos</h1>
                            </div>
                        </div>
                    </header>
                    <main className="student-main">
                        <section className="content-section">
                            <p style={{ color: "red", marginTop: "2rem" }}>
                                No estás autenticado. Inicia sesión nuevamente.
                            </p>
                        </section>
                    </main>
                </div>
            </div>
        );
    }

    const cargandoEstadoInicial = loadingConfig || loadingUsuario;

    return (
        <div className="student-layout">
            <aside className='student-sidebar'>
                <div className='sidebar-header'>
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className='sidebar-role'>Estudiante</span>
                </div>

                <nav className='sidebar-menu'>
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-estudiante">
                                <FontAwesomeIcon icon={faBook} className='icon-text' />
                                Mis Cursos
                            </Link>
                        </li>
                        <li>
                            <Link to="/pantalla-alumno/horario">
                                <FontAwesomeIcon icon={faCalendar} className='icon-text' />
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
                                <FontAwesomeIcon icon={faBell} className='icon-text' />
                                Notificaciones
                            </a>
                        </li>
                    </ul>
                </nav>

                <nav className='sidebar-menu'>
                    <h3>Otros campos</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-alumno/matricula" className="active">
                                <FontAwesomeIcon icon={faPenToSquare} className='icon-text' />
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
            <div className="student-right-area">
                <header className="docente-header">
                    <div className='header-content'>
                        <div className='name-header'>
                            <p>Bienvenido, <strong>{userName}</strong></p>
                            <h1>Campus Virtual</h1>
                        </div>
                        <div className='header-right'>
                            <Link to="/pantalla-estudiante" className="btn-back" style={{
                                fontSize: "14px",
                                padding: "8px 15px",
                                background: "#1a64aa",
                                borderRadius: "10px",
                                color: "#fff",
                                textDecoration: "none"
                            }}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Volver al
                                inicio
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="student-main">
                    <section className="content-section">
                        <h2>Matricúlate Aquí</h2>
                        <p className="matricula-user-summary">
                            Nivel: <strong>{userNivel || "No definido"}</strong>
                            &nbsp; | &nbsp;
                            Grado: <strong>{userGrado || "No definido"}</strong>
                        </p>

                        {/* Errores de carga de estado */}
                        {errorConfig && (
                            <p className="matricula-error-message">
                                {errorConfig}
                            </p>
                        )}
                        {errorUsuario && (
                            <p className="matricula-error-message">
                                {errorUsuario}
                            </p>
                        )}

                        {/* 1) Cargando estado inicial de matrícula/usuario */}
                        {cargandoEstadoInicial ? (
                            <p className="matricula-loading-text">
                                Cargando información de matrícula...
                            </p>
                        ) : isMatriculaCerrada ? (
                            // 2) MATRÍCULA CERRADA
                            <div className="matricula-alert matricula-alert-warning">
                                <h3>La matrícula está cerrada actualmente</h3>
                                {configMatricula?.fechaInicio &&
                                    configMatricula?.fechaFin && (
                                        <p className="matricula-alert-text">
                                            Periodo de matrícula:&nbsp;
                                            <strong>
                                                {configMatricula.fechaInicio} al{" "}
                                                {configMatricula.fechaFin}
                                            </strong>
                                        </p>
                                    )}
                                <p className="matricula-alert-text">
                                    Por favor, consulta con la institución para
                                    conocer el próximo periodo de matrícula.
                                </p>
                            </div>
                        ) : isAlumnoBloqueado ? (
                            // 3) MATRÍCULA ABIERTA, PERO ALUMNO BLOQUEADO
                            <div className="matricula-alert matricula-alert-danger">
                                <h3>Tu matrícula está temporalmente bloqueada</h3>
                                <p className="matricula-alert-text">
                                    Para poder matricularte, por favor:
                                </p>
                                <ul className="matricula-blocked-list">
                                    <li>Acércate a caja en la institución.</li>
                                    <li>Comunícate con el administrador académico.</li>
                                    <li>
                                        O escribe al correo:&nbsp;
                                        <strong>informes@fundaciondeportiva.pe</strong>{" "}
                                        (ejemplo).
                                    </li>
                                </ul>
                                <p className="matricula-alert-text">
                                    Una vez que tu matrícula sea habilitada,
                                    podrás ver aquí las secciones disponibles y
                                    completar tu registro.
                                </p>
                            </div>
                        ) : !puedeMatricular ? (
                            // Seguridad extra por si habilitadoMatricula es null
                            <p className="matricula-error-text">
                                No hemos podido determinar tu estado de matrícula.
                                Por favor, contacta con el administrador.
                            </p>
                        ) : (
                            // 4) MATRÍCULA ABIERTA Y ALUMNO HABILITADO
                            <>
                                {errorMatricula && (
                                    <p className="matricula-error-message">
                                        {errorMatricula}
                                    </p>
                                )}

                                {/* FILTRO POR TURNO */}
                                <div className="matricula-filter">
                                    <label>
                                        Filtrar por turno:&nbsp;
                                        <select
                                            value={filtroTurno}
                                            onChange={(e) =>
                                                setFiltroTurno(e.target.value)
                                            }
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
                                        <p className="matricula-loading-text">
                                            Cargando secciones disponibles...
                                        </p>
                                    ) : cursosAgrupados.length === 0 ? (
                                        <p className="matricula-empty-text">
                                            No hay secciones disponibles que coincidan con tu nivel y grado.
                                        </p>
                                    ) : (
                                        <div className="matricula-table-scroll">
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
                                                        const turnosUnicos = [
                                                            ...new Set(
                                                                curso.secciones.map(
                                                                    (s) => s.turno
                                                                )
                                                            ),
                                                        ];

                                                        return (
                                                            <React.Fragment key={key}>
                                                                <tr>
                                                                    <td>
                                                                        <div className="curso-info">
                                                                            <strong>
                                                                                {curso.codigoCurso}
                                                                            </strong>
                                                                            <span>
                                                                                {curso.tituloCurso}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {curso.secciones.length} secciones
                                                                        <br />
                                                                        <small>
                                                                            Turnos: {turnosUnicos.join(", ")}
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            className="btn-course btn-course-sm"
                                                                            onClick={() =>
                                                                                toggleCursoExpandido(key)
                                                                            }
                                                                        >
                                                                            {cursoExpandido === key
                                                                                ? "Ocultar horarios"
                                                                                : "Ver horarios"}
                                                                        </button>
                                                                    </td>
                                                                </tr>

                                                                {cursoExpandido === key && (
                                                                    <tr className="matricula-inner-row">
                                                                        <td colSpan={3}>
                                                                            <div className="matricula-inner-table-wrapper">
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
                                                                                        {curso.secciones.map(
                                                                                            (seccion) => {
                                                                                                const yaEnCarrito =
                                                                                                    seccionesSeleccionadas.some(
                                                                                                        (s) =>
                                                                                                            s.id === seccion.id
                                                                                                    );
                                                                                                const yaMatriculado =
                                                                                                    misMatriculas.some(
                                                                                                        (m) =>
                                                                                                            m.codigoCurso ===
                                                                                                            seccion.codigoCurso
                                                                                                    );
                                                                                                const mismoCursoEnCarrito =
                                                                                                    seccionesSeleccionadas.some(
                                                                                                        (s) =>
                                                                                                            s.codigoCurso ===
                                                                                                            seccion.codigoCurso
                                                                                                    );

                                                                                                return (
                                                                                                    <tr
                                                                                                        key={seccion.id}
                                                                                                    >
                                                                                                        <td>
                                                                                                            {seccion.nombre}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {seccion.nombreProfesor}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {seccion.turno}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {seccion.aula || "-"}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {formatoPeriodo(
                                                                                                                seccion.fechaInicio,
                                                                                                                seccion.fechaFin
                                                                                                            )}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {capacidadRestante(
                                                                                                                seccion
                                                                                                            )}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            <button
                                                                                                                className="btn-course btn-course-sm"
                                                                                                                onClick={() =>
                                                                                                                    agregarSeccionSeleccionada(
                                                                                                                        seccion
                                                                                                                    )
                                                                                                                }
                                                                                                                disabled={
                                                                                                                    !seccion.tieneCupo ||
                                                                                                                    yaEnCarrito ||
                                                                                                                    yaMatriculado ||
                                                                                                                    mismoCursoEnCarrito
                                                                                                                }
                                                                                                            >
                                                                                                                {yaMatriculado
                                                                                                                    ? "Ya matriculado"
                                                                                                                    : yaEnCarrito
                                                                                                                        ? "En carrito"
                                                                                                                        : "Agregar"}
                                                                                                            </button>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            }
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* ================= TABLA 2: CARRITO ================= */}
                                <div className="matricula-table-wrapper">
                                    <h3>Cursos seleccionados para matriculación</h3>

                                    {seccionesSeleccionadas.length === 0 ? (
                                        <p className="matricula-empty-text">
                                            Aún no has seleccionado ninguna sección.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="matricula-table-scroll">
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
                                                                <td>
                                                                    {formatoPeriodo(
                                                                        s.fechaInicio,
                                                                        s.fechaFin
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn-course btn-course-sm btn-course-danger"
                                                                        onClick={() =>
                                                                            quitarSeccionSeleccionada(
                                                                                s.id
                                                                            )
                                                                        }
                                                                    >
                                                                        Quitar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <button
                                                className="btn-course btn-course-confirm"
                                                onClick={handleConfirmarMatricula}
                                                disabled={confirmando}
                                            >
                                                {confirmando
                                                    ? "Procesando..."
                                                    : "Confirmar matrícula"}
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* ================= TABLA 3: MIS CURSOS ================= */}
                                <div className="matricula-table-wrapper">
                                    <h3>Mis cursos matriculados</h3>
                                    {loadingMatriculas ? (
                                        <p className="matricula-loading-text">
                                            Cargando tus cursos matriculados...
                                        </p>
                                    ) : misMatriculas.length === 0 ? (
                                        <p className="matricula-empty-text">
                                            Aún no estás matriculado en ningún curso.
                                        </p>
                                    ) : (
                                        <div className="matricula-table-scroll">
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
                                                                    <strong>
                                                                        {mat.codigoCurso}
                                                                    </strong>
                                                                    <span>
                                                                        {mat.tituloCurso}
                                                                    </span>
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
                                                            <td>
                                                                <button
                                                                    className="btn-delete-matricula"
                                                                    onClick={() =>
                                                                        handleRetirarCurso(
                                                                            mat.seccionId,
                                                                            mat.tituloCurso
                                                                        )
                                                                    }
                                                                    disabled={retirando}
                                                                    title="Retirarse del curso"
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faTrashCan}
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
