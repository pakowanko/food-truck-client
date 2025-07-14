import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from './apiConfig.js'; // Poprawiony import

// Używamy bezpośredniego adresu URL dla Socket.IO
const socket = io(SOCKET_URL, { 
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5
});

function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !token) {
        setError("Musisz być zalogowany, aby kontynuować.");
        setLoading(false);
        return;
    }

    socket.connect();

    socket.on('connect', () => {
        console.log(`Połączono z serwerem socket.io, id: ${socket.id}`);
        socket.emit('join_room', conversationId);
        console.log(`Wysłano żądanie dołączenia do pokoju: ${conversationId}`);
    });

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Błąd serwera: ${response.statusText}`);
        }
        const data = await response.json();
        setMessages(data);
        setError(null);
      } catch (err) {
        console.error("Błąd pobierania historii wiadomości", err);
        setError("Nie udało się załadować wiadomości. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.on('receive_message', handleReceiveMessage);

    socket.on('connect_error', (err) => {
        console.error('Błąd połączenia z Socket.IO:', err);
        setError('Nie można połączyć się z serwerem czatu.');
    });

    return () => {
      console.log("Sprzątanie komponentu czatu. Rozłączanie...");
      socket.off('connect');
      socket.off('receive_message', handleReceiveMessage);
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [conversationId, token, user?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messageData = {
      conversation_id: conversationId,
      sender_id: user.userId,
      message_content: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  if (loading) return <p>Ładowanie czatu...</p>;
  if (error) return <p style={{color: 'red'}}>Błąd: {error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>
          &larr; Powrót do panelu
        </Link>
      </nav>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Rozmowa</h1>
      <div className="message-list" style={{ 
          height: '60vh', 
          overflowY: 'scroll', 
          border: '1px solid #ccc', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column'
      }}>
        {messages.length > 0 ? messages.map((msg, index) => (
          <div key={msg.message_id || index} style={{ 
              alignSelf: msg.sender_id === user.userId ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              marginBottom: '10px'
          }}>
            <p style={{
              backgroundColor: msg.sender_id === user.userId ? '#dcf8c6' : '#f1f0f0',
              padding: '10px 15px',
              borderRadius: '15px',
              margin: 0,
              wordWrap: 'break-word'
            }}>
              {msg.message_content}
            </p>
          </div>
        )) : <p style={{textAlign: 'center', color: '#888'}}>Brak wiadomości. Napisz jako pierwszy!</p>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '20px', 
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
          placeholder="Wpisz wiadomość..."
        />
        <button type="submit" style={{ 
            padding: '12px 20px', 
            borderRadius: '20px', 
            border: 'none', 
            backgroundColor: '#007bff', 
            color: 'white', 
            cursor: 'pointer' 
        }}>Wyślij</button>
      </form>
    </div>
  );
}

export default ChatPage;