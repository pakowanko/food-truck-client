import React, { useState, useEffect, useContext } from 'react';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '500px' }}>
                <h2 style={{marginTop: 0}}>Edytuj użytkownika: {user.email}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Typ konta:</label>
                    <select name="user_type" value={formData.user_type} onChange={handleChange} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                        <option value="organizer">Organizator</option>
                        <option value="food_truck_owner">Właściciel Food Trucka</option>
                    </select>

                    <label style={{display: 'block', marginTop: '15px'}}>Nazwa firmy:</label>
                    <input name="company_name" value={formData.company_name || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}} />

                    <label style={{display: 'block', marginTop: '15px'}}>NIP:</label>
                    <input name="nip" value={formData.nip || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}} />

                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose}>Anuluj</button>
                        <button type="submit">Zapisz zmiany</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


function AdminPage() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

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

    useEffect(() => { fetchData(); }, []);

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

    const openEditModal = (userToEdit) => {
        setEditingUser(userToEdit);
        setIsEditModalOpen(true);
    };

    const handleUserUpdate = async (updatedUserData) => {
        try {
            await api.put(`/admin/users/${updatedUserData.user_id}`, updatedUserData);
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchData();
        } catch (err) {
            alert('Nie udało się zaktualizować użytkownika.');
        }
    };

    const handleDeleteUser = async (userIdToDelete) => {
        if (userIdToDelete === user.userId) {
            alert("Nie możesz usunąć własnego konta.");
            return;
        }
        
        const confirmation = window.confirm("Czy na pewno chcesz trwale usunąć tego użytkownika i wszystkie jego dane? Tej operacji nie można cofnąć.");
        if (confirmation) {
            try {
                await api.delete(`/admin/users/${userIdToDelete}`);
                fetchData();
            } catch (err) {
                alert('Nie udało się usunąć użytkownika.');
            }
        }
    };

    const statCardStyle = { flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', minWidth: '200px' };
    const statValueStyle = { fontSize: '2rem', fontWeight: 'bold' };
    const statLabelStyle = { fontSize: '1rem', color: '#6c757d' };

    if (loading) return <p>Ładowanie panelu admina...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <>
            {isEditModalOpen && <EditUserModal user={editingUser} onClose={() => setIsEditModalOpen(false)} onSave={handleUserUpdate} />}

            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1>Panel Administratora</h1>
                
                {stats && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                        <div style={statCardStyle}><div style={statValueStyle}>{stats.users}</div><div style={statLabelStyle}>Użytkowników</div></div>
                        <div style={statCardStyle}><div style={statValueStyle}>{stats.profiles}</div><div style={statLabelStyle}>Profili</div></div>
                        <div style={statCardStyle}><div style={statValueStyle}>{stats.bookings}</div><div style={statLabelStyle}>Rezerwacji</div></div>
                        <div style={statCardStyle}><div style={statValueStyle}>{stats.commission} zł</div><div style={statLabelStyle}>Prowizji</div></div>
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
                        {users.map(u => (
                            <tr key={u.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{u.user_id}</td>
                                <td style={{ padding: '8px' }}>{u.email}</td>
                                <td style={{ padding: '8px' }}>{u.role}</td>
                                <td style={{ padding: '8px', color: u.is_blocked ? 'red' : 'green' }}>{u.is_blocked ? 'Zablokowany' : 'Aktywny'}</td>
                                <td style={{ padding: '8px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleToggleBlock(u.user_id)} disabled={u.user_id === user.userId}>{u.is_blocked ? 'Odblokuj' : 'Zablokuj'}</button>
                                    <button onClick={() => openEditModal(u)}>Edytuj</button>
                                    <button onClick={() => handleDeleteUser(u.user_id)} disabled={u.user_id === user.userId} style={{backgroundColor: '#dc3545', color: 'white'}}>Usuń</button>
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
                                <td style={{ padding: '8px' }}>{new Date(booking.event_start_date).toLocaleDateString()}</td>
                                <td style={{ padding: '8px', color: booking.commission_paid ? 'green' : 'red', fontWeight: 'bold' }}>{booking.commission_paid ? 'Opłacona' : 'Nieopłacona'}</td>
                                <td style={{ padding: '8px', color: booking.packaging_ordered ? 'green' : 'orange', fontWeight: 'bold' }}>{booking.packaging_ordered ? 'Zamówione' : 'Brak zamówienia'}</td>
                                 <td style={{ padding: '8px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleCommissionStatusChange(booking.request_id, booking.commission_paid)}>Prowizja</button>
                                    <button onClick={() => handlePackagingStatusChange(booking.request_id, booking.packaging_ordered)}>Opakowania</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default AdminPage;
