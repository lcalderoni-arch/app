// src/services/eventosService.js
import { api } from "../api/apiClient";

export const registrarEvento = async (tipo, detalles = {}) => {
    try {
        // Si tu backend espera "detalles" como String, dejamos stringify aquí.
        // Si tu backend ya lo guarda como JSON/Map, podemos mandar "detalles" directo.
        await api.post("/eventos", {
            tipo,
            detalles: JSON.stringify(detalles),
        });
    } catch (e) {
        // No rompemos la app por un fallo de log
        console.error("Error enviando evento", e?.response?.status, e?.message);
    }
};
