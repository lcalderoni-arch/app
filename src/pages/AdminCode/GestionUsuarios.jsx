//src/pages/GestionUsuarios.jsx
import React, { useRef } from "react";
import axios from "axios";

// 1. Importa AMBOS modales
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api.js";
import EditUserModal from "../../components/EditUserModal.jsx";
import icon from "../../assets/logo.png";

// Importa los estilos CSS
import "../../styles/RolesStyle/AdminStyle/GestionUsuarios.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faUserGroup, faMagnifyingGlass, faSquarePlus } from "@fortawesome/free-solid-svg-icons";

function GestionUsuarios() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isNivelOpen, setIsNivelOpen] = React.useState(false);

  // Estados existentes
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Estados para modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);

  //  Referencias para cerrar dropdowns al hacer clic fuera
  const rolSelectRef = useRef(null);
  const nivelSelectRef = useRef(null);

  // NUEVOS ESTADOS para el formulario de creación
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [rol, setRol] = React.useState("");
  const [formError, setFormError] = React.useState(null);
  const [creatingUser, setCreatingUser] = React.useState(false);

  // --- ⭐ Estados ESPECÍFICOS para ALUMNO ---
  const [dniAlumno, setDniAlumno] = React.useState("");
  const [numberPhoneAlumno, setnumberPhoneAlumno] = React.useState("");
  const [nivel, setNivel] = React.useState("");
  const [grado, setGrado] = React.useState("");

  // --- ⭐ Estados ESPECÍFICOS para PROFESOR ---
  const [dniProfesor, setDniProfesor] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [experiencia, setExperiencia] = React.useState("");

  // Estados para filtros en la TABLA
  const [filtroNombre, setFiltroNombre] = React.useState('');
  const [filtroRol, setFiltroRol] = React.useState('');
  const [filtroEmail, setFiltroEmail] = React.useState('');
  const [filtroDni, setFiltroDni] = React.useState('');
  const [isFiltroRolOpen, setIsFiltroRolOpen] = React.useState(false);

  // Ref para el dropdown de filtro de rol
  const filtroRolSelectRef = useRef(null);

  const API_URL = API_ENDPOINTS.usuarios;

  // --- fetchUsuarios (sin cambios) ---
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
      // Cerrar dropdown de Rol
      if (rolSelectRef.current && !rolSelectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Cerrar dropdown de Nivel
      if (nivelSelectRef.current && !nivelSelectRef.current.contains(event.target)) {
        setIsNivelOpen(false);
      }
      // Cerrar dropdown de Filtro de Rol
      if (filtroRolSelectRef.current && !filtroRolSelectRef.current.contains(event.target)) {
        setIsFiltroRolOpen(false);
      }
    };

    // Agregar event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroRol('');
    setFiltroEmail('');
    setFiltroDni('');
  };

  // --- handleDelete (sin cambios) ---
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

  // --- Editar Usuario ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  // --- handleUserUpdated (sin cambios) ---
  const handleUserUpdated = (updatedUser) => {
    setUsuarios((currentUsers) =>
      currentUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    alert(`Usuario "${updatedUser.nombre}" actualizado.`);
  };

  // NUEVA FUNCIÓN: Limpiar formulario
  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRol("");
    setFormError(null);

    // Limpiar campos de ALUMNO
    setDniAlumno("");
    setnumberPhoneAlumno('');
    setNivel("");
    setGrado("");

    // Limpiar campos de PROFESOR
    setDniProfesor("");
    setTelefono('');
    setExperiencia("");
  };

  // NUEVA FUNCIÓN: Validar DNI (exactamente 8 dígitos)
  const validarDni = (dni) => {
    return /^\d{8}$/.test(dni);
  };

  // ⭐ NUEVA FUNCIÓN: Manejar cambio de DNI (solo números, máximo 8)
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

  // ⭐ NUEVA FUNCIÓN: Crear usuario (lógica del modal movida aquí)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setFormError(null);

    // ✅ VALIDACIÓN: Contraseñas coinciden
    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      setCreatingUser(false);
      return;
    }

    // ✅ VALIDACIÓN: Contraseña mínima
    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      setCreatingUser(false);
      return;
    }

    // ✅ VALIDACIÓN: Campos básicos
    if (!nombre.trim() || !email.trim() || !password) {
      setFormError("Nombre, Email y Contraseña son obligatorios.");
      setCreatingUser(false);
      return;
    }

    // ✅ Construir payload BASE
    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password,
      rol: rol,
    };

    // ✅ VALIDACIÓN Y PAYLOAD para ALUMNO
    if (rol === "ALUMNO") {
      if (!dniAlumno.trim() || !grado.trim() || !nivel) {
        setFormError("Para Alumno: DNI, Nivel y Grado son obligatorios.");
        setCreatingUser(false);
        return;
      }
      if (!validarDni(dniAlumno)) {
        setFormError("El DNI debe tener exactamente 8 dígitos.");
        setCreatingUser(false);
        return;
      }

      if (!/^\d{9}$/.test(numberPhoneAlumno)) {
        setFormError('El teléfono de emergencia debe tener exactamente 9 dígitos.');
        setCreatingUser(false);
        return;
      }

      // ⚠️ CAMBIO CRÍTICO: Usar nombres correctos del backend
      payload.dniAlumno = dniAlumno.trim(); // ← "dniAlumno" NO "dni"
      payload.nivel = nivel; // ← Campo obligatorio
      payload.grado = grado.trim();
      payload.telefonoEmergencia = numberPhoneAlumno.trim();
    }

    // ✅ VALIDACIÓN Y PAYLOAD para PROFESOR
    else if (rol === "PROFESOR") {
      if (!dniProfesor.trim()) {
        setFormError("Para Profesor: DNI es obligatorio.");
        setCreatingUser(false);
        return;
      }
      if (!validarDni(dniProfesor)) {
        setFormError("El DNI debe tener exactamente 8 dígitos.");
        setCreatingUser(false);
        return;
      }

      // ⭐ NUEVA VALIDACIÓN: Teléfono debe tener 9 dígitos
      if (telefono.trim() !== '' && !/^\d{9}$/.test(telefono)) {
        setFormError('El teléfono debe tener exactamente 9 dígitos (o déjalo vacío).');
        setCreatingUser(false);
        return;
      }

      // ⚠️ CAMBIO CRÍTICO: Usar nombres correctos del backend
      payload.dniProfesor = dniProfesor.trim(); // ← "dniProfesor" NO "dni"
      if (telefono.trim()) payload.telefono = telefono.trim();
      if (experiencia.trim()) payload.experiencia = experiencia.trim();
    }

    console.log("📤 Enviando payload:", payload);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Sesión expirada.");

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const url = `${API_BASE_URL}/usuarios/crear`;

      const response = await axios.post(url, payload, config);

      // ✅ Agregar usuario a la lista
      setUsuarios((current) => [response.data, ...current]);
      alert(`Usuario "${response.data.nombre}" creado correctamente.`);

      // ✅ Limpiar formulario
      limpiarFormulario();
    } catch (err) {
      console.error("❌ Error al crear usuario:", err);

      if (err.response) {
        console.log("📊 Status:", err.response.status);
        console.log("📦 Data:", err.response.data);

        if (err.response.status === 401 || err.response.status === 403) {
          setFormError("No tienes permisos para crear usuarios.");
        }

        // IMPORTANTE: Manejar errores 400 (validación)
        else if (err.response.status === 400 && err.response.data && err.response.data.message) {
          setFormError(err.response.data.message); // ← Mensaje detallado del backend
        }
        // Email duplicado o conflictos
        else if (err.response.status === 409 && err.response.data && err.response.data.message) {
          setFormError(err.response.data.message);
        }
        // Otros errores con mensaje
        else if (err.response.data && err.response.data.message) {
          setFormError(`Error: ${err.response.data.message}`);
        }
        // Fallback
        else {
          setFormError(`Error del servidor (código ${err.response.status})`);
        }
      } else if (err.request) {
        setFormError("No se pudo conectar al servidor.");
      } else {
        setFormError("Ocurrió un error inesperado.");
      }
    } finally {
      setCreatingUser(false);
    }

  };

  // --- Renderizado Condicional ---
  if (loading && usuarios.length === 0)
    return <p>Cargando lista de usuarios...</p>;
  if (error && usuarios.length === 0)
    return <p style={{ color: "red" }}>Error: {error}</p>;


  // Filtrar usuarios según los criterios
  const usuariosFiltrados = usuarios.filter(user => {
    const cumpleNombre = filtroNombre === '' ||
      user.nombre.toLowerCase().includes(filtroNombre.toLowerCase());

    const cumpleRol = filtroRol === '' || user.rol === filtroRol;

    const cumpleEmail = filtroEmail === '' ||
      user.email.toLowerCase().includes(filtroEmail.toLowerCase());

    const cumpleDni = filtroDni === '' ||
    (user.rol === 'ALUMNO' && user.dniAlumno?.includes(filtroDni)) ||
    (user.rol === 'PROFESOR' && user.dniProfesor?.includes(filtroDni));

  return cumpleNombre && cumpleRol && cumpleEmail && cumpleDni;
});

  // --- Renderizado Principal ---
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

        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {loading && <p>Actualizando lista...</p>}
      </div>
      {/* BOX RECIEN AÑADIDO (25/11/2025) */}
      <div className="box-formulario-gestionusuarios">
        <div className="centrar-tercer-titulo">
          <h3><FontAwesomeIcon className="icon" icon={faSquarePlus} />Crear Nuevo Usuario</h3>
          <p>Elige y complete los campos de textos del usuario</p>
        </div>

        <form className="auth-form-gestionusuarios" onSubmit={handleCreateUser}>
          <div className="auth-form-gestionusuarios-area-rol">
            <label className="rol-text">
              Rol de Usuario:
              <div className="custom-select-container" ref={rolSelectRef}>
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
                      className={`custom-select-option ${rol === 'ADMINISTRADOR' ? 'active' : ''}`}
                      onClick={() => { setRol("ADMINISTRADOR"); setIsOpen(false); }}
                    >
                      Administrador
                    </div>
                    <div
                      className={`custom-select-option ${rol === 'PROFESOR' ? 'active' : ''}`}
                      onClick={() => { setRol("PROFESOR"); setIsOpen(false); }}
                    >
                      Profesor
                    </div>
                    <div
                      className={`custom-select-option ${rol === 'ALUMNO' ? 'active' : ''}`}
                      onClick={() => { setRol("ALUMNO"); setIsOpen(false); }}
                    >
                      Alumno
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
          {/*Nombre completo*/}
          <div className='auth-form-area-form'>
            {/* ⭐ MENSAJE CUANDO NO HAY ROL SELECCIONADO */}
            {rol === '' && (
              <div className="mensaje-sin-rol">
                <p className="mensaje-sin-rol-titulo">
                  No hay datos a ingresar
                </p>
                <p className="mensaje-sin-rol-subtitulo">
                  Primero selecciona un rol de usuario
                </p>
              </div>
            )}

            {/* ⭐ CAMPOS BÁSICOS - Solo se muestran si hay rol seleccionado */}
            {rol !== '' && (
              <>
                <div className='form-area-datos'>
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

                  {/* EMAIL */}
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
                  <label>
                    Contraseña
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </label>

                  {/* CONFIRMAR CONTRASEÑA */}
                  <label>
                    Confirmar Contraseña
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </label>
                </div>

                {/* ⭐ CAMPOS ESPECÍFICOS PARA ALUMNO */}
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
                        required
                      />
                    </label>

                    <label>
                      Num. de Emergencia
                      <input
                        type="text"
                        onChange={handleNumberPhoneChange}
                        placeholder="Coloque un numero de celular"
                        maxLength={9}
                        pattern="\d{9}"
                        required
                      />
                    </label>

                    <label>
                      <span>Nivel</span>
                      <div className="student-select-container" ref={nivelSelectRef}>
                        <div
                          className={`student-select-trigger ${nivel !== "" ? "selected" : ""}`}
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
                          <FontAwesomeIcon className="icon-increment" icon={faAngleDown} />
                        </div>

                        {isNivelOpen && (
                          <div className="student-select-dropdown">
                            <div
                              className={`student-select-option ${nivel === 'INICIAL' ? 'active' : ''}`}
                              onClick={() => { setNivel("INICIAL"); setIsNivelOpen(false); }}
                            >
                              Inicial
                            </div>
                            <div
                              className={`student-select-option ${nivel === 'PRIMARIA' ? 'active' : ''}`}
                              onClick={() => { setNivel("PRIMARIA"); setIsNivelOpen(false); }}
                            >
                              Primaria
                            </div>
                            <div
                              className={`student-select-option ${nivel === 'SECUNDARIA' ? 'active' : ''}`}
                              onClick={() => { setNivel("SECUNDARIA"); setIsNivelOpen(false); }}
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
                        placeholder="Ej: 1ro, 5to"
                        required
                      />
                    </label>
                  </div>
                )}

                {/* ⭐ CAMPOS ESPECÍFICOS PARA PROFESOR */}
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
                        required
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
                        required
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

                {/* Mostrar error del formulario */}
                {formError && (
                  <p style={{
                    color: "red",
                    fontSize: "0.9rem",
                    marginTop: "10px",
                    gridColumn: "1 / -1",
                    backgroundColor: "#fee",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #fcc",
                  }}>
                    {formError}
                  </p>
                )}

                {/* BOTONES */}
                <div className="form-buttons">
                  <button
                    type="submit"
                    className="btn-create"
                    disabled={creatingUser}
                  >
                    {creatingUser ? "Creando..." : "Añadir Usuario"}
                  </button>
                  <button
                    type="button"
                    className="btn-clear"
                    onClick={limpiarFormulario}
                    disabled={creatingUser}
                  >
                    Limpiar Formulario
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      {/* FILTROS */}
      <div className="filtros-container">
        <div className="filtros-header">
          <h4><FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />Filtros de Búsqueda</h4>
          <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>

        <div className="filtros-grid">
          {/* Filtro por Nombre */}
          <div className="filtro-item">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          {/* Filtro por Rol */}
          <div className="filtro-item">
            <label>Rol</label>
            <div className="filter-select-container" ref={filtroRolSelectRef}>
              <div
                className={`filter-select-trigger ${filtroRol !== '' ? 'selected' : ''}`}
                onClick={() => setIsFiltroRolOpen(!isFiltroRolOpen)}
              >
                <span>
                  {filtroRol === '' ? 'Todos los roles' :
                    filtroRol === 'ALUMNO' ? 'Alumno' :
                      filtroRol === 'PROFESOR' ? 'Profesor' : 'Administrador'}
                </span>
                <FontAwesomeIcon className='icon-increment' icon={faAngleDown} />
              </div>

              {isFiltroRolOpen && (
                <div className="filter-select-dropdown">
                  <div
                    className={`filter-select-option ${filtroRol === '' ? 'active' : ''}`}
                    onClick={() => { setFiltroRol(''); setIsFiltroRolOpen(false); }}
                  >
                    Todos los roles
                  </div>
                  <div
                    className={`filter-select-option ${filtroRol === 'ADMINISTRADOR' ? 'active' : ''}`}
                    onClick={() => { setFiltroRol('ADMINISTRADOR'); setIsFiltroRolOpen(false); }}
                  >
                    Administrador
                  </div>
                  <div
                    className={`filter-select-option ${filtroRol === 'PROFESOR' ? 'active' : ''}`}
                    onClick={() => { setFiltroRol('PROFESOR'); setIsFiltroRolOpen(false); }}
                  >
                    Profesor
                  </div>
                  <div
                    className={`filter-select-option ${filtroRol === 'ALUMNO' ? 'active' : ''}`}
                    onClick={() => { setFiltroRol('ALUMNO'); setIsFiltroRolOpen(false); }}
                  >
                    Alumno
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtro por Email */}
          <div className="filtro-item">
            <label>Email</label>
            <input
              type="text"
              placeholder="Buscar por email..."
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
            />
          </div>

          {/* Filtro por DNI */}
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

        {/* Contador de resultados */}
        <div className="filtros-resultado">
          <p>Mostrando <strong>{usuariosFiltrados.length}</strong> de <strong>{usuarios.length}</strong> usuarios</p>
        </div>

        {/* Tabla general de usuarios */}
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
                      <span className={`badge-rol badge-${user.rol.toLowerCase()}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.rol === 'ALUMNO' && user.dniAlumno  // ⭐ Corregido: Mostrar DNI
                        ? user.dniAlumno
                        : user.rol === 'PROFESOR' && user.dniProfesor
                          ? user.dniProfesor
                          : '-'}
                    </td>
                    <td>
                      {user.rol === 'ALUMNO' && user.telefonoEmergencia
                        ? user.telefonoEmergencia
                        : user.rol === 'PROFESOR' && user.telefono
                          ? user.telefono
                          : '-'}
                    </td>
                    <td>
                      {user.rol === 'ALUMNO' && user.alumno?.nivel && user.alumno?.grado
                        ? `${user.alumno.nivel} - ${user.alumno.grado}`
                        : user.rol === 'PROFESOR' && user.profesor?.telefono
                          ? user.profesor.telefono
                          : '-'}
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(user)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(user.id, user.nombre)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
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

      {/* --- Renderizado del Modal de Edición (sin cambios) --- */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userToEdit={editingUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

export default GestionUsuarios;
