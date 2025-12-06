import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from 'axios';

import { API_ENDPOINTS, API_BASE_URL } from "../../config/api.js";
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionSecciones.css";
import { formatDateLocal } from '../../utils/dateUtils';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faChalkboard,
    faMagnifyingGlass,
    faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

function GestionSecciones() {
    // --- Estados de la lista de secciones ---
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para filtros ---
    const [filtroNivel, setFiltroNivel] = useState("TODOS");
    const [filtroTurno, setFiltroTurno] = useState("TODOS");
    const [filtroActiva, setFiltroActiva] = useState("TODOS");
    const [searchTerm, setSearchTerm] = useState("");

    // --- ESTADOS DEL FORMULARIO (CREAR / EDITAR) ---
    const [nombre, setNombre] = useState("");
    const [nivelSeccion, setNivelSeccion] = useState("");
    const [gradoSeccion, setGradoSeccion] = useState("");
    const [turno, setTurno] = useState("");
    const [aula, setAula] = useState("");
    const [capacidad, setCapacidad] = useState(30);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    // --- SEMANAS DE CLASES (solo cálculo automático) ---
    const [numeroSemanas, setNumeroSemanas] = useState(0);
    const [semanasCalculadas, setSemanasCalculadas] = useState(0);

    const [cursoId, setCursoId] = useState("");
    const [profesorDni, setProfesorDni] = useState("");

    const [cursos, setCursos] = useState([]);
    const [formError, setFormError] = useState(null);
    const [submittingSeccion, setSubmittingSeccion] = useState(false);
    const [loadingCursos, setLoadingCursos] = useState(false);

    // --- MODO EDICIÓN ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSeccion, setEditingSeccion] = useState(null);
    const formRef = useRef(null);

    // --- Refs para dropdowns ---
    const [isNivelOpen, setIsNivelOpen] = useState(false);
    const [isTurnoOpen, setIsTurnoOpen] = useState(false);
    const [isCursoOpen, setIsCursoOpen] = useState(false);
    const nivelSelectRef = useRef(null);
    const turnoSelectRef = useRef(null);
    const cursoSelectRef = useRef(null);

    const API_URL = API_ENDPOINTS.secciones;

    // --- useEffect para cerrar dropdowns al hacer click fuera ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (nivelSelectRef.current && !nivelSelectRef.current.contains(event.target)) {
                setIsNivelOpen(false);
            }
            if (turnoSelectRef.current && !turnoSelectRef.current.contains(event.target)) {
                setIsTurnoOpen(false);
            }
            if (cursoSelectRef.current && !cursoSelectRef.current.contains(event.target)) {
                setIsCursoOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Cargar secciones ---
    const cargarSecciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(API_URL, config);
            setSecciones(response.data);
        } catch (err) {
            console.error("Error al cargar secciones:", err);

            if (err.response) {
                const msgBackend = err.response.data?.message || "Error en el servidor";
                setError(`Error ${err.response.status}: ${msgBackend}`);
            } else if (err.request) {
                setError("No se pudo conectar al servidor.");
            } else {
                setError("Error: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        cargarSecciones();
    }, [cargarSecciones]);

    // --- Cargar cursos disponibles ---
    const cargarCursos = useCallback(async () => {
        setLoadingCursos(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(`${API_BASE_URL}/cursos`, config);
            setCursos(response.data);
        } catch (err) {
            console.error("Error al cargar cursos:", err);
            setFormError("No se pudieron cargar los cursos disponibles");
        } finally {
            setLoadingCursos(false);
        }
    }, []);

    useEffect(() => {
        cargarCursos();
    }, [cargarCursos]);

    // --- Limpiar formulario (y salir de modo edición) ---
    const limpiarFormularioSeccion = () => {
        setNombre("");
        setNivelSeccion("");
        setGradoSeccion("");
        setTurno("");
        setAula("");
        setCapacidad(30);
        setFechaInicio("");
        setFechaFin("");
        setNumeroSemanas(0);
        setSemanasCalculadas(0);
        setCursoId("");
        setProfesorDni("");
        setFormError(null);

        setIsEditMode(false);
        setEditingSeccion(null);
    };

    // FUNCIÓN PARA CALCULAR SEMANAS AUTOMÁTICAMENTE:
    const calcularSemanas = useCallback(() => {
        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio + "T00:00:00");
            const fin = new Date(fechaFin + "T00:00:00");

            const diffTime = Math.abs(fin - inicio);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const weeks = Math.floor(diffDays / 7) + 1;

            setSemanasCalculadas(weeks);
            setNumeroSemanas(weeks); // Auto-rellenar
        } else {
            setSemanasCalculadas(0);
            setNumeroSemanas(0);
        }
    }, [fechaInicio, fechaFin]);

    // LLAMAR AL CALCULAR CUANDO CAMBIEN LAS FECHAS:
    useEffect(() => {
        calcularSemanas();
    }, [calcularSemanas]);

    // --- Función auxiliar para obtener día de la semana ---
    const obtenerDiaSemana = (fechaString) => {
        if (!fechaString) return "";

        const diasSemana = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
        ];
        const meses = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
        ];

        const [year, month, day] = fechaString.split("-");
        const fecha = new Date(year, month - 1, day);

        const diaSemana = diasSemana[fecha.getDay()];
        const diaNumero = fecha.getDate();
        const mesNombre = meses[fecha.getMonth()];
        const año = fecha.getFullYear();

        return `${diaSemana} ${diaNumero} de ${mesNombre} ${año}`;
    };

    // --- Crear / Editar sección (submit unificado) ---
    const handleSubmitSeccion = async (e) => {
        e.preventDefault();
        setSubmittingSeccion(true);
        setFormError(null);

        // Validaciones comunes
        if (
            !nombre.trim() ||
            !nivelSeccion ||
            !gradoSeccion.trim() ||
            !turno ||
            !fechaInicio ||
            !fechaFin ||
            !cursoId ||
            !profesorDni.trim()
        ) {
            setFormError("Todos los campos obligatorios (*) deben ser completados");
            setSubmittingSeccion(false);
            return;
        }

        const capacidadNum = parseInt(capacidad);
        if (capacidadNum < 1 || capacidadNum > 100) {
            setFormError("La capacidad debe estar entre 1 y 100");
            setSubmittingSeccion(false);
            return;
        }

        // Validación de semanas solo para creación (la edición ya tiene dato en backend)
        if (!isEditMode) {
            if (numeroSemanas < 1 || numeroSemanas > 52) {
                setFormError("El número de semanas debe estar entre 1 y 52");
                setSubmittingSeccion(false);
                return;
            }
        }

        // Payload base (sin numeroSemanas)
        const payloadBase = {
            nombre: nombre.trim(),
            nivelSeccion: nivelSeccion,
            gradoSeccion: gradoSeccion.trim(),
            turno: turno,
            aula: aula.trim(),
            capacidad: capacidadNum,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            cursoId: parseInt(cursoId),
            profesorDni: profesorDni.trim(),
        };

        // Para creación SÍ enviamos numeroSemanas
        const payload = !isEditMode
            ? { ...payloadBase, numeroSemanas: numeroSemanas }
            : payloadBase;

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Sesión expirada.");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            // --- CREAR ---
            if (!isEditMode) {
                const url = `${API_BASE_URL}/secciones`;
                const response = await axios.post(url, payload, config);

                setSecciones((current) => [response.data, ...current]);
                alert(`Sección "${response.data.nombre}" creada correctamente.`);
                limpiarFormularioSeccion();
            }
            // --- EDITAR ---
            else if (isEditMode && editingSeccion) {
                const url = `${API_BASE_URL}/secciones/${editingSeccion.id}`;

                // Evitar peticiones sin cambios (opcional)
                const sinCambios =
                    payloadBase.nombre === (editingSeccion.nombre || "") &&
                    payloadBase.nivelSeccion === editingSeccion.nivelSeccion &&
                    payloadBase.gradoSeccion === editingSeccion.gradoSeccion &&
                    payloadBase.turno === editingSeccion.turno &&
                    payloadBase.aula === (editingSeccion.aula || "") &&
                    payloadBase.capacidad === editingSeccion.capacidad &&
                    payloadBase.fechaInicio === editingSeccion.fechaInicio &&
                    payloadBase.fechaFin === editingSeccion.fechaFin &&
                    payloadBase.cursoId === editingSeccion.cursoId &&
                    payloadBase.profesorDni === editingSeccion.dniProfesor;

                if (sinCambios) {
                    setFormError("No se realizaron cambios.");
                    setSubmittingSeccion(false);
                    return;
                }

                const response = await axios.put(url, payload, config);

                setSecciones((current) =>
                    current.map((s) => (s.id === response.data.id ? response.data : s))
                );
                alert(`Sección "${response.data.nombre}" actualizada correctamente.`);
                limpiarFormularioSeccion();
            }
        } catch (err) {
            console.error("❌ Error al guardar sección:", err);

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 401) {
                    setFormError(
                        "No estás autenticado. Por favor, inicia sesión nuevamente."
                    );
                } else if (status === 403) {
                    setFormError("No tienes permisos para gestionar secciones.");
                } else if (status === 400 && errorData?.message) {
                    setFormError(errorData.message);
                } else if (status === 500) {
                    const errorMsg =
                        errorData?.message || errorData?.error || "Error interno del servidor";
                    setFormError(`Error del servidor: ${errorMsg}`);
                } else if (errorData?.message) {
                    setFormError(errorData.message);
                } else {
                    setFormError(`Error del servidor (código ${status})`);
                }
            } else if (err.request) {
                setFormError("No se pudo conectar al servidor.");
            } else {
                setFormError("Ocurrió un error inesperado: " + err.message);
            }
        } finally {
            setSubmittingSeccion(false);
        }
    };

    // --- Filtrar secciones ---
    const seccionesFiltradas = secciones.filter((seccion) => {
        const coincideNivel =
            filtroNivel === "TODOS" || seccion.nivelSeccion === filtroNivel;
        const coincideTurno =
            filtroTurno === "TODOS" || seccion.turno === filtroTurno;
        const coincideActiva =
            filtroActiva === "TODOS" ||
            (filtroActiva === "ACTIVA" ? seccion.activa : !seccion.activa);
        const coincideBusqueda =
            seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.nombreProfesor.toLowerCase().includes(searchTerm.toLowerCase());

        return coincideNivel && coincideTurno && coincideActiva && coincideBusqueda;
    });

    // --- Handlers de acciones en tabla ---
    const handleEditClick = (seccion) => {
        setIsEditMode(true);
        setEditingSeccion(seccion);

        setNombre(seccion.nombre || "");
        setNivelSeccion(seccion.nivelSeccion || "");
        setGradoSeccion(seccion.gradoSeccion || "");
        setTurno(seccion.turno || "");
        setAula(seccion.aula || "");
        setCapacidad(seccion.capacidad || 30);
        setFechaInicio(seccion.fechaInicio || "");
        setFechaFin(seccion.fechaFin || "");
        setNumeroSemanas(seccion.numeroSemanas || 0);
        setSemanasCalculadas(seccion.numeroSemanas || 0);
        setCursoId(
            seccion.cursoId != null ? seccion.cursoId.toString() : ""
        );
        setProfesorDni(seccion.dniProfesor || "");
        setFormError(null);

        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta sección?")) {
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Sesión expirada.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.delete(`${API_URL}/${id}`, config);
            setSecciones(secciones.filter((s) => s.id !== id));
            alert("Sección eliminada exitosamente");

            if (isEditMode && editingSeccion && editingSeccion.id === id) {
                limpiarFormularioSeccion();
            }
        } catch (err) {
            console.error("Error al eliminar sección:", err);
            const errorMsg =
                err.response?.data?.message || "No se pudo eliminar la sección";
            alert(errorMsg);
        }
    };

    const handleToggleActiva = async (seccion) => {
        const accion = seccion.activa ? "desactivar" : "activar";
        if (!window.confirm(`¿Estás seguro de ${accion} esta sección?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Sesión expirada.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const endpoint = seccion.activa ? "desactivar" : "activar";
            await axios.patch(`${API_URL}/${seccion.id}/${endpoint}`, {}, config);

            setSecciones(
                secciones.map((s) =>
                    s.id === seccion.id ? { ...s, activa: !s.activa } : s
                )
            );

            alert(`Sección ${accion}da exitosamente`);
        } catch (err) {
            console.error(`Error al ${accion} sección:`, err);
            const errorMsg =
                err.response?.data?.message || `No se pudo ${accion} la sección`;
            alert(errorMsg);
        }
    };

    if (loading && secciones.length === 0) return <p>Cargando secciones...</p>;

    return (
        <div className="general-box-gestionsecciones">
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionsecciones">
                <div className="alinear-al-centro">
                    <h2>
                        <FontAwesomeIcon className="icon" icon={faChalkboard} />
                        Gestión de Secciones
                    </h2>
                </div>
                <p>Administra y asigna las secciones en la plataforma.</p>

                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {loading && <p>Actualizando lista...</p>}
            </div>

            {/* FORMULARIO CREAR / EDITAR */}
            <div className="box-formulario-gestionsecciones" ref={formRef}>
                <div className="centrar-tercer-titulo">
                    <h3>
                        <FontAwesomeIcon className="icon" icon={faSquarePlus} />
                        {isEditMode ? "Editar Sección" : "Crear Nueva Sección"}
                    </h3>
                    <p>
                        {isEditMode
                            ? "Modifica los datos de la sección seleccionada y guarda los cambios."
                            : "Complete los campos para registrar una nueva sección en el sistema"}
                    </p>
                </div>

                <form className="auth-form-gestionsecciones" onSubmit={handleSubmitSeccion}>
                    <div className="auth-form-gestionsecciones-area-form">
                        <div className="auth-form-area-form">
                            {/* FILA 1: Curso, Nombre, Nivel */}
                            <div className="form-area-datos-description">
                                {/* CURSO */}
                                <label>
                                    Curso *
                                    <div
                                        className="nivel-select-container-curso"
                                        ref={cursoSelectRef}
                                    >
                                        <div
                                            className={`nivel-select-trigger ${cursoId !== "" ? "selected" : ""
                                                } ${loadingCursos ? "disabled" : ""}`}
                                            onClick={(e) => {
                                                if (!loadingCursos) {
                                                    e.stopPropagation();
                                                    setIsCursoOpen(!isCursoOpen);
                                                }
                                            }}
                                        >
                                            <span>
                                                {loadingCursos
                                                    ? "Cargando cursos..."
                                                    : cursoId === ""
                                                        ? "Selecciona un curso..."
                                                        : (() => {
                                                            const cursoSeleccionado = cursos.find(
                                                                (c) => c.id === parseInt(cursoId)
                                                            );
                                                            return cursoSeleccionado
                                                                ? `${cursoSeleccionado.codigo} - ${cursoSeleccionado.titulo} (${cursoSeleccionado.nivelDestino})`
                                                                : "Selecciona un curso...";
                                                        })()}
                                            </span>
                                            <FontAwesomeIcon
                                                className="icon-increment"
                                                icon={faAngleDown}
                                            />
                                        </div>

                                        {isCursoOpen && !loadingCursos && (
                                            <div className="nivel-select-dropdown curso-dropdown">
                                                {cursos.length === 0 ? (
                                                    <div className="nivel-select-option no-options">
                                                        No hay cursos disponibles
                                                    </div>
                                                ) : (
                                                    cursos.map((curso) => (
                                                        <div
                                                            key={curso.id}
                                                            className={`nivel-select-option ${cursoId === curso.id.toString() ? "active" : ""
                                                                }`}
                                                            onClick={() => {
                                                                setCursoId(curso.id.toString());
                                                                setIsCursoOpen(false);
                                                            }}
                                                        >
                                                            <div className="curso-option-content">
                                                                <strong>{curso.codigo}</strong>
                                                                <span className="separador"> - </span>
                                                                <span className="curso-titulo">
                                                                    {curso.titulo}
                                                                </span>
                                                                <span className="separador-parentesis">
                                                                    {" "}
                                                                    (
                                                                </span>
                                                                <span className="curso-nivel">
                                                                    {curso.nivelDestino}
                                                                </span>
                                                                <span className="separador-parentesis">
                                                                    )
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {/* NOMBRE */}
                                <label>
                                    Nombre de la Sección *
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Matemática - 5to A - Mañana"
                                        required
                                    />
                                </label>

                                {/* NIVEL */}
                                <label>
                                    Nivel *
                                    <div
                                        className="nivel-select-container"
                                        ref={nivelSelectRef}
                                    >
                                        <div
                                            className={`nivel-select-trigger ${nivelSeccion !== "" ? "selected" : ""
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsNivelOpen(!isNivelOpen);
                                            }}
                                        >
                                            <span>
                                                {nivelSeccion === ""
                                                    ? "Selecciona un nivel..."
                                                    : nivelSeccion === "INICIAL"
                                                        ? "Inicial"
                                                        : nivelSeccion === "PRIMARIA"
                                                            ? "Primaria"
                                                            : "Secundaria"}
                                            </span>
                                            <FontAwesomeIcon
                                                className="icon-increment"
                                                icon={faAngleDown}
                                            />
                                        </div>

                                        {isNivelOpen && (
                                            <div className="nivel-select-dropdown">
                                                <div
                                                    className={`nivel-select-option ${nivelSeccion === "INICIAL" ? "active" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setNivelSeccion("INICIAL");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Inicial
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelSeccion === "PRIMARIA" ? "active" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setNivelSeccion("PRIMARIA");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Primaria
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelSeccion === "SECUNDARIA" ? "active" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setNivelSeccion("SECUNDARIA");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Secundaria
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* FILA 2: Grado, Turno, Aula, Capacidad */}
                            <div className="form-area-datos-secciones">
                                {/* GRADO */}
                                <label>
                                    Grado *
                                    <input
                                        type="text"
                                        value={gradoSeccion}
                                        onChange={(e) => setGradoSeccion(e.target.value)}
                                        placeholder="Ej: 5to A"
                                        required
                                    />
                                </label>

                                {/* TURNO */}
                                <label>
                                    Turno *
                                    <div className="nivel-select-container" ref={turnoSelectRef}>
                                        <div
                                            className={`nivel-select-trigger ${turno !== "" ? "selected" : ""
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsTurnoOpen(!isTurnoOpen);
                                            }}
                                        >
                                            <span>
                                                {turno === ""
                                                    ? "Selecciona un turno..."
                                                    : turno === "MAÑANA"
                                                        ? "Mañana"
                                                        : turno === "TARDE"
                                                            ? "Tarde"
                                                            : "Noche"}
                                            </span>
                                            <FontAwesomeIcon
                                                className="icon-increment"
                                                icon={faAngleDown}
                                            />
                                        </div>

                                        {isTurnoOpen && (
                                            <div className="nivel-select-dropdown">
                                                <div
                                                    className={`nivel-select-option ${turno === "MAÑANA" ? "active" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setTurno("MAÑANA");
                                                        setIsTurnoOpen(false);
                                                    }}
                                                >
                                                    Mañana
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${turno === "TARDE" ? "active" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setTurno("TARDE");
                                                        setIsTurnoOpen(false);
                                                    }}
                                                >
                                                    Tarde
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${turno === "NOCHE" ? "active" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setTurno("NOCHE");
                                                        setIsTurnoOpen(false);
                                                    }}
                                                >
                                                    Noche
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {/* AULA */}
                                <label>
                                    Aula (Opcional)
                                    <input
                                        type="text"
                                        value={aula}
                                        onChange={(e) => setAula(e.target.value)}
                                        placeholder="Ej: Aula 101"
                                    />
                                </label>

                                {/* CAPACIDAD */}
                                <label>
                                    Capacidad Máxima *
                                    <input
                                        type="number"
                                        value={capacidad}
                                        onChange={(e) => setCapacidad(e.target.value)}
                                        min="1"
                                        max="100"
                                        required
                                    />
                                </label>
                            </div>

                            {/* FILA 3: Fechas, Semanas, DNI Profesor */}
                            <div className="form-area-datos-secciones">
                                <label>
                                    Fecha de Inicio *
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        required
                                    />
                                </label>

                                <label>
                                    Fecha de Fin *
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        required
                                    />
                                </label>

                                {/* SEMANAS - SOLO LECTURA */}
                                <label>
                                    Semanas de Clase *
                                    <input
                                        type="number"
                                        value={numeroSemanas}
                                        readOnly
                                        className="readonly-input"
                                        placeholder="Se calcula automáticamente"
                                    />
                                    <small className="codigo-preview">
                                        {semanasCalculadas > 0 ? (
                                            <>
                                                Se calcularon{" "}
                                                <strong>{semanasCalculadas} semanas</strong> entre las
                                                fechas seleccionadas
                                                {fechaInicio && (
                                                    <>
                                                        {" "}
                                                        (Inicio:{" "}
                                                        <strong>
                                                            {obtenerDiaSemana(fechaInicio)}
                                                        </strong>
                                                        )
                                                    </>
                                                )}
                                                <div className="text-warning">
                                                    <p>
                                                        Las semanas se calculan con la fecha{" "}
                                                        <strong>Inicio</strong> y <strong>Fin</strong>
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            "Selecciona las fechas de inicio y fin"
                                        )}
                                    </small>
                                </label>

                                {/* PROFESOR */}
                                <label>
                                    DNI del Profesor *
                                    <input
                                        type="text"
                                        value={profesorDni}
                                        onChange={(e) => setProfesorDni(e.target.value)}
                                        placeholder="Ej: 12345678"
                                        required
                                    />
                                    <small className="codigo-preview">
                                        Ingresa el DNI del profesor asignado
                                    </small>
                                </label>
                            </div>

                            {/* Error del formulario */}
                            {formError && (
                                <p className="form-error-message">{formError}</p>
                            )}

                            {/* BOTONES */}
                            <div className="form-buttons">
                                <button
                                    type="submit"
                                    className="btn-create"
                                    disabled={submittingSeccion}
                                >
                                    {submittingSeccion
                                        ? isEditMode
                                            ? "Guardando..."
                                            : "Creando..."
                                        : isEditMode
                                            ? "Guardar Cambios"
                                            : "Crear Sección"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-clear"
                                    onClick={limpiarFormularioSeccion}
                                    disabled={submittingSeccion}
                                >
                                    {isEditMode ? "Cancelar edición" : "Limpiar Formulario"}
                                </button>
                            </div>

                            {/* Nota informativa */}
                            <div className="info-note">
                                <p>
                                    <strong>Nota:</strong> El código de la sección se generará
                                    automáticamente al crearla.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* FILTROS Y ESTADÍSTICAS */}
            <div className="filtros-container-seccion">
                <div className="filtros-header-seccion">
                    <h4>
                        <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />
                        Filtros de Secciones
                    </h4>
                </div>

                {/* Filtros */}
                <div className="filters-grid">
                    <div>
                        <label>Buscar:</label>
                        <input
                            type="text"
                            placeholder="Nombre, código, curso o profesor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div>
                        <label>Nivel:</label>
                        <select
                            value={filtroNivel}
                            onChange={(e) => setFiltroNivel(e.target.value)}
                            className="filter-select"
                        >
                            <option value="TODOS">Todos los niveles</option>
                            <option value="INICIAL">Inicial</option>
                            <option value="PRIMARIA">Primaria</option>
                            <option value="SECUNDARIA">Secundaria</option>
                        </select>
                    </div>

                    <div>
                        <label>Turno:</label>
                        <select
                            value={filtroTurno}
                            onChange={(e) => setFiltroTurno(e.target.value)}
                            className="filter-select"
                        >
                            <option value="TODOS">Todos los turnos</option>
                            <option value="MAÑANA">Mañana</option>
                            <option value="TARDE">Tarde</option>
                            <option value="NOCHE">Noche</option>
                        </select>
                    </div>

                    <div>
                        <label>Estado:</label>
                        <select
                            value={filtroActiva}
                            onChange={(e) => setFiltroActiva(e.target.value)}
                            className="filter-select"
                        >
                            <option value="TODOS">Todos</option>
                            <option value="ACTIVA">Activas</option>
                            <option value="INACTIVA">Inactivas</option>
                        </select>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="stats-grid">
                    <div className="stat-card stat-total">
                        <h3>{secciones.length}</h3>
                        <p>Total Secciones</p>
                    </div>
                    <div className="stat-card stat-active">
                        <h3>{secciones.filter((s) => s.activa).length}</h3>
                        <p>Activas</p>
                    </div>
                    <div className="stat-card stat-available">
                        <h3>{secciones.filter((s) => s.tieneCupo).length}</h3>
                        <p>Con Cupo</p>
                    </div>
                    <div className="stat-card stat-students">
                        <h3>
                            {secciones.reduce(
                                (acc, s) => acc + (s.estudiantesMatriculados || 0),
                                0
                            )}
                        </h3>
                        <p>Estudiantes Totales</p>
                    </div>
                </div>

                {/* TABLA */}
                <div className="table-secciones-gestionsecciones">
                    {error ? (
                        <p className="no-results" style={{ color: "red" }}>
                            {error}
                        </p>
                    ) : seccionesFiltradas.length === 0 ? (
                        <p className="no-results">
                            No se encontraron secciones con los filtros aplicados
                        </p>
                    ) : (
                        <table className="styled-table-seccion">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Curso</th>
                                    <th>Nivel/Grado</th>
                                    <th>Turno</th>
                                    <th>Profesor</th>
                                    <th>Cupo</th>
                                    <th>Periodo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seccionesFiltradas.map((seccion) => (
                                    <tr key={seccion.id}>
                                        <td>{seccion.codigo}</td>
                                        <td>{seccion.nombre}</td>
                                        <td>
                                            <div className="curso-info">
                                                <strong>{seccion.codigoCurso}</strong>
                                                <span>{seccion.tituloCurso}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="nivel-grado-info">
                                                {seccion.nivelSeccion}
                                                <strong>{seccion.gradoSeccion}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge-turno badge-turno-${seccion.turno.toLowerCase()}`}
                                            >
                                                {seccion.turno}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="profesor-info">
                                                {seccion.nombreProfesor}
                                                <span>DNI: {seccion.dniProfesor}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cupo-info">
                                                <strong>
                                                    {seccion.estudiantesMatriculados || 0}/
                                                    {seccion.capacidad}
                                                </strong>
                                                <span
                                                    className={
                                                        seccion.tieneCupo ? "disponible" : "completo"
                                                    }
                                                >
                                                    {seccion.tieneCupo ? "✓ Disponible" : "✗ Completo"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="fecha-info">
                                            {formatDateLocal(seccion.fechaInicio)}
                                            <br />
                                            {formatDateLocal(seccion.fechaFin)}
                                            <br />
                                            <span className="semanas-badge">
                                                ({seccion.numeroSemanas}{" "}
                                                {seccion.numeroSemanas === 1
                                                    ? "semana"
                                                    : "semanas"}
                                                )
                                            </span>
                                        </td>
                                        <td>
                                            <div className="estado-table">
                                                <span
                                                    className={`badge-estado badge-${seccion.activa ? "activa" : "inactiva"
                                                        }`}
                                                >
                                                    {seccion.activa ? "Activa" : "Inactiva"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleEditClick(seccion)}
                                                    className="btn-edit"
                                                    title="Editar sección"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiva(seccion)}
                                                    className={
                                                        seccion.activa ? "btn-warning" : "btn-success"
                                                    }
                                                    title={seccion.activa ? "Desactivar" : "Activar"}
                                                >
                                                    {seccion.activa ? "Desactivar" : "Activar"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(seccion.id)}
                                                    className="btn-delete"
                                                    title="Eliminar sección"
                                                    disabled={seccion.estudiantesMatriculados > 0}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GestionSecciones;
