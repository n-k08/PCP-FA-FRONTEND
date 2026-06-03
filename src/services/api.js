import axios from 'axios';

const API = axios.create({
  baseURL: 'https://pcp-fa-backend-tn7j.onrender.com',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
