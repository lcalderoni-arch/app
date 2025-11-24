// src/pages/GestionSecciones.jsx
// src/pages/GestionSecciones.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateSeccionModal from '../../components/CreateSeccionModal';
import EditSeccionModal from '../../components/EditSeccionModal';
import '../../styles/login/GestionUsuarios.css'; // Reutilizamos los mismos estilos

import { API_ENDPOINTS } from '../../config/api.js';

export default function GestionSecciones() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [seccionToEdit, setSeccionToEdit] = useState(null);

    // Estados para filtros
    const [filtroNivel, setFiltroNivel] = useState('TODOS');
    const [filtroTurno, setFiltroTurno] = useState('TODOS');
    const [filtroActiva, setFiltroActiva] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = API_ENDPOINTS.secciones;

    // Cargar secciones al montar el componente
    const cargarSecciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No estás autenticado.');
            
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            
            const response = await axios.get(API_URL, config);
            console.log('Secciones cargadas:', response.data);
            setSecciones(response.data);
        } catch (err) {
            console.error('Error al cargar secciones:', err);
            setError('No se pudieron cargar las secciones');
        } finally {
            setLoading(false);
        }
    }, [API_URL]); // Agregar API_URL como dependencia



    // agregar cargarSecciones en las dependencias
    useEffect(() => {
        cargarSecciones();
    }, [cargarSecciones]); // Agregar cargarSecciones



    // Filtrar secciones
    const seccionesFiltradas = secciones.filter((seccion) => {
        const coincideNivel = filtroNivel === 'TODOS' || seccion.nivelSeccion === filtroNivel;
        const coincideTurno = filtroTurno === 'TODOS' || seccion.turno === filtroTurno;
        const coincideActiva = filtroActiva === 'TODOS' ||
            (filtroActiva === 'ACTIVA' ? seccion.activa : !seccion.activa);
        const coincideBusqueda =
            seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.nombreProfesor.toLowerCase().includes(searchTerm.toLowerCase());

        return coincideNivel && coincideTurno && coincideActiva && coincideBusqueda;
    });

    // Handlers
    const handleSeccionCreated = (nuevaSeccion) => {
        setSecciones([nuevaSeccion, ...secciones]); // Añadir al principio
    };

    const handleSeccionUpdated = (seccionActualizada) => {
        setSecciones(secciones.map(s =>
            s.id === seccionActualizada.id ? seccionActualizada : s
        ));
    };

    const handleEdit = (seccion) => {
        setSeccionToEdit(seccion);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta sección?')) {
            return;
        }

        try {
            // ⭐ AGREGAR TOKEN
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Sesión expirada.');

            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            await axios.delete(`${API_URL}/${id}`, config);
            setSecciones(secciones.filter(s => s.id !== id));
            alert('Sección eliminada exitosamente');
        } catch (err) {
            console.error('Error al eliminar sección:', err);
            const errorMsg = err.response?.data?.message || 'No se pudo eliminar la sección';
            alert(errorMsg);
        }
    };

    const handleToggleActiva = async (seccion) => {
        const accion = seccion.activa ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Estás seguro de ${accion} esta sección?`)) {
            return;
        }

        try {
            // ⭐ AGREGAR TOKEN
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Sesión expirada.');

            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const endpoint = seccion.activa ? 'desactivar' : 'activar';
            await axios.patch(`${API_URL}/${seccion.id}/${endpoint}`, {}, config);

            setSecciones(secciones.map(s =>
                s.id === seccion.id ? { ...s, activa: !s.activa } : s
            ));

            alert(`Sección ${accion}da exitosamente`);
        } catch (err) {
            console.error(`Error al ${accion} sección:`, err);
            const errorMsg = err.response?.data?.message || `No se pudo ${accion} la sección`;
            alert(errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="gestion-container">
                <h1>Gestión de Secciones</h1>
                <p>Cargando secciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gestion-container">
                <h1>Gestión de Secciones</h1>
                <div className="error-message">{error}</div>
                <button onClick={cargarSecciones} className="btn-primary">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="gestion-container">
            <div className="gestion-header">
                <h1>Gestión de Secciones</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                >
                    + Nueva Sección
                </button>
            </div>

            {/* Filtros */}
            <div className="filters-container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div>
                    <label>Buscar:</label>
                    <input
                        type="text"
                        placeholder="Nombre, código, curso o profesor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div>
                    <label>Nivel:</label>
                    <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ACTIVA">Activas</option>
                        <option value="INACTIVA">Inactivas</option>
                    </select>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1976d2' }}>
                        {secciones.length}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Secciones</p>
                </div>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#388e3c' }}>
                        {secciones.filter(s => s.activa).length}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Activas</p>
                </div>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#f57c00' }}>
                        {secciones.filter(s => s.tieneCupo).length}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Con Cupo</p>
                </div>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fce4ec',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#c2185b' }}>
                        {secciones.reduce((acc, s) => acc + (s.estudiantesMatriculados || 0), 0)}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Estudiantes Totales</p>
                </div>
            </div>

            {/* Tabla de secciones */}
            <div className="table-container">
                {seccionesFiltradas.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No se encontraron secciones con los filtros aplicados
                    </p>
                ) : (
                    <table className="users-table">
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
                                        <div style={{ fontSize: '0.9em' }}>
                                            <strong>{seccion.codigoCurso}</strong>
                                            <br />
                                            <span style={{ color: '#666' }}>{seccion.tituloCurso}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9em' }}>
                                            {seccion.nivelSeccion}
                                            <br />
                                            <strong>{seccion.gradoSeccion}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85em',
                                            backgroundColor:
                                                seccion.turno === 'MAÑANA' ? '#fff3e0' :
                                                    seccion.turno === 'TARDE' ? '#e3f2fd' : '#f3e5f5',
                                            color:
                                                seccion.turno === 'MAÑANA' ? '#e65100' :
                                                    seccion.turno === 'TARDE' ? '#0d47a1' : '#4a148c'
                                        }}>
                                            {seccion.turno}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9em' }}>
                                            {seccion.nombreProfesor}
                                            <br />
                                            <span style={{ color: '#666' }}>DNI: {seccion.dniProfesor}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9em', textAlign: 'center' }}>
                                            <strong>{seccion.estudiantesMatriculados || 0}/{seccion.capacidad}</strong>
                                            <br />
                                            <span style={{
                                                color: seccion.tieneCupo ? '#388e3c' : '#d32f2f',
                                                fontSize: '0.85em'
                                            }}>
                                                {seccion.tieneCupo ? '✓ Disponible' : '✗ Completo'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85em' }}>
                                        {new Date(seccion.fechaInicio).toLocaleDateString()}
                                        <br />
                                        {new Date(seccion.fechaFin).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85em',
                                            backgroundColor: seccion.activa ? '#e8f5e9' : '#ffebee',
                                            color: seccion.activa ? '#2e7d32' : '#c62828'
                                        }}>
                                            {seccion.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleEdit(seccion)}
                                                className="btn-edit"
                                                title="Editar sección"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleToggleActiva(seccion)}
                                                className={seccion.activa ? 'btn-warning' : 'btn-success'}
                                                title={seccion.activa ? 'Desactivar' : 'Activar'}
                                            >
                                                {seccion.activa ? '🔒' : '🔓'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(seccion.id)}
                                                className="btn-delete"
                                                title="Eliminar sección"
                                                disabled={seccion.estudiantesMatriculados > 0}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modales */}
            <CreateSeccionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSeccionCreated={handleSeccionCreated}
            />

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