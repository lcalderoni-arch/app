// src/pages/Roles/Admin/GestionMatricula.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import { API_BASE_URL } from "../../config/api.js";
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionMatricula.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChalkboard,
    faCalendarDays,
    faSave,
    faLock,
    faLockOpen,
    faRotateRight,
    faUserGraduate,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

function GestionMatricula() {
    const token = localStorage.getItem("authToken");

    // --- Estados de configuración ---
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [errorConfig, setErrorConfig] = useState(null);

    // Estado global de "matrícula habilitada / bloqueada"
    const [matriculaHabilitada, setMatriculaHabilitada] = useState(null);
    const [cambiandoPermisoGlobal, setCambiandoPermisoGlobal] = useState(false);

    // --- Estados de estudiantes ---
    const [estudiantes, setEstudiantes] = useState([]);
    const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
    const [errorEstudiantes, setErrorEstudiantes] = useState(null);

    const [filtroNombre, setFiltroNombre] = useState("");
    const [reiniciando, setReiniciando] = useState(false);


    // --- Ciclo / Año escolar ---
    const [cicloActual, setCicloActual] = useState("");
    const [nuevoCiclo, setNuevoCiclo] = useState("");
    const [actualizandoCiclo, setActualizandoCiclo] = useState(false);


    // ================================
    //   CARGA DE CONFIGURACIÓN
    // ================================
    const cargarConfiguracion = useCallback(async () => {
        if (!token) return;

        setLoadingConfig(true);
        setErrorConfig(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(
                `${API_BASE_URL}/configuracion/matricula`,
                config
            );

            if (response && response.data) {
                // Si el backend devuelve "2025-10-23" (LocalDate), esto ya funciona bien
                setFechaInicio(response.data.fechaInicio || "");
                setFechaFin(response.data.fechaFin || "");
                // Ciclo actual si viene del backend
                setCicloActual(response.data.cicloActual || "");

                // Leemos el flag global si viene del backend
                if (typeof response.data.matriculaHabilitada === "boolean") {
                    setMatriculaHabilitada(response.data.matriculaHabilitada);
                } else {
                    setMatriculaHabilitada(null);
                }
            } else {
                setFechaInicio("");
                setFechaFin("");
                setMatriculaHabilitada(null);
            }
        } catch (error) {
            console.error("Error cargando configuración:", error);
            setErrorConfig("No se pudo cargar la configuración de matrícula.");
            setMatriculaHabilitada(null);
        } finally {
            setLoadingConfig(false);
        }
    }, [token]);

    // ================================
    //   CARGA DE ESTUDIANTES
    // ================================
    const cargarEstudiantes = useCallback(async () => {
        if (!token) return;

        setLoadingEstudiantes(true);
        setErrorEstudiantes(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(
                `${API_BASE_URL}/usuarios/alumnos`,
                config
            );

            if (Array.isArray(response.data)) {
                setEstudiantes(response.data);
            } else {
                setEstudiantes([]);
            }
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
            setErrorEstudiantes("No se pudieron cargar los estudiantes.");
            setEstudiantes([]);
        } finally {
            setLoadingEstudiantes(false);
        }
    }, [token]);

    // ================================
    //   EFECTO INICIAL
    // ================================
    useEffect(() => {
        if (!token) return;
        cargarConfiguracion();
        cargarEstudiantes();
    }, [token, cargarConfiguracion, cargarEstudiantes]);

    // ================================
    //   GUARDAR FECHAS DE MATRÍCULA
    // ================================
    const handleGuardarFechas = async (e) => {
        e.preventDefault();
        if (!fechaInicio || !fechaFin) {
            alert("Seleccione ambas fechas de inicio y fin.");
            return;
        }

        const inicio = new Date(fechaInicio + "T00:00:00");
        const fin = new Date(fechaFin + "T00:00:00");

        if (inicio > fin) {
            alert("La fecha de inicio no puede ser mayor que la fecha de cierre.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { fechaInicio, fechaFin };
            await axios.post(
                `${API_BASE_URL}/configuracion/matricula`,
                payload,
                config
            );
            alert("Fechas de matrícula actualizadas correctamente.");
            setErrorConfig(null);
        } catch (error) {
            console.error("Error guardando fechas:", error);
            setErrorConfig("No se pudieron guardar las fechas de matrícula.");
            alert("No se pudieron guardar las fechas.");
        }
    };

    // ================================
    //   CAMBIAR PERMISO GLOBAL MATRÍCULA
    // ================================
    const handleTogglePermisoGlobal = async () => {
        if (matriculaHabilitada === null) {
            alert("La configuración de matrícula aún no se ha cargado.");
            return;
        }

        const nuevoEstado = !matriculaHabilitada;

        if (
            !window.confirm(
                `¿Seguro que deseas ${nuevoEstado ? "HABILITAR" : "BLOQUEAR"
                } las matrículas para todos los estudiantes?`
            )
        ) {
            return;
        }

        try {
            setCambiandoPermisoGlobal(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(
                `${API_BASE_URL}/configuracion/matricula/permiso-matricula`,
                { habilitado: nuevoEstado },   // CAMBIAR A "habilitado"
                config
            );

            setMatriculaHabilitada(nuevoEstado);
            alert(
                `Matrículas ${nuevoEstado ? "habilitadas" : "bloqueadas"
                } correctamente a nivel global.`
            );
        } catch (error) {
            console.error("Error al cambiar permiso global:", error);
            alert("No se pudo cambiar el permiso global de matrícula.");
        } finally {
            setCambiandoPermisoGlobal(false);
        }
    };

    const handleActualizarCiclo = async () => {
        const valor = (nuevoCiclo || "").trim();

        if (!valor) {
            alert("Escribe el nuevo Año escolar / Periodo. Ej: 2026 o 2026-I");
            return;
        }

        if (!window.confirm(`¿Seguro que deseas cambiar el ciclo actual a: ${valor}?`)) return;

        try {
            setActualizandoCiclo(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(
                `${API_BASE_URL}/configuracion/matricula/ciclo`,
                { cicloActual: valor },
                config
            );

            setCicloActual(valor);
            setNuevoCiclo("");

            alert("Ciclo/Año escolar actualizado correctamente.");
        } catch (error) {
            console.error("Error actualizando ciclo:", error);
            alert("No se pudo actualizar el ciclo. Revisa backend / endpoint.");
        } finally {
            setActualizandoCiclo(false);
        }
    };

    // ================================
    //   CAMBIAR PERMISO DE MATRÍCULA (POR ESTUDIANTE)
    // ================================
    const handleTogglePermiso = async (estudiante) => {
        const nuevoEstado = !estudiante.habilitadoMatricula;

        if (
            !window.confirm(
                `¿Cambiar permiso de matrícula para ${estudiante.nombre}?`
            )
        )
            return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.patch(
                `${API_BASE_URL}/usuarios/${estudiante.id}/permiso-matricula`,
                { habilitado: nuevoEstado },
                config
            );

            // Actualización optimista
            setEstudiantes((prev) =>
                prev.map((e) =>
                    e.id === estudiante.id
                        ? { ...e, habilitadoMatricula: nuevoEstado }
                        : e
                )
            );
        } catch (error) {
            console.error(`Error al cambiar permiso:`, error);
            alert(`Error al actualizar el estudiante.`);
        }
    };

    // ================================
    //   REINICIAR CICLO ACADÉMICO
    // ================================
    const handleReiniciarCiclo = async () => {
        const confirmacion = window.prompt(
            "⚠️ PELIGRO: Esta acción es irreversible.\nEscribe 'REINICIAR' para confirmar:"
        );
        if (confirmacion !== "REINICIAR") return;

        try {
            setReiniciando(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const resp = await axios.post(
                `${API_BASE_URL}/matriculas/reset-ciclo`,
                {},
                config
            );

            console.log("RESPUESTA RESET-CICLO:", resp.data);

            alert("Ciclo reiniciado, matrículas archivadas y permisos bloqueados.");

            // Muy importante: recargar estado global y alumnos
            await Promise.all([
                cargarConfiguracion(), // vuelve a leer matriculaHabilitada
                cargarEstudiantes(),   // vuelve a leer habilitadoMatricula de cada alumno
            ]);
        } catch (error) {
            console.error("Error reiniciando ciclo:", error);
            if (error.response) {
                console.error("Respuesta del backend:", error.response.data);
            }
            alert("Error al reiniciar el ciclo.");
        } finally {
            setReiniciando(false);
        }
    };

    // ================================
    //   FILTRAR ESTUDIANTES
    // ================================
    const estudiantesFiltrados = Array.isArray(estudiantes)
        ? estudiantes.filter((e) => {
            const texto = filtroNombre.trim().toLowerCase();
            if (texto === "") return true;

            const nombre = (e.nombre || "").toLowerCase();
            const email = (e.email || "").toLowerCase();
            const dni = (e.dni || e.dniAlumno || "").toString();

            return (
                nombre.includes(texto) ||
                email.includes(texto) ||
                dni.includes(filtroNombre)
            );
        })
        : [];

    // ================================
    //   RENDER
    // ================================
    if (!token) {
        return (
            <div className="general-box-gestionmatricula">
                <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
                    No estás autenticado. Inicia sesión nuevamente.
                </p>
            </div>
        );
    }

    return (
        <div className="general-box-gestionmatricula">
            <div className="header-firstpage-admin">
                <img className="icon" src={icon} alt="Logo" />
                <h1>Plataforma de Matrícula Reinvented Rimac</h1>
            </div>

            <div className="div-box-header-text-gestionmatricula">
                <div className="alinear-al-centro">
                    <h2>
                        <FontAwesomeIcon className="icon" icon={faChalkboard} /> Gestión de
                        Matrícula
                    </h2>
                </div>
                <p>Define fechas de inscripción y permisos de acceso para alumnos.</p>

                {errorConfig && (
                    <p style={{ color: "red", marginTop: "0.5rem" }}>{errorConfig}</p>
                )}
                {errorEstudiantes && (
                    <p style={{ color: "red", marginTop: "0.5rem" }}>
                        {errorEstudiantes}
                    </p>
                )}
            </div>

            {/* SECCIÓN 1: FECHAS + ESTADO GLOBAL */}
            <div className="box-formulario-gestionmatricula">
                <div className="centrar-tercer-titulo">
                    <h3>
                        <FontAwesomeIcon className="icon" icon={faCalendarDays} /> Periodo
                        de Matricula
                    </h3>
                    <p>Administra la fecha de la matricula y a los estudiantes de la plataforma.</p>
                </div>

                <form className="auth-form-gestionmatricula" onSubmit={handleGuardarFechas}>
                    <div className="auth-form-gestionmatricula-area-form">
                        <div className="auth-form-area-form">
                            <div className="form-area-datos-description">
                                <label>
                                    Fecha Inicio:
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        required
                                    />
                                </label>

                                <label>
                                    Fecha Cierre:
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <div className="form-buttons">
                                <button
                                    type="submit"
                                    className="btn-create"
                                    disabled={loadingConfig}
                                    style={{ marginBottom: "2px" }}
                                >
                                    <FontAwesomeIcon icon={faSave} />{" "}
                                    {loadingConfig ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* ESTADO GLOBAL DE MATRÍCULA */}
                <div
                    style={{
                        marginTop: "15px",
                        textAlign: "center",
                    }}
                >
                    {matriculaHabilitada !== null && (
                        <>
                            <p style={{ marginBottom: "10px" }}>
                                Pantalla de Matricula:{" "}
                                {matriculaHabilitada ? (
                                    <span style={{ color: "green", fontWeight: "bold" }}>
                                        <FontAwesomeIcon icon={faLockOpen} /> HABILITADAS
                                    </span>
                                ) : (
                                    <span style={{ color: "red", fontWeight: "bold" }}>
                                        <FontAwesomeIcon icon={faLock} /> BLOQUEADAS
                                    </span>
                                )}
                            </p>
                            <button
                                onClick={handleTogglePermisoGlobal}
                                className="btn-create"
                                style={{
                                    backgroundColor: matriculaHabilitada
                                        ? "#dc3545"
                                        : "#28a745",
                                    border: "none",
                                    color: "white",
                                    padding: "8px 16px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginBottom: "20px"
                                }}
                                disabled={cambiandoPermisoGlobal}
                            >
                                {cambiandoPermisoGlobal
                                    ? "Aplicando..."
                                    : matriculaHabilitada
                                        ? "Bloquear todas las matrículas"
                                        : "Habilitar todas las matrículas"}
                            </button>
                        </>
                    )}
                </div>

                {/* BLOQUE: CICLO ACTUAL + CAMBIO DE CICLO */}
                <div className="box-ciclo-actual">
                    <div className="box-ciclo-header">
                        <h4>Año escolar / Periodo actual</h4>
                        <span className="ciclo-pill">{cicloActual || "-"}</span>
                    </div>

                    <p className="box-ciclo-desc">
                        En colegios es común manejar <strong>Año escolar</strong> (ej. 2025 / 2026).
                        Si tu institución lo maneja por periodos, puedes usar 2025-I / 2025-II.
                    </p>

                    <div className="box-ciclo-actions">
                        <input
                            type="text"
                            placeholder="Ej: 2026 o 2026-I"
                            value={nuevoCiclo}
                            onChange={(e) => setNuevoCiclo(e.target.value)}
                        />
                        <button
                            onClick={handleActualizarCiclo}
                            disabled={actualizandoCiclo}
                            className="btn-create"
                            style={{ border: "none", color: "white", backgroundColor: "#333" }}
                        >
                            {actualizandoCiclo ? "Actualizando..." : "Actualizar Año/Periodo"}
                        </button>
                    </div>
                </div>


            </div>

            {/* SECCIÓN 2: CAMBIO DE CICLO */}
            <div
                className="box-actions-ciclo"
                style={{
                    textAlign: "center",
                    margin: "30px auto 50px auto",
                    maxWidth: "800px",
                    padding: "15px",
                    border: "1px dashed #dc3545",
                    borderRadius: "8px",
                    background: "#fff5f5",
                }}
            >
                <h4
                    style={{
                        color: "#dc3545",
                        margin: "0 0 10px 0",
                    }}
                >
                    <FontAwesomeIcon icon={faTriangleExclamation} /> Cambio de Ciclo
                    Académico
                </h4>
                <p style={{ marginBottom: "10px" }}>
                    Esta acción archiva las matrículas vigentes y marca el cierre del
                    ciclo actual.
                </p>
                <button
                    onClick={handleReiniciarCiclo}
                    className="btn-delete"
                    style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    disabled={reiniciando}
                >
                    <FontAwesomeIcon icon={faRotateRight} />{" "}
                    {reiniciando ? "Reiniciando..." : "Cerrar Ciclo y Archivar Matrículas"}
                </button>
            </div>

            {/* SECCIÓN 3: TABLA ESTUDIANTES */}
            <div className="filtros-container">
                <div className="filtros-header">
                    <h4>
                        <FontAwesomeIcon className="icon" icon={faUserGraduate} /> Control
                        de Acceso de Estudiantes
                    </h4>
                </div>
                <div style={{ padding: "15px" }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o DNI..."
                        value={filtroNombre}
                        onChange={(e) => setFiltroNombre(e.target.value)}
                        style={{
                            padding: "8px",
                            width: "100%",
                            maxWidth: "300px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                        }}
                    />
                </div>

                <div className="table-users-gestioncursos">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>DNI</th>
                                <th>Estado de Matrícula</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingEstudiantes ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        Cargando estudiantes...
                                    </td>
                                </tr>
                            ) : estudiantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        No se encontraron estudiantes.
                                    </td>
                                </tr>
                            ) : (
                                estudiantesFiltrados.map((est) => (
                                    <tr key={est.id}>
                                        <td>{est.nombre}</td>
                                        <td>{est.email}</td>
                                        <td>{est.dni || est.dniAlumno || "-"}</td>
                                        <td>
                                            {est.habilitadoMatricula ? (
                                                <span
                                                    style={{ color: "green", fontWeight: "bold" }}
                                                >
                                                    <FontAwesomeIcon icon={faLockOpen} /> Habilitado
                                                </span>
                                            ) : (
                                                <span
                                                    style={{ color: "red", fontWeight: "bold" }}
                                                >
                                                    <FontAwesomeIcon icon={faLock} /> Bloqueado
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleTogglePermiso(est)}
                                                className={
                                                    est.habilitadoMatricula
                                                        ? "btn-delete"
                                                        : "btn-create"
                                                }
                                                style={{
                                                    padding: "5px 10px",
                                                    borderRadius: "4px",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "white",
                                                    backgroundColor: est.habilitadoMatricula
                                                        ? "#dc3545"
                                                        : "#28a745",
                                                }}
                                            >
                                                {est.habilitadoMatricula
                                                    ? "Bloquear"
                                                    : "Habilitar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default GestionMatricula;
