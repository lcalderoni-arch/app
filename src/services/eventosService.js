// src/services/eventosService.js
import { api } from "../api/apiClient";

export const registrarEvento = async (tipo, detalles = {}) => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // ✅ evita POST si no hay sesión

    try {
        await api.post("/eventos", {
            tipo,
            detalles: JSON.stringify(detalles),
        });
    } catch (e) {
        console.error("Error enviando evento", e?.response?.status, e?.message);
    }
};
