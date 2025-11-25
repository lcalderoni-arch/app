    //src/pages/DashboardHome.jsx
    import React from 'react';
    import "./../../styles/RolesStyle/AdminStyle.css/AdminPageFirst.css"
    import icon from "../../assets/logo.png";

    // Esta es la página de bienvenida que se muestra en /dashboard (ruta index)
    export default function DashboardHome() {
    
    const userName = localStorage.getItem('userName');
    
        return (
        <div className='box-firstpage-admin'>
            <div className='header-firstpage-admin'>
            <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
            <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>
            <div className='main-firstpage-admin'>
            <h2>Bienvenido {userName} al Panel de Control</h2>
            <p>
                Puedes ver tus paneles y funciones clickeando al icono <strong>(☰)</strong> para comenzar a gestionar
                la plataforma.
            </p>
            </div>

            <h3>Tutorial</h3>
            <div>
                <div className='card-tutorial-admin'>
                    <img className='img-tutorial-admin' src="" alt="" />
                </div>
                <div className='card-tutorial-admin'>
                    <img className='img-tutorial-admin' src="" alt="" />
                </div>
                <div className='card-tutorial-admin'>
                    <img className='img-tutorial-admin' src="" alt="" />
                </div>
            </div>
        {/* Puedes agregar aquí un resumen o estadísticas rápidas si lo deseas */}
        </div>
    );
    }

