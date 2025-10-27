//src/pages/GestionUsuarios.jsx
import React from 'react';
import axios from 'axios';

// Importa los estilos CSS.
// Si GestionUsuarios.jsx está en src/pages/ y Sidebar.css está en src/components/,
// la ruta correcta es subir un nivel (..) y entrar a components/
import '../components/Sidebar.css'; 

function GestionUsuarios() {
  // Estado para guardar la lista de usuarios
  const [usuarios, setUsuarios] = React.useState([]);
  // Estado para manejar la carga
  const [loading, setLoading] = React.useState(true);
  // Estado para manejar errores
  const [error, setError] = React.useState(null);

  // Endpoint de tu backend para obtener usuarios
  const API_URL = 'http://localhost:8081/api/usuarios';

  // useEffect se ejecuta una vez cuando el componente se monta
  React.useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Obtener el token del localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
          setError('No estás autenticado. Inicia sesión primero.');
          setLoading(false);
          return;
        }

        // 2. Configurar las cabeceras para enviar el token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // 3. Hacer la petición GET al backend
        const response = await axios.get(API_URL, config);

        // 4. Guardar los usuarios en el estado
        setUsuarios(response.data);

      } catch (err) {
        console.error("Error al obtener la lista de usuarios:", err);
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError("No tienes permisos de Administrador para ver esta sección.");
          } else {
            setError(`Error del servidor: ${err.response.status}`);
          }
        } else if (err.request) {
          setError("No se pudo conectar al servidor. Verifica que esté encendido y la URL sea correcta.");
        } else {
          setError("Ocurrió un error inesperado al cargar los datos.");
        }
      } finally {
        // 5. Indicar que la carga ha terminado
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []); // El array vacío [] asegura que solo se ejecute al montar

  // --- Renderizado Condicional ---
  if (loading) {
    return <p>Cargando lista de usuarios...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  // --- Renderizado Principal (Tabla de Usuarios) ---
  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <p>Administra los usuarios registrados en la plataforma.</p>

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
                  {/* TODO: Implementar lógica de Editar/Eliminar */}
                  <button className="btn-edit" onClick={() => alert(`Editar usuario ID: ${user.id}`)}>Editar</button>
                  <button className="btn-delete" onClick={() => alert(`Eliminar usuario ID: ${user.id}`)}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No hay usuarios registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GestionUsuarios;

