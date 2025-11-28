// src/pages/GestionCursos.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";

import { API_ENDPOINTS, API_BASE_URL } from "../../config/api.js";
import icon from "../../assets/logo.png";

// Importa los estilos CSS
import "../../styles/RolesStyle/AdminStyle/GestionCursos.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faBookOpen,
    faMagnifyingGlass,
    faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

import EditCursoModal from "../../components/EditCursoModal.jsx";

function GestionCursos() {
    // --- Estados de la lista de cursos ---
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isNivelOpen, setIsNivelOpen] = useState(false);
    const nivelSelectRef = useRef(null);

    // --- Estados del Modal de Edición ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCurso, setEditingCurso] = useState(null);

    // --- ⭐ NUEVOS ESTADOS para el formulario de creación ---
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [nivelDestino, setNivelDestino] = useState("");
    const [formError, setFormError] = useState(null);
    const [creatingCurso, setCreatingCurso] = useState(false);

    const API_URL = API_ENDPOINTS.cursos;

    // --- AGREGAR: useEffect para cerrar dropdown al hacer click fuera ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                nivelSelectRef.current &&
                !nivelSelectRef.current.contains(event.target)
            ) {
                setIsNivelOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- 1. Fetch de Cursos ---
    const fetchCursos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(API_URL, config);
            setCursos(response.data);
        } catch (err) {
            console.error("Error al obtener cursos:", err);
            if (
                err.response &&
                (err.response.status === 401 || err.response.status === 403)
            ) {
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
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Sesión expirada.");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.delete(`${API_URL}/${cursoId}`, config);
            setCursos((current) => current.filter((curso) => curso.id !== cursoId));
            alert(`Curso "${cursoTitulo}" eliminado.`);
        } catch (err) {
            console.error(`Error al eliminar ${cursoId}:`, err);
            if (
                err.response &&
                (err.response.status === 401 || err.response.status === 403)
            ) {
                setError("No tienes permisos para eliminar cursos.");
            } else if (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) {
                setError(err.response.data.message);
            } else {
                setError(err.message || "Error al eliminar.");
            }
        }
    };

    // --- 3. Manejo de Modal de Edición ---
    const handleEdit = (curso) => {
        setEditingCurso(curso);
        setIsEditModalOpen(true);
    };

    const handleCursoUpdated = (cursoActualizado) => {
        setCursos((currentCursos) =>
            currentCursos.map((c) =>
                c.id === cursoActualizado.id ? cursoActualizado : c
            )
        );
        alert(`Curso "${cursoActualizado.titulo}" actualizado.`);
    };

    // --- ⭐ NUEVA FUNCIÓN: Limpiar formulario ---
    const limpiarFormularioCurso = () => {
        setTitulo("");
        setDescripcion("");
        setNivelDestino(""); // CORREGIDO: Limpiar estado unificado
        setFormError(null);
    };

    // --- ⭐ NUEVA FUNCIÓN: Crear curso ---
    const handleCreateCurso = async (e) => {
        e.preventDefault();
        setCreatingCurso(true);
        setFormError(null);

        // ✅ VALIDACIÓN: Campos obligatorios
        if (!titulo.trim() || !nivelDestino) {
            setFormError("Título y Nivel son obligatorios.");
            setCreatingCurso(false);
            return;
        }

        // ✅ Construir payload
        const payload = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            nivelDestino: nivelDestino, // ⭐ Usa el estado unificado
        };

        console.log("📤 Enviando payload de curso:", payload);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Sesión expirada.");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const url = `${API_BASE_URL}/cursos`;
            const response = await axios.post(url, payload, config);

            // ✅ Agregar curso a la lista
            setCursos((current) => [response.data, ...current]);
            alert(`Curso "${response.data.titulo}" creado correctamente.`);

            // ✅ Limpiar formulario
            limpiarFormularioCurso();
        } catch (err) {
            console.error("❌ Error al crear curso:", err);

            if (err.response) {
                console.log("📊 Status:", err.response.status);
                console.log("📦 Data:", err.response.data);

                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 401) {
                    setFormError(
                        "No estás autenticado. Por favor, inicia sesión nuevamente."
                    );
                } else if (status === 403) {
                    setFormError(
                        "No tienes permisos de Administrador para crear cursos."
                    );
                } else if (status === 400 && errorData?.message) {
                    setFormError(errorData.message);
                } else if (status === 500) {
                    const errorMsg =
                        errorData?.message ||
                        errorData?.error ||
                        "Error interno del servidor";
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
            setCreatingCurso(false);
        }
    };

    // --- Renderizado Principal ---
    if (loading && cursos.length === 0) return <p>Cargando lista de cursos...</p>;
    if (error && cursos.length === 0)
        return <p style={{ color: "red" }}>Error: {error}</p>;

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

                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {loading && <p>Actualizando lista...</p>}
            </div>

            {/* FORMULARIO DE CREACIÓN */}
            <div className="box-formulario-gestionusuarios">
                <div className="centrar-tercer-titulo">
                    <h3>
                        <FontAwesomeIcon className="icon" icon={faSquarePlus} />
                        Crear Nuevo Curso
                    </h3>
                    <p>Complete los campos para registrar un nuevo curso en el sistema</p>
                </div>

                <form className="auth-form-gestioncursos" onSubmit={handleCreateCurso}>
                    <div className='auth-form-gestioncursos-area-form'>
                        <div className="auth-form-area-form">
                            <div className='form-area-datos-cursos'>
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

                                {/* NIVEL DE DESTINO - DROPDOWN PERSONALIZADO */}
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
                                                    className={`nivel-select-option ${nivelDestino === 'INICIAL' ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setNivelDestino("INICIAL");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Inicial
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelDestino === 'PRIMARIA' ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setNivelDestino("PRIMARIA");
                                                        setIsNivelOpen(false);
                                                    }}
                                                >
                                                    Primaria
                                                </div>
                                                <div
                                                    className={`nivel-select-option ${nivelDestino === 'SECUNDARIA' ? 'active' : ''}`}
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
                                        {nivelDestino === 'INICIAL' && '📚 El código será: INI-XXX'}
                                        {nivelDestino === 'PRIMARIA' && '📚 El código será: PRI-XXX'}
                                        {nivelDestino === 'SECUNDARIA' && '📚 El código será: SEC-XXX'}
                                        {nivelDestino === '' && '📚 Selecciona un nivel para ver el código'}
                                    </small>
                                </label>
                            </div>

                            <div className='form-area-description'>
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

                            {/* Error del formulario */}
                            {formError && (
                                <p className="form-error-message">
                                    {formError}
                                </p>
                            )}

                            {/* BOTONES */}
                            <div className="form-buttons">
                                <button
                                    type="submit"
                                    className="btn-create"
                                    disabled={creatingCurso}
                                >
                                    {creatingCurso ? 'Creando...' : 'Crear Curso'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-clear"
                                    onClick={limpiarFormularioCurso}
                                    disabled={creatingCurso}
                                >
                                    Limpiar Formulario
                                </button>
                            </div>

                            {/* Nota informativa */}
                            <div className="info-note">
                                <p><strong>Nota:</strong> El código del curso se generará automáticamente según el nivel seleccionado (INI-XXX, PRI-XXX, SEC-XXX).</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* TABLA DE CURSOS */}
            <div className="filtros-container">
                <div className="filtros-header">
                    <h4>
                        <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />
                        Filtro de Busqueda
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
                                            <span className="codigo-badge">
                                                {curso.codigo}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="titulo-badge">
                                                {curso.titulo}
                                            </span>
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
                                    <td colSpan="6" style={{ textAlign: 'center' }}>
                                        {error ? 'Error al cargar cursos.' : 'No hay cursos registrados.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Edición */}
            <EditCursoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                cursoToEdit={editingCurso}
                onCursoUpdated={handleCursoUpdated}
            />
        </div>
    );
}

export default GestionCursos;
