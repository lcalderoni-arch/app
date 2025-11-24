// src/config/api.js

// Detecta si estamos en desarrollo (localhost) o producción (Azure)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// URL base del backend según el entorno
export const API_BASE_URL = isDevelopment
    ? 'http://localhost:8081/api'  // Desarrollo local
    : 'https://fundaciondeportiva-backend-api-2025-gveefdbmgvdggqa8.chilecentral-01.azurewebsites.net/api'; // Producción Azure

// Opcional: Exportar URLs específicas si las necesitas
export const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/auth`,
    usuarios: `${API_BASE_URL}/usuarios`,
    alumnos: `${API_BASE_URL}/alumnos`,
    profesores: `${API_BASE_URL}/profesores`,
    cursos: `${API_BASE_URL}/cursos`, 
    secciones: `${API_BASE_URL}/secciones`, // ⭐ AGREGADO
};