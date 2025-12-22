// src/api/useInactivityLogout.js
import { useEffect, useRef } from "react";
import { logoutBackend } from "./authActions";

const INACTIVITY_TIME = 35 * 60 * 1000; // 2 minutos (prueba)

export function useInactivityLogout() {
    const timer = useRef(null);

    const resetTimer = () => {
        clearTimeout(timer.current);

        timer.current = setTimeout(async () => {
            console.warn("⏰ Logout por inactividad");

            try {
                await logoutBackend();
            } finally {
                // 🔔 motivo del logout
                sessionStorage.setItem("logoutReason", "INACTIVITY");
                window.location.replace("/");
            }
        }, INACTIVITY_TIME);
    };

    useEffect(() => {
        const events = ["click", "keydown", "touchstart"];
        events.forEach(e => window.addEventListener(e, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(timer.current);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, []);
}
