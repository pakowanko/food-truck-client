import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { api, SOCKET_URL } from './apiConfig.js';
import { jwtDecode } from 'jwt-decode'; // <-- NOWY IMPORT

const socket = io(SOCKET_URL, { 
    autoConnect: false,
    reconnection: true,
});

export const AuthContext = createContext(null);

export function NotificationPopup({ notification, onClose }) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/chat/${notification.conversationId}`);
        onClose();
    };
    return (
        <div onClick={handleClick} style={{
            position: 'fixed', bottom: '20px', right: '20px', backgroundColor: 'white', 
            padding: '15px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2000, cursor: 'pointer', maxWidth: '320px', borderLeft: '5px solid var(--primary-red)'
        }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Nowa wiadomość od {notification.senderName}</p>
            <p style={{ margin: '5px 0 0', color: '#666' }}>{notification.messagePreview}</p>
        </div>
    );
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // <-- NOWY STAN

  const logout = useCallback(() => {
    if (socket.connected) {
        socket.disconnect();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      // --- ZMIANA: Sprawdzamy, czy nie jesteśmy w trakcie logowania ---
      if (isLoggingIn) {
        setIsLoggingIn(false); // Resetujemy flagę
        setLoading(false); // Kończymy ładowanie
        return; // Przerywamy, aby uniknąć zbędnego zapytania API
      }

      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Token nieważny, wylogowywanie.", error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setUser(null);
        localStorage.removeItem('user');
      }
    };
    validateToken();
  }, [token, logout, isLoggingIn]);

  useEffect(() => {
    const onNewMessage = (data) => {
        setNotification(data);
        setTimeout(() => setNotification(null), 8000);
    };

    if (user && !loading) {
        if (!socket.connected) {
            socket.connect();
        }
        
        const onConnect = () => {
            console.log('Połączono z globalnym socketem i rejestruję użytkownika:', user.userId);
            socket.emit('register_user', user.userId);
        };
        
        socket.on('connect', onConnect);
        socket.on('new_message_notification', onNewMessage);

        if (socket.connected) {
            onConnect();
        }
    }

    return () => {
        socket.off('connect');
        socket.off('new_message_notification', onNewMessage);
    };
  }, [user, loading]);

  // --- ZAKTUALIZOWANA FUNKCJA LOGIN ---
  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    
    let finalUserData = userData;
    if (!finalUserData && userToken) {
        try {
            finalUserData = jwtDecode(userToken);
        } catch (e) {
            console.error("Nie udało się zdekodować tokena", e);
            logout();
            return;
        }
    }

    if (finalUserData) {
        setUser(finalUserData);
        localStorage.setItem('user', JSON.stringify(finalUserData));
    }
    
    // --- ZMIANA: Ustawiamy flagę, że właśnie się logujemy ---
    setIsLoggingIn(true); 
    setToken(userToken);
  };

  const value = useMemo(() => ({
    user, token, loading, login, logout, socket, notification, setNotification
  }), [user, token, loading, logout, notification]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
