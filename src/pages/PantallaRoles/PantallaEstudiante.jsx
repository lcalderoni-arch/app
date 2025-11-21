import React from 'react';
import LogoutButton from '../../components/login/LogoutButton';
import icon from "../../assets/logo.png";
import "../../styles/RolesStyle/EstudianteStyle.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-solid-svg-icons';

export default function PantallaEstudiante() {
    const userName = localStorage.getItem('userName');
    const userGrado = localStorage.getItem('userGrado');

    return (
        <div className='student-layout'>
            {/* ========== SIDEBAR IZQUIERDO (ALTURA COMPLETA) ========== */}
            <aside className='student-sidebar'>
                <div className='sidebar-header'>
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className='sidebar-role'>Estudiante</span>
                </div>
                
                <nav className='sidebar-menu'>
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <a href="#cursos" className='active'><FontAwesomeIcon icon={faBook} className='icon-text'/>
                                Mis Cursos
                            </a>
                        </li>
                        <li>
                            <a href="#horario"><FontAwesomeIcon icon={faCalendar} className='icon-text'/>
                                Horario
                            </a>
                        </li>
                        <li>
                            <a href="#progreso"><FontAwesomeIcon icon={faChartLine} className='icon-text'/>
                                Progreso
                            </a>
                        </li>
                        <li>
                            <a href="#notificaciones"><FontAwesomeIcon icon={faBell} className='icon-text'/>
                                Notificaciones
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* ========== ÁREA DERECHA (HEADER + MAIN) ========== */}
            <div className='student-right-area'>
                {/* HEADER */}
                <header className='student-header'>
                    <div className='header-content'>
                        <h1>Campus Virtual</h1>
                        <div className='header-right'>
                            <p>Bienvenido, <strong>{userName}</strong></p>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                {/* CONTENIDO PRINCIPAL */}
                <main className='student-main'>
                    <section className='content-section'>
                        <h2>Mis Cursos</h2>
                        <p>Visualiza tus cursos elegidos</p>
                        
                        <div className='courses-grid'>
                            <div className='course-card'>
                                <div className='header-card'>
                                    <h3>Matemáticas</h3>
                                    <p className='text-grado'>Grado: {userGrado || "No asignado"}</p>
                                </div>
                                <div className='line'></div>
                                <div className='information-card'>
                                    <p><strong>Profesor:</strong></p>
                                    <p><strong>Horario:</strong> Lunes 9:00 AM - 10:00AM (SALON: 5TO-B)</p>
                                </div>
                                <div className='line'></div>
                                <div className='footer-card'>
                                    <div className='fecha-information'>
                                        <p>Inicio: 10/10/2010</p>
                                        <p>Fin: 10/12/2010</p>
                                    </div>
                                <button className='btn-course'>Ver curso</button>
                                </div>
                            </div>

                            <div className='course-card'>
                                <div className='header-card'>
                                    <h3>Ciencias</h3>
                                    <p className='text-grado'>Grado: {userGrado || "No asignado"}</p>
                                </div>
                                <p>Tareas pendientes: 1</p>
                                <p>Próxima clase: Martes 10:00 AM</p>
                                <button className='btn-course'>Ver curso</button>
                            </div>

                            <div className='course-card'>
                                <div className='header-card'>
                                    <h3>Historia</h3>
                                    <p className='text-grado'>Grado: {userGrado || "No asignado"}</p>
                                </div>
                                <p>Tareas pendientes: 0</p>
                                <p>Próxima clase: Miércoles 11:00 AM</p>
                                <button className='btn-course'>Ver curso</button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
