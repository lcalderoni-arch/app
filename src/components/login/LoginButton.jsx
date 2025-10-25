import React, { useState } from "react";
import BaseModal from "./BaseModal.jsx";

export default function LoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn-login"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Iniciar sesión
      </button>

      {open && <BaseModal onClose={() => setOpen(false)} />}
    </>
  );
}
