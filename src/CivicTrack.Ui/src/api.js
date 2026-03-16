import axios from 'axios';

// Ensure this port matches your C# API port!
const API_BASE_URL = 'http://localhost:5038/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
});

// This attaches the token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;