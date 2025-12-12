import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

import "../../styles/Alumno/HistorialMatriculasAlumno.css";

const estadoLabel = (estado) => {
    switch (estado) {
        case "ACTIVA":
            return "Activa";
        case "RETIRADA":
            return "Retirada";
        case "COMPLETADA":
            return "Completada";
        default:
            return estado || "-";
    }
};

// Para colegios: “Año escolar” suena más natural que “ciclo”
const cicloLabelUI = (ciclo) => {
    if (!ciclo) return "-";
    // Si usas 2025-II, igual lo mostramos como “Año escolar / Periodo”
    return ciclo;
};

export default function HistorialMatriculasAlumno() {
    const token = localStorage.getItem("authToken");
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filtro por ciclo (Año escolar / Periodo)
    const [cicloSeleccionado, setCicloSeleccionado] = useState("TODOS");

    useEffect(() => {
        if (!token) return;

        const fetchHistorial = async () => {
            setLoading(true);
            setError(null);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const resp = await axios.get(`${API_BASE_URL}/matriculas/mis-matriculas`, config);

                const data = Array.isArray(resp.data) ? resp.data : [];
                // Orden: más reciente primero si hay fechas (fallback por id)
                data.sort((a, b) => {
                    const da = a.fechaInicioSeccion ? new Date(a.fechaInicioSeccion) : null;
                    const db = b.fechaInicioSeccion ? new Date(b.fechaInicioSeccion) : null;
                    if (da && db) return db - da;
                    return (b.id || 0) - (a.id || 0);
                });

                setHistorial(data);
            } catch (e) {
                console.error("Error cargando historial de matrículas:", e);
                setError("No se pudo cargar tu historial académico.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [token]);

    const ciclosDisponibles = useMemo(() => {
        const set = new Set();
        historial.forEach((m) => {
            if (m.ciclo) set.add(m.ciclo);
        });
        // Si no llega ciclo desde backend, solo queda vacío
        return Array.from(set).sort((a, b) => (a > b ? -1 : 1)); // desc
    }, [historial]);

    const historialFiltrado = useMemo(() => {
        if (cicloSeleccionado === "TODOS") return historial;
        return historial.filter((m) => m.ciclo === cicloSeleccionado);
    }, [historial, cicloSeleccionado]);

    const historialAgrupadoPorCiclo = useMemo(() => {
        // Agrupa por ciclo (si no viene ciclo, caen en “Sin ciclo”)
        const groups = {};
        historialFiltrado.forEach((m) => {
            const key = m.ciclo || "Sin ciclo";
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });

        // Orden de grupos: ciclo desc, “Sin ciclo” al final
        const keys = Object.keys(groups).sort((a, b) => {
            if (a === "Sin ciclo") return 1;
            if (b === "Sin ciclo") return -1;
            return a > b ? -1 : 1;
        });

        return keys.map((k) => ({ ciclo: k, items: groups[k] }));
    }, [historialFiltrado]);

    if (!token) return <p>No estás autenticado.</p>;

    return (
        <div className="historial-matriculas">
            <div className="historial-header">
                <div>
                    <h3>Historial académico</h3>
                    <p className="historial-subtitle">
                        Revisa tus cursos por <strong>Año escolar / Periodo</strong>.
                    </p>
                </div>

                <div className="historial-toolbar">
                    <label className="historial-label">
                        Año escolar / Periodo
                        <select
                            className="historial-select"
                            value={cicloSeleccionado}
                            onChange={(e) => setCicloSeleccionado(e.target.value)}
                            disabled={ciclosDisponibles.length === 0}
                            title={ciclosDisponibles.length === 0 ? "Aún no hay ciclos disponibles" : ""}
                        >
                            <option value="TODOS">Todos</option>
                            {ciclosDisponibles.map((c) => (
                                <option key={c} value={c}>
                                    {cicloLabelUI(c)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {loading ? (
                <p>Cargando historial...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : historial.length === 0 ? (
                <p>No se encontraron matrículas históricas.</p>
            ) : (
                <div className="historial-grupos">
                    {historialAgrupadoPorCiclo.map((g) => (
                        <div key={g.ciclo} className="historial-grupo">
                            <div className="historial-grupo-title">
                                <span className="historial-badge">
                                    {g.ciclo === "Sin ciclo" ? "Año escolar: - " : `Año escolar: ${cicloLabelUI(g.ciclo)}`}
                                </span>
                                <span className="historial-count">{g.items.length} curso(s)</span>
                            </div>

                            <div className="matricula-table-scroll">
                                <table className="styled-table-seccion">
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Sección</th>
                                            <th>Estado</th>
                                            <th>Año escolar</th>
                                            <th>Periodo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {g.items.map((m) => (
                                            <tr key={m.id}>
                                                <td>
                                                    <div className="curso-info">
                                                        <strong>{m.codigoCurso || "-"}</strong>
                                                        <span>{m.tituloCurso || "-"}</span>
                                                    </div>
                                                </td>
                                                <td>{m.nombreSeccion || "-"}</td>
                                                <td>
                                                    <span className={`estado-pill estado-${(m.estado || "").toLowerCase()}`}>
                                                        {estadoLabel(m.estado)}
                                                    </span>
                                                </td>
                                                <td>{cicloLabelUI(m.ciclo)}</td>
                                                <td>
                                                    {m.fechaInicioSeccion || "-"} al {m.fechaFinSeccion || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Mensaje útil si backend aún NO envía ciclo */}
            {historial.length > 0 && ciclosDisponibles.length === 0 && !loading && !error && (
                <div className="historial-warning">
                    Nota: tu historial aún no está recibiendo el campo <strong>ciclo</strong> desde el backend.
                    Se mostrará “-” hasta que lo añadamos en el DTO (te dejo el backend abajo).
                </div>
            )}
        </div>
    );
}
