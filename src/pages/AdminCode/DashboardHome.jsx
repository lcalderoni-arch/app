//src/pages/DashboardHome.jsx
import React from 'react';

import { useNavigate } from 'react-router-dom';

import "./../../styles/RolesStyle/AdminStyle/AdminPageFirst.css"
import icon from "../../assets/logo.png";
import image1 from "../../assets/cardimageadmin1.png";
import image2 from "../../assets/cardimageadmin2.png";
import image3 from "../../assets/cardimageadmin3.png";
import miGif from "../../assets/tutorialadmin.gif";

// Esta es la página de bienvenida que se muestra en /dashboard (ruta index)
export default function DashboardHome() {

    const navigate = useNavigate();

    const handleNavigateToUsuarios = () => {
        // Aquí puedes agregar lógica adicional
        console.log('Navegando a Gestión de Usuarios...');
        navigate('/dashboard-admin/usuarios');
    };

    const handleNavigateToCursos = () => {
        // Aquí puedes agregar lógica adicional
        console.log('Navegando a Gestión de Cursos...');
        navigate('/dashboard-admin/cursos');
    };

    const handleNavigateToSecciones = () => {
        // Aquí puedes agregar lógica adicional
        console.log('Navegando a Gestión de Secciones...');
        navigate('/dashboard-admin/secciones');
    };

    const userName = localStorage.getItem('userName');

    return (
        <div className='box-firstpage-admin'>
            <div className='header-firstpage-admin'>
                <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
                <h1>Plataforma de Gestiones Reinvented Rimac</h1>
            </div>
            <div className='main-firstpage-admin'>
                <h2>Bienvenido {userName} al Panel de Control</h2>
                <div className='card-instruction'>
                    <div className="text-container">
                        <h2>¿Como puedo Empezar?</h2>
                        <p>
                            Para comenzar a gestionar la plataforma, simplemente haz clic en el icono redondo <strong className='icon-text'>(☰)</strong> ubicado en la esquina superior. Allí encontrarás un menú con tus paneles y funciones disponibles, desde donde podrás acceder a todas las herramientas necesarias para administrar y controlar la plataforma de manera eficiente.
                        </p>
                    </div>
                    <img className='photo-instruction' src={miGif} alt="" />
                </div>
            </div>

            <div className='main-gestion-firstpage-admin'>
                <h3>Tutorial</h3>
                <div className='box-card-tutorial-admin'>
                    <div className='card-tutorial-admin'>
                        <img className='img-tutorial-admin' src={image1} alt="" />
                        <h3 className='card-tutorial-title-gestion'>Usuarios</h3>
                        <p>Administra tu comunidad educativa completa. Crea usuarios, asigna roles y
                            permisos, y mantén el control total sobre quién accede a tu plataforma.
                            Todo desde un solo lugar.</p>
                        <button to="/dashboard-admin/usuarios" onClick={handleNavigateToUsuarios}>Ir</button>
                    </div>
                    <div className='card-tutorial-admin'>
                        <img className='img-tutorial-admin' src={image2} alt="" />
                        <h3 className='card-tutorial-title-gestion'>Cursos</h3>
                        <p>Crea y organiza el catálogo completo de cursos. Define materias,
                            establece objetivos y estructura el contenido que transformará a
                            tus alumnos en campeones.</p>
                        <button to="/dashboard-admin/cursos" onClick={handleNavigateToCursos}>Ir</button>
                    </div>
                    <div className='card-tutorial-admin'>
                        <img className='img-tutorial-admin' src={image3} alt="" />
                        <h3 className='card-tutorial-title-gestion'>Secciones</h3>
                        <p>Organiza grupos, horarios y asignaciones de manera inteligente.
                            Conecta profesores con alumnos, establece capacidades y optimiza
                            la distribución de tu talento educativo.</p>
                        <button to="/dashboard-admin/secciones" onClick={handleNavigateToSecciones}>Ir</button>
                    </div>
                </div>
            </div>
            {/* Puedes agregar aquí un resumen o estadísticas rápidas si lo deseas */}
        </div>
    );
}

