// src/components/Hero.jsx
import React, { useEffect, useState } from "react";
import AuthContainer from "./login/AuthContainer";
import "../styles/Hero.css";

export default function Hero() {
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  useEffect(() => {
    const reason = sessionStorage.getItem("logoutReason");
    if (reason === "INACTIVITY") {
      setShowInactiveModal(true);
      sessionStorage.removeItem("logoutReason");
    }
  }, []);

  return (
    <section className="Fondo" id="inicio">
      {showInactiveModal && (
        <div className="modal-inactive-overlay">
          <div className="modal-inactive">
            <h2>Sesión cerrada por inactividad</h2>
            <p>Por tu seguridad, cerramos tu sesión automáticamente.</p>
            <button onClick={() => setShowInactiveModal(false)}>Entendido</button>
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
            <p className="marca">© 2025 ReinventED Rimac - Fundación Semillero de Campeones</p>
          </div>
        </div>
      </main>
    </section>
  );
}
