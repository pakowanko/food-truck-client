// pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig.js';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [usersRes, bookingsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/bookings')
            ]);
            setUsers(usersRes.data);
            setBookings(bookingsRes.data);
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
            fetchData(); // Odśwież dane po zmianie
        } catch (err) {
            alert('Nie udało się zaktualizować użytkownika.');
        }
    };

    const handlePackagingStatusChange = async (requestId, currentStatus) => {
        try {
            await api.put(`/admin/bookings/${requestId}/packaging-status`, { packaging_ordered: !currentStatus });
            fetchData(); // Odśwież dane po zmianie
        } catch (err) {
            alert('Nie udało się zaktualizować rezerwacji.');
        }
    };

    if (loading) return <p>Ładowanie panelu admina...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Panel Administratora</h1>
            
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
                        <th style={{ textAlign: 'left', padding: '8px' }}>Organizator</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Data eventu</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status opakowań</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.request_id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>{booking.request_id}</td>
                            <td style={{ padding: '8px' }}>{booking.company_name}</td>
                            <td style={{ padding: '8px' }}>{booking.organizer_email}</td>
                            <td style={{ padding: '8px' }}>{new Date(booking.event_date).toLocaleDateString()}</td>
                            <td style={{ padding: '8px', color: booking.packaging_ordered ? 'green' : 'red' }}>
                                {booking.packaging_ordered ? 'Zamówione' : 'Brak zamówienia'}
                            </td>
                             <td style={{ padding: '8px' }}>
                                <button onClick={() => handlePackagingStatusChange(booking.request_id, booking.packaging_ordered)}>
                                    Zmień status
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