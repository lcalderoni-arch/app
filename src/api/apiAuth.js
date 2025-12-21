// src/api/apiAuth.js
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const apiAuth = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ✅ cookies solo aquí
});
