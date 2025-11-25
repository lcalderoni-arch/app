// src/components/login/RegisterForm.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';

import { API_BASE_URL } from '../../config/api.js';

export default function RegisterForm({ openLogin }) {
  const nameRef = useRef(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dni, setDni] = useState(''); // ✅ NUEVO
  const [grado, setGrado] = useState(''); // ✅ NUEVO

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  // Validaciones...
  if (password !== confirmPassword) {
    setError("Las contraseñas no coinciden.");
    setLoading(false);
    return;
  }
  if (!dni || !grado) {
    setError("DNI y Grado son obligatorios para el registro de alumnos.");
    setLoading(false);
    return;
  }

  const url = `${API_BASE_URL}/usuarios/crear`;

  const payload = {
    nombre: nombre,
    email: email,
    password: password,
    rol: "ALUMNO",
    dni: dni,
    grado: grado
  };

  localStorage.setItem("userGrado", grado);

  try {
    // ✅ CORRECCIÓN: Eliminar "config" porque no está definido
    // Este endpoint debe ser público (sin autenticación)
    await axios.post(url, payload);  // ← SIN "config"

    alert("Registro exitoso. ¡Ahora puedes iniciar sesión!");

    if (openLogin) {
      setTimeout(openLogin, 300);
    }

  } catch (err) {
    console.error("Error en el registro:", err);

    if (err.response) {
      if (err.response.data && typeof err.response.data === 'string' && 
          err.response.data.includes("El correo electrónico ya está en uso")) {
        setError("El correo o DNI ya está registrado.");
      } else if (err.response.data && err.response.data.message) {
        setError(`Error: ${err.response.data.message}`);
      } else {
        setError(`Error del servidor: ${err.response.status}.`);
      }
    } else {
      setError("Error de conexión al servidor.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <h2>Crear cuenta de Alumno</h2>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Nombre completo*
          <input
            ref={nameRef}
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            disabled={loading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Correo electrónico*
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </label>

        {/* ✅ NUEVO: Campo DNI */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          DNI*
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            disabled={loading}
            placeholder="Ej: 12345678"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </label>

        {/* ✅ NUEVO: Campo Grado */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Grado/Nivel*
          <input
            type="text"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            required
            disabled={loading}
            placeholder="Ej: 5to de primaria"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Contraseña*
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Confirmar contraseña*
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </label>

        {error && <p style={{ color: 'red', fontSize: '14px', margin: '0' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#1a64aa',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>

        {openLogin && (
          <p style={{ textAlign: 'center', fontSize: '14px' }}>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={openLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a64aa',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Inicia sesión
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
