// src/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from './apiConfig'; // Importujemy URL z konfiguracji
import { AuthContext } from './AuthContext'; // Potrzebujemy tokena do autoryzacji

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    // Łączymy się z serwerem tylko jeśli użytkownik jest zalogowany (ma token)
    if (token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token }, // Przesyłamy token w celu autoryzacji połączenia socket
        autoConnect: true,
        reconnection: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => console.log('Socket.IO połączony przez Context!'));
      newSocket.on('disconnect', () => console.log('Socket.IO rozłączony.'));

      // Sprzątanie po wylogowaniu (gdy token zniknie)
      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};