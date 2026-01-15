// client/src/api.js
import axios from 'axios';

const api = axios.create({
  // Ensure this points to your Render backend
  baseURL: 'https://uptime-monitor-xipl.onrender.com/api', 
});

// 👇 THIS IS THE MISSING PART CAUSING THE LOOP
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;

