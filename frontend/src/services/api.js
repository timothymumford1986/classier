import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  googleLogin: (data) => api.post('/auth/google/callback', data),
  microsoftLogin: (data) => api.post('/auth/microsoft/callback', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Scenario API
export const scenarioAPI = {
  getAll: (schoolId) => api.get(`/scenarios/school/${schoolId}`),
  getById: (scenarioId) => api.get(`/scenarios/${scenarioId}`),
  create: (schoolId, data) => api.post(`/scenarios/school/${schoolId}`, data),
  delete: (scenarioId) => api.delete(`/scenarios/${scenarioId}`),
  importStudents: (scenarioId, text) => api.post(`/scenarios/${scenarioId}/students/import`, { text }),
  importRequests: (scenarioId, text) => api.post(`/scenarios/${scenarioId}/requests/import`, { text }),
  optimize: (scenarioId) => api.post(`/scenarios/${scenarioId}/optimize`),
  updateAssignment: (scenarioId, data) => api.put(`/scenarios/${scenarioId}/assignments`, data),
};

export default api;
