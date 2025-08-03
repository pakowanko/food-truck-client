import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

function VerifyLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    const redirectPath = searchParams.get('redirect');

    if (token && redirectPath) {
      // Używamy danych z AuthContext, aby "zalogować" użytkownika w frontendzie
      // Drugi argument (userData) jest opcjonalny, token jest kluczowy
      login(null, token); 
      
      // Przekierowujemy użytkownika do docelowej lokalizacji
      navigate(redirectPath, { replace: true });
    } else {
      // Jeśli brakuje parametrów, przekieruj na stronę logowania
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, login]);

  // Wyświetlamy prosty komunikat na czas przetwarzania
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Chwileczkę...</h1>
      <p>Trwa weryfikacja i logowanie. Zaraz zostaniesz przekierowany.</p>
    </div>
  );
}

export default VerifyLoginPage;
