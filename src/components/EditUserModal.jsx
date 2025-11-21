//src/components/EditUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/EditUserModal.css'; 

export default function EditUserModal({ isOpen, onClose, userToEdit, onUserUpdated }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
const API_BASE_URL = process.env.REACT_APP_API_URL;

  // NUEVOS ESTADOS
  const [dni, setDni] = useState('');
  const [grado, setGrado] = useState(''); // Reemplaza carrera
  const [codigoEstudiante, setCodigoEstudiante] = useState('');
  // DEPARTAMENTO fue ELIMINADO
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre || '');
      setEmail(userToEdit.email || '');
      setPassword(''); 
      // MAPEAMOS los nuevos campos
      setDni(userToEdit.dni || '');
      setGrado(userToEdit.grado || ''); 
      setCodigoEstudiante(userToEdit.codigoEstudiante || '');
      // setDepartamento(userToEdit.departamento || ''); // ELIMINADO
      setTimeout(() => nameInputRef.current?.focus(), 0); 
    }
    setError(null);
  }, [userToEdit, isOpen]); 

  if (!isOpen || !userToEdit) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = `${API_BASE_URL}/usuarios/editar/${userToEdit.id}`;
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
      setLoading(false);
      return;
    }

    // Construir el payload (UsuarioUpdateDTO) - Solo enviamos campos con valor Y que han cambiado
    const payload = {};
    if (nombre.trim() && nombre !== userToEdit.nombre) payload.nombre = nombre.trim();
    if (email.trim() && email !== userToEdit.email) payload.email = email.trim();
    if (password.trim()) payload.password = password.trim(); 
    
    // Actualización de campos de perfil (basado en el ROL ORIGINAL del usuario)
    if (userToEdit.rol === 'ALUMNO') {
      if (grado.trim() && grado !== userToEdit.grado) payload.grado = grado.trim(); // GRADO
      if (dni.trim() && dni !== userToEdit.dni) payload.dni = dni.trim(); // DNI
      if (codigoEstudiante.trim() && codigoEstudiante !== userToEdit.codigoEstudiante) payload.codigoEstudiante = codigoEstudiante.trim();
    } else if (userToEdit.rol === 'PROFESOR') {
      if (dni.trim() && dni !== userToEdit.dni) payload.dni = dni.trim(); // DNI
    }
    // DEPARTAMENTO fue ELIMINADO del payload

    if (Object.keys(payload).length === 0) {
        setError("No se realizaron cambios.");
        setLoading(false);
        return;
    }

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.put(url, payload, config);

      onUserUpdated(response.data); 
      onClose(); 

    } catch (err) {
      console.error("Error al editar usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para editar.");
         } else if (err.response.data && err.response.data.message) {
           setError(`Error del servidor: ${err.response.data.message}`); 
         } else {
            setError(`Error del servidor: ${err.response.status}`);
         }
      } else if (err.request) {
        setError("No se pudo conectar al servidor.");
      } else {
        setError("Ocurrió un error inesperado al guardar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <h2 id="edit-user-title" className="modal-title">Editar Usuario (ID: {userToEdit.id})</h2>
          
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label>
              Nombre Completo
              <input ref={nameInputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Nueva Contraseña (dejar en blanco para no cambiar)
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
            </label>
            
            {/* Mostrar campos de perfil según el rol original */}
            {userToEdit.rol === 'ALUMNO' && (
              <>
                <label>
                  Grado
                  <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} />
                </label>
                <label>
                  Código Estudiante
                  <input type="text" value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} />
                </label>
                <label>
                  DNI
                  <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} />
                </label>
              </>
            )}
            {userToEdit.rol === 'PROFESOR' && (
              <label>
                DNI
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} />
              </label>
            )}
            
            <p><strong>Rol:</strong> {userToEdit.rol}</p>

            {error && <p className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}