import React, { useState, useEffect, useContext } from 'react';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';
import { Link } from 'react-router-dom';

// --- Komponent EditUserModal (bez zmian) ---
const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
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
                    <label style={{display: 'block', marginTop: '15px'}}>Numer telefonu:</label>
                    <input name="phone_number" value={formData.phone_number || ''} onChange={handleChange} style={{width: '100%', padding: '8px'}} />
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

// --- Komponent ConversationModal (bez zmian) ---
const ConversationModal = ({ conversation, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/admin/conversations/${conversation.conversation_id}/messages`);
                setMessages(data);
            } catch (error) { console.error("Błąd pobierania wiadomości", error); }
            finally { setLoading(false); }
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
                            <small style={{color: '#888'}}>{msg.created_at?._seconds ? new Date(msg.created_at._seconds * 1000).toLocaleString('pl-PL') : 'Brak daty'}</small>
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

// --- Komponent EditProfileDetailsModal (z poprawkami) ---
const EditProfileDetailsModal = ({ profile, onClose, onSave }) => {
    const [formData, setFormData] = useState({ food_truck_description: '', base_location: '', operation_radius_km: '' });
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProfileDetails = async () => {
            setLoading(true);
            try {
                // ✨ POPRAWKA: Używamy doc_id do pobrania szczegółów
                const { data } = await api.get(`/admin/profiles/${profile.doc_id}`);
                setFormData({ food_truck_description: data.food_truck_description || '', base_location: data.base_location || '', operation_radius_km: data.operation_radius_km || '' });
                setGallery(data.gallery_photo_urls || []);
            } catch (error) { console.error("Błąd pobierania szczegółów profilu", error); alert("Nie udało się wczytać danych profilu."); }
            finally { setLoading(false); }
        };
        fetchProfileDetails();
    }, [profile.doc_id]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSave = async () => {
        try {
            // ✨ POPRAWKA: Używamy doc_id do zapisu
            await api.put(`/admin/profiles/${profile.doc_id}/details`, formData);
            alert("Zmiany zostały zapisane!");
            onSave();
        } catch (error) { alert(error.response?.data?.message || "Nie udało się zapisać zmian."); }
    };
    const handleDeletePhoto = async (photoUrl) => {
        if (window.confirm("Czy na pewno chcesz usunąć to zdjęcie?")) {
            try {
                // ✨ POPRAWKA: Używamy doc_id do usunięcia zdjęcia
                await api.delete(`/admin/profiles/${profile.doc_id}/photo`, { data: { photoUrl } });
                setGallery(prev => prev.filter(url => url !== photoUrl));
                alert("Zdjęcie usunięte.");
            } catch (error) { alert("Nie udało się usunąć zdjęcia."); }
        }
    };
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{marginTop: 0}}>Edytuj profil: {profile.food_truck_name}</h2>
                {loading ? <p>Wczytywanie...</p> : (
                    <>
                        <div>
                            <label>Opis:</label>
                            <textarea name="food_truck_description" value={formData.food_truck_description} onChange={handleChange} style={{width: '100%', minHeight: '100px', padding: '8px'}} />
                            <label style={{display: 'block', marginTop: '15px'}}>Miasto / Lokalizacja bazowa:</label>
                            <input name="base_location" value={formData.base_location} onChange={handleChange} style={{width: '100%', padding: '8px'}} />
                            <label style={{display: 'block', marginTop: '15px'}}>Promień (km):</label>
                            <input name="operation_radius_km" type="number" value={formData.operation_radius_km} onChange={handleChange} style={{width: '100px', padding: '8px'}} />
                        </div>
                        <h3 style={{marginTop: '30px'}}>Galeria zdjęć:</h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', border: '1px solid #eee', padding: '10px'}}>
                            {gallery.length > 0 ? gallery.map(url => (
                                <div key={url} style={{position: 'relative'}}>
                                    <img src={url} alt="zdjęcie z galerii" style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px'}} />
                                    <button onClick={() => handleDeletePhoto(url)} style={{position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '25px', height: '25px'}}>X</button>
                                </div>
                            )) : <p>Brak zdjęć w galerii.</p>}
                        </div>
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={onClose}>Anuluj</button>
                            <button type="button" onClick={handleSave}>Zapisz wszystkie zmiany</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Komponent ManageProfilesModal (z poprawkami) ---
const ManageProfilesModal = ({ user, onClose }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(null);
    const fetchProfiles = async () => {
        setLoading(true);
        try {
            // ✨ POPRAWKA: Używamy doc_id do pobrania profili
            const { data } = await api.get(`/admin/users/${user.doc_id}/profiles`);
            setProfiles(data);
        } catch (error) { console.error("Błąd pobierania profili", error); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchProfiles(); }, [user.doc_id]);

    const handleDeleteProfile = async (profileDocId) => {
        if (window.confirm("Czy na pewno chcesz usunąć ten profil food trucka? Tej operacji nie można cofnąć.")) {
            try {
                // ✨ POPRAWKA: Używamy doc_id do usunięcia profilu
                await api.delete(`/admin/profiles/${profileDocId}`);
                fetchProfiles();
            } catch (error) { alert("Nie udało się usunąć profilu."); }
        }
    };
    return (
        <>
            {editingProfile && <EditProfileDetailsModal profile={editingProfile} onClose={() => setEditingProfile(null)} onSave={() => { fetchProfiles(); setEditingProfile(null); }} />}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{marginTop: 0}}>Zarządzaj profilami: {user.email}</h2>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? <p>Wczytywanie profili...</p> : (
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead><tr><th style={{textAlign: 'left', padding: '8px'}}>Nazwa Food Trucka</th><th style={{textAlign: 'left', padding: '8px'}}>Akcje</th></tr></thead>
                                <tbody>
                                    {profiles.length > 0 ? profiles.map(p => (
                                        // ✨ POPRAWKA: Używamy doc_id jako klucza
                                        <tr key={p.doc_id}>
                                            <td style={{padding: '8px', borderTop: '1px solid #eee'}}>{p.food_truck_name} (ID: {p.profile_id})</td>
                                            <td style={{padding: '8px', borderTop: '1px solid #eee', display: 'flex', gap: '5px'}}>
                                                <button onClick={() => setEditingProfile(p)}>Edytuj szczegóły</button>
                                                {/* ✨ POPRAWKA: Przekazujemy doc_id do funkcji usuwającej */}
                                                <button onClick={() => handleDeleteProfile(p.doc_id)} style={{backgroundColor: '#dc3545', color: 'white'}}>Usuń</button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="2"><p>Ten użytkownik nie ma jeszcze żadnych profili.</p></td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose}>Zamknij</button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Główny komponent strony AdminPage
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

    const bookingStatusMap = {
        pending_owner_approval: { text: 'Oczekuje na akceptację', color: '#ffc107' },
        confirmed: { text: 'Potwierdzona', color: 'green' },
        rejected_by_owner: { text: 'Odrzucona (Właściciel)', color: 'red' },
        cancelled_by_organizer: { text: 'Anulowana (Organizator)', color: '#6c757d' },
        cancelled_by_owner: { text: 'Anulowana (Właściciel)', color: '#6c757d' },
        completed: { text: 'Zakończona', color: 'blue' }
    };

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
        } catch (err) { setError('Nie udało się pobrać danych.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggleBlock = async (userDocId) => {
        try { 
            // ✨ POPRAWKA: Używamy doc_id
            await api.put(`/admin/users/${userDocId}/toggle-block`); 
            fetchData(); 
        }
        catch (err) { alert('Nie udało się zaktualizować użytkownika.'); }
    };
    const handlePackagingStatusChange = async (requestId, currentStatus) => {
        try { await api.put(`/admin/bookings/${requestId}/packaging-status`, { packaging_ordered: !currentStatus }); fetchData(); }
        catch (err) { alert('Nie udało się zaktualizować statusu opakowań.'); }
    };
    const handleCommissionStatusChange = async (requestId, currentStatus) => {
        try { await api.put(`/admin/bookings/${requestId}/commission-status`, { commission_paid: !currentStatus }); fetchData(); }
        catch (err) { alert('Nie udało się zaktualizować statusu prowizji.'); }
    };
    const openEditModal = (userToEdit) => { setEditingUser(userToEdit); setIsEditModalOpen(true); };
    
    const handleUserUpdate = async (updatedUserData) => {
        try {
            // ✨ POPRAWKA: Używamy doc_id
            await api.put(`/admin/users/${updatedUserData.doc_id}`, updatedUserData);
            setIsEditModalOpen(false); setEditingUser(null); fetchData();
        } catch (err) { alert('Nie udało się zaktualizować użytkownika.'); }
    };

    const handleDeleteUser = async (userDocId) => {
        // ✨ POPRAWKA: Porównujemy docId, a nie numeryczne userId
        if (userDocId === user.docId) { 
            alert("Nie możesz usunąć własnego konta."); 
            return; 
        }
        const confirmation = window.confirm("Czy na pewno chcesz trwale usunąć tego użytkownika i wszystkie jego dane? Tej operacji nie można cofnąć.");
        if (confirmation) {
            try { 
                // ✨ POPRAWKA: Używamy doc_id
                await api.delete(`/admin/users/${userDocId}`); 
                fetchData(); 
            }
            catch (err) { alert('Nie udało się usunąć użytkownika.'); }
        }
    };

    const userTypeMap = { organizer: 'Organizator', food_truck_owner: 'Właściciel' };
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
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th><th style={{ textAlign: 'left', padding: '8px' }}>Email</th><th style={{ textAlign: 'left', padding: '8px' }}>Typ konta</th><th style={{ textAlign: 'left', padding: '8px' }}>Status</th><th style={{ textAlign: 'left', padding: '8px' }}>Liczba profili</th><th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            // ✨ POPRAWKA: Używamy doc_id jako unikalnego klucza
                            <tr key={u.doc_id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{u.user_id}</td><td style={{ padding: '8px' }}>{u.email}</td>
                                <td style={{ padding: '8px' }}>{u.role === 'admin' ? <strong>Admin</strong> : (userTypeMap[u.user_type] || u.user_type)}</td>
                                <td style={{ padding: '8px', color: u.is_blocked ? 'red' : 'green' }}>{u.is_blocked ? 'Zablokowany' : 'Aktywny'}</td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>{u.user_type === 'food_truck_owner' ? u.profile_count : 'N/A'}</td>
                                <td style={{ padding: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {/* ✨ POPRAWKA: Przekazujemy doc_id do wszystkich funkcji akcji */}
                                    <button onClick={() => handleToggleBlock(u.doc_id)} disabled={u.doc_id === user.docId}>{u.is_blocked ? 'Odblokuj' : 'Zablokuj'}</button>
                                    <button onClick={() => openEditModal(u)}>Edytuj</button>
                                    <button onClick={() => handleDeleteUser(u.doc_id)} disabled={u.doc_id === user.docId} style={{backgroundColor: '#dc3545', color: 'white'}}>Usuń</button>
                                    {u.user_type === 'food_truck_owner' && (<button onClick={() => setManagingUser(u)}>Zarządzaj profilami</button>)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 style={{marginTop: '40px'}}>Rezerwacje</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                         <tr style={{ borderBottom: '2px solid black' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th><th style={{ textAlign: 'left', padding: '8px' }}>Food Truck</th><th style={{ textAlign: 'left', padding: '8px' }}>Data eventu</th><th style={{ textAlign: 'left', padding: '8px' }}>Status Rezerwacji</th><th style={{ textAlign: 'left', padding: '8px' }}>Status Prowizji</th><th style={{ textAlign: 'left', padding: '8px' }}>Status Opakowań</th><th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.request_id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{booking.request_id}</td><td style={{ padding: '8px' }}>{booking.company_name}</td>
                                {/* ✨ POPRAWKA: Dodano obsługę daty z Firestore w tabeli */}
                                <td style={{ padding: '8px' }}>{booking.event_start_date?._seconds ? new Date(booking.event_start_date._seconds * 1000).toLocaleDateString('pl-PL') : 'Brak daty'}</td>
                                <td style={{ padding: '8px', color: bookingStatusMap[booking.status]?.color || 'black', fontWeight: 'bold' }}>{bookingStatusMap[booking.status]?.text || booking.status}</td>
                                <td style={{ padding: '8px', color: booking.commission_paid ? 'green' : 'red', fontWeight: 'bold' }}>{booking.commission_paid ? 'Opłacona' : 'Nieopłacona'}</td>
                                <td style={{ padding: '8px', color: booking.packaging_ordered ? 'green' : 'orange', fontWeight: 'bold' }}>{booking.packaging_ordered ? 'Zamówione' : 'Brak zamówienia'}</td>
                                 <td style={{ padding: '8px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleCommissionStatusChange(booking.request_id, booking.commission_paid)}>Prowizja</button>
                                    <button onClick={() => handlePackagingStatusChange(booking.request_id, booking.packaging_ordered)}>Opakowania</button>
                                    <Link to={`/admin/booking/${booking.request_id}`} style={{ padding: '0.6em 1.2em', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '1em', fontFamily: 'inherit', border: '1px solid transparent' }}>
                                        Szczegóły
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 style={{marginTop: '40px'}}>Rozmowy</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid black' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th><th style={{ textAlign: 'left', padding: '8px' }}>Tytuł</th><th style={{ textAlign: 'left', padding: '8px' }}>Uczestnicy</th><th style={{ textAlign: 'left', padding: '8px' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conversations.map(convo => (
                            <tr key={convo.conversation_id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{convo.conversation_id}</td><td style={{ padding: '8px' }}>{convo.title}</td><td style={{ padding: '8px' }}>{convo.participant1_email} <br/> {convo.participant2_email}</td>
                                <td style={{ padding: '8px' }}><button onClick={() => setViewingConversation(convo)}>Podgląd</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default AdminPage;
