// src/components/login/LoginForm.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
  const emailRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = "https://fundaciondeportiva-backend-api-2025-gveefdbmgvdggqa8.chilecentral-01.azurewebsites.net/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NUEVO: Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ✅ NUEVO: Función para toggle de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("Enviando datos de login...");

    const url = `${API_BASE_URL}/auth/login`;
    const payload = { email, password };

    try {
      const response = await axios.post(url, payload);
      const { token, nombre, rol } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", nombre);
      localStorage.setItem("userRole", rol);

      console.log("Login exitoso:", response.data);
      setLoading(false);

      let dashboardPath = '/';

      switch (rol) {
        case 'ADMINISTRADOR':
          dashboardPath = '/dashboard-admin';
          break;
        case 'ALUMNO':
          dashboardPath = '/pantalla-estudiante';
          break;
        case 'PROFESOR':
          dashboardPath = '/pantalla-docente';
          break;
        default:
          console.error(`⚠️ Rol desconocido: ${rol}`);
          setError("Rol de usuario no reconocido. Contacta al administrador.");
          setLoading(false);
          return;
      }

      navigate(dashboardPath);

    } catch (err) {
      console.error("Error en el login:", err);
      setLoading(false);

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        if (status === 401) {
          // Credenciales incorrectas (usuario no existe O contraseña incorrecta)
          setError("❌ Email o contraseña incorrectos");
        } else if (status === 400) {
          // Errores de validación de campos (@NotBlank, @Email)
          if (errorData.email) {
            setError("❌ " + errorData.email);
          } else if (errorData.password) {
            setError("❌ " + errorData.password);
          } else {
            setError("❌ Por favor verifica los campos del formulario");
          }
        } else if (status === 403) {
          setError("❌ Acceso denegado");
        } else if (status === 500) {
          setError("❌ Error del servidor. Intenta más tarde");
        } else if (errorData?.message) {
          setError("❌ " + errorData.message);
        } else {
          setError("❌ Error al iniciar sesión");
        }
      } else if (err.code === "ERR_NETWORK") {
        setError("❌ No se pudo conectar con el servidor. Verifica tu conexión a internet");
      } else {
        setError("❌ Ocurrió un error inesperado");
      }
    }
  };

  return (
    <>
      <h2>Fundación Semillero de Campeones</h2>
      <form method="post" onSubmit={handleSubmit}>
        {/* Campo de Usuario */}
        <div className="form-group">
          <label htmlFor="input-usuario">Usuario</label>
          <input
            ref={emailRef}
            type="email"
            id="input-usuario"
            className='input-usuario'
            placeholder="Ingresa tu usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Campo de Contraseña con toggle */}
        <div className="form-group">
          <div className="password-header">
            <label htmlFor="input-password">Contraseña</label>
            <button type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div style={{ position: 'relative' }}> {/* ✅ NUEVO: Wrapper para el toggle */}
            <input
              type={showPassword ? "text" : "password"} // ✅ NUEVO: Cambia tipo según estado
              id="input-password"
              className='input-password'
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {/* ✅ NUEVO: Botón toggle de contraseña */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '5px'
              }}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="icon-see" style={{
                fontSize: '15px',
                color: '#3E6FA3'
              }}/>
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          className="login-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Iniciar Sesión"}
        </button>
      </form>
    </>
  );
}
