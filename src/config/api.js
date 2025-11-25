// src/config/api.js
const isDevelopment = false; // ⚠️ Cambia a false temporalmente

export const API_BASE_URL = isDevelopment
    ? 'http://localhost:8081/api'
    : 'https://fundaciondeportiva-backend-api-2025-gveefdbmgvdggqa8.chilecentral-01.azurewebsites.net/api';

export const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/auth`,
    usuarios: `${API_BASE_URL}/usuarios`,
    alumnos: `${API_BASE_URL}/alumnos`,
    profesores: `${API_BASE_URL}/profesores`,
    cursos: `${API_BASE_URL}/cursos`,
    secciones: `${API_BASE_URL}/secciones`
};