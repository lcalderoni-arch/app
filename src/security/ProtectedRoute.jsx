//src/security/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  
  // 1. Revisa si tenemos un token
  const token = localStorage.getItem("authToken");

  // 2. 🚨 ¡NUEVO! Revisa qué rol tenemos
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    // 3. Si NO hay token, te bota (Autenticación)
    console.error("⛔ ACCESO DENEGADO: No se encontró token. Redirigiendo al inicio.");
    return <Navigate to="/" replace />;
  }

  // 4. 🚨 ¡NUEVO! Revisa si el rol es el correcto
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // 5. Si hay token, PERO el rol no es Admin, te bota (Autorización)
    console.error(`⛔ AUTORIZACIÓN DENEGADA: El rol '${userRole}' no tiene permisos. Roles permitidos: ${allowedRoles.join(', ')}`);
    
    // Opcional: Podríamos borrar el token aquí si quisiéramos ser más estrictos
    // localStorage.clear(); 
    return <Navigate to="/" replace />;
  }

  // 6. Si SÍ hay token Y SÍ es Admin, muestra la página protegida
  return children;
}

