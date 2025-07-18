import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { api } from '../apiConfig.js';

function MyAccountPage() {
    const { user } = useContext(AuthContext);
    
    // Stany dla formularzy
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    
    // Stany do obsługi komunikatów
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Pobieramy aktualne dane użytkownika przy pierwszym ładowaniu
        if (user) {
            setLoading(true);
            api.get('/auth/profile')
                .then(response => {
                    setFormData(response.data);
                })
                .catch(() => setError("Nie udało się wczytać danych profilu."))
                .finally(() => setLoading(false));
        }
    }, [user]);

    // Handlery do zmiany wartości w polach
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    // Handler do wysłania formularza z danymi profilu
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage(''); 
        setError('');
        try {
            await api.put('/users/me', formData);
            setMessage('Dane zaktualizowane pomyślnie!');
        } catch (err) {
            setError('Nie udało się zaktualizować danych.');
        }
    };

    // Handler do wysłania formularza zmiany hasła
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMessage(''); 
        setError('');
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError('Nowe hasła nie są takie same.');
            return;
        }
        try {
            const response = await api.put('/users/me/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage(response.data.message);
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Resetuj pola
        } catch (err) {
            setError(err.response?.data?.message || 'Nie udało się zmienić hasła.');
        }
    };

    // Style dla spójnego wyglądu formularza
    const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', marginTop: '5px' };
    const labelStyle = { display: 'block', marginTop: '15px', fontWeight: 'bold' };
    const fieldsetStyle = { border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginTop: '2rem' };

    if (loading) return <p>Ładowanie danych konta...</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
            <h1>Moje Konto</h1>
            {message && <p style={{ color: 'green', border: '1px solid green', padding: '10px', borderRadius: '5px' }}>{message}</p>}
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px' }}>{error}</p>}

            <form onSubmit={handleProfileUpdate}>
                <fieldset style={fieldsetStyle}>
                    <legend><h2>Twoje dane</h2></legend>
                    
                    <label style={labelStyle} htmlFor="first_name">Imię</label>
                    <input style={inputStyle} id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleChange} />
                    
                    <label style={labelStyle} htmlFor="last_name">Nazwisko</label>
                    <input style={inputStyle} id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleChange} />

                    <label style={labelStyle} htmlFor="phone_number">Numer telefonu</label>
                    <input style={inputStyle} id="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />

                    {user.user_type === 'food_truck_owner' && (
                        <>
                            <label style={labelStyle} htmlFor="company_name">Nazwa firmy</label>
                            <input style={inputStyle} id="company_name" name="company_name" value={formData.company_name || ''} onChange={handleChange} />

                            <label style={labelStyle} htmlFor="nip">NIP</label>
                            <input style={inputStyle} id="nip" name="nip" value={formData.nip || ''} onChange={handleChange} />

                            <label style={labelStyle} htmlFor="street_address">Ulica i numer</label>
                            <input style={inputStyle} id="street_address" name="street_address" value={formData.street_address || ''} onChange={handleChange} />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                                <div>
                                    <label style={labelStyle} htmlFor="postal_code">Kod pocztowy</label>
                                    <input style={inputStyle} id="postal_code" name="postal_code" value={formData.postal_code || ''} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={labelStyle} htmlFor="city">Miasto</label>
                                    <input style={inputStyle} id="city" name="city" value={formData.city || ''} onChange={handleChange} />
                                </div>
                            </div>
                        </>
                    )}
                    <button type="submit" style={{ ...inputStyle, marginTop: '20px', cursor: 'pointer', backgroundColor: 'var(--dark-text)', color: 'white' }}>Zapisz zmiany w profilu</button>
                </fieldset>
            </form>

            <form onSubmit={handlePasswordUpdate}>
                <fieldset style={fieldsetStyle}>
                    <legend><h2>Zmień hasło</h2></legend>
                    
                    <label style={labelStyle} htmlFor="currentPassword">Obecne hasło</label>
                    <input style={inputStyle} id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                    
                    <label style={labelStyle} htmlFor="newPassword">Nowe hasło</label>
                    <input style={inputStyle} id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                    
                    <label style={labelStyle} htmlFor="confirmNewPassword">Potwierdź nowe hasło</label>
                    <input style={inputStyle} id="confirmNewPassword" type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} required />
                    
                    <button type="submit" style={{ ...inputStyle, marginTop: '20px', cursor: 'pointer', backgroundColor: 'var(--primary-red)', color: 'white' }}>Zmień hasło</button>
                </fieldset>
            </form>
        </div>
    );
}

export default MyAccountPage;