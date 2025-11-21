// src/components/login/LoginForm.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const emailRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

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
      
      switch(rol) {
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
          return; // ✅ Detener la ejecución si el rol es inválido
      }
      
      navigate(dashboardPath);
      
      // ✅ NUEVO: Recargar página para limpiar estado
      setTimeout(() => {
        window.location.reload();
      }, 0);

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
            <a href="#">¿Olvidaste tu contraseña?</a>
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
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message" style={{color: 'red', marginTop: '10px', fontSize: '14px'}}>
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
