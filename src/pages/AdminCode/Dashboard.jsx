  // src/pages/Dashboard.jsx 
  import React, { useState } from 'react';
  import Sidebar from '../../components/Sidebar'; // Importa el Sidebar desde la carpeta components
  import { Outlet } from 'react-router-dom';

  // Estilos para el botón hamburguesa
  const hamburgerStyle = {
    fontSize: '20px',
  background: 'none',
  border: '3px solid #1a64aa',
  borderRadius: '50%', // Esto hace que el borde sea circular
  color: '#1a64aa', // Color primario de la escuela
  fontWeight: '800',
  cursor: 'pointer',
  padding: '15px',  // Usa un padding uniforme para que sea simétrico
  position: 'absolute',
  top: '12px',
  right: '20px',
  zIndex: 998,
  width: '45px',  // Establece un ancho fijo
  height: '45px', // Establece una altura fija igual al ancho
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', // Asegura que el icono esté centrado
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

