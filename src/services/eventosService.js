// src/services/eventosService.js
import { api } from "../api/api"; // <-- usa el mismo axios centralizado

export const registrarEvento = async (tipo, detalles = {}) => {
    try {
        await api.post("/eventos", {
            tipo,
            detalles: JSON.stringify(detalles),
        });
    } catch (e) {
        // Ignorar si no está autenticado
        const status = e?.response?.status;
        if (status === 401 || status === 403) return;

        console.error("Error enviando evento", status, e?.message);
    }
};
