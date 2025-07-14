import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx'; 
import API_URL from './apiConfig.js';

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
      
      const url = `${API_URL}/api/auth/login`;
      console.log('Krok 3: Próba wysłania zapytania na URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });
      
      console.log('Krok 4: Otrzymano odpowiedź od serwera.', response);

      const data = await response.json();
      console.log('Krok 5: Sparsowano dane JSON.', data);

      if (response.ok) {
        console.log('Krok 6: Odpowiedź jest OK. Logowanie...');
        login({
            userId: data.userId,
            email: data.email,
            user_type: data.user_type
        }, data.token);
        
        navigate(from, { replace: true });
      } else {
        console.error('Krok 6b: Odpowiedź z błędem.', data);
        setLoading(false);
        setMessage(data.message || 'Wystąpił nieznany błąd.');
      }
    } catch (error) {
      console.error('Krok X: Wystąpił krytyczny błąd w bloku CATCH!', error);
      setLoading(false);
      setMessage('Błąd sieci lub błąd parsowania JSON.');
    } finally {
      console.log('Krok 7: Wykonano blok finally.');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px' }}>
      <h2 style={{ textAlign: 'center' }}>Zaloguj się</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default LoginPage;