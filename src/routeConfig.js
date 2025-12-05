// src/index.js
import React from "react";

import HomePage from "./pages/HomePage.jsx";
import NosotrosPage from "./pages/NosotrosPage.jsx";

import Dashboard from "./pages/AdminCode/Dashboard.jsx";
import DashboardHome from "./pages/AdminCode/DashboardHome.jsx";
import GestionUsuarios from "./pages/AdminCode/GestionUsuarios.jsx";
import GestionCursos from "./pages/AdminCode/GestionCursos.jsx";
import GestionSecciones from "./pages/AdminCode/GestionSecciones.jsx";
import GestionMatricula from "./pages/AdminCode/GestionMatricula.jsx";
import PantallaMonitorAsistencias from "./pages/AdminCode/PantallaMonitorAsistencias.jsx";
import PantallaMonitorDetalleAsistencias from "./pages/AdminCode/PantallaMonitorDetalleAsistencias.jsx";


import PantallaEstudiante from "./pages/PantallaRoles/PantallaEstudiante/PantallaEstudiante.jsx";
import PantallaMatriculaAlumno from "./pages/PantallaRoles/PantallaEstudiante/PantallaMatriculaAlumno.jsx";

import PantallaAsistenciasAlumno from "./pages/PantallaRoles/PantallaEstudiante/PantallaAsistenciasAlumno.jsx";
import PantallaAsistenciasDocente from "./pages/PantallaRoles/PantallaDocente/PantallaAsistenciasDocente.jsx";

// IMPORTAMOS LA NUEVA VISTA
import PantallaSeccionEstudiante from "./pages/PantallaRoles/PantallaEstudiante/PantallaSeccionEstudiante.jsx";

import PantallaDocente from "./pages/PantallaRoles/PantallaDocente/PantallaDocente.jsx";
import PantallaSeccionDocente from "./pages/PantallaRoles/PantallaDocente/PantallaSeccionDocente.jsx";

import ProtectedRoute from "./security/ProtectedRoute.jsx";

const routeConfig = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/nosotros",
    element: <NosotrosPage />,
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
        element: <DashboardHome />,
      },
      {
        path: "usuarios",
        element: <GestionUsuarios />,
      },
      {
        path: "cursos",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionCursos />
          </ProtectedRoute>
        ),
      },
      {
        path: "secciones",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionSecciones />
          </ProtectedRoute>
        ),
      },
      {
        path: "matriculas",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionMatricula />
          </ProtectedRoute>
        ),
      },
      {
        path: "monitor-asistencias",
        element: (
          <ProtectedRoute allowedRoles={["ADMINISTRADOR", "COORDINADOR"]}>
            <PantallaMonitorAsistencias />
          </ProtectedRoute>
        ),
      },
      {
        path: "monitor-asistencias/:seccionId/:sesionId",
        element: (
          <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
            <PantallaMonitorDetalleAsistencias />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // --- RUTAS ESTUDIANTE ---
  {
    path: "/pantalla-estudiante",
    element: (
      <ProtectedRoute allowedRoles={["ALUMNO"]}>
        <PantallaEstudiante />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pantalla-alumno/matricula",
    element: (
      <ProtectedRoute allowedRoles={["ALUMNO"]}>
        <PantallaMatriculaAlumno />
      </ProtectedRoute>
    ),
  },
  // ⭐ NUEVA RUTA PARA VER EL CONTENIDO DE LA SECCIÓN
  {
    path: "/pantalla-estudiante/seccion/:seccionId",
    element: (
      <ProtectedRoute allowedRoles={["ALUMNO"]}>
        <PantallaSeccionEstudiante />
      </ProtectedRoute>
    ),
  },

  {
    path: "/alumno/seccion/:seccionId/asistencias",
    element: (
      <ProtectedRoute allowedRoles={["ALUMNO"]}>
        <PantallaAsistenciasAlumno />
      </ProtectedRoute>
    ),
  },

  // --- RUTAS DOCENTE ---
  {
    path: "/pantalla-docente",
    element: (
      <ProtectedRoute allowedRoles={["PROFESOR"]}>
        <PantallaDocente />
      </ProtectedRoute>
    ),
  },
  {
    path: "/docente/seccion/:seccionId",
    element: (
      <ProtectedRoute allowedRoles={["PROFESOR"]}>
        <PantallaSeccionDocente />
      </ProtectedRoute>
    ),
  },

  {
    path: "/docente/seccion/:seccionId/asistencias/:sesionId",
    element: (
      <ProtectedRoute allowedRoles={["PROFESOR"]}>
        <PantallaAsistenciasDocente />
      </ProtectedRoute>
    ),
  },
];

export default routeConfig;
