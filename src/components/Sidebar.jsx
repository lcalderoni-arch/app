//src/components/Sidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Asegúrate de que este archivo CSS exista en la misma carpeta (src/components/)
import './Sidebar.css';

// Recibe 'isOpen' para saber si mostrarse y 'onClose' para cerrarse
export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    console.warn("🔒 SESIÓN CERRADA: Token borrado."); // Mensaje para depuración
    // Borra TODO el localStorage para asegurar limpieza
    localStorage.clear();
    onClose(); // Cierra el sidebar
    navigate('/'); // Redirige al usuario a la página de inicio
  };

  return (
    <>
      {/* Capa oscura de fondo (Overlay) que cierra el menú al hacer clic */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen} // Para accesibilidad
      />

      {/* El Panel Lateral */}
      <nav
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Menú principal"
      >
        {/* Botón para cerrar el menú (la 'X') */}
        <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button>

        <h2>Menú Principal</h2>

        {/* Enlaces de navegación usando <Link> de react-router-dom */}
        {/* El onClick={onClose} cierra el menú después de hacer clic */}

        {/* '/dashboard' apunta a la ruta 'index' (DashboardHome) */}
        <Link to="/dashboard-admin" onClick={onClose}>
          Mi Perfil
        </Link>

        {/* '/dashboard/usuarios' apunta a la ruta de gestión */}
        <Link to="/dashboard-admin/usuarios" onClick={onClose}>
          Gestión de Usuarios
        </Link>

        {/* Puedes agregar más enlaces aquí */}
        {/* <Link to="/dashboard/cursos" onClick={onClose}>Mis Cursos</Link> */}
        {/* <Link to="/dashboard/ajustes" onClick={onClose}>Ajustes</Link> */}

        {/* Botón para cerrar sesión, alineado al fondo */}
        <button onClick={handleLogout} className="btn-logout">
          Cerrar sesión
        </button>
      </nav>
    </>
  );
}

