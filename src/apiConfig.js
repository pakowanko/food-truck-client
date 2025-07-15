// src/apiConfig.js
import axios from 'axios';

// TO JEST TO MIEJSCE:
const DIRECT_URL = 'https://food-truck-backend-1035693089076.europe-west1.run.app';

export const api = axios.create({
  baseURL: '/api'
});

export const SOCKET_URL = DIRECT_URL;
export const DIRECT_BACKEND_URL = DIRECT_URL;