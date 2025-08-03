import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

const handleInitialVerification = async (token, setStatus, setMessage, login, navigate) => {
  console.log('[VerifyEmailPage] Rozpoczęto handleInitialVerification z tokenem:', token);
  setStatus('verifying');
  setMessage('Trwa weryfikacja Twojego konta...');
  try {
    console.log('[VerifyEmailPage] Wysyłam GET /auth/verify-email...');
    const response = await api.get(`/auth/verify-email?token=${token}`);
    console.log('[VerifyEmailPage] Otrzymano odpowiedź z /auth/verify-email:', response.data);
    const { success, token: jwtToken, redirect, message: responseMessage } = response.data;

    if (success && jwtToken) {
      setStatus('success');
      setMessage(responseMessage + ' Za chwilę zostaniesz przekierowany...');
      
      console.log('[VerifyEmailPage] Wywołuję await login(jwtToken)...');
      const loggedInUser = await login(jwtToken);
      console.log('[VerifyEmailPage] Funkcja login() zakończona. Zalogowany użytkownik:', loggedInUser);
      
      if (loggedInUser) {
        console.log('[VerifyEmailPage] Użytkownik zalogowany, przekierowuję do:', redirect);
        setTimeout(() => navigate(redirect, { replace: true }), 1500);
      } else {
        console.log('[VerifyEmailPage] Błąd: login() zwrócił null.');
        setStatus('error');
        setMessage('Logowanie po weryfikacji nie powiodło się. Spróbuj zalogować się ręcznie.');
      }

    } else if (success && !jwtToken) {
      setStatus('success');
      setMessage(responseMessage + ' Przekierowujemy do strony logowania...');
      setTimeout(() => navigate(redirect, { replace: true }), 3000);
    } else {
      setStatus('error');
      setMessage(responseMessage || 'Wystąpił nieoczekiwany błąd.');
    }
  } catch (err) {
    console.error('[VerifyEmailPage] Błąd w handleInitialVerification:', err);
    setStatus('error');
    setMessage(err.response?.data?.message || 'Nie udało się zweryfikować konta. Link mógł wygasnąć.');
  }
};

const handleReminderLogin = async (token, setStatus, setMessage, login, navigate) => {
  console.log('[VerifyEmailPage] Rozpoczęto handleReminderLogin.');
  setStatus('verifying');
  setMessage('Logowanie... Za chwilę zostaniesz przekierowany do tworzenia profilu.');
  try {
    console.log('[VerifyEmailPage] Wysyłam POST /auth/login-with-reminder-token...');
    const response = await api.post('/auth/login-with-reminder-token', { token });
    console.log('[VerifyEmailPage] Otrzymano odpowiedź z /auth/login-with-reminder-token:', response.data);
    const { success, token: newJwtToken, redirect, message: responseMessage } = response.data;

    if (success) {
      setStatus('success');
      setMessage(responseMessage + ' Przekierowujemy...');
      
      console.log('[VerifyEmailPage] Wywołuję await login(newJwtToken)...');
      const loggedInUser = await login(newJwtToken);
      console.log('[VerifyEmailPage] Funkcja login() zakończona. Zalogowany użytkownik:', loggedInUser);

      if (loggedInUser) {
        console.log('[VerifyEmailPage] Użytkownik zalogowany, przekierowuję do:', redirect);
        setTimeout(() => navigate(redirect, { replace: true }), 1500);
      } else {
         console.log('[VerifyEmailPage] Błąd: login() zwrócił null.');
         setStatus('error');
         setMessage('Logowanie za pomocą linku nie powiodło się. Spróbuj zalogować się ręcznie.');
      }
    } else {
      setStatus('error');
      setMessage(responseMessage || 'Logowanie za pomocą linku nie powiodło się.');
    }
  } catch (err) {
    console.error('[VerifyEmailPage] Błąd w handleReminderLogin:', err);
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
    console.log('[VerifyEmailPage] Komponent zamontowany, uruchamiam useEffect.');
    // W trybie produkcyjnym ten warunek nigdy nie będzie prawdziwy, ale w deweloperskim jest kluczowy.
    if (effectRan.current === true && process.env.NODE_ENV === 'development') {
      console.log('[VerifyEmailPage] Efekt już uruchomiony, przerywam (Strict Mode).');
      return;
    }

    const verificationToken = searchParams.get('token');
    const reminderToken = searchParams.get('reminder_token');
    console.log(`[VerifyEmailPage] Znalezione tokeny w URL: verificationToken=${verificationToken ? 'jest' : 'brak'}, reminderToken=${reminderToken ? 'jest' : 'brak'}`);

    if (reminderToken) {
      handleReminderLogin(reminderToken, setStatus, setMessage, login, navigate);
    } else if (verificationToken) {
      handleInitialVerification(verificationToken, setStatus, setMessage, login, navigate);
    } else {
      setStatus('error');
      setMessage('Brak wymaganego tokena w adresie URL.');
    }
    
    // Ustawiamy flagę na true, aby zapobiec ponownemu uruchomieniu.
    return () => {
      console.log('[VerifyEmailPage] Funkcja czyszcząca useEffect, ustawiam effectRan na true.');
      effectRan.current = true;
    };
  }, []); // Pusta tablica zależności jest kluczowa.

  return (
    <div style={{ textAlign: 'center', padding: '50px', maxWidth: '600px', margin: '2rem auto', border: '1px solid #eee', borderRadius: '8px' }}>
      <h1>Status Weryfikacji</h1>
      {status === 'verifying' && <p>Proszę czekać...<br/>{message}</p>}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'error' && (
        <>
          <p style={{ color: 'red' }}>{message}</p>
          <Link to="/login" style={{marginTop: '20px', display: 'inline-block'}}>Wróć do strony logowania</Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmailPage;
