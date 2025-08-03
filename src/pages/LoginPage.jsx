import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
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
      const data = response.data;
      
      // --- POPRAWKA ---
      // Przekazujemy tylko token, zgodnie z nową logiką AuthContext
      login(data.token); 
      
      // Nawigacja po zalogowaniu pozostaje bez zmian
      if (data.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error) {
      setLoading(false);
      setMessage(error.response?.data?.message || 'Błąd sieci lub serwera.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage('');
    try {
        const response = await api.post('/auth/google-login', { credential: credentialResponse.credential });
        const data = response.data;
        
        // --- POPRAWKA ---
        // Tutaj również przekazujemy tylko token
        login(data.token);

        if (data.role === 'admin') {
            navigate('/admin', { replace: true });
        } else {
            const from = location.state?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        }
    } catch (error) {
        setLoading(false);
        setMessage(error.response?.data?.message || 'Błąd logowania przez Google.');
    }
  };

  const handleGoogleError = () => {
    setMessage('Logowanie przez Google nie powiodło się. Spróbuj ponownie.');
  };

  // Reszta komponentu (JSX) pozostaje bez zmian
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

      <div style={{ textAlign: 'center', margin: '20px 0', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <hr style={{flex: 1, borderTop: '1px solid #ddd'}} />
        <span>LUB</span>
        <hr style={{flex: 1, borderTop: '1px solid #ddd'}} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
        />
      </div>
      
      {message && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      
      <div style={{marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'space-between'}}>
        <Link to="/request-password-reset">Zapomniałem hasła</Link>
        <Link to="/register">Nie masz konta? Zarejestruj się</Link>
      </div>
    </div>
  );
}

export default LoginPage;
