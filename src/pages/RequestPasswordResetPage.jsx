import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../apiConfig.js';

function RequestPasswordResetPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await api.post('/auth/request-password-reset', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Wystąpił błąd. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center' }}>Resetuj hasło</h2>
            <p style={{ textAlign: 'center', color: '#666' }}>Podaj adres e-mail powiązany z Twoim kontem, a wyślemy Ci link do zresetowania hasła.</p>
            
            {!message ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{padding: '12px', fontSize: '1rem'}} />
                    <button type="submit" disabled={loading} style={{padding: '12px', fontSize: '1rem', cursor: 'pointer'}}>
                        {loading ? 'Wysyłanie...' : 'Wyślij link do resetu'}
                    </button>
                </form>
            ) : (
                <p style={{ color: 'green', textAlign: 'center', marginTop: '15px' }}>{message}</p>
            )}
            <p style={{ marginTop: '20px', textAlign: 'center' }}><Link to="/login">Wróć do logowania</Link></p>
        </div>
    );
}

export default RequestPasswordResetPage;