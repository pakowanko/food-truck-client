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
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                    
                    <label style={{display: 'block', marginTop: '15px'}}>Ulica i numer:</label>
                    <input name="street_address" value={formData.street_address || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}} />

                    <label style={{display: 'block', marginTop: '15px'}}>Kod pocztowy:</label>
                    <input name="postal_code" value={formData.postal_code || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}} />

                    <label style={{display: 'block', marginTop: '15px'}}>Miasto:</label>
                    <input name="city" value={formData.city || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}} />

                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose}>Anuluj</button>
                        <button type="submit">Zapisz zmiany</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConversationModal = ({ conversation, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/admin/conversations/${conversation.conversation_id}/messages`);
                setMessages(data);
            } catch (error) {
                console.error("Błąd pobierania wiadomości", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [conversation.conversation_id]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '600px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{marginTop: 0}}>Podgląd rozmowy: {conversation.title}</h2>
                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                    {loading ? <p>Wczytywanie wiadomości...</p> : messages.map(msg => (
                        <div key={msg.message_id} style={{ marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                            <strong style={{color: 'var(--primary-red)'}}>{msg.sender_email}:</strong>
                            <p style={{ margin: '5px 0' }}>{msg.message_content}</p>
                            <small style={{color: '#888'}}>{new Date(msg.created_at).toLocaleString()}</small>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose}>Zamknij</button>
                </div>
            </div>
        </div>
    );
};

// --- ZAKTUALIZOWANY KOMPONENT MODALNY DO ZARZĄDZANIA PROFILAMI ---
const ManageProfilesModal = ({ user, onClose }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRadiuses, setEditingRadiuses] = useState({});

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/users/${user.user_id}/profiles`);
            setProfiles(data);
            const initialRadiuses = data.reduce((acc, p) => {
                acc[p.profile_id] = p.operation_radius_km || '';
                return acc;
            }, {});
            setEditingRadiuses(initialRadiuses);
        } catch (error) {
            console.error("Błąd pobierania profili", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [user.user_id]);

    const handleRadiusChange = (profileId, value) => {
        setEditingRadiuses(prev => ({ ...prev, [profileId]: value }));
    };

    const handleSaveRadius = async (profileId) => {
        const newRadius = editingRadiuses[profileId];
        if (!newRadius || isNaN(parseInt(newRadius, 10))) {
            alert("Wprowadź poprawną liczbę jako promień.");
            return;
        }
        try {
            await api.put(`/admin/profiles/${profileId}/details`, { operation_radius_km: newRadius });
            alert("Promień został zaktualizowany!");
            fetchProfiles();
        } catch (error) {
            alert(error.response?.data?.message || "Nie udało się zaktualizować promienia.");
        }
    };

    const handleDeleteProfile = async (profileId) => {
        if (window.confirm("Czy na pewno chcesz usunąć ten profil food trucka? Tej operacji nie można cofnąć.")) {
            try {
                await api.delete(`/admin/profiles/${profileId}`);
                fetchProfiles();
            } catch (error) {
                alert("Nie udało się usunąć profilu.");
            }
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{marginTop: 0}}>Zarządzaj profilami: {user.email}</h2>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? <p>Wczytywanie profili...</p> : (
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr>
                                    <th style={{textAlign: 'left', padding: '8px'}}>Nazwa Food Trucka</th>
                                    <th style={{textAlign: 'left', padding: '8px'}}>Promień (km)</th>
                                    <th style={{textAlign: 'left', padding: '8px'}}>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.length > 0 ? profiles.map(p => (
                                    <tr key={p.profile_id}>
                                        <td style={{padding: '8px', borderTop: '1px solid #eee'}}>{p.food_truck_name} (ID: {p.profile_id})</td>
                                        <td style={{padding: '8px', borderTop: '1px solid #eee'}}>
                                            <input 
                                                type="number"
                                                value={editingRadiuses[p.profile_id] || ''}
                                                onChange={(e) => handleRadiusChange(p.profile_id, e.target.value)}
                                                style={{width: '80px', padding: '5px'}}
                                                placeholder="Brak"
                                            />
                                        </td>
                                        <td style={{padding: '8px', borderTop: '1px solid #eee', display: 'flex', gap: '5px'}}>
                                            <button onClick={() => handleSaveRadius(p.profile_id)}>Zapisz</button>
                                            <button onClick={() => handleDeleteProfile(p.profile_id)} style={{backgroundColor: '#dc3545', color: 'white'}}>Usuń</button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="3"><p>Ten użytkownik nie ma jeszcze żadnych profili.</p></td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose}>Zamknij</button>
                </div>
            </div>
        </div>
    );
};


function AdminPage() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingConversation, setViewingConversation] = useState(null);
    const [managingUser, setManagingUser] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, bookingsRes, statsRes, convosRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/bookings'),
                api.get('/admin/stats'),
                api.get('/admin/conversations')
            ]);
            setUsers(usersRes.data);
            setBookings(bookingsRes.data);
            setStats(statsRes.data);
            setConversations(convosRes.data);
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

    const userTypeMap = {
        organizer: 'Organizator',
        food_truck_owner: 'Właściciel'
    };

    const statCardStyle = { flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', minWidth: '200px' };
    const statValueStyle = { fontSize: '2rem', fontWeight: 'bold' };
    const statLabelStyle = { fontSize: '1rem', color: '#6c757d' };

    if (loading) return <p>Ładowanie panelu admina...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <>
            {isEditModalOpen && <EditUserModal user={editingUser} onClose={() => setIsEditModalOpen(false)} onSave={handleUserUpdate} />}
            {viewingConversation && <ConversationModal conversation={viewingConversation} onClose={() => setViewingConversation(null)} />}
            {managingUser && <ManageProfilesModal user={managingUser} onClose={() => setManagingUser(null)} />}

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
                            <th style={{ textAlign: 'left', padding: '8px' }}>Typ konta</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Liczba profili</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{u.user_id}</td>
                                <td style={{ padding: '8px' }}>{u.email}</td>
                                <td style={{ padding: '8px' }}>
                                    {u.role === 'admin' ? <strong>Admin</strong> : (userTypeMap[u.user_type] || u.user_type)}
                                </td>
                                <td style={{ padding: '8px', color: u.is_blocked ? 'red' : 'green' }}>{u.is_blocked ? 'Zablokowany' : 'Aktywny'}</td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                    {u.user_type === 'food_truck_owner' ? u.profile_count : 'N/A'}
                                </td>
                                <td style={{ padding: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button onClick={() => handleToggleBlock(u.user_id)} disabled={u.user_id === user.userId}>{u.is_blocked ? 'Odblokuj' : 'Zablokuj'}</button>
                                    <button onClick={() => openEditModal(u)}>Edytuj</button>
                                    <button onClick={() => handleDeleteUser(u.user_id)} disabled={u.user_id === user.userId} style={{backgroundColor: '#dc3545', color: 'white'}}>Usuń</button>
                                    {u.user_type === 'food_truck_owner' && (
                                        <button onClick={() => setManagingUser(u)}>Zarządzaj profilami</button>
                                    )}
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

                <h2 style={{marginTop: '40px'}}>Rozmowy</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid black' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Tytuł</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Uczestnicy</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conversations.map(convo => (
                            <tr key={convo.conversation_id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{convo.conversation_id}</td>
                                <td style={{ padding: '8px' }}>{convo.title}</td>
                                <td style={{ padding: '8px' }}>{convo.participant1_email} <br/> {convo.participant2_email}</td>
                                <td style={{ padding: '8px' }}>
                                    <button onClick={() => setViewingConversation(convo)}>
                                        Podgląd
                                    </button>
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
