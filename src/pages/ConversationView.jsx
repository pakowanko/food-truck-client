// plik: /src/components/ConversationView.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';
import { useSocket } from '../SocketContext';

function ConversationView() {
  const { conversationId } = useParams();
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId || !user || !socket) {
        setMessages([]);
        setLoading(false);
        return;
    };

    setLoading(true);
    setMessages([]);

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

    const handleNewMessage = (message) => {
      setMessages((prevMessages) => {
        // ✨ OSTATECZNA POPRAWKA: Używamy poprawnej nazwy pola 'user.user_id'
        const isMyMessage = String(message.sender_id) === String(user.user_id);

        if (isMyMessage) {
          const optimisticIndex = prevMessages.findIndex(m => m.isOptimistic && m.message_content === message.message_content);
          if (optimisticIndex > -1) {
            const newMessages = [...prevMessages];
            newMessages[optimisticIndex] = message;
            return newMessages;
          }
        }
        
        if (!prevMessages.some(m => m.message_id === message.message_id)) {
          return [...prevMessages, message];
        }

        return prevMessages;
      });
    };
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.emit('leave_room', conversationId);
      socket.off('newMessage', handleNewMessage);
    };
  }, [conversationId, user, socket]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messageData = {
      message_content: newMessage,
    };
    
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      // ✨ OSTATECZNA POPRAWKA: Używamy poprawnej nazwy 'user.user_id'
      sender_id: user.user_id,
      message_content: newMessage,
      message_id: tempId,
      isOptimistic: true
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    try {
      await api.post(`/conversations/${conversationId}/messages`, messageData);
    } catch (err) {
      console.error('Błąd wysyłania wiadomości:', err);
      setMessages(prev => prev.filter(m => m.message_id !== tempId));
      setError("Nie udało się wysłać wiadomości.");
    }
  };

  if (loading) return <p>Wczytywanie wiadomości...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (!conversationId) return <p style={{textAlign: 'center', color: '#888'}}>Wybierz rozmowę z listy.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
        {messages.length > 0 ? messages.map((msg, index) => (
          <div key={msg.message_id || index} style={{ 
                display: 'flex',
                // ✨ OSTATECZNA POPRAWKA: Używamy bezpiecznego porównania i poprawnej nazwy 'user.user_id'
                justifyContent: String(msg.sender_id) === String(user.user_id) ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
                opacity: msg.isOptimistic ? 0.6 : 1
          }}>
            <p style={{
              backgroundColor: String(msg.sender_id) === String(user.user_id) ? 'var(--accent-yellow)' : '#f1f0f0',
              color: '#333',
              padding: '10px 15px',
              borderRadius: '15px',
              margin: 0,
              maxWidth: '70%',
              wordWrap: 'break-word'
            }}>
              {msg.message_content}
            </p>
          </div>
        )) : <p style={{textAlign: 'center', color: '#888'}}>Napisz pierwszą wiadomość.</p>}
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
