import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx'; 
import API_URL from '../apiConfig.js';

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
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data, data.token); // Przekazujemy cały obiekt użytkownika i token
        navigate(from, { replace: true });
      } else {
        throw new Error(data.message || 'Wystąpił nieznany błąd.');
      }
    } catch (error) {
      setMessage(error.message || 'Błąd sieci. Nie można połączyć się z serwerem.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px' }}>
      <h2 style={{ textAlign: 'center' }}>Zaloguj się</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px'}}/>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px'}}/>
        <button type="submit" disabled={loading} style={{width: '100%', padding: '10px'}}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Nie masz konta? <Link to="/register">Zarejestruj się</Link>
      </p>
    </div>
  );
}

export default LoginPage;