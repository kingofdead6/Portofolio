import axios from "axios";

// Backend base URL. Override per-deployment with VITE_API_BASE_URL.
export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_BASE_URL });

// Attach the stored JWT (if any) to every request.
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const clearToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};
