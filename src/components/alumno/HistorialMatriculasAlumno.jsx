// src/components/alumno/HistorialMatriculasAlumno.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const estadoLabel = (estado) => {
    switch (estado) {
        case "ACTIVA":
            return "Activa";
        case "RETIRADA":
            return "Retirada";
        case "COMPLETADA":
            return "Completada";
        default:
            return estado;
    }
};

export default function HistorialMatriculasAlumno() {
    const token = localStorage.getItem("authToken");
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const fetchHistorial = async () => {
            setLoading(true);
            setError(null);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const resp = await axios.get(
                    `${API_BASE_URL}/matriculas/mis-matriculas`,
                    config
                );
                setHistorial(resp.data || []);
            } catch (e) {
                console.error("Error cargando historial de matrículas:", e);
                setError("No se pudo cargar tu historial académico.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [token]);

    if (!token) {
        return <p>No estás autenticado.</p>;
    }

    return (
        <div className="historial-matriculas">
            <h3>Historial académico</h3>

            {loading ? (
                <p>Cargando historial...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : historial.length === 0 ? (
                <p>No se encontraron matrículas históricas.</p>
            ) : (
                <div className="matricula-table-scroll">
                    <table className="styled-table-seccion">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Sección</th>
                                <th>Estado</th>
                                <th>Periodo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((m) => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="curso-info">
                                            <strong>{m.codigoCurso}</strong>
                                            <span>{m.tituloCurso}</span>
                                        </div>
                                    </td>
                                    <td>{m.nombreSeccion}</td>
                                    <td>{estadoLabel(m.estado)}</td>
                                    <td>
                                        {m.fechaInicioSeccion} al {m.fechaFinSeccion}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
