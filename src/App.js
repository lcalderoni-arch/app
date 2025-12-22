import { useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import routeConfig from "./routeConfig";
import "./App.css";
import { bootstrapAuth } from "./api/bootstrapAuth";
import { setAuthReady } from "./api/authState";

function App() {
  const location = useLocation();

  useEffect(() => {
    // ✅ limpia token legacy (de versiones anteriores)
    if (localStorage.getItem("authToken")) {
      localStorage.removeItem("authToken");
    }
    if (localStorage.getItem("userRol")) {
      localStorage.removeItem("userRol");
    }
  }, []);

  useEffect(() => {
    const hasSessionHints =
      !!localStorage.getItem("userRole") ||
      !!localStorage.getItem("userName") ||
      !!localStorage.getItem("userEmail");

    const isPublicRoute = location.pathname === "/" || location.pathname === "/nosotros";

    if (isPublicRoute) {
      if (hasSessionHints) bootstrapAuth();
      else setAuthReady(true);
      return;
    }

    bootstrapAuth();
  }, [location.pathname]);

  return useRoutes(routeConfig);
}

export default App;
