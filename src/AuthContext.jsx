import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { api, SOCKET_URL } from './apiConfig.js';

const socket = io(SOCKET_URL, { 
    autoConnect: false,
    reconnection: true,
});

export const AuthContext = createContext(null);

// Komponent NotificationPopup bez zmian
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

  // --- ULEPSZONA FUNKCJA LOGIN ---
  // Teraz jest asynchroniczna i zwraca dane użytkownika lub null.
  // Gwarantuje, że proces logowania (ustawienie tokena + pobranie profilu) jest atomowy.
  const login = useCallback(async (userToken) => {
    if (!userToken) {
        logout();
        return null; // Zwracamy null, jeśli nie ma tokena
    }
    
    setLoading(true);
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    
    try {
        const response = await api.get('/auth/profile');
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setLoading(false);
        return userData; // Zwracamy dane użytkownika po udanym logowaniu
    } catch (error) {
        console.error("Token nieważny lub wystąpił błąd, wylogowywanie.", error);
        logout(); // W razie błędu czyścimy wszystko
        setLoading(false);
        return null; // Zwracamy null w przypadku błędu
    }
  }, [logout]);

  // useEffect do inicjalizacji sesji przy pierwszym załadowaniu aplikacji
  useEffect(() => {
    const initialToken = localStorage.getItem('token');
    if (initialToken) {
      // Jeśli mamy token, próbujemy się zalogować, ale nie blokujemy renderowania
      login(initialToken);
    } else {
      setLoading(false); // Jeśli nie ma tokena, kończymy ładowanie
    }
  }, [login]);

  // useEffect do obsługi socket.io, bez zmian, ale teraz będzie działał poprawnie
  useEffect(() => {
    const onNewMessage = (data) => {
        setNotification(data);
        setTimeout(() => setNotification(null), 8000);
    };

    // Ten warunek jest teraz bezpieczny, bo `user` będzie ustawiony dopiero po pełnym zalogowaniu
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

  const value = useMemo(() => ({
    user, token, loading, login, logout, socket, notification, setNotification
  }), [user, token, loading, login, logout, notification]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
