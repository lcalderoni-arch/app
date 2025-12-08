import React, { useRef } from "react";
import axios from "axios";

import { API_ENDPOINTS, API_BASE_URL } from "../../config/api.js";
import icon from "../../assets/logo.png";

import "../../styles/RolesStyle/AdminStyle/GestionUsuarios.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faUserGroup,
  faMagnifyingGlass,
  faSquarePlus,
  faEye,
  faEyeSlash,      // 👈 AÑADIR
} from "@fortawesome/free-solid-svg-icons";

function GestionUsuarios() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isNivelOpen, setIsNivelOpen] = React.useState(false);

  // Estados de datos
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // --- EDICIÓN EN FORMULARIO ---
  const [editingUser, setEditingUser] = React.useState(null);
  const [isEditMode, setIsEditMode] = React.useState(false);

  // Refs para dropdowns
  const rolSelectRef = useRef(null);
  const nivelSelectRef = useRef(null);
  const filtroRolSelectRef = useRef(null);

  // Estados del formulario (crear / editar)
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [rol, setRol] = React.useState("");
  const [formError, setFormError] = React.useState(null);
  const [creatingUser, setCreatingUser] = React.useState(false);

  // Mostrar / ocultar contraseña
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // ALUMNO
  const [dniAlumno, setDniAlumno] = React.useState("");
  const [numberPhoneAlumno, setnumberPhoneAlumno] = React.useState("");
  const [nivel, setNivel] = React.useState("");
  const [grado, setGrado] = React.useState("");

  // PROFESOR
  const [dniProfesor, setDniProfesor] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [experiencia, setExperiencia] = React.useState("");

  // Filtros tabla
  const [filtroNombre, setFiltroNombre] = React.useState("");
  const [filtroRol, setFiltroRol] = React.useState("");
  const [filtroEmail, setFiltroEmail] = React.useState("");
  const [filtroDni, setFiltroDni] = React.useState("");
  const [isFiltroRolOpen, setIsFiltroRolOpen] = React.useState(false);

  // --- ETL ---
  const [etlFile, setEtlFile] = React.useState(null);
  const [etlResult, setEtlResult] = React.useState(null);
  const [loadingETL, setLoadingETL] = React.useState(false);

  const API_URL = API_ENDPOINTS.usuarios;

  // --- Cargar usuarios ---
  const fetchUsuarios = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No estás autenticado.");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("No tienes permisos de Administrador.");
      } else {
        setError(err.message || "Error al cargar datos.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (rolSelectRef.current && !rolSelectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (
        nivelSelectRef.current &&
        !nivelSelectRef.current.contains(event.target)
      ) {
        setIsNivelOpen(false);
      }
      if (
        filtroRolSelectRef.current &&
        !filtroRolSelectRef.current.contains(event.target)
      ) {
        setIsFiltroRolOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroRol("");
    setFiltroEmail("");
    setFiltroDni("");
  };

  // --- Eliminar usuario ---
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`¿Eliminar a "${userName}"?`)) return;
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Sesión expirada.");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/eliminar/${userId}`, config);
      setUsuarios((current) => current.filter((user) => user.id !== userId));
      alert(`Usuario "${userName}" eliminado.`);
    } catch (err) {
      console.error(`Error al eliminar ${userId}:`, err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("No tienes permisos para eliminar.");
      } else if (err.response && err.response.status === 404) {
        setError("El usuario ya no existe.");
        fetchUsuarios();
      } else {
        setError(err.message || "Error al eliminar.");
      }
    }
  };

  // --- Limpiar formulario + salir de edición ---
  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRol("");
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);

    setDniAlumno("");
    setnumberPhoneAlumno("");
    setNivel("");
    setGrado("");

    setDniProfesor("");
    setTelefono("");
    setExperiencia("");

    setIsEditMode(false);
    setEditingUser(null);
  };

  const validarDni = (dni) => /^\d{8}$/.test(dni);

  const handleDniAlumnoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) setDniAlumno(value);
  };

  const handleNumberPhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) setnumberPhoneAlumno(value);
  };

  const handleDniProfesorChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) setDniProfesor(value);
  };

  // --- Click en Editar: cargar usuario en formulario ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditMode(true);
    setFormError(null);

    setRol(user.rol || "");
    setNombre(user.nombre || "");
    setEmail(user.email || "");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (user.rol === "ALUMNO") {
      // Intentamos leer DNI, nivel y grado de varias formas
      const dniFromUser =
        user.dniAlumno || user.dni || (user.alumno && user.alumno.dni) || "";
      const nivelFromUser =
        (user.alumno && user.alumno.nivel) || user.nivel || "";
      const gradoFromUser =
        (user.alumno && user.alumno.grado) || user.grado || "";

      setDniAlumno(dniFromUser);
      setnumberPhoneAlumno(user.telefonoEmergencia || "");
      setNivel(nivelFromUser);
      setGrado(gradoFromUser);

      setDniProfesor("");
      setTelefono("");
      setExperiencia("");
    } else if (user.rol === "PROFESOR") {
      const dniFromUser =
        user.dniProfesor || user.dni || (user.profesor && user.profesor.dni) || "";

      setDniProfesor(dniFromUser);
      setTelefono(user.telefono || "");
      setExperiencia(
        (user.profesor && user.profesor.experiencia) ||
        user.experiencia ||
        ""
      );

      setDniAlumno("");
      setnumberPhoneAlumno("");
      setNivel("");
      setGrado("");
    } else {
      // ADMIN u otros
      setDniAlumno("");
      setnumberPhoneAlumno("");
      setNivel("");
      setGrado("");
      setDniProfesor("");
      setTelefono("");
      setExperiencia("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Crear usuario ---
  const crearUsuario = async () => {
    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!nombre.trim() || !email.trim() || !password) {
      setFormError("Nombre, Email y Contraseña son obligatorios.");
      return;
    }
    if (!rol) {
      setFormError("Debes seleccionar un rol.");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password,
      rol: rol,
    };

    if (rol === "ALUMNO") {
      if (!dniAlumno.trim() || !grado.trim() || !nivel) {
        setFormError("Para Alumno: DNI, Nivel y Grado son obligatorios.");
        return;
      }
      if (!validarDni(dniAlumno)) {
        setFormError("El DNI debe tener exactamente 8 dígitos.");
        return;
      }
      if (!/^\d{9}$/.test(numberPhoneAlumno)) {
        setFormError(
          "El teléfono de emergencia debe tener exactamente 9 dígitos."
        );
        return;
      }

      payload.dniAlumno = dniAlumno.trim();
      payload.nivel = nivel;
      payload.grado = grado.trim();
      payload.telefonoEmergencia = numberPhoneAlumno.trim();
    } else if (rol === "PROFESOR") {
      if (!dniProfesor.trim()) {
        setFormError("Para Profesor: DNI es obligatorio.");
        return;
      }
      if (!validarDni(dniProfesor)) {
        setFormError("El DNI debe tener exactamente 8 dígitos.");
        return;
      }

      if (telefono.trim() !== "" && !/^\d{9}$/.test(telefono)) {
        setFormError(
          "El teléfono debe tener exactamente 9 dígitos (o déjalo vacío)."
        );
        return;
      }

      payload.dniProfesor = dniProfesor.trim();
      if (telefono.trim()) payload.telefono = telefono.trim();
      if (experiencia.trim()) payload.experiencia = experiencia.trim();
    }

    console.log("📤 Enviando payload (crear):", payload);

    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Sesión expirada.");

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const url = `${API_BASE_URL}/usuarios/crear`;
    const response = await axios.post(url, payload, config);

    setUsuarios((current) => [response.data, ...current]);
    alert(`Usuario "${response.data.nombre}" creado correctamente.`);
    limpiarFormulario();
  };

  // --- Editar usuario ---
  const editarUsuario = async () => {
    if (!editingUser) {
      setFormError("No hay usuario seleccionado para edición.");
      return;
    }

    // Sólo validamos contraseña si quieren cambiarla
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setFormError("Las contraseñas no coinciden.");
        return;
      }
      if (password.length < 6) {
        setFormError(
          "La nueva contraseña debe tener al menos 6 caracteres."
        );
        return;
      }
    }

    const payload = {};

    if (nombre.trim() && nombre !== editingUser.nombre) {
      payload.nombre = nombre.trim();
    }
    if (email.trim() && email !== editingUser.email) {
      payload.email = email.trim();
    }
    if (password.trim()) {
      payload.password = password.trim();
    }

    // PERFIL ALUMNO
    if (editingUser.rol === "ALUMNO") {
      const dniOriginal =
        editingUser.dniAlumno ||
        editingUser.dni ||
        (editingUser.alumno && editingUser.alumno.dni) ||
        "";
      const gradoOriginal =
        (editingUser.alumno && editingUser.alumno.grado) ||
        editingUser.grado ||
        "";
      const nivelOriginal =
        (editingUser.alumno && editingUser.alumno.nivel) ||
        editingUser.nivel ||
        "";
      const telEmergOriginal = editingUser.telefonoEmergencia || "";

      if (dniAlumno.trim() && dniAlumno !== dniOriginal) {
        if (!validarDni(dniAlumno)) {
          setFormError("El DNI debe tener exactamente 8 dígitos.");
          return;
        }
        payload.dni = dniAlumno.trim(); // mismo campo que usaba tu modal
      }

      if (grado.trim() && grado !== gradoOriginal) {
        payload.grado = grado.trim();
      }

      if (nivel && nivel !== nivelOriginal) {
        payload.nivel = nivel;
      }

      if (numberPhoneAlumno.trim()) {
        if (!/^\d{9}$/.test(numberPhoneAlumno)) {
          setFormError(
            "El teléfono de emergencia debe tener exactamente 9 dígitos."
          );
          return;
        }
        if (numberPhoneAlumno !== telEmergOriginal) {
          payload.telefonoEmergencia = numberPhoneAlumno.trim();
        }
      }
    }

    // PERFIL PROFESOR
    if (editingUser.rol === "PROFESOR") {
      const dniOriginal =
        editingUser.dniProfesor ||
        editingUser.dni ||
        (editingUser.profesor && editingUser.profesor.dni) ||
        "";
      const telOriginal = editingUser.telefono || "";
      const expOriginal =
        (editingUser.profesor && editingUser.profesor.experiencia) ||
        editingUser.experiencia ||
        "";

      if (dniProfesor.trim() && dniProfesor !== dniOriginal) {
        if (!validarDni(dniProfesor)) {
          setFormError("El DNI debe tener exactamente 8 dígitos.");
          return;
        }
        payload.dni = dniProfesor.trim();
      }

      if (telefono.trim()) {
        if (!/^\d{9}$/.test(telefono)) {
          setFormError(
            "El teléfono debe tener exactamente 9 dígitos (o déjalo vacío)."
          );
          return;
        }
        if (telefono !== telOriginal) {
          payload.telefono = telefono.trim();
        }
      }

      if (experiencia.trim() && experiencia !== expOriginal) {
        payload.experiencia = experiencia.trim();
      }
    }

    if (Object.keys(payload).length === 0) {
      setFormError("No se realizaron cambios.");
      return;
    }

    console.log("📤 Enviando payload (editar):", payload);

    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Sesión expirada.");

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const url = `${API_BASE_URL}/usuarios/editar/${editingUser.id}`;

    const response = await axios.put(url, payload, config);

    setUsuarios((currentUsers) =>
      currentUsers.map((user) =>
        user.id === response.data.id ? response.data : user
      )
    );

    alert(`Usuario "${response.data.nombre}" actualizado.`);
    limpiarFormulario();
  };

  // --- Submit único ---
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setCreatingUser(true);

    try {
      if (isEditMode) {
        await editarUsuario();
      } else {
        await crearUsuario();
      }
    } catch (err) {
      console.error("❌ Error en el formulario de usuario:", err);

      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setFormError("No tienes permisos para esta acción.");
        } else if (err.response.status === 400 && err.response.data?.message) {
          setFormError(err.response.data.message);
        } else if (err.response.status === 409 && err.response.data?.message) {
          setFormError(err.response.data.message);
        } else if (err.response.data?.message) {
          setFormError(`Error: ${err.response.data.message}`);
        } else {
          setFormError(`Error del servidor (código ${err.response.status})`);
        }
      } else if (err.request) {
        setFormError("No se pudo conectar al servidor.");
      } else if (err.message) {
        setFormError(err.message);
      } else {
        setFormError("Ocurrió un error inesperado.");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  if (loading && usuarios.length === 0)
    return <p>Cargando lista de usuarios...</p>;
  if (error && usuarios.length === 0)
    return <p style={{ color: "red" }}>Error: {error}</p>;

  const usuariosFiltrados = usuarios.filter((user) => {
    const cumpleNombre =
      filtroNombre === "" ||
      user.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const cumpleRol = filtroRol === "" || user.rol === filtroRol;
    const cumpleEmail =
      filtroEmail === "" ||
      user.email.toLowerCase().includes(filtroEmail.toLowerCase());
    const cumpleDni =
      filtroDni === "" ||
      (user.rol === "ALUMNO" && user.dniAlumno?.includes(filtroDni)) ||
      (user.rol === "PROFESOR" && user.dniProfesor?.includes(filtroDni));

    return cumpleNombre && cumpleRol && cumpleEmail && cumpleDni;
  });

  const handleETLUpload = async () => {
    if (!etlFile) return;

    setLoadingETL(true);
    setEtlResult(null);

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("file", etlFile);

      const response = await axios.post(
        `${API_BASE_URL}/etl/usuarios`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEtlResult(response.data);
      alert("ETL completado");
      fetchUsuarios(); // recargar lista
    } catch (err) {
      console.error(err);
      alert("Error procesando Excel");
    } finally {
      setLoadingETL(false);
    }
  };

  return (
    <div className="general-box-gestionusuarios">
      <div className="header-firstpage-admin">
        <img className="icon" src={icon} alt="Logo de Reinvent ID Rímac" />
        <h1>Plataforma de Gestiones Reinvented Rimac</h1>
      </div>

      <div className="div-box-header-text-gestionusuarios">
        <div className="alinear-al-centro">
          <h2>
            <FontAwesomeIcon className="icon" icon={faUserGroup} />
            Gestión de Usuarios
          </h2>
        </div>
        <p>Administra los usuarios registrados en la plataforma.</p>

        {/* =======================
    ETL: Subir archivo Excel
   ======================= */}
        <div className="etl-upload-box">
          <label className="etl-upload-label">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setEtlFile(e.target.files[0])}
              className="etl-input"
            />
            📁 Seleccionar archivo Excel
          </label>

          <button
            className="etl-upload-btn"
            disabled={!etlFile || loadingETL}
            onClick={handleETLUpload}
          >
            {loadingETL ? "Procesando..." : "Cargar Usuarios (ETL)"}
          </button>
        </div>

        {etlResult && (
          <div className="etl-result-box">
            <h3>📊 Resultados del ETL</h3>

            <div className="etl-stats">
              <div className="etl-stat">Procesados: <strong>{etlResult.procesados}</strong></div>
              <div className="etl-stat">Exitosos: <strong>{etlResult.exitosos}</strong></div>
              <div className="etl-stat">Fallidos: <strong>{etlResult.fallidos}</strong></div>
            </div>

            {/* TABLA DE ERRORES */}
            {etlResult.errores.length > 0 && (
              <div className="etl-error-table">
                <h4>❗ Errores detectados</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Mensaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etlResult.errores.map((e, i) => (
                      <tr key={i}>
                        <td>{e.fila}</td>
                        <td>{e.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {loading && <p>Actualizando lista...</p>}
      </div>

      {/* FORM (CREAR / EDITAR) */}
      <div className="box-formulario-gestionusuarios">
        <div className="centrar-tercer-titulo">
          <h3>
            <FontAwesomeIcon className="icon" icon={faSquarePlus} />
            {isEditMode
              ? `Editar Usuario (ID: ${editingUser?.id})`
              : "Crear Nuevo Usuario"}
          </h3>
          <p>
            {isEditMode
              ? "Modifica los datos del usuario seleccionado."
              : "Elige y completa los campos del nuevo usuario."}
          </p>
        </div>

        <form
          className="auth-form-gestionusuarios"
          onSubmit={handleSubmitUser}
        >
          <div className="auth-form-gestionusuarios-area-rol">
            <label className="rol-text">
              Rol de Usuario:
              <div className="custom-select-container" ref={rolSelectRef}>
                {isEditMode ? (
                  <div className="custom-select-trigger selected disabled-select">
                    <span>
                      {rol === "ALUMNO"
                        ? "Alumno"
                        : rol === "PROFESOR"
                          ? "Profesor"
                          : "Administrador"}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className={`custom-select-trigger ${rol !== "" ? "selected" : ""
                        }`}
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span>
                        {rol === ""
                          ? "Elige un rol..."
                          : rol === "ALUMNO"
                            ? "Alumno"
                            : rol === "PROFESOR"
                              ? "Profesor"
                              : "Administrador"}
                      </span>
                      <FontAwesomeIcon
                        className="icon-increment"
                        icon={faAngleDown}
                      />
                    </div>

                    {isOpen && (
                      <div className="custom-select-dropdown">
                        <div
                          className={`custom-select-option ${rol === "ADMINISTRADOR" ? "active" : ""
                            }`}
                          onClick={() => {
                            setRol("ADMINISTRADOR");
                            setIsOpen(false);
                          }}
                        >
                          Administrador
                        </div>
                        <div
                          className={`custom-select-option ${rol === "PROFESOR" ? "active" : ""
                            }`}
                          onClick={() => {
                            setRol("PROFESOR");
                            setIsOpen(false);
                          }}
                        >
                          Profesor
                        </div>
                        <div
                          className={`custom-select-option ${rol === "ALUMNO" ? "active" : ""
                            }`}
                          onClick={() => {
                            setRol("ALUMNO");
                            setIsOpen(false);
                          }}
                        >
                          Alumno
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="auth-form-area-form">
            {!isEditMode && rol === "" && (
              <div className="mensaje-sin-rol">
                <p className="mensaje-sin-rol-titulo">No hay datos a ingresar</p>
                <p className="mensaje-sin-rol-subtitulo">
                  Primero selecciona un rol de usuario
                </p>
              </div>
            )}

            {(rol !== "" || isEditMode) && (
              <>
                <div className="form-area-datos">
                  <label>
                    Apellido y Nombre Completo
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: García López Juan"
                      required
                    />
                  </label>

                  <label>
                    Correo Electrónico
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </label>

                  {/* CONTRASEÑA */}
                  <label className="password-label-with-toggle">
                    {isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña"}
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          isEditMode
                            ? "Ingresa una nueva contraseña (opcional)"
                            : "Ingresa la contraseña"
                        }
                        minLength={isEditMode ? 0 : 6}
                        className="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="password-toggle-btn"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                          className="icon-see"
                        />
                      </button>
                    </div>
                    <small className="field-help">
                      {isEditMode
                        ? "Si dejas este campo vacío, la contraseña del usuario no se modificará."
                        : "Debe tener al menos 6 caracteres."}
                    </small>
                  </label>

                  {/* CONFIRMAR CONTRASEÑA */}
                  <label className="password-label-with-toggle">
                    {isEditMode ? "Confirmar Nueva Contraseña" : "Confirmar Contraseña"}
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={
                          isEditMode
                            ? "Repite la nueva contraseña"
                            : "Repite la contraseña"
                        }
                        minLength={isEditMode ? 0 : 6}
                        className="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="password-toggle-btn"
                        aria-label={
                          showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                        }
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                          className="icon-see"
                        />
                      </button>
                    </div>
                    <small className="field-help">
                      {isEditMode
                        ? "Solo es necesario si vas a cambiar la contraseña."
                        : "Debe coincidir con la contraseña anterior."}
                    </small>
                  </label>
                </div>

                {/* ALUMNO */}
                {rol === "ALUMNO" && (
                  <div className="form-area-extra-datos-student">
                    <label>
                      Dni
                      <input
                        type="text"
                        value={dniAlumno}
                        onChange={handleDniAlumnoChange}
                        placeholder="12345678"
                        maxLength={8}
                        pattern="\d{8}"
                        required={!isEditMode}
                      />
                    </label>

                    <label>
                      Num. de Emergencia
                      <input
                        type="text"
                        value={numberPhoneAlumno}
                        onChange={handleNumberPhoneChange}
                        placeholder="Coloque un numero de celular"
                        maxLength={9}
                        pattern="\d{9}"
                        required={!isEditMode}
                      />
                    </label>

                    <label>
                      <span>Nivel</span>
                      <div
                        className="student-select-container"
                        ref={nivelSelectRef}
                      >
                        <div
                          className={`student-select-trigger ${nivel !== "" ? "selected" : ""
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsNivelOpen(!isNivelOpen);
                          }}
                        >
                          <span>
                            {nivel === ""
                              ? "Elige un nivel..."
                              : nivel === "INICIAL"
                                ? "Inicial"
                                : nivel === "PRIMARIA"
                                  ? "Primaria"
                                  : "Secundaria"}
                          </span>
                          <FontAwesomeIcon
                            className="icon-increment"
                            icon={faAngleDown}
                          />
                        </div>

                        {isNivelOpen && (
                          <div className="student-select-dropdown">
                            <div
                              className={`student-select-option ${nivel === "INICIAL" ? "active" : ""
                                }`}
                              onClick={() => {
                                setNivel("INICIAL");
                                setIsNivelOpen(false);
                              }}
                            >
                              Inicial
                            </div>
                            <div
                              className={`student-select-option ${nivel === "PRIMARIA" ? "active" : ""
                                }`}
                              onClick={() => {
                                setNivel("PRIMARIA");
                                setIsNivelOpen(false);
                              }}
                            >
                              Primaria
                            </div>
                            <div
                              className={`student-select-option ${nivel === "SECUNDARIA" ? "active" : ""
                                }`}
                              onClick={() => {
                                setNivel("SECUNDARIA");
                                setIsNivelOpen(false);
                              }}
                            >
                              Secundaria
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    <label>
                      Grado
                      <input
                        type="text"
                        value={grado}
                        onChange={(e) => setGrado(e.target.value)}
                        placeholder="Ej: 2do B"
                        required={!isEditMode}
                      />
                    </label>
                  </div>
                )}

                {/* PROFESOR */}
                {rol === "PROFESOR" && (
                  <div className="form-area-extra-datos-teacher">
                    <label>
                      Dni
                      <input
                        type="text"
                        value={dniProfesor}
                        onChange={handleDniProfesorChange}
                        placeholder="12345678"
                        maxLength={8}
                        pattern="\d{8}"
                        required={!isEditMode}
                      />
                    </label>

                    <label>
                      Número de Teléfono
                      <input
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Coloque un numero de celular"
                        maxLength={9}
                        pattern="\d{9}"
                      />
                    </label>
                    <label>
                      Experiencia / Especialización
                      <textarea
                        value={experiencia}
                        onChange={(e) => setExperiencia(e.target.value)}
                        placeholder="Descripción de experiencia, especialidades, certificaciones..."
                        rows={4}
                        maxLength={180}
                      />
                    </label>
                  </div>
                )}

                {formError && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.9rem",
                      marginTop: "10px",
                      gridColumn: "1 / -1",
                      backgroundColor: "#fee",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #fcc",
                    }}
                  >
                    {formError}
                  </p>
                )}

                <div className="form-buttons">
                  <button
                    type="submit"
                    className="btn-create"
                    disabled={creatingUser}
                  >
                    {creatingUser
                      ? isEditMode
                        ? "Guardando..."
                        : "Creando..."
                      : isEditMode
                        ? "Guardar Cambios"
                        : "Añadir Usuario"}
                  </button>
                  <button
                    type="button"
                    className="btn-clear"
                    onClick={limpiarFormulario}
                    disabled={creatingUser}
                  >
                    {isEditMode ? "Cancelar Edición" : "Limpiar Formulario"}
                  </button>
                </div>
              </>
            )}
          </div>

          <p>Datos Deportivos</p>
          <div className="auth-form-area-form">
            <p>EN CURSO</p>
          </div>
        </form>
      </div>

      {/* FILTROS */}
      <div className="filtros-container">
        <div className="filtros-header">
          <h4>
            <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />
            Filtros de Búsqueda
          </h4>
          <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>

        <div className="filtros-grid">
          <div className="filtro-item">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          <div className="filtro-item">
            <label>Rol</label>
            <div className="filter-select-container" ref={filtroRolSelectRef}>
              <div
                className={`filter-select-trigger ${filtroRol !== "" ? "selected" : ""
                  }`}
                onClick={() => setIsFiltroRolOpen(!isFiltroRolOpen)}
              >
                <span>
                  {filtroRol === ""
                    ? "Todos los roles"
                    : filtroRol === "ALUMNO"
                      ? "Alumno"
                      : filtroRol === "PROFESOR"
                        ? "Profesor"
                        : "Administrador"}
                </span>
                <FontAwesomeIcon
                  className="icon-increment"
                  icon={faAngleDown}
                />
              </div>

              {isFiltroRolOpen && (
                <div className="filter-select-dropdown">
                  <div
                    className={`filter-select-option ${filtroRol === "" ? "active" : ""
                      }`}
                    onClick={() => {
                      setFiltroRol("");
                      setIsFiltroRolOpen(false);
                    }}
                  >
                    Todos los roles
                  </div>
                  <div
                    className={`filter-select-option ${filtroRol === "ADMINISTRADOR" ? "active" : ""
                      }`}
                    onClick={() => {
                      setFiltroRol("ADMINISTRADOR");
                      setIsFiltroRolOpen(false);
                    }}
                  >
                    Administrador
                  </div>
                  <div
                    className={`filter-select-option ${filtroRol === "PROFESOR" ? "active" : ""
                      }`}
                    onClick={() => {
                      setFiltroRol("PROFESOR");
                      setIsFiltroRolOpen(false);
                    }}
                  >
                    Profesor
                  </div>
                  <div
                    className={`filter-select-option ${filtroRol === "ALUMNO" ? "active" : ""
                      }`}
                    onClick={() => {
                      setFiltroRol("ALUMNO");
                      setIsFiltroRolOpen(false);
                    }}
                  >
                    Alumno
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="filtro-item">
            <label>Email</label>
            <input
              type="text"
              placeholder="Buscar por email..."
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
            />
          </div>

          <div className="filtro-item">
            <label>DNI / Código</label>
            <input
              type="text"
              placeholder="Buscar por DNI o código..."
              value={filtroDni}
              onChange={(e) => setFiltroDni(e.target.value)}
            />
          </div>
        </div>

        <div className="filtros-resultado">
          <p>
            Mostrando <strong>{usuariosFiltrados.length}</strong> de{" "}
            <strong>{usuarios.length}</strong> usuarios
          </p>
        </div>

        <div className="table-users-gestionusuarios">
          <table className="styled-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>ID Sistema</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Email</th>
                <th>Dni</th>
                <th>Num. de Telefono</th>
                <th>Código</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>
                      <span
                        className={`badge-rol badge-${user.rol.toLowerCase()}`}
                      >
                        {user.rol}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.rol === "ALUMNO" && user.dniAlumno
                        ? user.dniAlumno
                        : user.rol === "PROFESOR" && user.dniProfesor
                          ? user.dniProfesor
                          : "-"}
                    </td>
                    <td>
                      {user.rol === "ALUMNO" && user.telefonoEmergencia
                        ? user.telefonoEmergencia
                        : user.rol === "PROFESOR" && user.telefono
                          ? user.telefono
                          : "-"}
                    </td>
                    <td>
                      {user.rol === "ALUMNO" &&
                        user.alumno?.nivel &&
                        user.alumno?.grado
                        ? `${user.alumno.nivel} - ${user.alumno.grado}`
                        : user.rol === "PROFESOR" && user.profesor?.telefono
                          ? user.profesor.telefono
                          : "-"}
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          handleDelete(user.id, user.nombre)
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    {filtroNombre || filtroRol || filtroEmail || filtroDni
                      ? "No se encontraron usuarios con los filtros aplicados."
                      : error
                        ? "Error al cargar usuarios."
                        : "No hay usuarios registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;
