import axios from "axios";

// In dev, Vite proxies /api to the backend (see vite.config.js).
// In production the frontend is served by the same Express app, so a
// relative base URL always points at the right place.
export const axiosInstance = axios.create({
    baseURL: "/api",
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("bokbok_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
