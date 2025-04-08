import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // <-- make sure this is the JWT token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
