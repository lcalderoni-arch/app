// src/components/login/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        // Limpieza total del localStorage
        localStorage.clear(); 
        
        // Navegar y recargar para que la App.js inicie limpia
        navigate('/');
        window.location.reload(); 
    };

    return (
        <button
            className="btn-logout"
            onClick={handleLogout}
            title={`Sesión de ${userName || 'Usuario'}`}
            style={{
                padding: '10px 20px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
            }}
        >
            Cerrar sesión
        </button>
    );
}