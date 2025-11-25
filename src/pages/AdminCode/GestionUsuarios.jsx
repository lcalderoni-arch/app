//src/pages/GestionUsuarios.jsx
import React from 'react';
import axios from 'axios';

// 1. Importa AMBOS modales
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api.js';
import EditUserModal from '../../components/EditUserModal.jsx'

// Importa los estilos CSS
import '../../styles/RolesStyle/AdminStyle/GestionUsuarios.css';

function GestionUsuarios() {
  // Estados existentes
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Estados para modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);

  // NUEVOS ESTADOS para el formulario de creación
  const [nombre, setNombre] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [rol, setRol] = React.useState('ALUMNO');
  const [formError, setFormError] = React.useState(null);
  const [creatingUser, setCreatingUser] = React.useState(false);

  // --- ⭐ Estados ESPECÍFICOS para ALUMNO ---
  const [dniAlumno, setDniAlumno] = React.useState('');
  const [nivel, setNivel] = React.useState('SECUNDARIA');
  const [grado, setGrado] = React.useState('');

  // --- ⭐ Estados ESPECÍFICOS para PROFESOR ---
  const [dniProfesor, setDniProfesor] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [experiencia, setExperiencia] = React.useState('');

  const API_URL = API_ENDPOINTS.usuarios;

  // --- fetchUsuarios (sin cambios) ---
  const fetchUsuarios = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No estás autenticado.');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("No tienes permisos de Administrador.");
      } else {
        setError(err.message || "Error al cargar datos.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // --- handleDelete (sin cambios) ---
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`¿Eliminar a "${userName}"?`)) return;
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Sesión expirada.');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.delete(`${API_URL}/eliminar/${userId}`, config);
      setUsuarios(current => current.filter(user => user.id !== userId));
      alert(`Usuario "${userName}" eliminado.`);
    } catch (err) {
      console.error(`Error al eliminar ${userId}:`, err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("No tienes permisos para eliminar.");
      } else if (err.response && err.response.status === 404) {
        setError("El usuario ya no existe.");
        fetchUsuarios();
      } else {
        setError(err.message || "Error al eliminar.");
      }
    }
  };

  // --- Editar Usuario ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };


  // --- handleUserUpdated (sin cambios) ---
  const handleUserUpdated = (updatedUser) => {
    setUsuarios(currentUsers =>
      currentUsers.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    alert(`Usuario "${updatedUser.nombre}" actualizado.`);
  };

  // NUEVA FUNCIÓN: Limpiar formulario
  const limpiarFormulario = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRol('ALUMNO');
    setFormError(null);

    // Limpiar campos de ALUMNO
    setDniAlumno('');
    setNivel('SECUNDARIA');
    setGrado('');

    // Limpiar campos de PROFESOR
    setDniProfesor('');
    setTelefono('');
    setExperiencia('');
  };

  // NUEVA FUNCIÓN: Validar DNI (exactamente 8 dígitos)
  const validarDni = (dni) => {
    return /^\d{8}$/.test(dni);
  };

  // ⭐ NUEVA FUNCIÓN: Manejar cambio de DNI (solo números, máximo 8)
  const handleDniAlumnoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) setDniAlumno(value);
  };

  const handleDniProfesorChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) setDniProfesor(value);
  };

  // ⭐ NUEVA FUNCIÓN: Crear usuario (lógica del modal movida aquí)
  const handleCreateUser = async (e) => {
  e.preventDefault();
  setCreatingUser(true);
  setFormError(null);

  // ✅ VALIDACIÓN: Contraseñas coinciden
  if (password !== confirmPassword) {
    setFormError('Las contraseñas no coinciden.');
    setCreatingUser(false);
    return;
  }

  // ✅ VALIDACIÓN: Contraseña mínima
  if (password.length < 6) {
    setFormError('La contraseña debe tener al menos 6 caracteres.');
    setCreatingUser(false);
    return;
  }

  // ✅ VALIDACIÓN: Campos básicos
  if (!nombre.trim() || !email.trim() || !password) {
    setFormError('Nombre, Email y Contraseña son obligatorios.');
    setCreatingUser(false);
    return;
  }

  // ✅ Construir payload BASE
  const payload = {
    nombre: nombre.trim(),
    email: email.trim(),
    password: password,
    rol: rol,
  };

  // ✅ VALIDACIÓN Y PAYLOAD para ALUMNO
  if (rol === 'ALUMNO') {
    if (!dniAlumno.trim() || !grado.trim() || !nivel) {
      setFormError('Para Alumno: DNI, Nivel y Grado son obligatorios.');
      setCreatingUser(false);
      return;
    }
    if (!validarDni(dniAlumno)) {
      setFormError('El DNI debe tener exactamente 8 dígitos.');
      setCreatingUser(false);
      return;
    }
    
    // ⚠️ CAMBIO CRÍTICO: Usar nombres correctos del backend
    payload.dniAlumno = dniAlumno.trim();  // ← "dniAlumno" NO "dni"
    payload.nivel = nivel;                  // ← Campo obligatorio
    payload.grado = grado.trim();
  }

  // ✅ VALIDACIÓN Y PAYLOAD para PROFESOR
  else if (rol === 'PROFESOR') {
    if (!dniProfesor.trim()) {
      setFormError('Para Profesor: DNI es obligatorio.');
      setCreatingUser(false);
      return;
    }
    if (!validarDni(dniProfesor)) {
      setFormError('El DNI debe tener exactamente 8 dígitos.');
      setCreatingUser(false);
      return;
    }
    
    // ⚠️ CAMBIO CRÍTICO: Usar nombres correctos del backend
    payload.dniProfesor = dniProfesor.trim();  // ← "dniProfesor" NO "dni"
    if (telefono.trim()) payload.telefono = telefono.trim();
    if (experiencia.trim()) payload.experiencia = experiencia.trim();
  }

  console.log("📤 Enviando payload:", payload);

  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Sesión expirada.');

    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const url = `${API_BASE_URL}/usuarios/crear`;
    
    const response = await axios.post(url, payload, config);

    // ✅ Agregar usuario a la lista
    setUsuarios(current => [response.data, ...current]);
    alert(`Usuario "${response.data.nombre}" creado correctamente.`);

    // ✅ Limpiar formulario
    limpiarFormulario();

  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    
    if (err.response) {
      console.log("📊 Status:", err.response.status);
      console.log("📦 Data:", err.response.data);
      
      if (err.response.status === 401 || err.response.status === 403) {
        setFormError("No tienes permisos para crear usuarios.");
      } else if (err.response.data && typeof err.response.data === 'string' && 
                 err.response.data.includes("El correo electrónico ya está en uso")) {
        setFormError("El correo electrónico ya está registrado.");
      } else if (err.response.data && err.response.data.message) {
        setFormError(`Error: ${err.response.data.message}`);
      } else {
        setFormError(`Error del servidor: ${err.response.status}`);
      }
    } else if (err.request) {
      setFormError("No se pudo conectar al servidor.");
    } else {
      setFormError("Ocurrió un error inesperado.");
    }
  } finally {
    setCreatingUser(false);
  }
};

  // --- Renderizado Condicional ---
  if (loading && usuarios.length === 0) return <p>Cargando lista de usuarios...</p>;
  if (error && usuarios.length === 0) return <p style={{ color: 'red' }}>Error: {error}</p>;


  // --- Renderizado Principal ---
  return (
    <div className='general-box-gestionusuarios'>
      <div className='div-box-text-gestionusuarios'>
        <h2>Gestión de Usuarios</h2>
        <p>Administra los usuarios registrados en la plataforma.</p>


        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {loading && <p>Actualizando lista...</p>}
      </div>
      {/* BOX RECIEN AÑADIDO (25/11/2025) */}
      <div className='box-formulario-gestionusuarios'>
        <h3>Crear Nuevo Usuario</h3>

        <form className='auth-form-gestionusuarios' onSubmit={handleCreateUser}>
          <label htmlFor="">Rol de Usuario
            <select value={rol} onChange={(e) => setRol(e.target.value)} required>
              <option value="ALUMNO">Alumno</option>
              <option value="PROFESOR">Profesor</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </label>
          {/*Nombre completo*/}
          <label>
            Apellido y Nombre Completo*
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: García López Juan"
              required
            />
          </label>

          {/* EMAIL */}
          <label>
            Correo Electrónico*
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
          </label>

          {/* CONTRASEÑA */}
          <label>
            Contraseña* (mínimo 6 caracteres)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>

          {/* CONFIRMAR CONTRASEÑA */}
          <label>
            Confirmar Contraseña*
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>

          {/* ⭐ CAMPOS ESPECÍFICOS PARA ALUMNO */}
          {rol === 'ALUMNO' && (
            <>
              <label>
                DNI (Alumno)* - 8 dígitos
                <input
                  type="text"
                  value={dniAlumno}
                  onChange={handleDniAlumnoChange}
                  placeholder="12345678"
                  maxLength={8}
                  pattern="\d{8}"
                  required
                />
              </label>

              <label>
                Nivel*
                <select value={nivel} onChange={(e) => setNivel(e.target.value)} required>
                  <option value="INICIAL">Inicial</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                </select>
              </label>

              <label>
                Grado*
                <input
                  type="text"
                  value={grado}
                  onChange={(e) => setGrado(e.target.value)}
                  placeholder="Ej: 1ro, 5to"
                  required
                />
              </label>
            </>
          )}

          {/* ⭐ CAMPOS ESPECÍFICOS PARA PROFESOR */}
          {rol === 'PROFESOR' && (
            <>
              <label>
                DNI (Profesor)* - 8 dígitos
                <input
                  type="text"
                  value={dniProfesor}
                  onChange={handleDniProfesorChange}
                  placeholder="12345678"
                  maxLength={8}
                  pattern="\d{8}"
                  required
                />
              </label>

              <label>
                Número de Teléfono
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 987654321"
                />
              </label>

              <label>
                Experiencia / Especialización
                <textarea
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                  placeholder="Descripción de experiencia, especialidades, certificaciones..."
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </label>
            </>
          )}

          {/* Mostrar error del formulario */}
          {formError && (
            <p style={{
              color: 'red',
              fontSize: '0.9rem',
              marginTop: '10px',
              gridColumn: '1 / -1',
              backgroundColor: '#fee',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #fcc'
            }}>
              {formError}
            </p>
          )}

          {/* BOTONES */}
          <div className="form-buttons">
            <button
              type="submit"
              className="btn-create"
              disabled={creatingUser}
            >
              {creatingUser ? 'Creando...' : '✓ Añadir Usuario'}
            </button>
            <button
              type="button"
              className="btn-clear"
              onClick={limpiarFormulario}
              disabled={creatingUser}
            >
              Limpiar Formulario
            </button>
          </div>
        </form>
      </div>

      <div className='table-users-gestionusuarios'>
        <table className="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge-rol badge-${user.rol.toLowerCase()}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(user)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(user.id, user.nombre)}>Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  {error ? 'Error al cargar usuarios.' : 'No hay usuarios registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Renderizado del Modal de Edición (sin cambios) --- */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userToEdit={editingUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

export default GestionUsuarios;

