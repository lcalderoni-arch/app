// src/api/useInactivityLogout.js
import { useEffect, useRef } from "react";
import { logoutBackend } from "./authActions";

const INACTIVITY_TIME = 35 * 60 * 1000;

export function useInactivityLogout() {
    const timer = useRef(null);

    const events = ["click", "keydown", "touchstart", "mousemove", "scroll"];

    const resetTimer = () => {
        clearTimeout(timer.current);

        timer.current = setTimeout(async () => {
            console.warn("Logout por inactividad");

            try {
                await logoutBackend();
            } finally {
                // Consistente con apiClient
                try {
                    sessionStorage.setItem("logoutReason", "INACTIVITY");
                    sessionStorage.setItem("logoutMessage", "Cerramos tu sesión por inactividad.");
                } catch { }

                // Evitar recargar si ya estás en "/"
                if (window.location.pathname !== "/") {
                    window.location.replace("/");
                } else {
                    window.location.reload();
                }
            }
        }, INACTIVITY_TIME);
    };

    useEffect(() => {
        events.forEach((e) => window.addEventListener(e, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(timer.current);
            events.forEach((e) => window.removeEventListener(e, resetTimer));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
