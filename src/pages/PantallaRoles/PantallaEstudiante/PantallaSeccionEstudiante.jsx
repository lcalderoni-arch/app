// frontend/PantallaSeccionAlumno.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../../../config/api';
import LogoutButton from '../../../components/login/LogoutButton';
import { formatDateLocal } from '../../../utils/dateUtils';

import icon from "../../../assets/logo.png";
import icon2 from "../../../assets/logo2.png";
import image from "../../../assets/imagetarea.png";

import "../../../styles/RolesStyle/StudentStyle/StudentPageFirst.css";
import "../../../styles/RolesStyle/DocenteStyle/SeccionDocente.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPenToSquare,
    faBook,
    faSpinner,
    faBell,
    faChartLine,
    faCalendar,
    faCircleUser,
    faEnvelope,
    faDownload,
    faUpRightFromSquare,
    faUser,
    faMessage,
    faHighlighter,
    faComment
} from '@fortawesome/free-solid-svg-icons';

// Igual que en PantallaSeccionDocente
const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const apiRoot = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${apiRoot}${path}`;
};

export default function PantallaSeccionEstudiante() {
    const { seccionId } = useParams();
    const navigate = useNavigate();

    const userName = localStorage.getItem('userName');

    const [seccion, setSeccion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sesiones, setSesiones] = useState([]);
    const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);

    const [recursos, setRecursos] = useState([]);
    const [loadingRecursos, setLoadingRecursos] = useState(false);
    const [errorRecursos, setErrorRecursos] = useState(null);

    // Modal de tarea
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [showModalTarea, setShowModalTarea] = useState(false);

    const [tituloEntrega, setTituloEntrega] = useState("");
    const [descripcionEntrega, setDescripcionEntrega] = useState("");
    const [archivoEntrega, setArchivoEntrega] = useState(null);
    const [enviandoEntrega, setEnviandoEntrega] = useState(false);

    // 🔹 Modal vista previa recurso (PDF / IMAGEN / DOC / ARCHIVO)
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
    const [showModalRecurso, setShowModalRecurso] = useState(false);

    const abrirModalRecurso = (recurso) => {
        setRecursoSeleccionado(recurso);
        setShowModalRecurso(true);
    };

    const cerrarModalRecurso = () => {
        setShowModalRecurso(false);
        setRecursoSeleccionado(null);
    };

    // --- cargar sección + sesiones ---
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No estás autenticado.");

                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [seccionRes, sesionesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/secciones/${seccionId}`, config),
                    axios.get(`${API_BASE_URL}/sesiones/seccion/${seccionId}`, config),
                ]);

                setSeccion(seccionRes.data);
                setSesiones(sesionesRes.data || []);

                if (seccionRes.data.semanaActual > 0) {
                    setSemanaSeleccionada(seccionRes.data.semanaActual);
                }
            } catch (err) {
                console.error("Error al cargar la sección:", err);
                setError(err.response?.data?.message || "No se pudo cargar la información del curso.");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [seccionId]);

    // Sesión actual
    let sesionActualId = null;
    if (sesiones && sesiones.length > 0) {
        const index = semanaSeleccionada - 1;
        sesionActualId = sesiones[index]?.id || null;
    }

    // Cargar recursos de la sesión actual
    useEffect(() => {
        const cargarRecursos = async () => {
            if (!sesionActualId) {
                setRecursos([]);
                setErrorRecursos(null);
                return;
            }

            try {
                setLoadingRecursos(true);
                setErrorRecursos(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No estás autenticado.");

                const config = { headers: { Authorization: `Bearer ${token}` } };

                const response = await axios.get(
                    `${API_BASE_URL}/recursos/sesion/${sesionActualId}`,
                    config
                );

                setRecursos(response.data || []);
            } catch (err) {
                console.error("Error al cargar recursos:", err);
                setErrorRecursos(
                    err.response?.data?.message ||
                    "No se pudieron cargar los recursos de la sesión."
                );
                setRecursos([]);
            } finally {
                setLoadingRecursos(false);
            }
        };

        cargarRecursos();
    }, [sesionActualId]);

    const handleClickSemana = (numSemana) => {
        setSemanaSeleccionada(numSemana);
    };

    const numeroSemanas = seccion?.numeroSemanas || sesiones.length || 0;
    const semanas = Array.from({ length: numeroSemanas }, (_, i) => i + 1);
    const semanaActual = seccion?.semanaActual || 0;

    const recursosExplora = recursos.filter((r) => r.momento === "ANTES");
    const recursosEstudia = recursos.filter((r) => r.momento === "DURANTE");
    const recursosAplica = recursos.filter((r) => r.momento === "DESPUES");

    const formatDateTimeLocal = (value) => {
        if (!value) return "";
        const d = new Date(value);
        return d.toLocaleString();
    };

    const ahoraDentroDeRango = (tarea) => {
        if (!tarea) return false;
        const ahora = new Date().getTime();
        const ini = tarea.fechaInicioEntrega ? new Date(tarea.fechaInicioEntrega).getTime() : null;
        const fin = tarea.fechaFinEntrega ? new Date(tarea.fechaFinEntrega).getTime() : null;

        if (ini && ahora < ini) return false;
        if (fin && ahora > fin) return false;
        return true;
    };

    const abrirModalTarea = (tarea) => {
        setTareaSeleccionada(tarea);
        setTituloEntrega("");
        setDescripcionEntrega("");
        setArchivoEntrega(null);
        setShowModalTarea(true);
    };

    const cerrarModalTarea = () => {
        setShowModalTarea(false);
        setTareaSeleccionada(null);
    };

    const handleEnviarEntrega = async (e) => {
        e.preventDefault();
        if (!tareaSeleccionada || !archivoEntrega) {
            alert("Debes seleccionar un archivo para enviar tu tarea.");
            return;
        }

        try {
            setEnviandoEntrega(true);
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const formData = new FormData();
            formData.append("file", archivoEntrega);
            if (tituloEntrega.trim()) formData.append("titulo", tituloEntrega.trim());
            if (descripcionEntrega.trim()) formData.append("descripcion", descripcionEntrega.trim());

            await axios.post(
                `${API_BASE_URL}/tareas/${tareaSeleccionada.id}/entregar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // Content-Type lo maneja axios
                    },
                }
            );

            alert("Tarea enviada correctamente ✨");
            cerrarModalTarea();
        } catch (err) {
            console.error("Error al enviar tarea:", err);
            alert(
                err.response?.data?.message || "No se pudo enviar la tarea."
            );
        } finally {
            setEnviandoEntrega(false);
        }
    };

    const renderListaRecursos = (lista) => {
        if (loadingRecursos) return <p>Cargando recursos...</p>;
        if (errorRecursos) return <p className="recurso-error">❌ {errorRecursos}</p>;
        if (!lista || lista.length === 0) return <p>No hay recursos registrados aún.</p>;

        return (
            <div className="recursos-grid">
                {lista.map((r) => {
                    const isLink = !!r.linkVideo;
                    const isFile = !!r.archivoUrl;
                    const isTarea = r.tipo === "TAREA";

                    const fileUrl = isFile ? buildFileUrl(r.archivoUrl) : null;

                    const botonTexto = isLink
                        ? "Abrir enlace"
                        : isFile
                            ? "Ver recurso"
                            : (isTarea ? "Ver / responder" : "Ver recurso");

                    const entregasHabilitadas = isTarea && r.permiteEntregas && ahoraDentroDeRango(r);

                    return (
                        <article key={r.id} className="recurso-card">
                            <header className="recurso-card-header">
                                <span className="recurso-tipo-badge">{r.tipo}</span>
                            </header>

                            <h5 className="recurso-card-title">{r.titulo}</h5>

                            {r.descripcion && (
                                <p className="recurso-card-desc">{r.descripcion}</p>
                            )}

                            {isTarea && (
                                <div className="recurso-tarea-meta">
                                    {r.fechaInicioEntrega && (
                                        <p>
                                            <strong>Inicio:</strong>{" "}
                                            {formatDateTimeLocal(r.fechaInicioEntrega)}
                                        </p>
                                    )}
                                    {r.fechaFinEntrega && (
                                        <p>
                                            <strong>Fin:</strong>{" "}
                                            {formatDateTimeLocal(r.fechaFinEntrega)}
                                        </p>
                                    )}
                                    <span
                                        className={
                                            entregasHabilitadas
                                                ? "pill pill-green"
                                                : "pill pill-gray"
                                        }
                                    >
                                        {entregasHabilitadas
                                            ? "Entregas habilitadas"
                                            : "Fuera de plazo o deshabilitada"}
                                    </span>
                                </div>
                            )}

                            {/* LINK (YouTube / web) → abre nueva pestaña */}
                            {!isTarea && isLink && (
                                <a
                                    href={r.linkVideo}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="recurso-card-btn"
                                >
                                    {botonTexto}
                                </a>
                            )}

                            {/* Archivos físicos → modal de vista previa */}
                            {!isTarea && isFile && fileUrl && (
                                <button
                                    type="button"
                                    className="recurso-card-btn"
                                    onClick={() => abrirModalRecurso(r)}
                                >
                                    {botonTexto}
                                </button>
                            )}

                            {/* TAREA → modal de entrega */}
                            {isTarea && (
                                <button
                                    type="button"
                                    className="recurso-card-btn"
                                    disabled={!entregasHabilitadas}
                                    onClick={() => entregasHabilitadas && abrirModalTarea(r)}
                                >
                                    {botonTexto}
                                </button>
                            )}
                        </article>
                    );
                })}
            </div>
        );
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

    return (
        <div className="student-layout">
            {/* SIDEBAR */}
            <aside className='student-sidebar'>
                <div className='sidebar-header'>
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className='sidebar-role'>Estudiante</span>
                </div>

                <nav className='sidebar-menu'>
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-estudiante" className='active'>
                                <FontAwesomeIcon icon={faBook} className='icon-text' />
                                Mis Cursos
                            </Link>
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
                    </ul>
                </nav>

                <nav className='sidebar-menu'>
                    <h3>Otros campos</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-alumno/matricula">
                                <FontAwesomeIcon icon={faPenToSquare} className='icon-text' />
                                Matricúlate Aquí
                            </Link>
                        </li>
                        <li>
                            <Link to="/mi-perfil" className="desactive">
                                <FontAwesomeIcon icon={faUser} className="icon-text" />
                                Mi Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* AREA PRINCIPAL */}
            <div className="docente-right-area">
                {/* HEADER */}
                <header className="docente-header">
                    <div className='header-content'>
                        <div className='name-header'>
                            <p>Bienvenido, <strong>{userName}</strong></p>
                            <h1>Campus Virtual</h1>
                        </div>
                        <div className='header-right'>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <div className='container-all'>
                    <div className='second-container'>
                        <div className="header-content-left">
                            <div className='content-first'>
                                <img className="icon-class" src={icon2} alt="Logo Campus" />
                                <div>
                                    <h2>{seccion.nombre}</h2>
                                    <p><strong>Sección</strong> {seccion.gradoSeccion}</p>
                                </div>
                            </div>
                            <div className='content-second'>
                                <p>
                                    Nivel:
                                    <strong>{seccion.nivelSeccion}</strong>
                                </p>
                            </div>
                            <div className='content-third'>
                                <FontAwesomeIcon icon={faCalendar} className='icon-text' />
                                <div>
                                    <p>Inicio: {formatDateLocal(seccion.fechaInicio)}</p>
                                    <p>Fin: {formatDateLocal(seccion.fechaFin)}</p>
                                </div>
                            </div>
                        </div>

                        <div className='header-content-right'>
                            <div className='content-first'>
                                <FontAwesomeIcon icon={faCircleUser} className='icon-text' />
                                <h2>Docente</h2>
                            </div>

                            <div className='content-second'>
                                <div>
                                    <h3>NOMBRE</h3>
                                    <p>{seccion.nombreProfesor || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className='content-third'>
                                <FontAwesomeIcon icon={faEnvelope} className='icon-text' />
                                <p>{seccion.correoProfesor || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className='content-body-seccion'>
                        <main className="docente-main">
                            {/* BARRA DE SEMANAS */}
                            <section className="semanas-section">
                                <h2>Semana de aprendizaje:</h2>
                                <div className="semanas-container">
                                    {semanas.map((num) => {
                                        const esActual = num === semanaActual;
                                        const esSeleccionada = num === semanaSeleccionada;

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
                            <section className="contenido-semana-section-teacher">
                                <div>
                                    <h3 className='title-sesion'>
                                        Sesión {semanaSeleccionada.toString().padStart(2, "0")}
                                        {semanaSeleccionada === semanaActual && " (ACTUAL)"}
                                    </h3>

                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(`/alumno/seccion/${seccionId}/asistencias`)}
                                    >
                                        Ver mis asistencias
                                    </button>

                                    <button
                                        className="btn-primary"
                                        onClick={() =>
                                            navigate("/pantalla-alumno/examenes", {
                                                state: { seccionId },   // si tu pantalla de exámenes quiere filtrar por sección
                                            })
                                        }
                                    >
                                        Ver notas de exámenes
                                    </button>

                                </div>

                                <p>Contenido del Curso:</p>

                                <div className="contenido-semana-card-seccion">
                                    <div className='area-explora'>
                                        <h4>EXPLORAMOS</h4>
                                        {renderListaRecursos(recursosExplora)}
                                    </div>
                                    <div className='area-estudio'>
                                        <h4>ESTUDIAMOS</h4>
                                        {renderListaRecursos(recursosEstudia)}
                                    </div>
                                    <div className='area-aplica'>
                                        <h4>APLICAMOS</h4>
                                        {renderListaRecursos(recursosAplica)}
                                    </div>
                                </div>
                            </section>
                        </main>
                    </div>
                </div>
            </div>

            {/* MODAL VISTA PREVIA RECURSO (PDF / IMAGEN / DOC / ARCHIVO GENÉRICO) */}
            {showModalRecurso && recursoSeleccionado && (
                <div className="modal-backdrop" onClick={cerrarModalRecurso}>
                    <div className="modal-content modal-preview" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{recursoSeleccionado.titulo}</h3>
                            <button className="modal-close" onClick={cerrarModalRecurso}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-tarea-desc-area">
                                <h4><FontAwesomeIcon icon={faMessage} className="icon-title" />Descripción:</h4>
                                {recursoSeleccionado.descripcion && (
                                    <p className="modal-tarea-desc">{recursoSeleccionado.descripcion}</p>
                                )}
                            </div>

                            {(() => {
                                const url = buildFileUrl(recursoSeleccionado.archivoUrl);
                                const tipo = recursoSeleccionado.tipo;

                                if (!url) {
                                    return <p>No se encontró la URL del archivo.</p>;
                                }

                                // IMAGEN
                                if (tipo === "IMAGEN") {
                                    return (
                                        <div className="preview-center">
                                            <img
                                                src={url}
                                                alt={recursoSeleccionado.titulo}
                                                className="preview-image"
                                            />
                                        </div>
                                    );
                                }

                                // PDF → Google Viewer
                                if (tipo === "PDF") {
                                    const googleViewerUrl =
                                        "https://docs.google.com/gview?embedded=true&url=" +
                                        encodeURIComponent(url);

                                    return (
                                        <div className="preview-frame-wrapper">
                                            <iframe
                                                src={googleViewerUrl}
                                                title={recursoSeleccionado.titulo}
                                                className="preview-frame"
                                            />
                                        </div>
                                    );
                                }

                                // DOCUMENTO (Word) → Google Viewer
                                if (tipo === "DOCUMENTO") {
                                    const googleViewerUrl =
                                        "https://docs.google.com/gview?embedded=true&url=" +
                                        encodeURIComponent(url);

                                    return (
                                        <div className="preview-frame-wrapper">
                                            <iframe
                                                src={googleViewerUrl}
                                                title={recursoSeleccionado.titulo}
                                                className="preview-frame"
                                            />
                                        </div>
                                    );
                                }

                                // ARCHIVO genérico (ZIP, RAR, etc.)
                                return (
                                    <div className="preview-center">
                                        <p>Este tipo de archivo no se puede previsualizar.</p>
                                        <a
                                            href={url}
                                            download
                                            className="btn-primary"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Descargar archivo
                                        </a>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Barra de acciones (descargar / nueva ventana) */}
                        <div className="modal-footer-actions">
                            {recursoSeleccionado.archivoUrl && (
                                <>
                                    <a
                                        href={buildFileUrl(recursoSeleccionado.archivoUrl)}
                                        download
                                        className="icon-button"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FontAwesomeIcon icon={faDownload} /> Descargar
                                    </a>

                                    <button
                                        type="button"
                                        className="icon-button"
                                        onClick={() =>
                                            window.open(
                                                buildFileUrl(recursoSeleccionado.archivoUrl),
                                                "_blank",
                                                "noopener,noreferrer"
                                            )
                                        }
                                    >
                                        <FontAwesomeIcon icon={faUpRightFromSquare} /> Nueva ventana
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAREA */}
            {showModalTarea && tareaSeleccionada && (
                <div className="modal-backdrop" onClick={cerrarModalTarea}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <img className="icon-class" src={icon2} alt="Logo Campus" />
                                <h3>{seccion.nombre}</h3>
                            </div>
                            <button className="modal-close" onClick={cerrarModalTarea}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-body-description">
                                <div>
                                    <h4 className="title"><FontAwesomeIcon icon={faHighlighter} className="icon-title" />Título:</h4>
                                    <h4 className="title-text">{tareaSeleccionada.titulo}</h4>
                                </div>
                                <img className="icon-class" src={image} alt="Imagen de entrega de tarea" />
                            </div>

                            <div className="description-area">
                                <h4><FontAwesomeIcon icon={faComment} className="icon-title" />Descripción:</h4>
                                {tareaSeleccionada.descripcion && (
                                    <p className="modal-tarea-desc">
                                        {tareaSeleccionada.descripcion}
                                    </p>
                                )}
                            </div>

                            <div className="modal-tarea-meta">
                                <h4><FontAwesomeIcon icon={faCalendar} className="icon" />Fecha:</h4>
                                {tareaSeleccionada.fechaInicioEntrega && (
                                    <p>
                                        <strong>Inicio de entrega:</strong>{" "}
                                        {formatDateTimeLocal(tareaSeleccionada.fechaInicioEntrega)}
                                    </p>
                                )}
                                {tareaSeleccionada.fechaFinEntrega && (
                                    <p>
                                        <strong>Fin de entrega:</strong>{" "}
                                        {formatDateTimeLocal(tareaSeleccionada.fechaFinEntrega)}
                                    </p>
                                )}
                            </div>

                            <form className="modal-form" onSubmit={handleEnviarEntrega}>
                                <div className="modal-form-grid">

                                    {/* Título */}
                                    <div className="form-field">
                                        <label className="field-label" htmlFor="tituloEntrega">Título de tu entrega</label>
                                        <input
                                            id="tituloEntrega"
                                            type="text"
                                            className="field-input"
                                            value={tituloEntrega}
                                            onChange={(e) => setTituloEntrega(e.target.value)}
                                            placeholder="Ej: Tarea Semana 3 - Investigación"
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div className="form-field">
                                        <label className="field-label" htmlFor="descripcionEntrega">Comentario / descripción</label>
                                        <textarea
                                            id="descripcionEntrega"
                                            className="field-textarea"
                                            rows={4}
                                            value={descripcionEntrega}
                                            onChange={(e) => setDescripcionEntrega(e.target.value)}
                                            placeholder="Escribe un comentario breve sobre tu entrega…"
                                        />
                                    </div>

                                    {/* Archivo (con botón bonito y nombre del archivo) */}
                                    <div className="form-field">
                                        <span className="field-label">Archivo a subir</span>

                                        <div className="file-row">
                                            <input
                                                id="archivoEntrega"
                                                type="file"
                                                className="file-input"
                                                onChange={(e) => setArchivoEntrega(e.target.files?.[0] ?? null)}
                                            />

                                            <label htmlFor="archivoEntrega" className="file-btn">
                                                Seleccionar archivo
                                            </label>

                                            <span className="file-filename">
                                                {archivoEntrega ? archivoEntrega.name : "Ningún archivo seleccionado"}
                                            </span>
                                        </div>

                                        <div className="helper-note">
                                            Solo se acepta <strong>un archivo</strong> (PDF, Word, video, ZIP, RAR, etc.).
                                        </div>
                                    </div>

                                </div>

                                {/* Acciones */}
                                <div className="modal-form-actions">
                                    <button
                                        type="submit"
                                        className="modal-submit-btn modal-submit-btn--wide"
                                        disabled={enviandoEntrega}
                                    >
                                        {enviandoEntrega ? "Enviando..." : "Enviar tarea"}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
