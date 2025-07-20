import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Hasła nie są takie same.');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('/auth/reset-password', { token, newPassword: password });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>Błąd</h1>
                <p style={{color: 'red'}}>Brak tokenu do resetu hasła. Upewnij się, że używasz poprawnego linku.</p>
                <Link to="/login">Wróć do logowania</Link>
            </div>
        );
    }
    
    return (
        <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center' }}>Ustaw nowe hasło</h2>
            
            {!message ? (
                 <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nowe hasło" required style={{padding: '12px', fontSize: '1rem'}} />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Potwierdź nowe hasło" required style={{padding: '12px', fontSize: '1rem'}} />
                    <button type="submit" disabled={loading} style={{padding: '12px', fontSize: '1rem', cursor: 'pointer'}}>
                        {loading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
                    </button>
                </form>
            ) : (
                <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>
            )}

            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
            <p style={{ marginTop: '20px', textAlign: 'center' }}><Link to="/login">Wróć do logowania</Link></p>
        </div>
    );
}

export default ResetPasswordPage;