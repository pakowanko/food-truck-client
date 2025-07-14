// src/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Gdy AuthContext weryfikuje token, pokazujemy komunikat o ładowaniu.
  //    To kluczowy krok, który zapobiega renderowaniu strony ze starymi danymi.
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Ładowanie sesji...</div>;
  }

  // 2. Po zakończeniu ładowania sprawdzamy, czy użytkownik jest zalogowany.
  //    Jeśli nie, przekierowujemy na stronę logowania.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Jeśli użytkownik jest zalogowany, renderujemy chroniony komponent.
  return children;
};

export default ProtectedRoute;