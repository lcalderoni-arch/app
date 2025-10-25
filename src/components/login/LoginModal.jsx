// src/components/LoginModal.jsx
import React, { useEffect, useRef } from "react";

export default function LoginModal({ onClose, openRegister }) {
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: login
    onClose();
  };

  return (
    <>
      <h2 id="login-title" className="modal-title">Iniciar sesión</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Usuario o correo
          <input ref={usernameRef} type="text" name="username" required />
        </label>

        <label>
          Contraseña
          <input type="password" name="password" required />
        </label>

        <div className="modal-actions">
          <button type="submit" className="btn-submit">Entrar</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </form>

      <p className="toggle-line">
        ¿No tienes cuenta?{" "}
        <button type="button" className="link-button" onClick={openRegister}>
          Crear cuenta
        </button>
      </p>
    </>
  );
}
