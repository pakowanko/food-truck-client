import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

// Przenosimy funkcje pomocnicze poza komponent, aby nie były tworzone przy każdym renderze.
// Otrzymują wszystko, czego potrzebują, jako argumenty.
const handleInitialVerification = async (token, setStatus, setMessage, login, navigate) => {
  setStatus('verifying');
  setMessage('Trwa weryfikacja Twojego konta...');
  try {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    const { success, token: jwtToken, redirect, message: responseMessage } = response.data;

    if (success && jwtToken) {
      setStatus('success');
      setMessage(responseMessage + ' Za chwilę zostaniesz przekierowany...');
      login(jwtToken);
      setTimeout(() => navigate(redirect, { replace: true }), 2000);
    } else if (success && !jwtToken) {
      setStatus('success');
      setMessage(responseMessage + ' Przekierowujemy do strony logowania...');
      setTimeout(() => navigate(redirect, { replace: true }), 3000);
    } else {
      setStatus('error');
      setMessage(responseMessage || 'Wystąpił nieoczekiwany błąd.');
    }
  } catch (err) {
    setStatus('error');
    setMessage(err.response?.data?.message || 'Nie udało się zweryfikować konta. Link mógł wygasnąć.');
  }
};

const handleReminderLogin = async (token, setStatus, setMessage, login, navigate) => {
  setStatus('verifying');
  setMessage('Logowanie... Za chwilę zostaniesz przekierowany do tworzenia profilu.');
  try {
    const response = await api.post('/auth/login-with-reminder-token', { token });
    const { success, token: newJwtToken, redirect, message: responseMessage } = response.data;

    if (success) {
      setStatus('success');
      setMessage(responseMessage + ' Przekierowujemy...');
      login(newJwtToken);
      setTimeout(() => navigate(redirect, { replace: true }), 2000);
    } else {
      setStatus('error');
      setMessage(responseMessage || 'Logowanie za pomocą linku nie powiodło się.');
    }
  } catch (err) {
    setStatus('error');
    setMessage(err.response?.data?.message || 'Nie udało się zalogować. Link mógł wygasnąć.');
  }
};


function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Przetwarzanie Twojego żądania...');

  const effectRan = useRef(false);

  useEffect(() => {
    // Ten warunek jest kluczowy dla React Strict Mode w trybie deweloperskim.
    // Zapobiega podwójnemu wykonaniu logiki, która powinna być uruchomiona tylko raz (jak weryfikacja jednorazowego tokena).
    if (effectRan.current === true) {
      return;
    }

    const verificationToken = searchParams.get('token');
    const reminderToken = searchParams.get('reminder_token');

    if (reminderToken) {
      handleReminderLogin(reminderToken, setStatus, setMessage, login, navigate);
    } else if (verificationToken) {
      handleInitialVerification(verificationToken, setStatus, setMessage, login, navigate);
    } else {
      setStatus('error');
      setMessage('Brak wymaganego tokena w adresie URL.');
    }
    
    // Funkcja czyszcząca `useEffect`. Uruchamia się, gdy komponent jest "odmontowywany".
    // W Strict Mode, React od razu odmontowuje i montuje komponent ponownie,
    // więc ta funkcja ustawi flagę `effectRan` na `true` przed drugim uruchomieniem efektu.
    return () => {
      effectRan.current = true;
    };
    // Zależności zapewniają, że efekt uruchomi się ponownie tylko, jeśli zmieni się któraś z tych wartości.
  }, [searchParams, navigate, login]);

  return (
    <div style={{ textAlign: 'center', padding: '50px', maxWidth: '600px', margin: '2rem auto', border: '1px solid #eee', borderRadius: '8px' }}>
      <h1>Status Weryfikacji</h1>
      {status === 'verifying' && <p>Proszę czekać...<br/>{message}</p>}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && (
        <>
          <p style={{ color: 'red' }}>{message}</p>
          <Link to="/" style={{marginTop: '20px', display: 'inline-block'}}>Wróć na stronę główną</Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmailPage;
