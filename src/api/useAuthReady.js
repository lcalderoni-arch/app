import { useEffect, useState } from "react";
import { isAuthReady } from "./authState";

export function useAuthReady() {
    const [ready, setReady] = useState(isAuthReady());

    useEffect(() => {
        const handler = () => setReady(isAuthReady());
        window.addEventListener("auth-ready-changed", handler);
        return () => window.removeEventListener("auth-ready-changed", handler);
    }, []);

    return ready;
}
