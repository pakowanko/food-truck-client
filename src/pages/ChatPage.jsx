// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react'; // ✨ POPRAWKA: Dodano import Hooków
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../SocketContext';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext';

function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pobieramy dane użytkownika i socket z kontekstów
  const { user } = useContext(AuthContext); // Używamy bezpośrednio useContext
  const socket = useSocket();
  
  const messagesEndRef = useRef(null); // Używamy bezpośrednio useRef

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efekt do pobierania wiadomości i nasłuchiwania
  useEffect(() => {
    if (!socket || !user) return;

    // Dołącz do pokoju czatu
    socket.emit('join_room', conversationId);

    // Pobierz historię wiadomości
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(response.data);
        setError(null);
      } catch (err) {
        console.error("Błąd pobierania historii wiadomości", err);
        setError(err.response?.data?.message || "Nie udało się załadować wiadomości.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    const handleNewMessage = (message) => {
      setMessages((prevMessages) => 
        prevMessages.some(m => m.message_id === message.message_id) 
        ? prevMessages 
        : [...prevMessages, message]
      );
    };
    socket.on('newMessage', handleNewMessage);

    // Sprzątanie po wyjściu z komponentu
    return () => {
      socket.emit('leave_room', conversationId);
      socket.off('newMessage', handleNewMessage);
    };
  }, [conversationId, socket, user]);

  // Efekt do przewijania na dół
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messageData = {
      sender_id: user.userId,
      message_content: newMessage,
    };
    
    const tempId = `temp_${Date.now()}`;
    setMessages(prev => [...prev, { ...messageData, message_id: tempId, isOptimistic: true }]);
    setNewMessage('');
    
    try {
      await api.post(`/conversations/${conversationId}/messages`, messageData);
    } catch (err) {
      console.error('Błąd wysyłania wiadomości:', err);
      setMessages(prev => prev.filter(m => m.message_id !== tempId));
      setError("Nie udało się wysłać wiadomości.");
    }
  };

  if (loading) return <p>Ładowanie czatu...</p>;
  if (error) return <p style={{color: 'red'}}>Błąd: {error}</p>;

  // Reszta komponentu JSX (bez zmian)
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>
          &larr; Powrót do panelu
        </Link>
      </nav>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Rozmowa</h1>
      <div className="message-list" style={{ height: '60vh', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px 20px', borderRadius: '8px', marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
        {messages.length > 0 ? messages.map((msg) => (
          <div key={msg.message_id} style={{ alignSelf: msg.sender_id === user.userId ? 'flex-end' : 'flex-start', maxWidth: '70%', marginBottom: '10px', opacity: msg.isOptimistic ? 0.6 : 1 }}>
            <p style={{ backgroundColor: msg.sender_id === user.userId ? '#dcf8c6' : '#f1f0f0', padding: '10px 15px', borderRadius: '15px', margin: 0, wordWrap: 'break-word' }}>
              {msg.message_content}
            </p>
          </div>
        )) : <p style={{textAlign: 'center', color: '#888'}}>Brak wiadomości. Napisz jako pierwszy!</p>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ccc', marginRight: '10px' }} placeholder="Wpisz wiadomość..." />
        <button type="submit" style={{ padding: '12px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>Wyślij</button>
      </form>
    </div>
  );
}

export default ChatPage;