import axios from 'axios';
import { getToken, clearStoredUser } from '../utils/auth';

// API base URL from env — avoids hardcoding localhost in production builds
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,   // 10 second timeout — prevents hanging requests
});

// ── Request Interceptor — Attach JWT automatically ───────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor — Auto-logout on 401 ────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear auth and reload to /login
            clearStoredUser();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── Auth Endpoints ───────────────────────────────────────────────────────────
export const login    = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);

// ── Task Endpoints ───────────────────────────────────────────────────────────
export const fetchTasks      = (params) => api.get('/tasks', { params });
export const createTask      = (taskData) => api.post('/tasks', taskData);
export const updateTaskStatus = (id, status) => api.put(`/tasks/${id}`, { status });
export const deleteTask      = (id) => api.delete(`/tasks/${id}`);