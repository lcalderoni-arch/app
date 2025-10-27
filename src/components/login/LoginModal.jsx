//src/components/login/LoginModal.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ onClose, openRegister }) {
  const usernameRef = useRef(null);

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);    
    console.log("Enviando datos de login...");

    const url = "http://localhost:8081/api/auth/login";

    const payload = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(url, payload);
      const { token, nombre, rol } = response.data;
      
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", nombre);
      localStorage.setItem("userRole", rol);

      console.log("Login exitoso:", response.data); 
      setLoading(false);
      
      // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
      
      // 1. Cerramos el modal PRIMERO.
      onClose(); 
      
      // 2. Usamos setTimeout con 0ms. Esto le dice a React
      // "Espera a que el 'onClose' termine de renderizar,
      // y LUEGO ejecuta la navegación".
      setTimeout(() => {
        navigate('/dashboard');
      }, 0); // 👈 El '0' es intencional.

    } catch (err) {
      console.error("Error en el login:", err);
      setLoading(false);

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Email o contraseña incorrectos.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Error de red o CORS. Revisa la consola (F12).");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    }
  };

  return (
    <>
      <h2 id="login-title" className="modal-title">Iniciar sesión</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            ref={usernameRef}
            type="email" 
            name="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            name="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
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

