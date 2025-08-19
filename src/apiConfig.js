// src/apiConfig.js

import axios from 'axios';

// Adres URL do backendu jest poprawny
const DIRECT_URL = 'https://food-truck-api-firestore-1035693089076.europe-west1.run.app';

export const api = axios.create({
  // TUTAJ JEST JEDYNA POTRZEBNA ZMIANA:
  // Ustawiamy baseURL na pełny adres URL do Twojego API
  baseURL: `${DIRECT_URL}/api`
});

export const SOCKET_URL = DIRECT_URL;
export const DIRECT_BACKEND_URL = DIRECT_URL;