// src/pages/ChatLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { api } from '../apiConfig.js';

function ChatLayout() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { conversationId } = useParams(); // Aby podświetlić aktywny czat

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/conversations');
        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Błąd pobierania listy konwersacji", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const styles = {
    layout: { display: 'flex', height: 'calc(100vh - 80px)' }, // 80px to wysokość navbara
    sidebar: { width: '300px', borderRight: '1px solid #eee', overflowY: 'auto' },
    chatView: { flex: 1, padding: '20px' },
    convLink: { display: 'block', padding: '15px 20px', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid #eee' },
    activeLink: { backgroundColor: '#f0f0f0' }
  };

  if (loading) return <p>Ładowanie rozmów...</p>;

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h3 style={{padding: '0 20px'}}>Twoje Rozmowy</h3>
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <Link 
              key={conv.conversation_id} 
              to={`/chat/${conv.conversation_id}`}
              style={{
                ...styles.convLink,
                ...(parseInt(conversationId) === conv.conversation_id ? styles.activeLink : {})
              }}
            >
              <strong>{conv.title}</strong>
            </Link>
          ))
        ) : (
          <p style={{padding: '0 20px'}}>Brak rozmów.</p>
        )}
      </div>
      <div style={styles.chatView}>
        {/* Tutaj React Router wstrzyknie widok wybranej konwersacji */}
        <Outlet /> 
      </div>
    </div>
  );
}

export default ChatLayout;