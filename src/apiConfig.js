// src/apiConfig.js
import axios from 'axios';

// Adres URL dla zapytań przez Firebase Hosting (rewrites)
const API_BASE_URL = ''; 

// Pełny adres URL do bezpośrednich połączeń (np. Socket.IO)
const DIRECT_URL = 'https://food-truck-backend-1035693089076.europe-west1.run.app';

// Tworzymy i eksportujemy skonfigurowaną instancję axios
export const api = axios.create({
  baseURL: API_BASE_URL
});

// Eksportujemy pozostałe stałe
export const SOCKET_URL = DIRECT_URL;
export const DIRECT_BACKEND_URL = DIRECT_URL;