import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://clothing-brand-1-h9ng.onrender.com' : '');

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default api;
