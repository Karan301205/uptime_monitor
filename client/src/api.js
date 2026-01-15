import axios from 'axios';

const api = axios.create({
  // Your Live Backend URL
  baseURL: 'https://uptime-monitor-xipl.onrender.com/api', 
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;