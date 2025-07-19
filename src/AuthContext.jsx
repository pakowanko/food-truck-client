import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { api, SOCKET_URL } from './apiConfig.js';

// Tworzymy jedną, globalną instancję socketa
const socket = io(SOCKET_URL, { 
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5
});

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // Nowy stan na powiadomienia

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  useEffect(() => {
    if (user && token) {
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.on('connect', () => {
            console.log('Połączono z globalnym socketem:', socket.id);
            socket.emit('register_user', user.userId);
        });

        socket.on('new_message_notification', (data) => {
            setNotification(data);
            setTimeout(() => setNotification(null), 8000);
        });
    }

    return () => {
        socket.off('new_message_notification');
        socket.off('connect');
        if (socket.connected) {
            socket.disconnect();
        }
    }
  }, [user, token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    if (socket.connected) {
        socket.disconnect();
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    socket 
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {notification && <NotificationPopup notification={notification} onClose={() => setNotification(null)} />}
      {!loading && children}
    </AuthContext.Provider>
  );
};

function NotificationPopup({ notification, onClose }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/chat/${notification.conversationId}`);
        onClose();
    };

    return (
        <div onClick={handleClick} style={{
            position: 'fixed', bottom: '20px', right: '20px',
            backgroundColor: 'white', padding: '15px 20px',
            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2000, cursor: 'pointer', maxWidth: '320px',
            borderLeft: '5px solid var(--primary-red)'
        }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Nowa wiadomość od {notification.senderName}</p>
            <p style={{ margin: '5px 0 0', color: '#666' }}>{notification.messagePreview}</p>
        </div>
    );
}