// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";

export default function HomePage() {
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  useEffect(() => {
    const reason = sessionStorage.getItem("logoutReason");
    if (reason === "INACTIVITY") {
      setShowInactiveModal(true);
      sessionStorage.removeItem("logoutReason");
    }
  }, []);

  return (
    <>
      <Header />

      {showInactiveModal && (
        <div className="modal-inactive-overlay">
          <div className="modal-inactive">
            <h2>Sesión cerrada por inactividad</h2>
            <p>
              Por tu seguridad, tu sesión se cerró automáticamente tras un
              período de inactividad.
            </p>
            <button onClick={() => setShowInactiveModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      <Hero />
    </>
  );
}
