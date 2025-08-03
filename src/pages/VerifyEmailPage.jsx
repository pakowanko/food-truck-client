import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Przetwarzanie Twojego żądania...');

  // Dodajemy ref, aby zapobiec podwójnemu uruchomieniu efektu w trybie deweloperskim (Strict Mode)
  const effectRan = useRef(false);

  useEffect(() => {
    // W trybie deweloperskim (Strict Mode) React uruchamia ten efekt dwukrotnie, aby pomóc znaleźć błędy.
    // Token weryfikacyjny może być użyty tylko raz. Drugie uruchomienie powoduje błąd.
    // Ten warunek zapobiega wykonaniu logiki przy drugim uruchomieniu.
    if (effectRan.current === true) {
      return;
    }

    const verificationToken = searchParams.get('token');
    const reminderToken = searchParams.get('reminder_token');

    // Funkcja do obsługi weryfikacji po rejestracji (token jednorazowy)
    const handleInitialVerification = async (token) => {
      setStatus('verifying');
      setMessage('Trwa weryfikacja Twojego konta...');
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        const { success, token: jwtToken, redirect, message: responseMessage } = response.data;

        if (success && jwtToken) {
          // Sukces, mamy token JWT do automatycznego zalogowania
          setStatus('success');
          setMessage(responseMessage + ' Za chwilę zostaniesz przekierowany...');
          login(jwtToken);
          setTimeout(() => navigate(redirect, { replace: true }), 2000);
        } else if (success && !jwtToken) {
           // Sukces, ale bez tokena (np. konto już aktywne)
           setStatus('success');
           setMessage(responseMessage + ' Przekierowujemy do strony logowania...');
           setTimeout(() => navigate(redirect, { replace: true }), 3000);
        } else {
          // Jawny błąd z backendu
          setStatus('error');
          setMessage(responseMessage || 'Wystąpił nieoczekiwany błąd.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Nie udało się zweryfikować konta. Link mógł wygasnąć.');
      }
    };

    // Funkcja do obsługi logowania z przypomnienia (token JWT)
    const handleReminderLogin = async (token) => {
        setStatus('verifying');
        setMessage('Logowanie... Za chwilę zostaniesz przekierowany do tworzenia profilu.');

        try {
            // Używamy nowego endpointu, który weryfikuje token JWT z przypomnienia
            const response = await api.post('/auth/login-with-reminder-token', { token });
            const { success, token: newJwtToken, redirect, message: responseMessage } = response.data;

            if (success) {
                setStatus('success');
                setMessage(responseMessage + ' Przekierowujemy...');
                login(newJwtToken); // Logujemy za pomocą świeżego tokena
                setTimeout(() => {
                    navigate(redirect, { replace: true });
                }, 2000);
            } else {
                setStatus('error');
                setMessage(responseMessage || 'Logowanie za pomocą linku nie powiodło się.');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Nie udało się zalogować. Link mógł wygasnąć.');
        }
    };

    // Sprawdzamy, który token otrzymaliśmy i uruchamiamy odpowiednią funkcję
    if (reminderToken) {
        handleReminderLogin(reminderToken);
    } else if (verificationToken) {
        handleInitialVerification(verificationToken);
    } else {
        setStatus('error');
        setMessage('Brak wymaganego tokena w adresie URL.');
    }
    
    // Funkcja czyszcząca dla efektu. Uruchamia się, gdy komponent jest odmontowywany.
    // W Strict Mode uruchamia się po pierwszym renderowaniu. Ustawiamy tutaj naszą flagę na true.
    return () => {
      effectRan.current = true;
    };
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
