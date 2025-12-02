import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

// Importaciones de tu proyecto (Las mantenemos tal cual)
import LogoutButton from '../../../components/login/LogoutButton';
import icon from "../../../assets/logo.png";
import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";
import { API_BASE_URL } from "../../../config/api"; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBook, 
    faCalendar, 
    faChartLine, 
    faBell, 
    faPenToSquare,
    faSpinner, 
    faChalkboardTeacher
} from '@fortawesome/free-solid-svg-icons';

const formatDateLocal = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function PantallaEstudiante() {
    const userName = localStorage.getItem('userName');
    const userGrado = localStorage.getItem('userGrado');
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate(); // Hook para navegación

    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarMisCursos = async () => {
            if (!token) return;

            setLoading(true);
            setError(null);

            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                // Endpoint de matrículas activas
                const url = `${API_BASE_URL}/matriculas/mis-matriculas/activas`;
                const response = await axios.get(url, config);
                
                setCursos(response.data || []);
            } catch (err) {
                console.error("Error al cargar cursos en dashboard:", err);
                if (err.response && err.response.status !== 404) {
                    setError("No se pudieron cargar tus cursos.");
                }
            } finally {
                setLoading(false);
            }
        };

        cargarMisCursos();
    }, [token]);

    return (
        <div className='student-layout'>
            {/* ========== SIDEBAR IZQUIERDO ========== */}
            <aside className='student-sidebar'>
                <div className='sidebar-header'>
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className='sidebar-role'>Estudiante</span>
                </div>

                <nav className='sidebar-menu'>
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <a href="#cursos" className='active'>
                                <FontAwesomeIcon icon={faBook} className='icon-text' />
                                Mis Cursos
                            </a>
                        </li>
                        <li>
                            <a href="#horario">
                                <FontAwesomeIcon icon={faCalendar} className='icon-text' />
                                Horario
                            </a>
                        </li>
                        <li>
                            <a href="#progreso">
                                <FontAwesomeIcon icon={faChartLine} className='icon-text' />
                                Progreso
                            </a>
                        </li>
                        <li>
                            <a href="#notificaciones">
                                <FontAwesomeIcon icon={faBell} className='icon-text' />
                                Notificaciones
                            </a>
                        </li>
                        <li>
                            <Link to="/pantalla-alumno/matricula">
                                <FontAwesomeIcon icon={faPenToSquare} className='icon-text' />
                                Matricúlate Aquí
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* ========== ÁREA DERECHA ========== */}
            <div className='student-right-area'>
                <header className='student-header'>
                    <div className='header-content'>
                        <h1>Campus Virtual</h1>
                        <div className='header-right'>
                            <p>Bienvenido, <strong>{userName}</strong></p>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className='student-main'>
                    <section className='content-section'>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <div>
                                <h2>Mis Cursos Activos</h2>
                                <p style={{color: '#666', marginTop: '5px'}}>Visualiza tus asignaturas del grado: <strong>{userGrado}</strong></p>
                            </div>
                            {/* Botón rápido para ir a matrícula */}
                        </div>

                        {/* --- LOADING --- */}
                        {loading && (
                            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                                <p style={{ marginTop: "10px" }}>Cargando tus cursos...</p>
                            </div>
                        )}

                        {/* --- ERROR --- */}
                        {error && (
                            <div style={{ color: "red", background: "#ffebee", padding: "1rem", borderRadius: "5px", marginBottom: "1rem" }}>
                                <p>❌ {error}</p>
                            </div>
                        )}

                        {/* --- SIN CURSOS --- */}
                        {!loading && !error && cursos.length === 0 && (
                            <div style={{ textAlign: "center", padding: "3rem", background: "#f9f9f9", borderRadius: "8px", border: "1px dashed #ccc" }}>
                                <FontAwesomeIcon icon={faBook} size="3x" style={{ color: "#ccc", marginBottom: "1rem" }} />
                                <h3>No tienes cursos inscritos actualmente</h3>
                                <p>Dirígete a la sección de "Matricúlate Aquí" para inscribir tus asignaturas.</p>
                            </div>
                        )}

                        {/* --- GRID DE CURSOS DINÁMICO --- */}
                        {!loading && !error && cursos.length > 0 && (
                            <div className='courses-grid'>
                                {cursos.map((matricula) => (
                                    <div key={matricula.id} className='course-card'>
                                        
                                        <div className='header-card' style={{ alignItems: 'flex-start' }}>
                                            <div>
                                                <h3>{matricula.tituloCurso}</h3>
                                                <p style={{fontSize: '0.8rem', color: '#888', margin: 0}}>
                                                    Cód: {matricula.codigoCurso}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: '#e3f2fd',
                                                color: '#1565c0',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {matricula.nombreSeccion}
                                            </span>
                                        </div>

                                        <div className='line'></div>

                                        <div className='information-card'>
                                            <p style={{marginBottom: '8px'}}>
                                                <FontAwesomeIcon icon={faChalkboardTeacher} style={{marginRight: '8px', color: '#555'}}/>
                                                Prof. <strong>{matricula.nombreProfesor}</strong>
                                            </p>
                                            
                                            <div style={{background: '#f8f9fa', padding: '8px', borderRadius: '4px'}}>
                                                <p style={{margin: '4px 0'}}>
                                                    <strong>Turno:</strong> {matricula.turnoSeccion}
                                                </p>
                                                <p style={{margin: '4px 0'}}>
                                                    <strong>Aula:</strong> {matricula.aulaSeccion || 'Virtual'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='line'></div>

                                        <div className='footer-card' style={{flexDirection: 'column', gap: '10px', alignItems: 'stretch'}}>
                                            <div className='fecha-information' style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666'}}>
                                                <span>Del: {formatDateLocal(matricula.fechaInicioSeccion)}</span>
                                                <span>Al: {formatDateLocal(matricula.fechaFinSeccion)}</span>
                                            </div>
                                            
                                            {/* ⭐ BOTÓN ACTIVO PARA IR A LA SECCIÓN */}
                                            <button 
                                                className='btn-course' 
                                                style={{justifyContent: 'center', width: '100%', cursor: 'pointer'}}
                                                // Usamos el ID de la SECCIÓN para navegar
                                                onClick={() => navigate(`/pantalla-estudiante/seccion/${matricula.seccionId}`)}
                                            >
                                                Ver contenido
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}