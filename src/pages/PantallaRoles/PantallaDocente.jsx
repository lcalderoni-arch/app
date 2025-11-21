import React from 'react';
import LogoutButton from '../../components/login/LogoutButton';

export default function PantallaDocente() {
    const userName = localStorage.getItem('userName');

    return (
        <div style={{ padding: '20px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                borderBottom: '2px solid #1a64aa',
                paddingBottom: '15px'
            }}>
                <div>
                    <h1>Portal del Docente</h1>
                    <p>Bienvenido, {userName}</p>
                </div>
                <LogoutButton />
            </header>

            <main>
                <h2>Mis Clases</h2>
                <p>Gestiona tus clases, estudiantes y calificaciones.</p>
            </main>
        </div>
    );
}