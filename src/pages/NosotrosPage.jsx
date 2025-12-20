import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Importar
import Header from "../components/Header.jsx";
import Nosotros from "./Nosotros";

export default function NosotrosPage() {
  const location = useLocation();

    // Detectar hash y hacer scroll
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Pequeño delay para asegurar que el DOM esté listo
    } else {
      // Si no hay hash, scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <Header />
        <Nosotros />
    </>
  );
}