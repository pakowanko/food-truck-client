// pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig.js';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/users');
                setUsers(data);
            } catch (err) {
                setError('Nie udało się pobrać listy użytkowników.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <p>Ładowanie panelu admina...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Panel Administratora</h1>
            
            <h2>Użytkownicy</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid black' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Nazwa Firmy</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Rola</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Zablokowany?</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>{user.user_id}</td>
                            <td style={{ padding: '8px' }}>{user.email}</td>
                            <td style={{ padding: '8px' }}>{user.company_name || '-'}</td>
                            <td style={{ padding: '8px' }}>{user.role}</td>
                            <td style={{ padding: '8px' }}>{user.is_blocked ? 'TAK' : 'NIE'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPage;