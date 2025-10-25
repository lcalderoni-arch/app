// src/components/Header.jsx
import React from "react";
import icon from "../assets/logo.png";
import LoginButton from "./login/LoginButton";
import "../styles/Header.css";

export default function Header() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <header className="Encabezado">
      <nav className="nav-container">
        <div
          className="logo-name"
          onClick={scrollToTop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && scrollToTop()}
          style={{ cursor: "pointer" }}
        >
          <img className="icon" src={icon} alt="Logo de la Escuela" />
        </div>

        <div className="nav-links">
          <a href="#nosotros">Nosotros</a>
          <a href="#programas">Programas</a>
          {/* Cambiado de Admisiones a Contáctanos */}
          <a href="#contactanos">Contáctanos</a>
        </div>

        <div className="nav-auth">
          <LoginButton />
        </div>
      </nav>
    </header>
  );
}