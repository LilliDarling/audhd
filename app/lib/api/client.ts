import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Change once we have the URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  console.log('Request cookies:', document.cookie);
  return config;
});

api.interceptors.response.use((response) => {
  console.log('Response cookies:', document.cookie);
  return response;
});