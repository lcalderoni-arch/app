// src/pages/GestionSecciones.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";    
import axios from 'axios';

import { API_ENDPOINTS, API_BASE_URL } from "../../config/api.js";
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionSecciones.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faBookOpen,
    faMagnifyingGlass,
    faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

import EditSeccionModal from "../../components/EditSeccionModal.jsx";

function GestionSecciones() {
    // --- Estados de la lista de secciones ---
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados del Modal de Edición ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [seccionToEdit, setSeccionToEdit] = useState(null);

    // --- Estados para filtros ---
    const [filtroNivel, setFiltroNivel] = useState("TODOS");
    const [filtroTurno, setFiltroTurno] = useState("TODOS");
    const [filtroActiva, setFiltroActiva] = useState("TODOS");
    const [searchTerm, setSearchTerm] = useState("");

    // --- ⭐ ESTADOS DEL FORMULARIO DE CREACIÓN ---
    const [nombre, setNombre] = useState("");
    const [nivelSeccion, setNivelSeccion] = useState("");
    const [gradoSeccion, setGradoSeccion] = useState("");
    const [turno, setTurno] = useState("");
    const [aula, setAula] = useState("");
    const [capacidad, setCapacidad] = useState(30);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [cursoId, setCursoId] = useState("");
    const [profesorDni, setProfesorDni] = useState("");

    const [cursos, setCursos] = useState([]);
    const [formError, setFormError] = useState(null);
    const [creatingSeccion, setCreatingSeccion] = useState(false);
    const [loadingCursos, setLoadingCursos] = useState(false);

    // --- Refs para dropdowns ---
    const [isNivelOpen, setIsNivelOpen] = useState(false);
    const [isTurnoOpen, setIsTurnoOpen] = useState(false);
    const nivelSelectRef = useRef(null);
    const turnoSelectRef = useRef(null);

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
            setError("No se pudieron cargar las secciones");
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

    // --- Limpiar formulario ---
    const limpiarFormularioSeccion = () => {
        setNombre("");
        setNivelSeccion("");
        setGradoSeccion("");
        setTurno("");
        setAula("");
        setCapacidad(30);
        setFechaInicio("");
        setFechaFin("");
        setCursoId("");
        setProfesorDni("");
        setFormError(null);
    };

    // --- Crear sección ---
    const handleCreateSeccion = async (e) => {
        e.preventDefault();
        setCreatingSeccion(true);
        setFormError(null);

        // Validaciones
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
            setCreatingSeccion(false);
            return;
        }

        const capacidadNum = parseInt(capacidad);
        if (capacidadNum < 1 || capacidadNum > 100) {
            setFormError("La capacidad debe estar entre 1 y 100");
            setCreatingSeccion(false);
            return;
        }

        const payload = {
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

        console.log("📤 Enviando payload de sección:", payload);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Sesión expirada.");

            const url = `${API_BASE_URL}/secciones`;

            const response = await axios.post(url, payload, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setSecciones((current) => [response.data, ...current]);
            alert(`Sección "${response.data.nombre}" creada correctamente.`);
            limpiarFormularioSeccion();
        } catch (err) {
            console.error("❌ Error al crear sección:", err);

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 401) {
                    setFormError("No estás autenticado. Por favor, inicia sesión nuevamente.");
                } else if (status === 403) {
                    setFormError("No tienes permisos para crear secciones.");
                } else if (status === 400 && errorData?.message) {
                    setFormError(errorData.message);
                } else if (status === 500) {
                    const errorMsg = errorData?.message || "Error interno del servidor";
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
            setCreatingSeccion(false);
        }
    };

    // --- Filtrar secciones ---
    const seccionesFiltradas = secciones.filter((seccion) => {
        const coincideNivel = filtroNivel === "TODOS" || seccion.nivelSeccion === filtroNivel;
        const coincideTurno = filtroTurno === "TODOS" || seccion.turno === filtroTurno;
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

    // --- Handlers ---
    const handleEdit = (seccion) => {
        setSeccionToEdit(seccion);
        setShowEditModal(true);
    };

    const handleSeccionUpdated = (seccionActualizada) => {
        setSecciones(secciones.map((s) => (s.id === seccionActualizada.id ? seccionActualizada : s)));
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
        } catch (err) {
            console.error("Error al eliminar sección:", err);
            const errorMsg = err.response?.data?.message || "No se pudo eliminar la sección";
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
                secciones.map((s) => (s.id === seccion.id ? { ...s, activa: !s.activa } : s))
            );

            alert(`Sección ${accion}da exitosamente`);
        } catch (err) {
            console.error(`Error al ${accion} sección:`, err);
            const errorMsg = err.response?.data?.message || `No se pudo ${accion} la sección`;
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
                        <FontAwesomeIcon className="icon" icon={faBookOpen} />
                        Gestión de Secciones
                    </h2>
                </div>
                <p>Administra y asigna las secciones en la plataforma.</p>

                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {loading && <p>Actualizando lista...</p>}
            </div>

            {/* FORMULARIO DE CREACIÓN */}
            <div className="box-formulario-gestionsecciones">
                <div className="centrar-tercer-titulo">
                    <h3>
                        <FontAwesomeIcon className="icon" icon={faSquarePlus} />
                        Crear Nueva Sección
                    </h3>
                    <p>Complete los campos para registrar una nueva sección en el sistema</p>
                </div>

                <form className="auth-form-gestionsecciones" onSubmit={handleCreateSeccion}>
                    <div className="auth-form-gestionsecciones-area-form">
                        <div className="auth-form-area-form">
                            {/* FILA 1: Nombre */}
                            <div className="form-area-datos-full">
                                {/* CURSO - SELECT NORMAL */}
                                <label>
                                    Curso *
                                    <select
                                        value={cursoId}
                                        onChange={(e) => setCursoId(e.target.value)}
                                        required
                                        disabled={loadingCursos}
                                    >
                                        <option value="">
                                            {loadingCursos ? "Cargando cursos..." : "Selecciona un curso"}
                                        </option>
                                        {cursos.map((curso) => (
                                            <option key={curso.id} value={curso.id}>
                                                {curso.codigo} - {curso.titulo} ({curso.nivelDestino})
                                            </option>
                                        ))}
                                    </select>
                                </label>
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
                                {/* NIVEL - DROPDOWN PERSONALIZADO */}
                                <label>
                                    Nivel *
                                    <div className="nivel-select-container" ref={nivelSelectRef}>
                                        <div
                                            className={`nivel-select-trigger ${nivelSeccion !== "" ? "selected" : ""}`}
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
                                            <FontAwesomeIcon className="icon-increment" icon={faAngleDown} />
                                        </div>

                                        {isNivelOpen && (
                                            <div className="nivel-select-dropdown">
                                                <div
                                                    className={`nivel-select-option ${nivelSeccion === "INICIAL" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setNivelSeccion("INICIAL");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Inicial
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelSeccion === "PRIMARIA" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setNivelSeccion("PRIMARIA");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Primaria
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelSeccion === "SECUNDARIA" ? "active" : ""}`}
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

                            {/* FILA 2: Nivel y Grado */}
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
                            </div>

                            {/* FILA 3: Turno y Aula */}
                            <div className="form-area-datos-secciones">
                                {/* TURNO - DROPDOWN PERSONALIZADO */}
                                <label>
                                    Turno *
                                    <div className="nivel-select-container" ref={turnoSelectRef}>
                                        <div
                                            className={`nivel-select-trigger ${turno !== "" ? "selected" : ""}`}
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
                                            <FontAwesomeIcon className="icon-increment" icon={faAngleDown} />
                                        </div>

                                        {isTurnoOpen && (
                                            <div className="nivel-select-dropdown">
                                                <div
                                                    className={`nivel-select-option ${turno === "MAÑANA" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setTurno("MAÑANA");
                                                        setIsTurnoOpen(false);
                                                    }}
                                                >
                                                    Mañana
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${turno === "TARDE" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setTurno("TARDE");
                                                        setIsTurnoOpen(false);
                                                    }}
                                                >
                                                    Tarde
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${turno === "NOCHE" ? "active" : ""}`}
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
                            </div>

                            {/* FILA 4: Capacidad, Fecha Inicio, Fecha Fin */}
                            <div className="form-area-datos-triple">
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
                            </div>

                            {/* FILA 5: Curso y DNI Profesor */}
                            <div className="form-area-datos-secciones">
                                {/* DNI PROFESOR */}
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
                            {formError && <p className="form-error-message">{formError}</p>}

                            {/* BOTONES */}
                            <div className="form-buttons">
                                <button type="submit" className="btn-create" disabled={creatingSeccion}>
                                    {creatingSeccion ? "Creando..." : "Crear Sección"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-clear"
                                    onClick={limpiarFormularioSeccion}
                                    disabled={creatingSeccion}
                                >
                                    Limpiar Formulario
                                </button>
                            </div>

                            {/* Nota informativa */}
                            <div className="info-note">
                                <p>
                                    <strong>Nota:</strong> El código de la sección se generará automáticamente
                                    al crearla.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* FILTROS Y ESTADÍSTICAS */}
            <div className="filtros-container">
                <div className="filtros-header">
                    <h4>
                        <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />
                        Lista de Secciones Registradas
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
                            {secciones.reduce((acc, s) => acc + (s.estudiantesMatriculados || 0), 0)}
                        </h3>
                        <p>Estudiantes Totales</p>
                    </div>
                </div>

                {/* TABLA */}
                <div className="table-secciones-gestionsecciones">
                    {seccionesFiltradas.length === 0 ? (
                        <p className="no-results">No se encontraron secciones con los filtros aplicados</p>
                    ) : (
                        <table className="styled-table">
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
                                        <td>
                                            <strong>{seccion.codigo}</strong>
                                        </td>
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
                                                    {seccion.estudiantesMatriculados || 0}/{seccion.capacidad}
                                                </strong>
                                                <span className={seccion.tieneCupo ? "disponible" : "completo"}>
                                                    {seccion.tieneCupo ? "✓ Disponible" : "✗ Completo"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="fecha-info">
                                            {new Date(seccion.fechaInicio).toLocaleDateString()}
                                            <br />
                                            {new Date(seccion.fechaFin).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span className={`badge-estado badge-${seccion.activa ? "activa" : "inactiva"}`}>
                                                {seccion.activa ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleEdit(seccion)}
                                                    className="btn-edit"
                                                    title="Editar sección"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiva(seccion)}
                                                    className={seccion.activa ? "btn-warning" : "btn-success"}
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

            {/* Modal de Edición */}
            <EditSeccionModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSeccionToEdit(null);
                }}
                seccionToEdit={seccionToEdit}
                onSeccionUpdated={handleSeccionUpdated}
            />
        </div>
    );
}

export default GestionSecciones;