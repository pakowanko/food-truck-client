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
  // Inicjalizujemy token z localStorage. To jest nasz "jedyny" punkt startowy.
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Zaczynamy z ładowaniem, dopóki nie zweryfikujemy tokena
  const [notification, setNotification] = useState(null);

  // Funkcja logout jest teraz prostsza
  const logout = useCallback(() => {
    if (socket.connected) {
        socket.disconnect();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Usuwamy też usera
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    // Nie ma potrzeby nawigacji tutaj, komponenty same zareagują na zmianę `user` na `null`
  }, []);

  // Główny useEffect do zarządzania sesją. Reaguje tylko na zmianę tokena.
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // Ustawiamy nagłówek od razu
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Zawsze pobieramy świeże dane profilu z serwera
          const response = await api.get('/auth/profile');
          setUser(response.data);
          // Zapisujemy pełne dane użytkownika w localStorage dla szybszego startu przy odświeżeniu
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Token nieważny lub wystąpił błąd, wylogowywanie.", error);
          logout(); // Jeśli token jest zły, czyścimy wszystko
        }
      } else {
        // Jeśli nie ma tokena, upewniamy się, że użytkownik jest wylogowany
        setUser(null);
        localStorage.removeItem('user');
      }
      // Kończymy ładowanie dopiero po całej operacji
      setLoading(false);
    };

    validateToken();
  }, [token, logout]); // Zależność tylko od `token` i `logout`

  // useEffect do obsługi socket.io bez zmian
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

  // Uproszczona funkcja login. Jej jedynym zadaniem jest ustawienie nowego tokena.
  // Resztą zajmie się główny useEffect.
  const login = (userToken) => {
    setLoading(true); // Włączamy ładowanie na czas weryfikacji nowego tokena
    localStorage.setItem('token', userToken);
    setToken(userToken); // To uruchomi główny useEffect, który zweryfikuje token i ustawi usera
  };

  const value = useMemo(() => ({
    user, token, loading, login, logout, socket, notification, setNotification
  }), [user, token, loading, logout, notification]);

  return (
    <AuthContext.Provider value={value}>
      {/* Nie renderujemy dzieci dopóki trwa inicjalne ładowanie */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
