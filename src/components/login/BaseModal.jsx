// src/components/BaseModal.jsx
import React, { useEffect, useRef, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../../styles/login/LoginModal.css";

export default function BaseModal({ onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);

    // bloquear scroll del body mientras modal abierto
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // al cambiar de modo, enfocar primer input dentro del body
  useEffect(() => {
    setTimeout(() => {
      const first = containerRef.current?.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
      first?.focus();
    }, 0);
  }, [mode]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div
        className="modal fixed-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={mode === "login" ? "login-title" : "register-title"}
        ref={containerRef}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>

        {/* body con overflow: el que mantiene el tamaño fijo del modal */}
        <div className="modal-body">
          {mode === "login" ? (
            <LoginModal onClose={onClose} openRegister={() => setMode("register")} />
          ) : (
            <RegisterModal onClose={onClose} openLogin={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
