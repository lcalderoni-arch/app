// src/index.js
import React from 'react';

import HomePage from "./pages/HomePage.jsx"; 
import NosotrosPage from "./pages/NosotrosPage.jsx"; // ✅ Mejor nombre de importación

import Dashboard from "./pages/AdminCode/Dashboard.jsx"; 
import DashboardHome from "./pages/AdminCode/DashboardHome.jsx";
import GestionUsuarios from "./pages/AdminCode/GestionUsuarios.jsx";
import PantallaEstudiante from "./pages/PantallaRoles/PantallaEstudiante.jsx";
import PantallaDocente from "./pages/PantallaRoles/PantallaDocente.jsx";

import ProtectedRoute from "./security/ProtectedRoute.jsx"; 

// Define la estructura de rutas como un ARRAY
const routeConfig = [
  { 
    path: "/", 
    element: <HomePage /> 
  },  
  { 
    path: "/nosotros", // ✅ URL más limpia (sin "Page")
    element: <NosotrosPage /> // ✅ Nombre claro
  },

  {
    path: "/dashboard-admin", 
    element: (
      <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
        <Dashboard /> 
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: <DashboardHome /> 
      }, 
      { 
        path: "usuarios", 
        element: <GestionUsuarios /> 
      },
    ]
  },

  // ✅ NUEVA RUTA PARA ESTUDIANTE
  {
    path: "/pantalla-estudiante",
    element: (
      <ProtectedRoute allowedRoles={["ALUMNO"]}>
        <PantallaEstudiante />
      </ProtectedRoute>
    )
  },
  
  // ✅ NUEVA RUTA PARA DOCENTE
  {
    path: "/pantalla-docente",
    element: (
      <ProtectedRoute allowedRoles={["PROFESOR"]}>
        <PantallaDocente />
      </ProtectedRoute>
    )
  },

];

// Exporta el ARRAY como default
export default routeConfig;

