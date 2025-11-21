//src/components/CreateUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
// Reutiliza los estilos del modal de login
import '../styles/CreateUserModal.css';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('ALUMNO'); // Valor por defecto


    // NUEVOS ESTADOS para reemplazar carrera/departamento
    const [grado, setGrado] = useState('');
    const [dni, setDni] = useState(''); // DNI para Alumno y Profesor

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nameInputRef = useRef(null);

    // Limpiar formulario y enfocar al abrir
    useEffect(() => {
        if (isOpen) {
            setNombre('');
            setEmail('');
            setPassword('');
            setRol('ALUMNO');
            setGrado('');
            setDni(''); // Limpiar DNI
            setError(null);
            setTimeout(() => nameInputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/usuarios/crear`;
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('Sesión expirada.');
            setLoading(false);
            return;
        }

        // Construir el payload (UsuarioInputDTO)
        const payload = {
            nombre: nombre.trim(),
            email: email.trim(),
            password: password,
            rol: rol,
            dni: dni.trim(), // AÑADIDO DNI (Requerido en el backend)
            ...(rol === 'ALUMNO' && { grado: grado.trim() }), // GRADO reemplaza carrera
            // DEPARTAMENTO fue ELIMINADO del payload de creación
        };

        // Validación simple
        if (!payload.nombre || !payload.email || !payload.password || !payload.dni) {
            setError('Nombre, Email, Contraseña y DNI son obligatorios.');
            setLoading(false);
            return;
        }

        if (rol === 'ALUMNO' && !payload.grado) {
            setError('Para Alumno, el Grado es obligatorio.');
            setLoading(false);
            return;
        }

        // Nota: La validación de departamento fue eliminada del lado del FE, ya que el BE ya no lo espera para Profesor.

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.post(url, payload, config);
            onUserCreated(response.data);
            onClose();

        } catch (err) {
            console.error("Error al crear usuario:", err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("No tienes permisos para crear usuarios.");
                } else if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes("El correo electrónico ya está en uso")) {
                    setError("El correo electrónico ya está registrado.");
                } else if (err.response.data && err.response.data.message) {
                    setError(`Error del servidor: ${err.response.data.message}`);
                } else {
                    setError(`Error del servidor: ${err.response.status}`);
                }
            } else if (err.request) {
                setError("No se pudo conectar al servidor.");
            } else {
                setError("Ocurrió un error inesperado.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
            <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
                <div className="modal-body">
                    <h2 id="create-user-title" className="modal-title">Crear Nuevo Usuario</h2>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {/* Campos del formulario */}
                        <label> Nombre Completo* <input ref={nameInputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /> </label>
                        <label> Email* <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> </label>
                        <label> Contraseña* <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> </label>
                        <label> Rol*
                            <select value={rol} onChange={(e) => setRol(e.target.value)} required>
                                <option value="ALUMNO">Alumno</option>
                                <option value="PROFESOR">Profesor</option>
                                <option value="ADMINISTRADOR">Administrador</option>
                            </select>
                        </label>

                        <label> DNI* <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required /> </label>

                        {/* Campos condicionales según el rol */}
                        {rol === 'ALUMNO' && (
                            <>
                                <label> Grado* <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} required /> </label>
                            </>
                        )}
                        {/* PROFESOR ya no requiere campo extra aquí, solo DNI */}

                        {error && <p className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                        <div className="modal-actions">
                            <button type="submit" className="btn-submit" disabled={loading}> {loading ? 'Creando...' : 'Crear Usuario'} </button>
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}> Cancelar </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}