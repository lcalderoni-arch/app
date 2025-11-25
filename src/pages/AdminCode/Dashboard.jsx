  // src/pages/Dashboard.jsx 
  import React, { useState } from 'react';
  import Sidebar from '../../components/Sidebar'; // Importa el Sidebar desde la carpeta components
  import { Outlet } from 'react-router-dom'; // 🚨 1. IMPORTAMOS EL OUTLET

  // Estilos para el botón hamburguesa
  const hamburgerStyle = {
    fontSize: '2rem',
    background: 'none',
    border: 'none',
    color: '#1a64aa', // Color primario de la escuela
    cursor: 'pointer',
    padding: '10px',
    position: 'fixed',
    top: '2px',
    right: '20px',
    zIndex: 998,
  };

  // Este componente ahora actúa como un contenedor para las sub-páginas del dashboard
  export default function Dashboard() {
    // Estado para controlar si el sidebar está abierto
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
      <div>
        {/* Botón para abrir el menú lateral */}
        <button
          style={hamburgerStyle}
          onClick={openSidebar}
          aria-label="Abrir menú de navegación"
        >
          ☰
        </button>

        {/* Componente Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

          {/* 🚨 2. AQUÍ SE RENDERIZARÁN LAS SUB-RUTAS (DashboardHome o GestionUsuarios) */}
          <Outlet />
      </div>
    );
  }

