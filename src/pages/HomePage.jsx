// src/pages/HomePage.jsx 
// 🚨 ESTE ES EL NUEVO ARCHIVO DE PÁGINA

import React from 'react';
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import Info from "../components/Info.jsx";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Info />
    </>
  );
}