import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Weryfikowanie Twojego konta...');
    const [error, setError] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setMessage('Brak tokenu weryfikacyjnego w adresie URL.');
            setError(true);
            return;
        }

        const verifyAccount = async () => {
            try {
                const response = await api.get(`/auth/verify-email?token=${token}`);
                setMessage(response.data.message + ' Możesz się teraz zalogować.');
                setError(false);
            } catch (err) {
                setMessage(err.response?.data?.message || 'Wystąpił błąd podczas weryfikacji.');
                setError(true);
            }
        };

        verifyAccount();
    }, [searchParams]); // Uruchom efekt tylko raz, gdy komponent się załaduje

    return (
        <div style={{ textAlign: 'center', padding: '50px', maxWidth: '600px', margin: '2rem auto' }}>
            <h1>Status Weryfikacji Konta</h1>
            <p style={{ color: error ? 'red' : 'green', fontSize: '1.2rem', minHeight: '50px' }}>
                {message}
            </p>
            {!error && (
                <Link to="/login" style={{
                    display: 'inline-block',
                    marginTop: '20px',
                    padding: '12px 25px',
                    backgroundColor: 'var(--primary-red)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '1rem'
                }}>
                    Przejdź do logowania
                </Link>
            )}
        </div>
    );
}

export default VerifyEmailPage;