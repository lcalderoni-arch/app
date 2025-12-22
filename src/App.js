import { useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import routeConfig from "./routeConfig";
import "./App.css";
import { bootstrapAuth } from "./api/bootstrapAuth";
import { setAuthReady } from "./api/authState";

function App() {
  const location = useLocation();

  useEffect(() => {
    const hasSessionHints =
      !!localStorage.getItem("userRole") ||
      !!localStorage.getItem("userName") ||
      !!localStorage.getItem("userEmail");

    const isLoginRoute = location.pathname === "/";
    const isNosotrosRoute = location.pathname === "/nosotros";
    const isPublicRoute = isLoginRoute || isNosotrosRoute;

    // En rutas públicas:
    // - si hay hints, intentamos refresh (para redirigir al dashboard sin pedir login)
    // - si NO hay hints, no hacemos refresh (evita 401 spam) y marcamos listo
    if (isPublicRoute) {
      if (hasSessionHints) {
        bootstrapAuth();
      } else {
        setAuthReady(true);
      }
      return;
    }

    // En rutas privadas: siempre intentamos refresh (si falla, ProtectedRoute hará su trabajo)
    bootstrapAuth();
  }, [location.pathname]);

  return useRoutes(routeConfig);
}

export default App;
