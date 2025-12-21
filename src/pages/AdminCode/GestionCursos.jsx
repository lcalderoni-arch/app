// src/pages/GestionCursos.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";

import { API_ENDPOINTS, API_BASE_URL } from "../../config/api.js";
import { api } from "../../api/api"; // ✅ NUEVO
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionCursos.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faBookOpen,
    faTable,
    faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

function GestionCursos() {
    // --- Estados de la lista de cursos ---
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isNivelOpen, setIsNivelOpen] = useState(false);
    const nivelSelectRef = useRef(null);

    // --- Estados del formulario (crear / editar) ---
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [nivelDestino, setNivelDestino] = useState("");
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // --- Modo edición ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCurso, setEditingCurso] = useState(null);
    const formRef = useRef(null);

    const API_URL = API_ENDPOINTS.cursos;

    // --- Cerrar dropdown al hacer click fuera ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (nivelSelectRef.current && !nivelSelectRef.current.contains(event.target)) {
                setIsNivelOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- 1. Fetch de Cursos ---
    const fetchCursos = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(API_URL);
            setCursos(response.data);
        } catch (err) {
            console.error("Error al obtener cursos:", err);

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("No tienes permisos para ver los cursos.");
            } else {
                setError(err.message || "Error al cargar datos.");
            }
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchCursos();
    }, [fetchCursos]);

    // --- 2. Eliminar Curso ---
    const handleDelete = async (cursoId, cursoTitulo) => {
        if (!window.confirm(`¿Eliminar el curso "${cursoTitulo}"?`)) return;

        setError(null);

        try {
            await api.delete(`${API_URL}/${cursoId}`);

            setCursos((current) => current.filter((curso) => curso.id !== cursoId));
            alert(`Curso "${cursoTitulo}" eliminado.`);

            if (isEditMode && editingCurso && editingCurso.id === cursoId) {
                limpiarFormularioCurso();
            }
        } catch (err) {
            console.error(`Error al eliminar ${cursoId}:`, err);

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("No tienes permisos para eliminar cursos.");
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || "Error al eliminar.");
            }
        }
    };

    // --- 3. Editar: pasar datos al formulario ---
    const handleEdit = (curso) => {
        setIsEditMode(true);
        setEditingCurso(curso);
        setTitulo(curso.titulo || "");
        setDescripcion(curso.descripcion || "");
        setNivelDestino(curso.nivelDestino || "");
        setFormError(null);

        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleCursoActualizadoEnLista = (cursoActualizado) => {
        setCursos((currentCursos) =>
            currentCursos.map((c) => (c.id === cursoActualizado.id ? cursoActualizado : c))
        );
    };

    // --- Limpiar formulario (y salir de modo edición) ---
    const limpiarFormularioCurso = () => {
        setTitulo("");
        setDescripcion("");
        setNivelDestino("");
        setFormError(null);
        setIsEditMode(false);
        setEditingCurso(null);
    };

    // --- Enviar formulario: Crear o Editar ---
    const handleSubmitCurso = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        if (!titulo.trim() || !nivelDestino) {
            setFormError("Título y Nivel son obligatorios.");
            setSubmitting(false);
            return;
        }

        const payload = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            nivelDestino: nivelDestino,
        };

        try {
            // MODO CREAR
            if (!isEditMode) {
                const url = `${API_BASE_URL}/cursos`; // este endpoint lo dejas tal cual lo tenías
                const response = await api.post(url, payload);

                setCursos((current) => [response.data, ...current]);
                alert(`Curso "${response.data.titulo}" creado correctamente.`);
                limpiarFormularioCurso();
            }
            // MODO EDITAR
            else if (isEditMode && editingCurso) {
                const url = `${API_BASE_URL}/cursos/${editingCurso.id}`;

                if (
                    payload.titulo === (editingCurso.titulo || "") &&
                    payload.descripcion === (editingCurso.descripcion || "") &&
                    payload.nivelDestino === editingCurso.nivelDestino
                ) {
                    setFormError("No se realizaron cambios.");
                    setSubmitting(false);
                    return;
                }

                const response = await api.put(url, payload);

                handleCursoActualizadoEnLista(response.data);
                alert(`Curso "${response.data.titulo}" actualizado correctamente.`);
                limpiarFormularioCurso();
            }
        } catch (err) {
            console.error("❌ Error al guardar curso:", err);

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 401) {
                    setFormError("No estás autenticado. Por favor, inicia sesión nuevamente.");
                } else if (status === 403) {
                    setFormError("No tienes permisos de Administrador para gestionar cursos.");
                } else if (status === 400 && errorData?.message) {
                    setFormError(errorData.message);
                } else if (status === 500) {
                    const errorMsg = errorData?.message || errorData?.error || "Error interno del servidor";
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
            setSubmitting(false);
        }
    };

    // --- Renderizado Principal ---
    if (loading && cursos.length === 0) return <p>Cargando lista de cursos...</p>;
    if (error && cursos.length === 0) return <p style={{ color: "red" }}>Error: {error}</p>;

    return (
        <div className="general-box-gestionusuarios">
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionusuarios">
                <div className="alinear-al-centro">
                    <h2>
                        <FontAwesomeIcon className="icon" icon={faBookOpen} />
                        Gestión de Cursos
                    </h2>
                </div>
                <p>Administra los cursos registrados en la plataforma.</p>

                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {loading && <p>Actualizando lista...</p>}
            </div>

            {/* FORMULARIO CREAR / EDITAR */}
            <div className="box-formulario-gestioncursos" ref={formRef}>
                <div className="centrar-tercer-titulo">
                    <h3>
                        <FontAwesomeIcon className="icon" icon={faSquarePlus} />
                        {isEditMode ? "Editar Curso" : "Crear Nuevo Curso"}
                    </h3>
                    <p>
                        {isEditMode
                            ? "Modifica los datos del curso seleccionado y guarda los cambios."
                            : "Complete los campos para registrar un nuevo curso en el sistema."}
                    </p>
                </div>

                <form className="auth-form-gestioncursos" onSubmit={handleSubmitCurso}>
                    <div className="auth-form-gestioncursos-area-form">
                        <div className="auth-form-area-form">
                            <div className="form-area-datos-cursos">
                                {/* TÍTULO */}
                                <label>
                                    Título del Curso
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        placeholder="Ej: Matemática Básica"
                                        required
                                    />
                                </label>

                                {/* NIVEL DE DESTINO */}
                                <label>
                                    Nivel
                                    <div className="nivel-select-container" ref={nivelSelectRef}>
                                        <div
                                            className={`nivel-select-trigger ${nivelDestino !== "" ? "selected" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsNivelOpen(!isNivelOpen);
                                            }}
                                        >
                                            <span>
                                                {nivelDestino === ""
                                                    ? "Elige un nivel..."
                                                    : nivelDestino === "INICIAL"
                                                        ? "Inicial"
                                                        : nivelDestino === "PRIMARIA"
                                                            ? "Primaria"
                                                            : "Secundaria"}
                                            </span>
                                            <FontAwesomeIcon className="icon-increment" icon={faAngleDown} />
                                        </div>

                                        {isNivelOpen && (
                                            <div className="nivel-select-dropdown">
                                                <div
                                                    className={`nivel-select-option ${nivelDestino === "INICIAL" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setNivelDestino("INICIAL");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Inicial
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelDestino === "PRIMARIA" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setNivelDestino("PRIMARIA");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Primaria
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelDestino === "SECUNDARIA" ? "active" : ""}`}
                                                    onClick={() => {
                                                        setNivelDestino("SECUNDARIA");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Secundaria
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <small className="codigo-preview">
                                        {nivelDestino === "INICIAL" && "El código será: INI-XXX"}
                                        {nivelDestino === "PRIMARIA" && "El código será: PRI-XXX"}
                                        {nivelDestino === "SECUNDARIA" && "El código será: SEC-XXX"}
                                        {nivelDestino === "" && "Selecciona un nivel para ver el código sugerido"}
                                    </small>
                                </label>
                            </div>

                            <div className="form-area-description">
                                {/* DESCRIPCIÓN */}
                                <label>
                                    Descripción (Opcional)
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Descripción del curso, objetivos, contenido..."
                                        rows={4}
                                    />
                                </label>
                            </div>

                            {formError && <p className="form-error-message">{formError}</p>}

                            <div className="form-buttons">
                                <button type="submit" className="btn-create" disabled={submitting}>
                                    {submitting
                                        ? isEditMode
                                            ? "Guardando..."
                                            : "Creando..."
                                        : isEditMode
                                            ? "Guardar Cambios"
                                            : "Crear Curso"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-clear"
                                    onClick={limpiarFormularioCurso}
                                    disabled={submitting}
                                >
                                    {isEditMode ? "Cancelar edición" : "Limpiar Formulario"}
                                </button>
                            </div>

                            <div className="info-note">
                                <p>
                                    <strong>Nota:</strong> El código del curso se genera automáticamente
                                    según el nivel seleccionado (INI-XXX, PRI-XXX, SEC-XXX).
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* TABLA DE CURSOS */}
            <div className="filtros-container">
                <div className="filtros-header">
                    <h4>
                        <FontAwesomeIcon className="icon" icon={faTable} />
                        Tabla de Cursos
                    </h4>
                </div>

                <div className="table-users-gestioncursos">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>ID Sistema</th>
                                <th>Código</th>
                                <th>Título</th>
                                <th>Nivel</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.length > 0 ? (
                                cursos.map((curso, index) => (
                                    <tr key={curso.id}>
                                        <td>{index + 1}</td>
                                        <td>{curso.id}</td>
                                        <td>
                                            <span className="codigo-badge">{curso.codigo}</span>
                                        </td>
                                        <td>
                                            <span className="titulo-badge">{curso.titulo}</span>
                                        </td>
                                        <td>
                                            <span className={`badge-rol badge-${curso.nivelDestino.toLowerCase()}`}>
                                                {curso.nivelDestino}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-edit" onClick={() => handleEdit(curso)}>
                                                Editar
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(curso.id, curso.titulo)}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        {error ? "Error al cargar cursos." : "No hay cursos registrados."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default GestionCursos;
