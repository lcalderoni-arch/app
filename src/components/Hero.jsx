// src/components/Hero.jsx
import React from "react";
import AuthContainer from "./login/AuthContainer";
import "../styles/Hero.css";

export default function Hero() {
  return (
    <section className="Fondo" id="inicio">
      <main className='contenido-fondo'>
        <div className='content-wrapper'>
          <div className='description-container'>
            <h1>Bienvenido a tu Centro de Estudio</h1>
          </div>
          
          <div className="login-container">
            <AuthContainer />
            <p className='marca'>© 2025 ReinventED Rimac - Fundación Semillero de Campeones</p>
          </div>
        </div>
      </main>
    </section>
  );
}