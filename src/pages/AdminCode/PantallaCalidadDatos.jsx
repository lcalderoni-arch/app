// src/pages/AdminCode/PantallaCalidadDatos.jsx
import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import "../../styles/RolesStyle/AdminStyle/PantallaCalidadDatos.css";

const PantallaCalidadDatos = () => {
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);
    const [resumen, setResumen] = useState(null);

    const fetchResumen = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const resp = await fetch(`${API_ENDPOINTS.dataQuality}/resumen`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!resp.ok) {
                throw new Error("Error al obtener el resumen de calidad");
            }
            const data = await resp.json();
            setResumen(data);
        } catch (e) {
            console.error(e);
            setError(e.message);
        }
    };

    useEffect(() => {
        fetchResumen();
    }, []);

    const ejecutarLimpieza = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");

            const resp = await fetch(
                `${API_ENDPOINTS.dataQuality}/limpiar-eventos`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!resp.ok) {
                throw new Error("Error al ejecutar la limpieza");
            }

            const data = await resp.json();
            setResultado({
                eventosProcesados: data.eventosProcesados,
                fecha: new Date().toLocaleString(),
            });

            // Después de limpiar, recargamos el resumen
            await fetchResumen();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="calidad-datos-container">
            <h1 className="calidad-datos-titulo">Calidad de Datos</h1>
            <p className="calidad-datos-descripcion">
                Ejecuta el proceso de <strong>limpieza y normalización</strong> de los
                eventos registrados en el campus virtual y revisa el estado global de la
                calidad de los datos.
            </p>

            <button
                className="calidad-datos-boton"
                onClick={ejecutarLimpieza}
                disabled={loading}
            >
                {loading ? "Procesando..." : "Ejecutar limpieza de eventos"}
            </button>

            {error && (
                <div className="calidad-datos-alerta error">
                    {error}
                </div>
            )}

            {resultado && (
                <div className="calidad-datos-resultado">
                    <p>
                        <strong>Eventos procesados en la última ejecución:</strong>{" "}
                        {resultado.eventosProcesados}
                    </p>
                    <p>
                        <strong>Fecha de última ejecución:</strong> {resultado.fecha}
                    </p>
                </div>
            )}

            {resumen && (
                <div className="calidad-datos-resumen">
                    <h2>Resumen global</h2>
                    <p>
                        <strong>Total de eventos crudos:</strong> {resumen.totalCrudos}
                    </p>
                    <p>
                        <strong>Total de eventos limpios:</strong> {resumen.totalLimpios}
                    </p>

                    {resumen.detalleCalidad && (
                        <div className="calidad-datos-resumen-detalle">
                            <h3>Detalle por calidad</h3>
                            <ul>
                                {Object.entries(resumen.detalleCalidad).map(
                                    ([clave, valor]) => (
                                        <li key={clave}>
                                            <strong>{clave}:</strong> {valor}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="calidad-datos-nota">
                <h2>¿Qué representa este módulo?</h2>
                <ul>
                    <li><strong>Eventos crudos:</strong> datos tal como llegan desde el frontend.</li>
                    <li><strong>Eventos limpios:</strong> datos ya depurados y normalizados.</li>
                    <li><strong>Calidad OK:</strong> registros que ya venían consistentes.</li>
                    <li><strong>Calidad CORREGIDO:</strong> registros que requirieron ajuste.</li>
                </ul>
            </div>
        </div>
    );
};


export default PantallaCalidadDatos;
