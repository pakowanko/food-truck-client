const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://foodtruck-backend-prod-XXXX.run.app' // UWAGA: Wklej tutaj finalny adres URL z Cloud Run
  : 'http://localhost:3000';

export default API_URL;