// src/components/Info.jsx
//Info.jsx
import React from "react";
import "../styles/Info.css";

export default function Info() {
  return (
    <section className="Contenido">
      <main className="info">

        {/* Sección: Nosotros */}
        <section id="nosotros" className="section-block">
          <h2>Nuestra Institución</h2>
          <p>
            Somos una institución educativa comprometida con la excelencia
            académica y el desarrollo integral de nuestros estudiantes.
            Nuestra misión es formar líderes con pensamiento crítico, valores
            sólidos y las habilidades necesarias para enfrentar los retos del
            futuro.
          </p>
        </section>

        {/* Sección: Programas */}
        <section id="programas" className="section-block">
          <h2>Programas Educativos</h2>
          <ul>
            <li>Educación Inicial (Nido y Preescolar)</li>
            <li>Educación Primaria</li>
            <li>Educación Secundaria</li>
            <li>Programas de Bachillerato Internacional (IB)</li>
            <li>Actividades extracurriculares: Deportes, Arte y Tecnología</li>
          </ul>
        </section>

        {/* Sección: Contáctanos */}
        <section id="contactanos" className="section-block">
          <h2>Contáctanos</h2>
          <p>
            ¡Estamos listos para resolver tus dudas! Visítanos o comunícate
            con nosotros a través de los siguientes medios:
          </p>
          <ul>
            <li><strong>Dirección:</strong> Av. del Saber 123, Ciudad del Conocimiento</li>
            <li><strong>Teléfono:</strong> (+51) 1 555-1234</li>
            <li><strong>Email:</strong> admision@mi-escuela.edu</li>
            <li><strong>Horario de atención:</strong> Lunes a Viernes de 8:00 a.m. a 4:00 p.m.</li>
          </ul>
        </section>

      </main>
    </section>
  );
}