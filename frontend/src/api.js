import axios from 'axios';

// 1. Создаем базовый инстанс axios
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// 2. Настраиваем интерцептор для автоматического добавления токена
API.interceptors.request.use(
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

export default API;
