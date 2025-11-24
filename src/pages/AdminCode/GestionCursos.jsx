// src/pages/GestionCursos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CreateCursoModal from '../../components/CreateCursoModal.jsx'; // (Lo crearemos abajo)
import EditCursoModal from '../../components/EditCursoModal.jsx'; // (Lo crearemos abajo)
import '../../styles/login/GestionUsuarios'; // (Reutilizamos los estilos de la tabla)

function GestionCursos() {
    // --- Estados ---
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados de Modales ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCurso, setEditingCurso] = useState(null); // El curso a editar

    const API_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/cursos'; // API que ya creamos en el backend

    // --- 1. Fetch de Cursos ---
    const fetchCursos = useCallback(async () => { 
        setLoading(true);
        setError(null);
        try {
            // (La cookie HttpOnly se envía automáticamente)
            const response = await axios.get(API_URL); 
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
    }, []);

    useEffect(() => {
        fetchCursos();
    }, [fetchCursos]);

    // --- 2. Eliminar Curso ---
    const handleDelete = async (cursoId, cursoTitulo) => {
        if (!window.confirm(`¿Eliminar el curso "${cursoTitulo}"?`)) return;
        setError(null);
        try {
            // (La cookie HttpOnly se envía automáticamente)
            await axios.delete(`${API_URL}/${cursoId}`);
            setCursos(current => current.filter(curso => curso.id !== cursoId));
            alert(`Curso "${cursoTitulo}" eliminado.`);
        } catch (err) {
            console.error(`Error al eliminar ${cursoId}:`, err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("No tienes permisos para eliminar cursos.");
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Ej. "El curso tiene secciones"
            } else {
                setError(err.message || "Error al eliminar."); 
            }
        }
    };

    // --- 3. Manejo de Modales (Callbacks) ---
    const handleEdit = (curso) => {
        setEditingCurso(curso); 
        setIsEditModalOpen(true); 
    };

    const handleCursoUpdated = (cursoActualizado) => {
        // Reemplaza el curso en la lista con la versión actualizada
        setCursos(currentCursos => 
            currentCursos.map(c => 
                c.id === cursoActualizado.id ? cursoActualizado : c
            )
        );
        alert(`Curso "${cursoActualizado.titulo}" actualizado.`); 
    };

    const handleCursoCreated = (nuevoCurso) => {
        // Añade el nuevo curso al inicio de la lista
        setCursos(currentCursos => [nuevoCurso, ...currentCursos]); 
        alert(`Curso "${nuevoCurso.titulo}" creado.`);
    };

    // --- Renderizado Principal ---
    if (loading && cursos.length === 0) return <p>Cargando lista de cursos...</p>; 
    if (error && cursos.length === 0) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="gestion-usuarios-container"> {/* Reutiliza CSS */}
            <h2>Gestión de Cursos</h2>
            <p>Administra los cursos base de la plataforma.</p>
            
            <button 
                className="btn-create" 
                style={{ marginBottom: '15px' }}
                onClick={() => setIsCreateModalOpen(true)}
            >
                + Crear Nuevo Curso
            </button>

            {error && <p className="status-message error">Error: {error}</p>}
            {loading && <p className="status-message loading">Actualizando lista...</p>}
            
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Título</th>
                        <th>Nivel</th>
                        {/* <th>Grado</th> // Eliminamos Grado */}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {
                    cursos.length > 0 ? (
                        cursos.map(curso => (
                            <tr key={curso.id}>
                                <td>{curso.id}</td>
                                <td>{curso.codigo}</td>
                                <td>{curso.titulo}</td>
                                <td>{curso.nivelDestino}</td>
                                {/* <td>{curso.gradoDestino}</td> // Eliminamos Grado */}
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(curso)}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(curso.id, curso.titulo)}>Eliminar</button> 
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5">{error ? 'Error al cargar cursos.' : 'No hay cursos registrados.'}</td></tr>
                    )
                }
                </tbody>
            </table>

            {/* --- Modales --- */}
            <CreateCursoModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCursoCreated={handleCursoCreated}
            />

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