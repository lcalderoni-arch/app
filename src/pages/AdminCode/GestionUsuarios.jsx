//src/pages/GestionUsuarios.jsx
import React from 'react';
import axios from 'axios';


// 1. Importa AMBOS modales
import { API_ENDPOINTS } from '../../config/api.js';


import EditUserModal from '../../components/EditUserModal.jsx'
import CreateUserModal from '../../components/CreateUserModal.jsx'; // 👈 NUEVO


// Importa los estilos CSS
import '../../styles/login/GestionUsuarios.css';

function GestionUsuarios() {
  // Estados existentes
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Estados para modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);

  // --- ⭐ NUEVO ESTADO para modal de creación ---
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

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
    if (!window.confirm(`¿Eliminar "${userName}"?`)) return;
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
        setError("Error: El usuario ya no existe."); fetchUsuarios();
      }
      else { setError(err.message || "Error al eliminar."); }
    }
  };

  // --- handleEdit (sin cambios) ---
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

  // --- ⭐ NUEVA FUNCIÓN: Se llama desde CreateUserModal cuando se guarda ---
  const handleUserCreated = (newUser) => {
    // Añade el nuevo usuario al PRINCIPIO de la lista para visibilidad inmediata
    setUsuarios(currentUsers => [newUser, ...currentUsers]);
    alert(`Usuario "${newUser.nombre}" creado correctamente.`);
    // Opcional: podrías llamar a fetchUsuarios() para recargar toda la lista si prefieres
    // fetchUsuarios(); 
  };

  // --- Renderizado Condicional ---
  if (loading && usuarios.length === 0) return <p>Cargando lista de usuarios...</p>;
  if (error && usuarios.length === 0) return <p style={{ color: 'red' }}>Error: {error}</p>;

  // --- Renderizado Principal ---
  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <p>Administra los usuarios registrados en la plataforma.</p>

      {/* ⭐ Botón Crear AHORA CONECTADO */}
      <button
        className="btn-create"
        style={{ marginBottom: '15px' }}
        onClick={() => setIsCreateModalOpen(true)} // Abre el modal de creación
      >
        + Crear Nuevo Usuario
      </button>

      {/* Mostrar errores */}
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}
      {loading && <p>Actualizando lista...</p>}

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
                <td>{user.rol}</td>
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

      {/* --- ⭐ RENDERIZADO DEL MODAL DE CREACIÓN --- */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated} // Callback para añadir a la tabla
      />

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

