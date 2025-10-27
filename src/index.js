// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode> {/* 👈 Comenta esta línea */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  // </React.StrictMode> {/* 👈 Comenta esta línea */}
);

