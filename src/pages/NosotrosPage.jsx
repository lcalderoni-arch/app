import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Importar
import Header from "../components/Header.jsx";
import Nosotros from "./Nosotros";

export default function NosotrosPage() {
  const location = useLocation();

  // Detectar hash y hacer scroll
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <>
      <Header />
      <Nosotros />
    </>
  );
}