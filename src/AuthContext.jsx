import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { api, SOCKET_URL } from './apiConfig.js';

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
  const [token, setToken] = useState(() => {
    const initialToken = localStorage.getItem('token');
    console.log(`[AuthContext] Inicjalizacja. Token z localStorage: ${initialToken ? 'jest' : 'brak'}`);
    return initialToken;
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const logout = useCallback(() => {
    console.log('[AuthContext] Wylogowywanie...');
    if (socket.connected) {
        socket.disconnect();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const login = useCallback(async (userToken) => {
    console.log('[AuthContext] Rozpoczęto funkcję login().');
    if (!userToken) {
        console.log('[AuthContext] Brak tokena, wywołuję logout().');
        logout();
        return null;
    }
    
    console.log('[AuthContext] Ustawiam loading na true.');
    setLoading(true);
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    
    try {
        console.log('[AuthContext] Próbuję pobrać /auth/profile...');
        const response = await api.get('/auth/profile');
        const userData = response.data;
        console.log('[AuthContext] Sukces! Otrzymano dane użytkownika:', userData);
        
        console.log('[AuthContext] Ustawiam stany: user, token, loading.');
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken); 
        setLoading(false);
        console.log('[AuthContext] Funkcja login() zakończona pomyślnie.');
        return userData;
    } catch (error) {
        console.error("[AuthContext] Błąd w login(), wylogowywanie.", error);
        logout();
        setLoading(false);
        console.log('[AuthContext] Funkcja login() zakończona błędem.');
        return null;
    }
  }, [logout]);

  useEffect(() => {
    console.log('[AuthContext] Uruchomiono useEffect do inicjalizacji sesji.');
    const initialToken = localStorage.getItem('token');
    if (initialToken) {
      console.log('[AuthContext] Znaleziono token inicjalizacyjny, wywołuję login().');
      login(initialToken);
    } else {
      console.log('[AuthContext] Brak tokena inicjalizacyjnego, ustawiam loading na false.');
      setLoading(false);
    }
    // Pusta tablica zależności [] jest kluczowa, aby ten efekt uruchomił się tylko raz.
  }, []); 

  useEffect(() => {
    console.log(`[AuthContext] Uruchomiono useEffect dla socket.io. Stan: user=${user ? user.userId : 'null'}, loading=${loading}`);
    if (user && !loading) {
        if (!socket.connected) {
            console.log('[AuthContext] Socket.io - łączę...');
            socket.connect();
        }
        
        const onConnect = () => {
            console.log('[AuthContext] Socket połączony. Rejestruję użytkownika z ID:', user.userId);
            socket.emit('register_user', user.userId);
        };
        
        socket.on('connect', onConnect);
        socket.on('new_message_notification', (data) => {
            console.log('[AuthContext] Otrzymano powiadomienie o nowej wiadomości:', data);
            setNotification(data);
            setTimeout(() => setNotification(null), 8000);
        });

        if (socket.connected) {
            onConnect();
        }
    } else {
        console.log('[AuthContext] Socket.io - warunki nie spełnione, nie łączę.');
    }

    return () => {
        socket.off('connect');
        socket.off('new_message_notification');
    };
  }, [user, loading]);

  const value = useMemo(() => ({
    user, token, loading, login, logout, socket, notification, setNotification
  }), [user, token, loading, login, logout, notification]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? <p style={{textAlign: 'center', marginTop: '50px', fontSize: '1.2rem'}}>Ładowanie aplikacji...</p> : children}
    </AuthContext.Provider>
  );
};
