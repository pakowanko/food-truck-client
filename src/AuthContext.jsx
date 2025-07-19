import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { api, SOCKET_URL } from './apiConfig.js';

const socket = io(SOCKET_URL, { 
    autoConnect: false,
    reconnection: true,
});

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const logout = useCallback(() => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error("Token nieważny, wylogowywanie.", error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    validateToken();
  }, [token, logout]);

  useEffect(() => {
    const onNewMessage = (data) => {
        setNotification(data);
        setTimeout(() => setNotification(null), 8000);
    };

    if (user && !loading) {
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.on('connect', () => {
            console.log('Połączono z globalnym socketem i rejestruję użytkownika:', user.userId);
            socket.emit('register_user', user.userId);
        });

        socket.on('new_message_notification', onNewMessage);

    }

    return () => {
        socket.off('connect');
        socket.off('new_message_notification', onNewMessage);
    };
  }, [user, loading]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(userData);
  };

  const value = useMemo(() => ({
    user, token, loading, login, logout, socket 
  }), [user, token, loading, logout]);

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
            position: 'fixed', bottom: '20px', right: '20px', backgroundColor: 'white', 
            padding: '15px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2000, cursor: 'pointer', maxWidth: '320px', borderLeft: '5px solid var(--primary-red)'
        }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Nowa wiadomość od {notification.senderName}</p>
            <p style={{ margin: '5px 0 0', color: '#666' }}>{notification.messagePreview}</p>
        </div>
    );
}

export default AuthProvider;