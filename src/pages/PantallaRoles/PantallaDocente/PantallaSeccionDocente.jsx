// frontend/PantallaSeccionDocente.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import icon from "../../../assets/logo.png";
import icon2 from "../../../assets/logo2.png";

import { API_BASE_URL } from '../../../config/api';
import LogoutButton from '../../../components/login/LogoutButton';
import { formatDateLocal } from '../../../utils/dateUtils';

import "../../../styles/RolesStyle/DocenteStyle/SeccionDocente.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faCircleUser,
    faEnvelope,
    faDownload,
    faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';

// ---- Tipos de recurso disponibles ----
const opcionesTipoRecurso = [
    { value: "LINK", label: "Recurso web / enlace" },
    { value: "VIDEO", label: "Video" },
    { value: "PDF", label: "PDF" },
    { value: "DOCUMENTO", label: "Documento" },
    { value: "ARCHIVO", label: "Archivo genérico" },
    { value: "IMAGEN", label: "Imagen" },
    { value: "TAREA", label: "Tarea" },             // 🔹 nuevo tipo
    { value: "OTRO", label: "Otro" },
];

const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // ya es absoluta (Azure, etc.)

    // Quitamos /api del final del API_BASE_URL (http://localhost:8081/api -> http://localhost:8081)
    const apiRoot = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${apiRoot}${path}`;
};

// --------------------------------------
//   Subcomponente: formulario recurso
// --------------------------------------
function RecursoForm({ sesionId, momento, onRecursoCreado }) {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tipo, setTipo] = useState("LINK");
    const [linkVideo, setLinkVideo] = useState("");
    const [file, setFile] = useState(null);

    // Campos exclusivos para tarea
    const [fechaInicioEntrega, setFechaInicioEntrega] = useState("");
    const [fechaFinEntrega, setFechaFinEntrega] = useState("");
    const [permiteEntregas, setPermiteEntregas] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const esTarea = tipo === "TAREA";
    const esTipoLink = tipo === "LINK" || tipo === "VIDEO";
    const requiereArchivo = !esTipoLink && !esTarea; // las tareas no suben archivo el docente

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sesionId) {
            alert("No se encontró la sesión actual.");
            return;
        }

        if (!titulo.trim()) {
            alert("El título es obligatorio.");
            return;
        }

        if (requiereArchivo && !file) {
            alert("Debes seleccionar un archivo para este tipo de recurso.");
            return;
        }

        if (esTarea) {
            // Para tareas, validamos fechas mínimas
            if (!fechaInicioEntrega || !fechaFinEntrega) {
                alert("Para una tarea debes indicar fecha de inicio y fin de entrega.");
                return;
            }
        }

        try {
            setSaving(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            // 👉 LINK / VIDEO / TAREA usan JSON
            if (esTipoLink || esTarea) {
                const payload = {
                    sesionId,
                    titulo: titulo.trim(),
                    descripcion: descripcion.trim() || null,
                    momento,             // ANTES / DURANTE / DESPUES
                    tipo,                // LINK / VIDEO / TAREA
                    linkVideo: esTipoLink ? (linkVideo.trim() || null) : null,
                    archivoUrl: null,

                    // 🔹 datos extra para tareas (el backend los puede ignorar si no es TAREA)
                    fechaInicioEntrega: esTarea && fechaInicioEntrega ? fechaInicioEntrega : null,
                    fechaFinEntrega: esTarea && fechaFinEntrega ? fechaFinEntrega : null,
                    permiteEntregas: esTarea ? permiteEntregas : false,
                };

                const response = await axios.post(
                    `${API_BASE_URL}/recursos/crear`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                onRecursoCreado && onRecursoCreado(response.data);
            } else {
                // 👉 Archivos físicos: multipart/form-data
                const formData = new FormData();
                formData.append("file", file);
                formData.append("titulo", titulo.trim());
                if (descripcion.trim()) {
                    formData.append("descripcion", descripcion.trim());
                }
                formData.append("momento", momento);       // ANTES / DURANTE / DESPUES
                formData.append("tipoRecurso", tipo);      // PDF / DOCUMENTO / ARCHIVO / etc.

                const response = await axios.post(
                    `${API_BASE_URL}/recursos/sesion/${sesionId}/archivo`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            // axios setea automáticamente el Content-Type
                        },
                    }
                );

                onRecursoCreado && onRecursoCreado(response.data);
            }

            // Limpiar formulario
            setTitulo("");
            setDescripcion("");
            setLinkVideo("");
            setFile(null);
            setTipo("LINK");
            setFechaInicioEntrega("");
            setFechaFinEntrega("");
            setPermiteEntregas(false);
        } catch (err) {
            console.error("Error al crear recurso:", err);
            setError(
                err.response?.data?.message ||
                "No se pudo crear el recurso."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="recurso-form" onSubmit={handleSubmit}>
            <h5>Agregar recurso</h5>

            <label>
                Título
                <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Guía de estudio semana 01"
                />
            </label>

            <label>
                Descripción (opcional)
                <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Breve descripción del recurso..."
                />
            </label>

            <label>
                Tipo de recurso
                <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="">Selecciona tipo</option>
                    {opcionesTipoRecurso.map((op) => (
                        <option key={op.value} value={op.value}>
                            {op.label}
                        </option>
                    ))}
                </select>
            </label>

            {esTipoLink && (
                <label>
                    URL (YouTube / Página web)
                    <input
                        type="url"
                        value={linkVideo}
                        onChange={(e) => setLinkVideo(e.target.value)}
                        placeholder="https://..."
                    />
                </label>
            )}

            {requiereArchivo && (
                <label>
                    Archivo
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0] || null)}
                    />
                </label>
            )}

            {esTarea && (
                <>
                    <div className="tarea-fields-divider" />

                    <p className="tarea-label-group">Configuración de la tarea</p>

                    <label>
                        Inicio de entrega
                        <input
                            type="datetime-local"
                            value={fechaInicioEntrega}
                            onChange={(e) => setFechaInicioEntrega(e.target.value)}
                        />
                    </label>

                    <label>
                        Fin de entrega
                        <input
                            type="datetime-local"
                            value={fechaFinEntrega}
                            onChange={(e) => setFechaFinEntrega(e.target.value)}
                        />
                    </label>

                    <label className="tarea-checkbox-row">
                        <input
                            type="checkbox"
                            checked={permiteEntregas}
                            onChange={(e) => setPermiteEntregas(e.target.checked)}
                        />
                        Permitir que los alumnos envíen entregas
                    </label>
                </>
            )}

            {error && <p className="recurso-error">❌ {error}</p>}

            <button type="submit" className="btn-recurso-guardar" disabled={saving}>
                {saving ? "Guardando..." : "Guardar recurso"}
            </button>
        </form>
    );
}

// --------------------------------------
//          Pantalla principal
// --------------------------------------
export default function PantallaSeccionDocente() {
    const { seccionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    const seccionDesdeState = location.state?.seccion || null;

    const [seccion, setSeccion] = useState(seccionDesdeState);
    const [loading, setLoading] = useState(!seccionDesdeState);
    const [error, setError] = useState(null);

    const [sesiones, setSesiones] = useState([]);
    const [loadingSesiones, setLoadingSesiones] = useState(false);
    const [errorSesiones, setErrorSesiones] = useState(null);

    const [semanaSeleccionada, setSemanaSeleccionada] = useState(
        seccionDesdeState?.semanaActual || 1
    );

    // Recursos de la sesión actual
    const [recursos, setRecursos] = useState([]);
    const [loadingRecursos, setLoadingRecursos] = useState(false);
    const [errorRecursos, setErrorRecursos] = useState(null);

    // 🔹 Modal detalle tarea (DOCENTE)
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [entregasTarea, setEntregasTarea] = useState([]);
    const [showModalTarea, setShowModalTarea] = useState(false);
    const [loadingEntregas, setLoadingEntregas] = useState(false);
    const [errorEntregas, setErrorEntregas] = useState(null);

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

    // --- helpers de estado de recursos ---
    const handleRecursoActualizado = (recursoActualizado) => {
        setRecursos((prev) =>
            prev.map((r) => (r.id === recursoActualizado.id ? recursoActualizado : r))
        );
    };

    const handleRecursoEliminado = (id) => {
        setRecursos((prev) => prev.filter((r) => r.id !== id));
    };

    // --- editar recurso (simple con prompt) ---
    const handleEditarRecurso = async (recurso) => {
        try {
            const nuevoTitulo = window.prompt("Nuevo título:", recurso.titulo);
            if (nuevoTitulo === null) return;

            const nuevaDescripcion = window.prompt(
                "Nueva descripción (opcional):",
                recurso.descripcion || ""
            );
            if (nuevaDescripcion === null) return;

            let nuevoLink = recurso.linkVideo || "";
            if (recurso.tipo === "LINK" || recurso.tipo === "VIDEO" || recurso.linkVideo) {
                nuevoLink = window.prompt(
                    "URL (YouTube / página web):",
                    recurso.linkVideo || ""
                );
                if (nuevoLink === null) return;
            }

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const payload = {
                titulo: nuevoTitulo.trim(),
                descripcion: nuevaDescripcion.trim() || null,
                linkVideo: nuevoLink.trim() || null,
                tipo: recurso.tipo,
                momento: recurso.momento,
                sesionId: recurso.sesionId,
                archivoUrl: recurso.archivoUrl || null,
                // si tu backend también permite editar fechas de tarea, aquí las enviarías
                fechaInicioEntrega: recurso.fechaInicioEntrega || null,
                fechaFinEntrega: recurso.fechaFinEntrega || null,
                permiteEntregas: recurso.permiteEntregas || false,
            };

            const response = await axios.put(
                `${API_BASE_URL}/recursos/${recurso.id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            handleRecursoActualizado(response.data);
            alert("Recurso actualizado correctamente.");
        } catch (err) {
            console.error("Error al actualizar recurso:", err);
            alert(
                err.response?.data?.message || "No se pudo actualizar el recurso."
            );
        }
    };

    const handleEliminarRecurso = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este recurso?")) return;

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            await axios.delete(`${API_BASE_URL}/recursos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            handleRecursoEliminado(id);
            alert("Recurso eliminado.");
        } catch (err) {
            console.error("Error al eliminar recurso:", err);
            alert(err.response?.data?.message || "No se pudo eliminar el recurso.");
        }
    };

    const handleVerDetalleTarea = async (recurso) => {
        try {
            setTareaSeleccionada(recurso);
            setShowModalTarea(true);
            setLoadingEntregas(true);
            setErrorEntregas(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // 👉 Llama al endpoint del backend para listar entregas de esa tarea
            const response = await axios.get(
                `${API_BASE_URL}/tareas/${recurso.id}/entregas`,
                config
            );

            setEntregasTarea(response.data || []);
        } catch (err) {
            console.error("Error al cargar entregas de la tarea:", err);
            setErrorEntregas(
                err.response?.data?.message ||
                "No se pudieron cargar las entregas de esta tarea."
            );
            setEntregasTarea([]);
        } finally {
            setLoadingEntregas(false);
        }
    };

    const cerrarModalTareaDocente = () => {
        setShowModalTarea(false);
        setTareaSeleccionada(null);
        setEntregasTarea([]);
        setErrorEntregas(null);
    };


    // --- Cargar sesiones ---
    useEffect(() => {
        const cargarSesiones = async () => {
            try {
                setLoadingSesiones(true);
                setErrorSesiones(null);

                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No estás autenticado.");

                const config = { headers: { Authorization: `Bearer ${token}` } };

                const response = await axios.get(
                    `${API_BASE_URL}/sesiones/seccion/${seccionId}`,
                    config
                );

                setSesiones(response.data || []);
            } catch (err) {
                console.error("Error al cargar sesiones:", err);
                setErrorSesiones(
                    err.response?.data?.message || "No se pudieron cargar las sesiones de la sección."
                );
            } finally {
                setLoadingSesiones(false);
            }
        };

        if (seccionId) {
            cargarSesiones();
        }
    }, [seccionId]);

    // --- Cargar sección si no llegó por state ---
    useEffect(() => {
        const cargarSeccion = async () => {
            if (seccion) return;

            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('authToken');
                if (!token) throw new Error("No estás autenticado.");

                const config = { headers: { Authorization: `Bearer ${token}` } };

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

    // Sesión actual según semana
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

    const handleRecursoCreado = (nuevoRecurso) => {
        setRecursos((prev) => [...prev, nuevoRecurso]);
    };

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

    const numeroSemanas = seccion.numeroSemanas || sesiones.length || 0;
    const semanas = Array.from({ length: numeroSemanas }, (_, i) => i + 1);
    const semanaActual = seccion.semanaActual || 1;

    const handleClickSemana = (numSemana) => {
        setSemanaSeleccionada(numSemana);
    };

    const handleTomarAsistencia = () => {
        if (!sesiones || sesiones.length === 0) {
            alert("No hay sesiones creadas para esta sección.");
            return;
        }

        const index = semanaSeleccionada - 1;
        const sesionSeleccionada = sesiones[index];

        if (!sesionSeleccionada) {
            alert("No se encontró la sesión correspondiente a esta semana.");
            return;
        }

        navigate(`/docente/seccion/${seccion.id}/asistencias/${sesionSeleccionada.id}`);
    };

    // Agrupar por momento
    const recursosExplora = recursos.filter((r) => r.momento === "ANTES");
    const recursosEstudia = recursos.filter((r) => r.momento === "DURANTE");
    const recursosAplica = recursos.filter((r) => r.momento === "DESPUES");

    const formatDateTimeLocal = (value) => {
        if (!value) return "";
        const d = new Date(value);
        return d.toLocaleString();
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

                    const botonTexto = isLink
                        ? "Abrir enlace"
                        : isFile
                            ? "Ver recurso"
                            : isTarea
                                ? "Ver detalle"
                                : "Ver recurso";

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
                                            r.permiteEntregas ? "pill pill-green" : "pill pill-gray"
                                        }
                                    >
                                        {r.permiteEntregas
                                            ? "Entregas habilitadas"
                                            : "Entregas deshabilitadas"}
                                    </span>
                                </div>
                            )}

                            {/* Links simples (YouTube / web) siguen igual */}
                            {isLink && !isTarea && (
                                <a
                                    href={r.linkVideo}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="recurso-card-btn"
                                >
                                    {botonTexto}
                                </a>
                            )}

                            {/* Archivos físicos (PDF, DOCUMENTO, IMAGEN, ARCHIVO genérico) → modal */}
                            {isFile && !isTarea && (
                                <button
                                    type="button"
                                    className="recurso-card-btn"
                                    onClick={() => abrirModalRecurso(r)}
                                >
                                    {botonTexto}
                                </button>
                            )}

                            {/* TAREA → modal de detalle de tarea (cuando lo integres) */}
                            {isTarea && (
                                <button
                                    type="button"
                                    className="recurso-card-btn"
                                    onClick={() => handleVerDetalleTarea(r)}
                                >
                                    Detalle de tarea
                                </button>
                            )}

                            <div className="recurso-card-actions">
                                <button
                                    type="button"
                                    className="btn-recurso-edit"
                                    onClick={() => handleEditarRecurso(r)}
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    className="btn-recurso-delete"
                                    onClick={() => handleEliminarRecurso(r.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="docente-layout">
            {/* SIDEBAR */}
            <aside className='docente-sidebar'>
                <div className='sidebar-header'>
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className='sidebar-role'>Docente</span>
                </div>

                <nav className='sidebar-menu'>
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <a href="/pantalla-docente" className='active'>
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
                    </ul>
                </nav>
            </aside>

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
                                    <p>{userName}</p>
                                </div>
                            </div>
                            <div className='content-third'>
                                <FontAwesomeIcon icon={faEnvelope} className='icon-text' />
                                <p>{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className='content-body-seccion'>
                        <main className="docente-main">
                            {/* BARRA DE SEMANAS */}
                            <section className="semanas-section">
                                <h2>Sesiones de clase:</h2>
                                <div className="semanas-container">
                                    {semanas.map((num) => {
                                        const esActual = num === semanaActual;
                                        const esSeleccionada = num === semanaSeleccionada;
                                        const esBloqueada = num > semanaActual;

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

                            {/* CONTENIDO DE LA SEMANA */}
                            <section className="contenido-semana-section-teacher">
                                <div>
                                    <h3 className='title-sesion'>
                                        Sesión {semanaSeleccionada.toString().padStart(2, "0")}
                                        {semanaSeleccionada === semanaActual && " (ACTUAL)"}
                                    </h3>
                                    <button
                                        className="btn-primary"
                                        onClick={handleTomarAsistencia}
                                        disabled={loadingSesiones || sesiones.length === 0}
                                    >
                                        {loadingSesiones
                                            ? "Cargando sesiones..."
                                            : `Tomar asistencia de Semana ${semanaSeleccionada}`}
                                    </button>
                                </div>

                                <p>Contenido del Curso:</p>

                                {errorSesiones && (
                                    <p className="error-message">
                                        ❌ {errorSesiones}
                                    </p>
                                )}

                                <div className="contenido-semana-card-seccion">
                                    {/* EXPLORA */}
                                    <div className='area-explora'>
                                        <h4>EXPLORAMOS</h4>

                                        {sesionActualId && (
                                            <RecursoForm
                                                sesionId={sesionActualId}
                                                momento="ANTES"
                                                onRecursoCreado={handleRecursoCreado}
                                            />
                                        )}

                                        {renderListaRecursos(recursosExplora)}
                                    </div>

                                    {/* ESTUDIA */}
                                    <div className='area-estudio'>
                                        <h4>ESTUDIAMOS</h4>

                                        {sesionActualId && (
                                            <RecursoForm
                                                sesionId={sesionActualId}
                                                momento="DURANTE"
                                                onRecursoCreado={handleRecursoCreado}
                                            />
                                        )}

                                        {renderListaRecursos(recursosEstudia)}
                                    </div>

                                    {/* APLICA */}
                                    <div className='area-aplica'>
                                        <h4>APLICAMOS</h4>

                                        {sesionActualId && (
                                            <RecursoForm
                                                sesionId={sesionActualId}
                                                momento="DESPUES"
                                                onRecursoCreado={handleRecursoCreado}
                                            />
                                        )}

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
                            {recursoSeleccionado.descripcion && (
                                <p className="modal-tarea-desc">{recursoSeleccionado.descripcion}</p>
                            )}

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

                                // PDF
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

                                // DOCUMENTO (Word) → opcionalmente Google Docs Viewer
                                if (tipo === "DOCUMENTO") {
                                    const googleViewerUrl =
                                        "https://docs.google.com/gview?embedded=true&url=" +
                                        encodeURIComponent(url);

                                    return (
                                        <div className="preview-frame-wrapper">
                                            {/* Si no te funciona el visor de Google, cambia src={googleViewerUrl} por src={url} */}
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

                        {/* Barra de acciones comunes (descargar / nueva ventana) */}
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


            {/* MODAL DETALLE TAREA - DOCENTE */}
            {showModalTarea && tareaSeleccionada && (
                <div className="modal-backdrop" onClick={cerrarModalTareaDocente}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detalle de tarea</h3>
                            <button className="modal-close" onClick={cerrarModalTareaDocente}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <h4>{tareaSeleccionada.titulo}</h4>

                            {tareaSeleccionada.descripcion && (
                                <p className="modal-tarea-desc">
                                    {tareaSeleccionada.descripcion}
                                </p>
                            )}

                            <div className="modal-tarea-meta">
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

                            <hr />

                            <h4>Entregas de los alumnos</h4>

                            {loadingEntregas && <p>Cargando entregas...</p>}
                            {errorEntregas && (
                                <p className="recurso-error">❌ {errorEntregas}</p>
                            )}

                            {!loadingEntregas && !errorEntregas && entregasTarea.length === 0 && (
                                <p>No hay entregas registradas aún.</p>
                            )}

                            {!loadingEntregas && entregasTarea.length > 0 && (
                                <table className="tabla-entregas">
                                    <thead>
                                        <tr>
                                            <th>Alumno</th>
                                            <th>Título</th>
                                            <th>Fecha entrega</th>
                                            <th>Archivo</th>
                                            <th>Nota</th>
                                            <th>Retroalimentación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entregasTarea.map((e) => (
                                            <tr key={e.id}>
                                                <td>{e.alumnoNombre || `ID: ${e.alumnoId}`}</td>
                                                <td>{e.titulo || "(sin título)"}</td>
                                                <td>
                                                    {e.fechaEntrega
                                                        ? formatDateTimeLocal(e.fechaEntrega)
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {e.archivoUrl ? (
                                                        <a
                                                            href={buildFileUrl(e.archivoUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Ver archivo
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                                <td>{e.nota != null ? e.nota : "-"}</td>
                                                <td>{e.retroalimentacion || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
