// src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// ZMIANA: Poprawiona ścieżka do AuthContext i apiConfig
import { AuthContext } from '../AuthContext.jsx'; 
import api from '../api/apiConfig.js'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log('Krok 1: Funkcja handleLogin została uruchomiona.');

    setLoading(true);
    setMessage('');

    try {
      const loginPayload = { email, password };
      console.log('Krok 2: Przygotowano dane do wysyłki:', loginPayload);
      
      const url = `${api.defaults.baseURL}/auth/login`; // Używamy baseURL z instancji axios
      console.log('Krok 3: Próba wysłania zapytania na URL:', url);

      // Używamy instancji axios, którą teraz importujemy
      const response = await api.post('/auth/login', loginPayload);
      
      console.log('Krok 4: Otrzymano odpowiedź od serwera.', response);

      const data = response.data; // W axios dane są w polu `data`
      console.log('Krok 5: Sparsowano dane JSON.', data);

      // W axios odpowiedź 2xx nie rzuca błędu, więc sprawdzamy status
      if (response.status >= 200 && response.status < 300) {
        console.log('Krok 6: Odpowiedź jest OK. Logowanie...');
        login({
            userId: data.userId,
            email: data.email,
            user_type: data.user_type
        }, data.token);
        
        navigate(from, { replace: true });
      } else {
        // Ta część jest teraz obsługiwana w bloku catch dla axios
        console.error('Krok 6b: Odpowiedź z błędem.', data);
        setLoading(false);
        setMessage(data.message || 'Wystąpił nieznany błąd.');
      }
    } catch (error) {
      console.error('Krok X: Wystąpił krytyczny błąd w bloku CATCH!', error);
      setLoading(false);
      // W axios błąd ma strukturę error.response.data.message
      setMessage(error.response?.data?.message || 'Błąd sieci lub serwera.');
    } finally {
      console.log('Krok 7: Wykonano blok finally.');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>Zaloguj się</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{padding: '10px'}} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" required style={{padding: '10px'}} />
        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      {message && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
    </div>
  );
}

export default LoginPage;