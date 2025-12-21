import React, { useEffect, useMemo, useState } from "react";

import "../../styles/Alumno/HistorialMatriculasAlumno.css";

import { api } from "../../api/api";

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

const cicloLabelUI = (ciclo) => {
    if (!ciclo) return "-";
    return ciclo;
};

export default function HistorialMatriculasAlumno() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [cicloSeleccionado, setCicloSeleccionado] = useState("TODOS");

    useEffect(() => {
        let alive = true;

        const fetchHistorial = async () => {
            setLoading(true);
            setError(null);

            try {
                // Antes: axios + Bearer token
                const { data } = await api.get("/matriculas/mis-matriculas");

                const arr = Array.isArray(data) ? data : [];

                arr.sort((a, b) => {
                    const da = a.fechaInicioSeccion ? new Date(a.fechaInicioSeccion) : null;
                    const db = b.fechaInicioSeccion ? new Date(b.fechaInicioSeccion) : null;
                    if (da && db) return db - da;
                    return (b.id || 0) - (a.id || 0);
                });

                if (!alive) return;
                setHistorial(arr);
            } catch (e) {
                console.error("Error cargando historial de matrículas:", e);
                if (!alive) return;
                setError(e?.response?.data?.message || "No se pudo cargar tu historial académico.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        fetchHistorial();

        return () => {
            alive = false;
        };
    }, []);

    const ciclosDisponibles = useMemo(() => {
        const set = new Set();
        historial.forEach((m) => {
            if (m.ciclo) set.add(m.ciclo);
        });
        return Array.from(set).sort((a, b) => (a > b ? -1 : 1)); // desc
    }, [historial]);

    const historialFiltrado = useMemo(() => {
        if (cicloSeleccionado === "TODOS") return historial;
        return historial.filter((m) => m.ciclo === cicloSeleccionado);
    }, [historial, cicloSeleccionado]);

    const historialAgrupadoPorCiclo = useMemo(() => {
        const groups = {};
        historialFiltrado.forEach((m) => {
            const key = m.ciclo || "Sin ciclo";
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });

        const keys = Object.keys(groups).sort((a, b) => {
            if (a === "Sin ciclo") return 1;
            if (b === "Sin ciclo") return -1;
            return a > b ? -1 : 1;
        });

        return keys.map((k) => ({ ciclo: k, items: groups[k] }));
    }, [historialFiltrado]);

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
                                    {g.ciclo === "Sin ciclo" ? "Año escolar: -" : `Año escolar: ${cicloLabelUI(g.ciclo)}`}
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
                                                    <span className={`estado-pill estado-${String(m.estado || "").toLowerCase()}`}>
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

            {historial.length > 0 && ciclosDisponibles.length === 0 && !loading && !error && (
                <div className="historial-warning">
                    Nota: tu historial aún no está recibiendo el campo <strong>ciclo</strong> desde el backend. Se mostrará “-”
                    hasta que lo añadamos en el DTO.
                </div>
            )}
        </div>
    );
}
