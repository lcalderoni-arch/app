// src/components/EditCursoModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../config/api.js';

export default function EditCursoModal({ isOpen, onClose, cursoToEdit, onCursoUpdated }) {
    // --- Estados del Formulario ---
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [nivelDestino, setNivelDestino] = useState('SECUNDARIA');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const tituloInputRef = useRef(null); 

    // --- Cargar datos del curso al abrir ---
    useEffect(() => {
        if (isOpen && cursoToEdit) {
            setTitulo(cursoToEdit.titulo || '');
            setDescripcion(cursoToEdit.descripcion || '');
            setNivelDestino(cursoToEdit.nivelDestino || 'SECUNDARIA');
            setError(null);
            setTimeout(() => tituloInputRef.current?.focus(), 0);
        }
    }, [isOpen, cursoToEdit]);

    if (!isOpen || !cursoToEdit) {
        return null;
    }

    // --- Manejo de Envío ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/cursos/crear`;
        
        const payload = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            nivelDestino: nivelDestino,
        };

        if (!payload.titulo || !payload.nivelDestino) {
            setError('Título y Nivel son obligatorios.');
            setLoading(false);
            return;
        }

        // Evitar peticiones si no hay cambios
        if (payload.titulo === cursoToEdit.titulo &&
            payload.descripcion === (cursoToEdit.descripcion || '') &&
            payload.nivelDestino === cursoToEdit.nivelDestino)
        {
            setError("No se realizaron cambios.");
            setLoading(false);
            return;
        }

        try {
            console.log('Enviando solicitud para actualizar curso:', payload);
            
            const response = await axios.put(url, payload, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            }); 
            
            console.log('Curso actualizado exitosamente:', response.data);
            onCursoUpdated(response.data);
            onClose(); 

        } catch (err) {
            console.error("Error al actualizar curso:", err);
            console.error("Detalles del error:", {
                message: err.message,
                response: err.response,
                status: err.response?.status,
                data: err.response?.data
            });
            
            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                
                if (status === 401) {
                    setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
                } else if (status === 403) {
                    setError("No tienes permisos de Administrador para editar cursos.");
                } else if (status === 404) {
                    setError("El curso no existe o fue eliminado.");
                } else if (status === 400 && errorData?.message) {
                    setError(errorData.message);
                } else if (status === 500) {
                    const errorMsg = errorData?.message || errorData?.error || "Error interno del servidor";
                    setError(`Error del servidor: ${errorMsg}`);
                } else if (errorData?.message) {
                    setError(errorData.message);
                } else {
                    setError(`Error del servidor: ${status}`);
                }
            } else if (err.request) {
                setError("No se pudo conectar con el servidor. Verifica tu conexión.");
            } else {
                setError("Ocurrió un error inesperado: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
            <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="edit-curso-title">
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
                <div className="modal-body">
                    <h2 id="edit-curso-title" className="modal-title">
                        Editar Curso
                    </h2>

                    <div style={{ 
                        fontSize: '0.9em', 
                        color: '#666', 
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span><strong>Código:</strong> {cursoToEdit.codigo}</span>
                        <span style={{ fontSize: '0.85em', color: '#999' }}>
                            (El código no se puede modificar)
                        </span>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <label>
                            Título del Curso*
                            <input 
                                ref={tituloInputRef} 
                                type="text" 
                                value={titulo} 
                                onChange={(e) => setTitulo(e.target.value)} 
                                placeholder="Ej: Matemática Básica"
                                required 
                            /> 
                        </label>
                        
                        <label>
                            Nivel de Destino*
                            <select 
                                value={nivelDestino} 
                                onChange={(e) => setNivelDestino(e.target.value)} 
                                required
                            >
                                <option value="INICIAL">Inicial</option>
                                <option value="PRIMARIA">Primaria</option>
                                <option value="SECUNDARIA">Secundaria</option>
                            </select>
                        </label>
                        
                        <label>
                            Descripción
                            <textarea 
                                value={descripcion} 
                                onChange={(e) => setDescripcion(e.target.value)} 
                                placeholder="Descripción opcional del curso"
                                rows="4"
                            /> 
                        </label>
                        
                        {error && (
                            <div className="auth-error" style={{ 
                                color: '#d32f2f', 
                                backgroundColor: '#ffebee',
                                padding: '12px',
                                borderRadius: '4px',
                                marginTop: '10px',
                                border: '1px solid #ef5350'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button 
                                type="submit" 
                                className="btn-submit" 
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-cancel" 
                                onClick={onClose} 
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}