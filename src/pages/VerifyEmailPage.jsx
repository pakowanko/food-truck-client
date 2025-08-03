import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Trwa weryfikacja Twojego konta...');

  useEffect(() => {
    const verificationToken = searchParams.get('token');

    if (!verificationToken) {
      setStatus('error');
      setMessage('Brak tokena weryfikacyjnego w adresie URL.');
      return;
    }

    const verifyAccount = async () => {
      try {
        // Frontend wysyła zapytanie do backendu, aby zweryfikować token
        const response = await api.get(`/auth/verify-email?token=${verificationToken}`);
        
        const { success, token, redirect, message } = response.data;

        if (success && token) {
          // Weryfikacja i auto-logowanie udane
          setStatus('success');
          setMessage(message + ' Za chwilę zostaniesz przekierowany...');
          login(null, token); // Zapisujemy token w kontekście
          setTimeout(() => {
            navigate(redirect, { replace: true });
          }, 2000); // Krótkie opóźnienie, aby użytkownik zobaczył komunikat
        } else if (success && !token) {
           // Konto było już aktywne, przekierowujemy do logowania
           setStatus('success');
           setMessage(message + ' Przekierowujemy do strony logowania...');
           setTimeout(() => {
            navigate(redirect, { replace: true });
          }, 3000);
        } else {
          // Weryfikacja nie powiodła się po stronie backendu
          setStatus('error');
          setMessage(message || 'Wystąpił nieoczekiwany błąd.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Nie udało się zweryfikować konta. Link mógł wygasnąć.');
      }
    };

    verifyAccount();
  }, [searchParams, navigate, login]);

  return (
    <div style={{ textAlign: 'center', padding: '50px', maxWidth: '600px', margin: '2rem auto', border: '1px solid #eee', borderRadius: '8px' }}>
      <h1>Status Weryfikacji Konta</h1>
      {status === 'verifying' && <p>{message}</p>}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && (
        <>
          <p style={{ color: 'red' }}>{message}</p>
          <Link to="/register" style={{marginTop: '20px', display: 'inline-block'}}>Wróć do rejestracji</Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmailPage;
