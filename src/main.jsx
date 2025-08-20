// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Importuje komponent App z drugiego pliku

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);