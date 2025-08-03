import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Przetwarzanie Twojego żądania...');

  useEffect(() => {
    const verificationToken = searchParams.get('token');
    const reminderToken = searchParams.get('reminder_token'); // Nasz nowy parametr

    // Funkcja do obsługi weryfikacji po rejestracji
    const handleInitialVerification = async () => {
      setStatus('verifying');
      setMessage('Trwa weryfikacja Twojego konta...');
      try {
        const response = await api.get(`/auth/verify-email?token=${verificationToken}`);
        const { success, token, redirect, message } = response.data;

        if (success && token) {
          setStatus('success');
          setMessage(message + ' Za chwilę zostaniesz przekierowany...');
          login(null, token);
          setTimeout(() => navigate(redirect, { replace: true }), 2000);
        } else if (success && !token) {
           setStatus('success');
           setMessage(message + ' Przekierowujemy do strony logowania...');
           setTimeout(() => navigate(redirect, { replace: true }), 3000);
        } else {
          setStatus('error');
          setMessage(message || 'Wystąpił nieoczekiwany błąd.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Nie udało się zweryfikować konta. Link mógł wygasnąć.');
      }
    };

    // Funkcja do obsługi automatycznego logowania z przypomnienia
    const handleReminderLogin = () => {
        setStatus('verifying');
        setMessage('Logowanie... Za chwilę zostaniesz przekierowany do tworzenia profilu.');
        login(null, reminderToken);
        setTimeout(() => {
            navigate('/create-profile', { replace: true });
        }, 2000); // Dajemy chwilę na przetworzenie logowania
    };

    // Sprawdzamy, który token otrzymaliśmy i uruchamiamy odpowiednią funkcję
    if (reminderToken) {
        handleReminderLogin();
    } else if (verificationToken) {
        handleInitialVerification();
    } else {
        setStatus('error');
        setMessage('Brak wymaganego tokena w adresie URL.');
    }

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
