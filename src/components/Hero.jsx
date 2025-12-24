// src/components/Hero.jsx
import React, { useEffect, useState } from "react";
import AuthContainer from "./login/AuthContainer";
import "../styles/Hero.css";

export default function Hero() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reason = sessionStorage.getItem("logoutReason");
    const msg = sessionStorage.getItem("logoutMessage");

    if (!reason) return;

    // Definimos mensajes por tipo
    switch (reason) {
      case "INACTIVITY":
        setTitle("Sesión cerrada por inactividad");
        setMessage(
          msg || "Por tu seguridad, cerramos tu sesión automáticamente."
        );
        break;

      case "EXPIRED":
        setTitle("Sesión expirada");
        setMessage(
          msg || "Tu sesión expiró. Por favor, inicia sesión nuevamente."
        );
        break;

      default:
        setTitle("Sesión finalizada");
        setMessage(
          msg || "Tu sesión ha finalizado. Inicia sesión para continuar."
        );
        break;
    }

    setShowModal(true);

    // Limpieza
    sessionStorage.removeItem("logoutReason");
    sessionStorage.removeItem("logoutMessage");
  }, []);

  return (
    <section className="Fondo" id="inicio">
      {showModal && (
        <div className="modal-inactive-overlay">
          <div className="modal-inactive">
            <h2>{title}</h2>
            <p>{message}</p>
            <button onClick={() => setShowModal(false)}>Entendido</button>
          </div>
        </div>
      )}

      <main className="contenido-fondo">
        <div className="content-wrapper">
          <div className="description-container">
            <h1>Bienvenido a tu Centro de Estudio</h1>
          </div>

          <div className="login-container">
            <AuthContainer />
            <p className="marca">
              © 2025 ReinventED Rimac - Fundación Semillero de Campeones
            </p>
          </div>
        </div>
      </main>
    </section>
  );
}
