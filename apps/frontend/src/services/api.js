import axios from 'axios';

/**
 * VedEngine API Service Configuration
 * -------------------------------------
 * Centralized Axios instance for making API calls to backend server.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// 1. Authentication Services
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// 2. Document & Web Link Services
export const documentAPI = {
  getAllDocuments: () => api.get('/all'),
  getDocumentById: (id) => api.get(`/${id}`),
  searchDocumentsByKeyword: (keyword) => api.get('/', { params: { keyword } }),
  createDocument: (docData) => api.post('/create', docData),
  deleteDocument: (id) => api.delete(`/${id}`),
};

// 3. File Upload Services
export const uploadAPI = {
  uploadDocument: (formData) =>
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// 4. AI Search Services
export const searchAPI = {
  query: (searchTerm, page = 1, limit = 10, ai = true) =>
    api.get('/search', {
      params: { q: searchTerm, page, limit, ai },
    }),
  semanticQuery: (searchTerm, limit = 5) =>
    api.get('/search/ai', {
      params: { q: searchTerm, limit },
    }),
  getSuggestions: (searchTerm) =>
    api.get('/search/suggestions', {
      params: { q: searchTerm },
    }),
};

// 5. Analytics Services
export const analyticsAPI = {
  getSearchAnalytics: () => api.get('/analytics/search'),
  getSearchLogs: () => api.get('/search-log'),
};

export default api;