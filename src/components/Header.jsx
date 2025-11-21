// src/components/Header.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ AGREGAR
import icon from "../assets/logo.png";
import "../styles/Header.css";

export default function Header() {
  const navigate = useNavigate(); // ✅ AGREGAR
  const location = useLocation(); // DETECTAR PAGINA IMPORTANTE (PARA DISEÑO TRANSPARENTE)

  // ✅ Determinar si estamos en la página principal
  const isHomePage = location.pathname === "/";
  
  const handleLogoClick = () => {
    navigate("/nosotros"); // ✅ Navega a home
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };
  
  const scrollToLogin = () => {
    navigate("/");
    setTimeout(() => {
      const loginSection = document.getElementById("inicio");
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleNavigateToSection = (sectionId) => {
        if (location.pathname === "/nosotros") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
            navigate(`/nosotros#${sectionId}`);
    }
  };

  return (
        <header className={`Encabezado ${isHomePage ? 'home' : 'subpage'}`}> {/* ✅ Clase condicional */}
      <nav className="nav-container">
        <div
          className="logo-name"
          onClick={handleLogoClick} // ✅ CAMBIAR
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleLogoClick()} // ✅ CAMBIAR
          style={{ cursor: "pointer" }}
        >
          <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
        </div>

        <div className="nav-links">
          {/* ✅ Usar onClick en lugar de href */}
          <button 
            className="other-page" onClick={() => handleNavigateToSection("nosotros")}>
            Nosotros
          </button>
          <button className="other-page" onClick={() => handleNavigateToSection("programas")}>
            Programas
          </button>
          <button 
            className="other-page" onClick={() => handleNavigateToSection("contactanos")}>
            Contáctanos
          </button>
        </div>

        <div className="nav-auth">
          <button 
            className="btn-login"
            onClick={scrollToLogin}
          >
            Accede al Campus
          </button>
        </div>
      </nav>
    </header>
  );
}
