import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx'; 
import { api } from '../apiConfig.js'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const loginPayload = { email, password };
      const response = await api.post('/auth/login', loginPayload);
      const data = response.data; // Odpowiedź z serwera, zawiera teraz pole 'role'

      // ---- POCZĄTEK ZMIAN ----

      // 1. Zapisujemy w kontekście PEŁNE dane użytkownika (wraz z rolą)
      login(data, data.token);
      
      // 2. Sprawdzamy rolę i decydujemy, gdzie przekierować
      if (data.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // Dla zwykłych użytkowników zachowujemy poprzednią logikę
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
      
      // ---- KONIEC ZMIAN ----

    } catch (error) {
      setLoading(false);
      setMessage(error.response?.data?.message || 'Błąd sieci lub serwera.');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>Zaloguj się</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{padding: '12px', fontSize: '1rem'}} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" required style={{padding: '12px', fontSize: '1rem'}} />
        <button type="submit" disabled={loading} style={{padding: '12px', fontSize: '1rem', cursor: 'pointer'}}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      {message && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
    </div>
  );
}

export default LoginPage;