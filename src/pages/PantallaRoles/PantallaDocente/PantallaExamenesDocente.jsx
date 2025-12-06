import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../../../config/api";
import icon from "../../../assets/logo.png";
import LogoutButton from "../../../components/login/LogoutButton";
import "../../../styles/RolesStyle/DocenteStyle/ExamenesDocente.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBook,
    faCalendar,
    faChartLine,
    faBell,
    faUser,
    faPlus,
    faSave,
} from "@fortawesome/free-solid-svg-icons";

export default function PantallaExamenesDocente() {
    const { seccionId } = useParams();
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");

    const [seccion, setSeccion] = useState(null);
    const [loadingSeccion, setLoadingSeccion] = useState(true);
    const [errorSeccion, setErrorSeccion] = useState(null);

    const [examenes, setExamenes] = useState([]);
    const [loadingExamenes, setLoadingExamenes] = useState(true);
    const [errorExamenes, setErrorExamenes] = useState(null);

    const [examenSeleccionadoId, setExamenSeleccionadoId] = useState(null);
    const [notasData, setNotasData] = useState(null);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [errorNotas, setErrorNotas] = useState(null);

    // Para edición de notas
    const [notasEditables, setNotasEditables] = useState({});

    // Formulario nuevo examen
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevoDescripcion, setNuevoDescripcion] = useState("");
    const [nuevoFecha, setNuevoFecha] = useState("");
    const [nuevoPeso, setNuevoPeso] = useState("");
    const [nuevoNotaMax, setNuevoNotaMax] = useState("20");
    const [creandoExamen, setCreandoExamen] = useState(false);

    // ================= CARGAR SECCIÓN =================
    useEffect(() => {
        const fetchSeccion = async () => {
            try {
                setLoadingSeccion(true);
                setErrorSeccion(null);

                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No estás autenticado.");

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const resp = await axios.get(
                    `${API_BASE_URL}/secciones/${seccionId}`,
                    config
                );
                setSeccion(resp.data);
            } catch (err) {
                console.error("Error al cargar sección:", err);
                setErrorSeccion(
                    err.response?.data?.message || "No se pudo cargar la sección."
                );
            } finally {
                setLoadingSeccion(false);
            }
        };

        if (seccionId) {
            fetchSeccion();
        }
    }, [seccionId]);

    // ================= CARGAR EXÁMENES =================
    const cargarExamenes = async () => {
        try {
            setLoadingExamenes(true);
            setErrorExamenes(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const resp = await axios.get(
                `${API_BASE_URL}/docente/secciones/${seccionId}/examenes`,
                config
            );

            setExamenes(resp.data || []);
        } catch (err) {
            console.error("Error al cargar exámenes:", err);
            setErrorExamenes(
                err.response?.data?.message || "No se pudieron cargar los exámenes."
            );
        } finally {
            setLoadingExamenes(false);
        }
    };

    useEffect(() => {
        if (seccionId) {
            cargarExamenes();
        }
        // Si tu ESLint se queja por cargarExamenes en deps, puedes desactivar:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seccionId]);

    // ================= CARGAR NOTAS DE UN EXAMEN =================
    const cargarNotasExamen = async (examenId) => {
        try {
            setExamenSeleccionadoId(examenId);
            setLoadingNotas(true);
            setErrorNotas(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const resp = await axios.get(
                `${API_BASE_URL}/docente/examenes/${examenId}/notas`,
                config
            );

            setNotasData(resp.data || null);

            const map = {};
            (resp.data?.alumnos || []).forEach((fila) => {
                map[fila.alumnoId] = fila.nota ?? "";
            });
            setNotasEditables(map);
        } catch (err) {
            console.error("Error al cargar notas del examen:", err);
            setErrorNotas(
                err.response?.data?.message || "No se pudieron cargar las notas del examen."
            );
        } finally {
            setLoadingNotas(false);
        }
    };

    // ================= CREAR NUEVO EXAMEN =================
    const handleCrearExamen = async (e) => {
        e.preventDefault();

        if (!nuevoTitulo.trim()) {
            alert("El título es obligatorio.");
            return;
        }

        const peso = parseFloat(nuevoPeso);
        if (isNaN(peso) || peso <= 0) {
            alert("El peso porcentual debe ser un número mayor a 0.");
            return;
        }

        const notaMax = parseFloat(nuevoNotaMax);
        if (isNaN(notaMax) || notaMax <= 0) {
            alert("La nota máxima debe ser un número mayor a 0.");
            return;
        }

        try {
            setCreandoExamen(true);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                titulo: nuevoTitulo.trim(),
                descripcion: nuevoDescripcion.trim() || null,
                fecha: nuevoFecha || null,
                pesoPorcentual: peso,
                notaMaxima: notaMax,
                orden: null,
            };

            await axios.post(
                `${API_BASE_URL}/docente/secciones/${seccionId}/examenes`,
                payload,
                config
            );

            // Recargar exámenes
            await cargarExamenes();

            // Limpiar form
            setNuevoTitulo("");
            setNuevoDescripcion("");
            setNuevoFecha("");
            setNuevoPeso("");
            setNuevoNotaMax("20");
        } catch (err) {
            console.error("Error al crear examen:", err);
            alert(
                err.response?.data?.message ||
                "No se pudo crear el examen. Verifica que la suma de pesos no supere el 100%."
            );
        } finally {
            setCreandoExamen(false);
        }
    };

    // ================= MANEJO DE NOTAS EDITABLES =================
    const handleChangeNota = (alumnoId, value) => {
        setNotasEditables((prev) => ({
            ...prev,
            [alumnoId]: value,
        }));
    };

    const handleGuardarNotas = async () => {
        if (!examenSeleccionadoId || !notasData) return;

        if (!window.confirm("¿Guardar notas del examen?")) return;

        try {
            setLoadingNotas(true);
            setErrorNotas(null);

            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No estás autenticado.");

            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = (notasData.alumnos || []).map((fila) => {
                const raw = notasEditables[fila.alumnoId];
                const nota =
                    raw === "" || raw === null || raw === undefined
                        ? null
                        : Number(raw);

                return {
                    alumnoId: fila.alumnoId,
                    nota,
                };
            });

            const resp = await axios.put(
                `${API_BASE_URL}/docente/examenes/${examenSeleccionadoId}/notas`,
                payload,
                config
            );

            setNotasData(resp.data || null);

            const map = {};
            (resp.data?.alumnos || []).forEach((fila) => {
                map[fila.alumnoId] = fila.nota ?? "";
            });
            setNotasEditables(map);

            alert("Notas guardadas correctamente.");
        } catch (err) {
            console.error("Error al guardar notas:", err);
            setErrorNotas(
                err.response?.data?.message ||
                "No se pudieron guardar las notas."
            );
        } finally {
            setLoadingNotas(false);
        }
    };

    const renderEstadoBadge = (estado) => {
        if (estado === "APROBADO") {
            return <span className="badge-estado badge-aprobado">Aprobado</span>;
        }
        if (estado === "DESAPROBADO") {
            return <span className="badge-estado badge-desaprobado">Desaprobado</span>;
        }
        return <span className="badge-estado badge-pendiente">Pendiente</span>;
    };

    return (
        <div className="docente-layout">
            {/* SIDEBAR IZQUIERDO */}
            <aside className="docente-sidebar">
                <div className="sidebar-header">
                    <img className="sidebar-icon" src={icon} alt="Logo Campus" />
                    <span className="sidebar-role">Docente</span>
                </div>

                <nav className="sidebar-menu">
                    <h3>Menú Principal</h3>
                    <ul>
                        <li>
                            <Link to="/pantalla-docente">
                                <FontAwesomeIcon icon={faBook} className="icon-text" />
                                Mis Cursos
                            </Link>
                        </li>
                        <li>
                            <Link to="/docente/horario">
                                <FontAwesomeIcon icon={faCalendar} className="icon-text" />
                                Horario
                            </Link>
                        </li>
                        <li>
                            <Link to="/docente/progreso">
                                <FontAwesomeIcon icon={faChartLine} className="icon-text" />
                                Progreso
                            </Link>
                        </li>
                        <li>
                            <a href="#notificaciones">
                                <FontAwesomeIcon icon={faBell} className="icon-text" />
                                Notificaciones
                            </a>
                        </li>
                    </ul>
                </nav>

                <nav className="sidebar-menu">
                    <h3>Cuenta</h3>
                    <ul>
                        <li>
                            <Link to="/mi-perfil">
                                <FontAwesomeIcon icon={faUser} className="icon-text" />
                                Mi Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* COLUMNA DERECHA */}
            <div className="docente-right-area">
                <header className="docente-header">
                    <div className="header-content">
                        <div className="name-header">
                            <p>
                                Bienvenido, <strong>{userName}</strong>
                            </p>
                            <h1>Exámenes de la sección</h1>
                        </div>
                        <div className="header-right">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <main className="docente-main docente-examenes-main">
                    {/* Info de sección */}
                    {loadingSeccion && <p>Cargando sección...</p>}
                    {errorSeccion && (
                        <p className="error-message">❌ {errorSeccion}</p>
                    )}
                    {seccion && (
                        <section className="examenes-seccion-info">
                            <div>
                                <h2>{seccion.curso?.titulo || "Curso"}</h2>
                                <p>
                                    Sección: <strong>{seccion.nombre}</strong> |{" "}
                                    <span>Grado: {seccion.gradoSeccion}</span>
                                </p>
                            </div>
                            <button
                                className="btn-volver"
                                onClick={() => navigate(-1)}
                            >
                                Volver
                            </button>
                        </section>
                    )}

                    <div className="examenes-layout">
                        {/* Columna izquierda: lista de exámenes + creación */}
                        <section className="examenes-col-left">
                            <h3>Exámenes de la sección</h3>

                            {loadingExamenes && <p>Cargando exámenes...</p>}
                            {errorExamenes && (
                                <p className="error-message">❌ {errorExamenes}</p>
                            )}

                            {!loadingExamenes && examenes.length === 0 && (
                                <p>No hay exámenes definidos todavía.</p>
                            )}

                            <div className="examenes-list">
                                {examenes.map((ex) => (
                                    <article
                                        key={ex.examenId}
                                        className={
                                            "examen-card" +
                                            (ex.examenId === examenSeleccionadoId
                                                ? " examen-card-activo"
                                                : "")
                                        }
                                        onClick={() => cargarNotasExamen(ex.examenId)}
                                    >
                                        <header>
                                            <h4>{ex.titulo}</h4>
                                        </header>
                                        <p className="examen-sub">
                                            Peso: <strong>{ex.pesoPorcentual}%</strong>{" "}
                                            {ex.fecha && <> | Fecha: {ex.fecha}</>}
                                        </p>
                                        <div className="examen-stats-mini">
                                            <span>Aprob: {ex.aprobados}</span>
                                            <span>Desap: {ex.desaprobados}</span>
                                            <span>Pend: {ex.pendientes}</span>
                                        </div>
                                        {ex.promedio != null && (
                                            <p className="examen-prom">
                                                Promedio:{" "}
                                                <strong>{ex.promedio.toFixed(2)}</strong>
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>

                            {/* Form crear examen */}
                            <section className="examen-crear-section">
                                <h4>
                                    <FontAwesomeIcon icon={faPlus} /> Nuevo examen
                                </h4>
                                <form onSubmit={handleCrearExamen} className="examen-crear-form">
                                    <label>
                                        Título
                                        <input
                                            type="text"
                                            value={nuevoTitulo}
                                            onChange={(e) => setNuevoTitulo(e.target.value)}
                                            placeholder="Ej: Examen parcial"
                                        />
                                    </label>

                                    <label>
                                        Descripción (opcional)
                                        <textarea
                                            rows={2}
                                            value={nuevoDescripcion}
                                            onChange={(e) =>
                                                setNuevoDescripcion(e.target.value)
                                            }
                                        />
                                    </label>

                                    <label>
                                        Fecha (opcional)
                                        <input
                                            type="date"
                                            value={nuevoFecha}
                                            onChange={(e) => setNuevoFecha(e.target.value)}
                                        />
                                    </label>

                                    <div className="form-row-2">
                                        <label>
                                            Peso (%)
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                step="0.1"
                                                value={nuevoPeso}
                                                onChange={(e) => setNuevoPeso(e.target.value)}
                                            />
                                        </label>

                                        <label>
                                            Nota máxima
                                            <input
                                                type="number"
                                                min="1"
                                                step="0.5"
                                                value={nuevoNotaMax}
                                                onChange={(e) =>
                                                    setNuevoNotaMax(e.target.value)
                                                }
                                            />
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary-examen"
                                        disabled={creandoExamen}
                                    >
                                        {creandoExamen ? "Creando..." : "Crear examen"}
                                    </button>
                                </form>
                            </section>
                        </section>

                        {/* Columna derecha: notas del examen seleccionado */}
                        <section className="examenes-col-right">
                            {!examenSeleccionadoId && (
                                <p>
                                    Selecciona un examen en la lista para ver y registrar
                                    las notas.
                                </p>
                            )}

                            {examenSeleccionadoId && (
                                <>
                                    {loadingNotas && <p>Cargando notas...</p>}
                                    {errorNotas && (
                                        <p className="error-message">❌ {errorNotas}</p>
                                    )}
                                    {notasData && (
                                        <>
                                            <header className="examen-notas-header">
                                                <div>
                                                    <h3>{notasData.tituloExamen}</h3>
                                                    <p>
                                                        Nota máx:{" "}
                                                        <strong>
                                                            {notasData.notaMaxima}
                                                        </strong>{" "}
                                                        | Peso:{" "}
                                                        <strong>
                                                            {notasData.pesoPorcentual}%
                                                        </strong>{" "}
                                                        | Aprobado desde:{" "}
                                                        <strong>
                                                            {
                                                                notasData.notaMinimaAprobatoria
                                                            }
                                                        </strong>
                                                    </p>
                                                </div>
                                                <div className="examen-stats-boxes">
                                                    <div className="examen-stat-box aprob">
                                                        <span>Aprobados</span>
                                                        <strong>
                                                            {notasData.aprobados}
                                                        </strong>
                                                    </div>
                                                    <div className="examen-stat-box desap">
                                                        <span>Desaprobados</span>
                                                        <strong>
                                                            {notasData.desaprobados}
                                                        </strong>
                                                    </div>
                                                    <div className="examen-stat-box pend">
                                                        <span>Pendientes</span>
                                                        <strong>
                                                            {notasData.pendientes}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </header>

                                            <table className="tabla-notas-examen">
                                                <thead>
                                                    <tr>
                                                        <th>Alumno</th>
                                                        <th>Nota</th>
                                                        <th>Estado</th>
                                                        <th>Última actualización</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {notasData.alumnos.map((fila) => (
                                                        <tr key={fila.alumnoId}>
                                                            <td>{fila.alumnoNombre}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={
                                                                        notasData.notaMaxima
                                                                    }
                                                                    step="0.1"
                                                                    value={
                                                                        notasEditables[
                                                                        fila.alumnoId
                                                                        ] ?? ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleChangeNota(
                                                                            fila.alumnoId,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="input-nota"
                                                                />
                                                            </td>
                                                            <td>
                                                                {renderEstadoBadge(
                                                                    fila.estado
                                                                )}
                                                            </td>
                                                            <td>
                                                                {fila.fechaActualizacion
                                                                    ? fila.fechaActualizacion
                                                                    : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <div className="examen-notas-footer">
                                                <button
                                                    className="btn-primary"
                                                    onClick={handleGuardarNotas}
                                                    disabled={loadingNotas}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faSave}
                                                    />{" "}
                                                    {loadingNotas
                                                        ? "Guardando..."
                                                        : "Guardar notas"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
