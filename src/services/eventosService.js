// src/services/eventosService.js
import { API_ENDPOINTS } from "../config/api";

export const registrarEvento = async (tipo, detalles = {}) => {
    try {
        const token = localStorage.getItem("authToken"); // mismo que usaste antes

        await fetch(`${API_ENDPOINTS.eventos}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                tipo,
                detalles: JSON.stringify(detalles),
            }),
        });
    } catch (e) {
        // No rompemos la app por un fallo de log, solo lo registramos en consola
        console.error("Error enviando evento", e);
    }
};
