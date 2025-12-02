import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../../../config/api';
import LogoutButton from '../../../components/login/LogoutButton';
import { formatDateLocal } from '../../../utils/dateUtils';
import icon from "../../../assets/logo.png";

// Reutilizamos estilos. Puedes usar el de docente si quieres que se vea igual la estructura interna
import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css"; 
// Importamos los estilos de sección para la barra de semanas y estructura (asegúrate de que este archivo exista)
import "../../../styles/RolesStyle/DocenteStyle/SeccionDocente.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBook, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function PantallaSeccionAlumno() {
    const { seccionId } = useParams();
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    const [seccion, setSeccion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);

    // --- Cargar datos de la sección ---
    useEffect(() => {
        const cargarSeccion = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No estás autenticado.");

                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Reutilizamos el endpoint para obtener info básica de la sección
                const response = await axios.get(
                    `${API_BASE_URL}/secciones/${seccionId}`,
                    config
                );

                setSeccion(response.data);
                
                // Si la sección tiene una semana actual, la seleccionamos por defecto
                if (response.data.semanaActual > 0) {
                    setSemanaSeleccionada(response.data.semanaActual);
                }
            } catch (err) {
                console.error("Error al cargar la sección:", err);
                setError(err.response?.data?.message || "No se pudo cargar la información del curso.");
            } finally {
                setLoading(false);
            }
        };

        cargarSeccion();
    }, [seccionId]);

    const handleClickSemana = (numSemana) => {
        setSemanaSeleccionada(numSemana);
        // Aquí cargarías materiales/tareas de esa semana en el futuro
    };

    if (loading) {
        return (
            <div className="student-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', color: '#555' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                    <p style={{ marginTop: '10px' }}>Cargando curso...</p>
                </div>
            </div>
        );
    }

    if (error || !seccion) {
        return (
            <div className="student-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'red' }}>Error</h2>
                    <p>{error || "Curso no encontrado"}</p>
                    <button className="btn-course" onClick={() => navigate('/pantalla-estudiante')}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const numeroSemanas = seccion.numeroSemanas || 0;
    const semanas = Array.from({ length: numeroSemanas }, (_, i) => i + 1);
    const semanaActual = seccion.semanaActual || 0;

    return (
        <div className="student-layout">
            {/* SIDEBAR */}
            <aside className="student-sidebar">
                <div className="sidebar-header">
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className="sidebar-role">Estudiante</span>
                </div>
                <nav className="sidebar-menu">
                    <ul>
                        <li>
                            <button 
                                className="link-sidebar" 
                                onClick={() => navigate('/pantalla-estudiante')}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', width: '100%', 
                                    textAlign: 'left', padding: '15px 20px', fontSize: '1rem', 
                                    color: '#333', display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} /> Volver a Mis Cursos
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* AREA PRINCIPAL */}
            <div className="student-right-area">
                <header className="student-header">
                    <div className="header-content">
                        <div>
                            <h1>{seccion.nombre}</h1>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                Prof. {seccion.nombreProfesor} | {seccion.aula || 'Aula Virtual'}
                            </p>
                        </div>
                        <div className="header-right">
                            <p>Hola, <strong>{userName}</strong></p>
                            <LogoutButton />
                        </div>
                    </div>
                    {/* Subtítulo estilo docente */}
                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#555' }}>
                        Sección {seccion.gradoSeccion} - Nivel {seccion.nivelSeccion} | 
                        Inicio: {formatDateLocal(seccion.fechaInicio)} | Fin: {formatDateLocal(seccion.fechaFin)}
                    </div>
                </header>

                <main className="student-main">
                    
                    {/* BARRA DE SEMANAS */}
                    <section className="semanas-section">
                        <h2>Semana de aprendizaje:</h2>
                        <div className="semanas-container">
                            {semanas.map((num) => {
                                const esActual = num === semanaActual;
                                const esSeleccionada = num === semanaSeleccionada;
                                // Puedes agregar lógica de bloqueo si lo deseas
                                // const esBloqueada = num > semanaActual; 

                                return (
                                    <button
                                        key={num}
                                        className={[
                                            "semana-item",
                                            esSeleccionada ? "semana-activa" : "",
                                            esActual ? "semana-actual" : "",
                                        ].join(" ")}
                                        onClick={() => handleClickSemana(num)}
                                    >
                                        {num.toString().padStart(2, "0")}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* CONTENIDO DE LA SEMANA */}
                    <section className="contenido-semana-section">
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
                            <h2 style={{ color: '#1976d2', margin: 0 }}>
                                Contenido de la Semana {semanaSeleccionada}
                                {semanaSeleccionada === semanaActual && <span style={{ fontSize: '0.8rem', color: '#4caf50', marginLeft: '10px' }}>(Semana Actual)</span>}
                            </h2>
                        </div>

                        {/* Placeholder del contenido */}
                        <div className="contenido-semana-card" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <FontAwesomeIcon icon={faBook} size="3x" style={{ marginBottom: '15px', opacity: 0.5 }} />
                            <p>Aquí verás los materiales, tareas y exámenes correspondientes a la semana {semanaSeleccionada}.</p>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}