// src/components/Header.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ AGREGAR
import icon from "../assets/logo.png";
import "../styles/Header.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

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
          <a onClick={() => handleNavigateToSection("nosotros")} style={{ cursor: "pointer" }}>
          <FontAwesomeIcon icon={faPeopleGroup} className="icon-header"/>Nosotros
          </a>
          <a onClick={() => handleNavigateToSection("programas")} style={{ cursor: "pointer" }}>
          <FontAwesomeIcon icon={faBookOpen} className="icon-header"/>Programas
          </a>
          <a onClick={() => handleNavigateToSection("contactanos")} style={{ cursor: "pointer" }}>
          <FontAwesomeIcon icon={faPhone} className="icon-header"/>Contáctanos
          </a>
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
