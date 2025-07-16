import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { api, SOCKET_URL } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

const socket = io(SOCKET_URL, { 
    autoConnect: false,
    reconnection: true
});

function ConversationView() {
  const { conversationId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId || !user) {
        setMessages([]);
        setLoading(false);
        return;
    };

    setLoading(true);
    setMessages([]);

    socket.connect();
    socket.emit('join_room', conversationId);

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Nie udało się załadować wiadomości.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    const handleReceiveMessage = (message) => {
      if (message.conversation_id.toString() === conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    socket.on('receive_message', handleReceiveMessage);

    socket.on('connect_error', (err) => {
        console.error('Błąd połączenia z Socket.IO:', err);
        setError('Nie można połączyć się z serwerem czatu.');
    });

    return () => {
      socket.emit('leave_room', conversationId);
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();
    };
  }, [conversationId, user]);

  useEffect(scrollToBottom, [messages]);

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

  if (loading) return <p>Wczytywanie wiadomości...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
        {messages.length > 0 ? messages.map((msg, index) => (
          <div key={msg.message_id || index} style={{ 
                display: 'flex',
                justifyContent: msg.sender_id === user.userId ? 'flex-end' : 'flex-start',
                marginBottom: '10px'
          }}>
            <p style={{
              backgroundColor: msg.sender_id === user.userId ? 'var(--accent-yellow)' : '#f1f0f0',
              color: msg.sender_id === user.userId ? '#333' : '#333',
              padding: '10px 15px',
              borderRadius: '15px',
              margin: 0,
              maxWidth: '70%',
              wordWrap: 'break-word'
            }}>
              {msg.message_content}
            </p>
          </div>
        )) : <p style={{textAlign: 'center', color: '#888'}}>Wybierz rozmowę z listy lub napisz pierwszą wiadomość.</p>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', marginTop: 'auto' }}>
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
            backgroundColor: 'var(--primary-red)', 
            color: 'white', 
            cursor: 'pointer' 
        }}>Wyślij</button>
      </form>
    </div>
  );
}

export default ConversationView;