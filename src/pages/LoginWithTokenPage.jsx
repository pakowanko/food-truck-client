// plik: /src/pages/LoginWithTokenPage.jsx

import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { api } from '../apiConfig.js';

function LoginWithTokenPage() {
  const [status, setStatus] = useState('Logowanie...');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processTokenLogin = async () => {
      // Pobieramy token i ewentualne przekierowanie z adresu URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const redirectPath = params.get('redirect');

      if (!token) {
        setStatus('Błąd: Brak tokena w adresie URL.');
        return;
      }

      try {
        // Wysyłamy token do backendu
        const response = await api.post('/auth/login-with-token', { token });
        
        if (response.data.success && response.data.token) {
          // Jeśli logowanie się udało, zapisujemy nowy token
          login(response.data.token);
          setStatus('Zalogowano pomyślnie! Przekierowywanie...');
          // Przekierowujemy do miejsca wskazanego w linku lub domyślnie do panelu
          navigate(redirectPath || response.data.redirect || '/dashboard');
        } else {
          setStatus(response.data.message || 'Wystąpił nieznany błąd.');
        }
      } catch (error) {
        setStatus(error.response?.data?.message || 'Nie udało się zalogować. Spróbuj ponownie.');
      }
    };

    processTokenLogin();
  }, [location, login, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', textAlign: 'center' }}>
      <div>
        <h1>Logowanie w toku...</h1>
        <p style={{ fontSize: '1.2rem', color: '#555' }}>{status}</p>
      </div>
    </div>
  );
}

export default LoginWithTokenPage;
