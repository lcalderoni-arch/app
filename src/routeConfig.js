// src/index.js
import React from 'react';

// Importa tus componentes (¡Añade .jsx si es necesario!)
import HomePage from "./pages/HomePage.jsx"; 
import Dashboard from "./pages/Dashboard.jsx"; 
import DashboardHome from "./pages/DashboardHome.jsx";
import GestionUsuarios from "./pages/GestionUsuarios.jsx"; // Usa la versión simple o la completa
import ProtectedRoute from "./security/ProtectedRoute.jsx"; 

// Define la estructura de rutas como un ARRAY
const routeConfig = [
  { 
    path: "/", 
    element: <HomePage /> 
  },
  {
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
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
];

// Exporta el ARRAY como default
export default routeConfig;

