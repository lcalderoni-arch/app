import React from "react";

import slider1 from "../assets/slider1.png";
import slider2 from "../assets/slider2.png";
import slider3 from "../assets/slider3.png";

import "../styles/Nosotros.css";

export default function Nosotros() {
    return (
        <section className="title-nosotros">
            <div className="slider-box">
                <ul>
                    <li>
                        <img src={slider1} alt="" />
                    </li>
                    <li>
                        <img src={slider2} alt="" />
                    </li>
                    <li>
                        <img src={slider3} alt="" />
                    </li>
                </ul>
            </div>
            <div className="box-data">
                <div className="text">
                    <div className="value">
                        <p>5,000+</p>
                    </div>
                    <p>Estudiantes Activo</p>
                </div>
                <div className="text">
                    <div className="value">
                        <p>12</p>
                    </div>
                    <p>Programas Académicos</p>
                </div>
                <div className="text">
                    <div className="value">
                        <p>98%</p>
                    </div>
                    <p>Satisfacción Estudiantil</p>
                </div>
            </div>
            <div className="area-motivo">
                <h2>¿Por qué elegirnos?</h2>
                <p>Más que una Universidad, una Comunidad</p>
                <p>En Reinvented Rimac, no solo formamos profesionales, creamos líderes que transforman el mundo. Nuestra metodología innovadora combina teoría y práctica para garantizar tu éxito.</p>
                <ul>
                    <li>
                        <h3>Acreditación Internacional</h3>
                        <p>Programas reconocidos globalmente con estándares de excelencia</p>
                    </li>
                    <li>
                        <h3>Red Global de Contactos</h3>
                        <p>Convenios con universidades y empresas en más de 30 países</p>
                    </li>
                    <li>
                        <h3>Metodología Innovadora</h3>
                        <p>Aprendizaje basado en proyectos reales y casos de estudio actuales</p>
                    </li>
                </ul>
            </div>
            <div className="area-nosotros">
                <h2 id="nosotros">Sobre Nosotros</h2>
                <p>Reinvented Rimac es una institución educativa comprometida con la excelencia académica y el desarrollo integral de nuestros estudiantes. Ofrecemos una experiencia educativa innovadora que prepara a los jóvenes para los desafíos del futuro, Nuestra misión es formar líderes con pensamiento crítico, valores sólidos y las habilidades necesarias para enfrentar los retos del futuro.</p>
            </div>
            <div className="area-programas">
                <h2 id="programas">Programas Educativos</h2>
                <p>Ofrecemos programas diseñados para formar el futuro del estudiante</p>
                <ul>
                    <li>Educación Inicial (Nido y Preescolar)</li>
                    <li>Educación Primaria</li>
                    <li>Educación Secundaria</li>
                    <li>Programas de Bachillerato Internacional (IB)</li>
                    <li>Actividades extracurriculares: Deportes, Arte y Tecnología</li>
                </ul>
            </div>
            <div className="area-contactanos">
                <h2 id="contactanos">Contáctanos</h2>
                <p>¿Tienes alguna duda o problema?</p>
                <p>Estamos aquí para responder todas tus preguntas y ayudarte en tu camino académico</p>
                <p>Información del contacto</p>
            </div>
        </section>
    );
}