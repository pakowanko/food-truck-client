import React, { createContext, useState, useEffect, useMemo } from 'react';
// ZMIANA: Importujemy naszą skonfigurowaną instancję 'api'
import { api } from './apiConfig.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // ZMIANA: Ustawiamy nagłówek na naszej instancji 'api', a nie globalnym 'axios'
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // ZMIANA: Używamy naszej instancji 'api' do wysłania zapytania
          const response = await api.get('/auth/profile');

          setUser(response.data);
        } catch (error) {
          console.error("Błąd weryfikacji tokenu lub token nieważny", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`; // Ustawiamy header przy logowaniu
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};