import { useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import routeConfig from "./routeConfig";
import "./App.css";

import { bootstrapAuth } from "./api/bootstrapAuth";
import { setAuthReady } from "./api/authState";
import { useInactivityLogout } from "./api/useInactivityLogout";

function App() {
  const location = useLocation();

  // Hook de inactividad (30–45 min)
  useInactivityLogout();

  // Limpieza de residuos de versiones anteriores
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      localStorage.removeItem("authToken");
    }
    if (localStorage.getItem("userRol")) {
      localStorage.removeItem("userRol");
    }
  }, []);

  // Bootstrap de autenticación por ruta
  useEffect(() => {
    const hasSessionHints =
      !!localStorage.getItem("userRole") ||
      !!localStorage.getItem("userName") ||
      !!localStorage.getItem("userEmail");

    const isPublicRoute =
      location.pathname === "/" || location.pathname === "/nosotros";

    if (isPublicRoute) {
      if (hasSessionHints) {
        bootstrapAuth();
      } else {
        setAuthReady(true);
      }
      return;
    }

    // Rutas privadas → intentamos refresh
    bootstrapAuth();
  }, [location.pathname]);

  return useRoutes(routeConfig);
}

export default App;
