import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies if used
});

// Request interceptor to add token if you switch to Header based auth later
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response &&(error.response.status === 401 || error.response.status === 403)) {
       // Handle unauthorized access (e.g., redirect to login)
       // But be careful not to loop if the 401 comes from the login page itself
       localStorage.removeItem('token');
       // optional: window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
