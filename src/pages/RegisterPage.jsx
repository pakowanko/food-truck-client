import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig.js';

function RegisterPage() {
    const [userType, setUserType] = useState('organizer');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        country_code: 'PL',
        password: '',
        confirmPassword: '',
        company_name: '',
        nip: ''
    });
    const [streetAddress, setStreetAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFetchGusData = async () => {
        if (!formData.nip) {
            setError('Wpisz numer NIP, aby pobrać dane.');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('Pobieranie danych z GUS...');
        try {
            const { data } = await api.get(`/gus/company-data/${formData.nip}`);
            setFormData({ ...formData, company_name: data.company_name });
            setStreetAddress(data.street_address);
            setPostalCode(data.postal_code);
            setCity(data.city);
            setMessage('Dane pobrane pomyślnie!');
        } catch (err) {
            setError(err.response?.data?.message || 'Nie udało się pobrać danych z GUS.');
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            setError("Hasła nie są takie same.");
            return;
        }

        setLoading(true);

        const submissionData = {
            ...formData,
            user_type: userType,
            street_address: streetAddress,
            postal_code: postalCode,
            city: city
        };

        try {
            await api.post('/auth/register', submissionData);
            setMessage('Rejestracja pomyślna! Za chwilę zostaniesz przekierowany do strony logowania.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
            <h1>Utwórz nowe konto</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                    <legend>Wybierz typ konta:</legend>
                    <label style={{ marginRight: '20px' }}>
                        <input type="radio" name="userType" value="organizer" checked={userType === 'organizer'} onChange={(e) => setUserType(e.target.value)} />
                        Jestem Organizatorem
                    </label>
                    <label>
                        <input type="radio" name="userType" value="food_truck_owner" checked={userType === 'food_truck_owner'} onChange={(e) => setUserType(e.target.value)} />
                        Jestem Właścicielem Food Trucka
                    </label>
                </fieldset>

                <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                    <legend>Dane podstawowe</legend>
                    <input type="text" name="first_name" placeholder="Imię" value={formData.first_name} onChange={handleChange} required style={{width: '100%'}}/>
                    <input type="text" name="last_name" placeholder="Nazwisko" value={formData.last_name} onChange={handleChange} required style={{ marginTop: '10px', width: '100%' }}/>
                    <input type="email" name="email" placeholder="Adres e-mail" value={formData.email} onChange={handleChange} required style={{ marginTop: '10px', width: '100%' }}/>
                    <input type="tel" name="phone_number" placeholder="Numer telefonu" value={formData.phone_number} onChange={handleChange} required style={{ marginTop: '10px', width: '100%' }}/>
                    <select name="country_code" value={formData.country_code} onChange={handleChange} style={{ marginTop: '10px', width: '100%', padding: '8px' }}>
                        <option value="PL">Polska</option>
                    </select>
                    <input type="password" name="password" placeholder="Hasło" value={formData.password} onChange={handleChange} required style={{ marginTop: '10px', width: '100%' }}/>
                    <input type="password" name="confirmPassword" placeholder="Potwierdź hasło" value={formData.confirmPassword} onChange={handleChange} required style={{ marginTop: '10px', width: '100%' }}/>
                </fieldset>

                {userType === 'food_truck_owner' && (
                    <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                        <legend>Dane Firmy</legend>
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: 0 }}>Jako właściciel food trucka musisz podać dane swojej działalności.</p>
                        
                        <div style={{ marginTop: '15px' }}>
                            <label htmlFor="company_name" style={{ display: 'block', marginBottom: '5px' }}>Nazwa firmy / działalności</label>
                            <input id="company_name" type="text" name="company_name" value={formData.company_name} onChange={handleChange} required={userType === 'food_truck_owner'} style={{ width: '100%' }} />
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label htmlFor="nip" style={{ display: 'block', marginBottom: '5px' }}>NIP</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input id="nip" type="text" name="nip" value={formData.nip} onChange={handleChange} required={userType === 'food_truck_owner'} style={{ width: '100%', flex: 1 }}/>
                                <button type="button" onClick={handleFetchGusData} disabled={loading} style={{ padding: '8px 12px' }}>
                                    {loading ? '...' : 'Pobierz dane z GUS'}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label htmlFor="streetAddress" style={{ display: 'block', marginBottom: '5px' }}>Ulica i numer</label>
                            <input id="streetAddress" type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required={userType === 'food_truck_owner'} style={{ width: '100%' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '15px' }}>
                            <div>
                                <label htmlFor="postalCode" style={{ display: 'block', marginBottom: '5px' }}>Kod pocztowy</label>
                                <input id="postalCode" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required={userType === 'food_truck_owner'} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>Miasto</label>
                                <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required={userType === 'food_truck_owner'} style={{ width: '100%' }} />
                            </div>
                        </div>
                    </fieldset>
                )}

                <label>
                    <input type="checkbox" required /> Akceptuję <a href="/regulamin" target="_blank">regulamin</a> serwisu.
                </label>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}

                <button type="submit" disabled={loading} style={{ padding: '15px', fontSize: '1.2em' }}>
                    {loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                </button>
            </form>
        </div>
    );
}

export default RegisterPage;