import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { api, setAccessToken } from "../../api/api";

export default function LoginForm() {
  const emailRef = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { email, password };

      // LOGIN SIN cookies
      const res = await api.post("/auth/login", payload);

      const token = res.data.token;
      const rol = res.data.rol;

      if (!token || !rol) {
        throw new Error("Respuesta de login incompleta (token/rol).");
      }

      // Token en memoria (axios)
      setAccessToken(token);

      // ✅ Persistencia para GuestRoute / ProtectedRoute
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRol", rol);

      // datos de UI
      localStorage.setItem("userName", res.data.nombre || "");
      localStorage.setItem("userEmail", res.data.email || "");
      localStorage.setItem("userDni", res.data.dni || "");
      localStorage.setItem("userNivel", res.data.nivelAlumno || "");
      localStorage.setItem("userGrado", res.data.gradoAlumno || "");

      // redirección por rol
      switch ((rol || "").toUpperCase()) {
        case "ADMINISTRADOR":
          navigate("/dashboard-admin", { replace: true });
          break;
        case "ALUMNO":
          navigate("/pantalla-estudiante", { replace: true });
          break;
        case "PROFESOR":
          navigate("/pantalla-docente", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
          break;
      }
    } catch (err) {
      console.error("Error login:", err);
      setError("❌ Email o contraseña incorrectos");
    } finally {
      setLoading(false);
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
            className="input-usuario"
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
            <button type="button">¿Olvidaste tu contraseña?</button>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="input-password"
              className="input-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                padding: "5px",
              }}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="icon-see"
                style={{ fontSize: "15px", color: "#3E6FA3" }}
              />
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginTop: "10px", fontSize: "14px" }}
          >
            {error}
          </div>
        )}

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Iniciar Sesión"}
        </button>
      </form>
    </>
  );
}
