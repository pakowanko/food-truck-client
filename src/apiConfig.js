// src/apiConfig.js

// Ten adres pozostaje pusty. Jest poprawny dla zapytań przez Firebase Hosting (rewrites).
export const API_URL = ''; 

// UWAGA: PONIŻSZY ADRES MUSI ZOSTAĆ ZMIENIONY!
// Wklej tutaj pełny adres URL Twojego nowego backendu dla food trucków wdrożonego w Google Cloud Run.
const DIRECT_URL = 'https://food-truck-backend-1035693089076.europe-west1.run.app';

// Te eksporty używają powyższej stałej
export const SOCKET_URL = DIRECT_URL;
export const DIRECT_BACKEND_URL = DIRECT_URL;

export default API_URL;