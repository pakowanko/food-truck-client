// plik: /src/components/ConversationView.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';
import { useSocket } from '../SocketContext'; // Upewnij się, że ten import jest poprawny

function ConversationView() {
  const { conversationId } = useParams();
  const { user } = useContext(AuthContext);
  const socket = useSocket(); // Używamy hooka z SocketContext
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efekt do pobierania wiadomości i nasłuchiwania na nowe
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
        // ✨ POPRAWKA: Ulepszona logika obsługi wiadomości przychodzących
        const isMyMessage = String(message.sender_id) === String(user.userId);

        // Jeśli to moja wiadomość wracająca z serwera
        if (isMyMessage) {
          // Znajdź i zamień wersję optymistyczną (tymczasową)
          const optimisticIndex = prevMessages.findIndex(m => m.isOptimistic && m.message_content === message.message_content);
          if (optimisticIndex > -1) {
            const newMessages = [...prevMessages];
            newMessages[optimisticIndex] = message;
            return newMessages;
          }
        }
        
        // Dla wiadomości od innych lub jeśli nie znaleziono wersji optymistycznej,
        // dodaj wiadomość tylko wtedy, gdy jej jeszcze nie ma.
        if (!prevMessages.some(m => m.message_id === message.message_id)) {
          return [...prevMessages, message];
        }

        // W przeciwnym razie (to duplikat), zwróć stan bez zmian
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
      sender_id: user.userId,
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
                // ✨ POPRAWKA: Używamy bezpiecznego porównania String()
                justifyContent: String(msg.sender_id) === String(user.userId) ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
                opacity: msg.isOptimistic ? 0.6 : 1
          }}>
            <p style={{
              backgroundColor: String(msg.sender_id) === String(user.userId) ? 'var(--accent-yellow)' : '#f1f0f0',
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
