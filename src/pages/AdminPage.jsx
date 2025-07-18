import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig.js';

function AdminPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, bookingsRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/bookings'),
                api.get('/admin/stats')
            ]);
            setUsers(usersRes.data);
            setBookings(bookingsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError('Nie udało się pobrać danych.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleBlock = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/toggle-block`);
            fetchData();
        } catch (err) {
            alert('Nie udało się zaktualizować użytkownika.');
        }
    };

    const handlePackagingStatusChange = async (requestId, currentStatus) => {
        try {
            await api.put(`/admin/bookings/${requestId}/packaging-status`, { packaging_ordered: !currentStatus });
            fetchData();
        } catch (err) {
            alert('Nie udało się zaktualizować statusu opakowań.');
        }
    };

    const handleCommissionStatusChange = async (requestId, currentStatus) => {
        try {
            await api.put(`/admin/bookings/${requestId}/commission-status`, { commission_paid: !currentStatus });
            fetchData();
        } catch (err) {
            alert('Nie udało się zaktualizować statusu prowizji.');
        }
    };
    
    const statCardStyle = {
        flex: 1,
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        minWidth: '200px'
    };
    const statValueStyle = { fontSize: '2rem', fontWeight: 'bold' };
    const statLabelStyle = { fontSize: '1rem', color: '#6c757d' };

    if (loading) return <p>Ładowanie panelu admina...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Panel Administratora</h1>
            
            {stats && (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                    <div style={statCardStyle}>
                        <div style={statValueStyle}>{stats.users}</div>
                        <div style={statLabelStyle}>Zarejestrowanych użytkowników</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statValueStyle}>{stats.profiles}</div>
                        <div style={statLabelStyle}>Profili food trucków</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statValueStyle}>{stats.bookings}</div>
                        <div style={statLabelStyle}>Wszystkich rezerwacji</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statValueStyle}>{stats.commission} zł</div>
                        <div style={statLabelStyle}>Suma opłaconych prowizji</div>
                    </div>
                </div>
            )}
            
            <h2 style={{marginTop: '40px'}}>Użytkownicy</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid black' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Rola</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>{user.user_id}</td>
                            <td style={{ padding: '8px' }}>{user.email}</td>
                            <td style={{ padding: '8px' }}>{user.role}</td>
                            <td style={{ padding: '8px', color: user.is_blocked ? 'red' : 'green' }}>
                                {user.is_blocked ? 'Zablokowany' : 'Aktywny'}
                            </td>
                            <td style={{ padding: '8px' }}>
                                <button onClick={() => handleToggleBlock(user.user_id)}>
                                    {user.is_blocked ? 'Odblokuj' : 'Zablokuj'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 style={{marginTop: '40px'}}>Rezerwacje</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                     <tr style={{ borderBottom: '2px solid black' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Food Truck</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Data eventu</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status Prowizji</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status Opakowań</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.request_id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>{booking.request_id}</td>
                            <td style={{ padding: '8px' }}>{booking.company_name}</td>
                            <td style={{ padding: '8px' }}>{new Date(booking.event_date).toLocaleDateString()}</td>
                            <td style={{ padding: '8px', color: booking.commission_paid ? 'green' : 'red', fontWeight: 'bold' }}>
                                {booking.commission_paid ? 'Opłacona' : 'Nieopłacona'}
                            </td>
                            <td style={{ padding: '8px', color: booking.packaging_ordered ? 'green' : 'orange', fontWeight: 'bold' }}>
                                {booking.packaging_ordered ? 'Zamówione' : 'Brak zamówienia'}
                            </td>
                             <td style={{ padding: '8px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleCommissionStatusChange(booking.request_id, booking.commission_paid)}>
                                    Prowizja
                                </button>
                                <button onClick={() => handlePackagingStatusChange(booking.request_id, booking.packaging_ordered)}>
                                    Opakowania
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPage;