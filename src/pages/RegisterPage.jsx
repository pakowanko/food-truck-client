import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../apiConfig.js';
import { AuthContext } from '../AuthContext.jsx';

// Prosty komponent ikony oka
const EyeIcon = ({ size = 24, color = '#6c757d' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = ({ size = 24, color = '#6c757d' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

function RegisterPage() {
    // Style dla formularza
    const inputStyle = {
        width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #ccc',
        borderRadius: '5px', boxSizing: 'border-box', height: '48px'
    };
    const formRowStyle = { marginTop: '15px' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500' };

    // Stany komponentu
    const [userType, setUserType] = useState('organizer');
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone_number: '', country_code: 'PL',
        password: '', confirmPassword: '', company_name: '', nip: ''
    });
    const [streetAddress, setStreetAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            ...formData, user_type: userType,
            street_address: streetAddress, postal_code: postalCode, city: city
        };

        try {
            const response = await api.post('/auth/register', submissionData);
            setMessage(response.data.message);
            setRegistrationSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setMessage('');
        try {
            const response = await api.post('/auth/google-login', { credential: credentialResponse.credential });
            const data = response.data;
            login(data, data.token);

            if (data.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (error) {
            setLoading(false);
            setError(error.response?.data?.message || 'Błąd logowania przez Google.');
        }
      };
    
      const handleGoogleError = () => {
        setError('Logowanie przez Google nie powiodło się. Spróbuj ponownie.');
      };

    if (registrationSuccess) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', maxWidth: '600px', margin: '2rem auto', border: '1px solid #eee', borderRadius: '8px' }}>
                <h1>Rejestracja prawie ukończona!</h1>
                <p style={{ color: 'green', fontSize: '1.2rem' }}>{message}</p>
                <p>Wysłaliśmy link aktywacyjny na Twój adres e-mail. Sprawdź swoją skrzynkę odbiorczą (oraz folder spam), aby dokończyć proces.</p>
                <Link to="/" style={{marginTop: '20px', display: 'inline-block'}}>Powrót na stronę główną</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
            <h1>Utwórz nowe konto</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <fieldset style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                    <legend>Wybierz typ konta:</legend>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label><input type="radio" name="userType" value="organizer" checked={userType === 'organizer'} onChange={(e) => setUserType(e.target.value)} /> Jestem Organizatorem</label>
                        <label><input type="radio" name="userType" value="food_truck_owner" checked={userType === 'food_truck_owner'} onChange={(e) => setUserType(e.target.value)} /> Jestem Właścicielem Food Trucka</label>
                    </div>
                </fieldset>

                <fieldset style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                    <legend>Dane podstawowe</legend>
                    <div style={formRowStyle}><label htmlFor="first_name" style={labelStyle}>Imię</label><input id="first_name" type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={inputStyle} /></div>
                    <div style={formRowStyle}><label htmlFor="last_name" style={labelStyle}>Nazwisko</label><input id="last_name" type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={inputStyle} /></div>
                    <div style={formRowStyle}><label htmlFor="email" style={labelStyle}>Adres e-mail</label><input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} /></div>
                    <div style={formRowStyle}><label htmlFor="phone_number" style={labelStyle}>Numer telefonu</label><input id="phone_number" type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required style={inputStyle} /></div>
                    <div style={formRowStyle}><label htmlFor="country_code" style={labelStyle}>Kraj rezydencji podatkowej</label><select id="country_code" name="country_code" value={formData.country_code} onChange={handleChange} style={inputStyle}><option value="PL">Polska</option></select></div>
                    <div style={formRowStyle}>
                        <label htmlFor="password" style={labelStyle}>Hasło</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required style={{...inputStyle, paddingRight: '50px'}} />
                            <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', cursor: 'pointer', display: 'flex' }}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </div>
                        </div>
                    </div>
                    <div style={formRowStyle}>
                        <label htmlFor="confirmPassword" style={labelStyle}>Potwierdź hasło</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{...inputStyle, paddingRight: '50px'}} />
                            <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '15px', cursor: 'pointer', display: 'flex' }}>
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </div>
                        </div>
                    </div>
                </fieldset>

                {userType === 'food_truck_owner' && (
                    <fieldset style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                        <legend>Dane Firmy</legend>
                        <div style={formRowStyle}><label htmlFor="company_name" style={labelStyle}>Nazwa firmy / działalności</label><input id="company_name" type="text" name="company_name" value={formData.company_name} onChange={handleChange} required={userType === 'food_truck_owner'} style={inputStyle} /></div>
                        <div style={formRowStyle}>
                            <label htmlFor="nip" style={labelStyle}>NIP</label>
                            <input id="nip" type="text" name="nip" value={formData.nip} onChange={handleChange} required={userType === 'food_truck_owner'} style={inputStyle} />
                        </div>
                        <div style={formRowStyle}><label htmlFor="streetAddress" style={labelStyle}>Ulica i numer</label><input id="streetAddress" type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required={userType === 'food_truck_owner'} style={inputStyle} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', ...formRowStyle }}>
                            <div><label htmlFor="postalCode" style={labelStyle}>Kod pocztowy</label><input id="postalCode" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required={userType === 'food_truck_owner'} style={inputStyle} /></div>
                            <div><label htmlFor="city" style={labelStyle}>Miasto</label><input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required={userType === 'food_truck_owner'} style={inputStyle} /></div>
                        </div>
                    </fieldset>
                )}

                <div style={formRowStyle}><label><input type="checkbox" required /> Akceptuję <a href="/regulamin" target="_blank" style={{color: 'var(--primary-red)'}}>regulamin</a> serwisu.</label></div>
                <button type="submit" disabled={loading} style={{ ...inputStyle, backgroundColor: 'var(--primary-red)', color: 'white', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>{loading ? 'Rejestrowanie...' : 'Zarejestruj się'}</button>
            </form>

            <div style={{ textAlign: 'center', margin: '20px 0', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <hr style={{flex: 1, borderTop: '1px solid #ddd'}} />
                <span>LUB</span>
                <hr style={{flex: 1, borderTop: '1px solid #ddd'}} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                />
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
            
            <p style={{ marginTop: '20px', textAlign: 'center' }}>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
        </div>
    );
}

export default RegisterPage;