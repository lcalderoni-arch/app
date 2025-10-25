// src/components/RegisterModal.jsx
import React, { useEffect, useRef } from "react";

export default function RegisterModal({ onClose, openLogin }) {
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: register
    onClose();
  };

  return (
    <>
      <h2 id="register-title" className="modal-title">Crear cuenta</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Nombre completo
          <input ref={nameRef} type="text" name="name" required />
        </label>

        <label>
          Correo electrónico
          <input type="email" name="email" required />
        </label>

        <label>
          Contraseña
          <input type="password" name="password" required />
        </label>

        <label>
          Confirmar contraseña
          <input type="password" name="confirm" required />
        </label>

        <div className="modal-actions">
          <button type="submit" className="btn-submit">Registrar</button>
          <button type="button" className="btn-cancel" onClick={openLogin}>Volver</button>
        </div>
      </form>

      <p className="toggle-line">
        ¿Ya tienes cuenta?{" "}
        <button type="button" className="link-button" onClick={openLogin}>
          Inicia sesión
        </button>
      </p>
    </>
  );
}
