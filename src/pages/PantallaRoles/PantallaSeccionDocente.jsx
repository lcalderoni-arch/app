// frontend/PantallaSeccionDocente.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../../config/api';
import LogoutButton from '../../components/login/LogoutButton';
import { formatDateLocal } from '../../utils/dateUtils';

import "../../styles/RolesStyle/DocenteStyle/SeccionDocente.css";

export default function PantallaSeccionDocente() {
    const { seccionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const userName = localStorage.getItem('userName');

    // si venimos desde PantallaDocente, ya tenemos la sección
    const seccionDesdeState = location.state?.seccion || null;

    const [seccion, setSeccion] = useState(seccionDesdeState);
    const [loading, setLoading] = useState(!seccionDesdeState);
    const [error, setError] = useState(null);

    const [semanaSeleccionada, setSemanaSeleccionada] = useState(
        seccionDesdeState?.semanaActual || 1
    );

    // 🔁 Si no llegó por state, la pedimos al backend
    useEffect(() => {
        const cargarSeccion = async () => {
            if (seccion) return; // ya la tenemos

            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No estás autenticado.");

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const response = await axios.get(
                    `${API_BASE_URL}/secciones/${seccionId}`,
                    config
                );

                setSeccion(response.data);
                setSemanaSeleccionada(response.data.semanaActual || 1);
            } catch (err) {
                console.error("Error al cargar la sección:", err);
                setError(err.response?.data?.message || "No se pudo cargar la sección");
            } finally {
                setLoading(false);
            }
        };

        cargarSeccion();
    }, [seccion, seccionId]);

    // 👉 aquí podrías hacer otra llamada para cargar el contenido de la semana
    // por ejemplo: GET /secciones/{id}/semanas/{semana}
    // por ahora lo dejo como placeholder
    // const [contenidoSemana, setContenidoSemana] = useState(null);
    // useEffect(() => { ...cargarContenidoSemana(seccionId, semanaSeleccionada) }, [semanaSeleccionada]);

    if (loading) {
        return (
            <div className="docente-layout">
                <div className="docente-right-area">
                    <header className="docente-header">
                        <h1>Cargando sección...</h1>
                    </header>
                </div>
            </div>
        );
    }

    if (error || !seccion) {
        return (
            <div className="docente-layout">
                <div className="docente-right-area">
                    <header className="docente-header">
                        <h1>Error</h1>
                    </header>
                    <main className="docente-main">
                        <p className="error-message">❌ {error || "No se encontró la sección."}</p>
                        <button onClick={() => navigate(-1)} className="btn-volver">
                            Volver
                        </button>
                    </main>
                </div>
            </div>
        );
    }

    const numeroSemanas = seccion.numeroSemanas || 0;
    const semanas = Array.from({ length: numeroSemanas }, (_, i) => i + 1);
    const semanaActual = seccion.semanaActual || 1;

    const handleClickSemana = (numSemana) => {
        setSemanaSeleccionada(numSemana);
        // aquí luego llamas a tu API para traer contenido de esa semana
    };

    return (
        <div className="docente-layout">
            {/* Sidebar podría ser el mismo que ya usas, o uno reducido */}
            <aside className="docente-sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-role">Docente</span>
                </div>
                <nav className="sidebar-menu">
                    <ul>
                        <li>
                            <button className="link-sidebar" onClick={() => navigate('/pantalla-docente')}>
                                ← Mis cursos
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <div className="docente-right-area">
                {/* HEADER */}
                <header className="docente-header">
                    <div className="header-content">
                        <h1>{seccion.nombre}</h1>
                        <div className="header-right">
                            <p>Profesor: <strong>{userName}</strong></p>
                            <LogoutButton />
                        </div>
                    </div>
                    <p className="subtitulo-seccion">
                        Sección {seccion.gradoSeccion} - Nivel {seccion.nivelSeccion} | 
                        Inicio: {formatDateLocal(seccion.fechaInicio)} | Fin: {formatDateLocal(seccion.fechaFin)}
                    </p>
                </header>

                <main className="docente-main">
                    {/* BARRA DE SEMANAS */}
                    <section className="semanas-section">
                        <h2>Sesiones de clase:</h2>
                        <div className="semanas-container">
                            {semanas.map((num) => {
                                const esActual = num === semanaActual;
                                const esSeleccionada = num === semanaSeleccionada;
                                const esBloqueada = num > semanaActual; // si quieres bloquear semanas futuras

                                return (
                                    <button
                                        key={num}
                                        className={[
                                            "semana-item",
                                            esSeleccionada ? "semana-activa" : "",
                                            esActual ? "semana-actual" : "",
                                            esBloqueada ? "semana-bloqueada" : "",
                                        ].join(" ")}
                                        onClick={() => !esBloqueada && handleClickSemana(num)}
                                        disabled={esBloqueada}
                                    >
                                        {num.toString().padStart(2, "0")}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* CONTENIDO DE LA SEMANA SELECCIONADA */}
                    <section className="contenido-semana-section">
                        <h3>
                            Contenido de la semana {semanaSeleccionada.toString().padStart(2, "0")}
                            {semanaSeleccionada === semanaActual && " (Semana actual)"}
                        </h3>

                        {/* Aquí luego puedes renderizar formularios, tareas, materiales, etc. */}
                        <div className="contenido-semana-card">
                            <p>
                                Aquí irá el contenido que el profesor puede crear/editar para esta semana
                                (materiales, tareas, foros, etc.).
                            </p>
                            {/* Ejemplo de lugar donde luego colocarás tus componentes: */}
                            {/* <EditorRecursosSemana seccionId={seccionId} semana={semanaSeleccionada} /> */}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
