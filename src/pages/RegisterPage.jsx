import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig.js';

function RegisterPage() {
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState('organizer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('PL'); 
  
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Hasła nie są takie same.');
      return;
    }
    if (!termsAccepted) {
        setMessage('Musisz zaakceptować regulamin.');
        return;
    }
    setLoading(true);
    setMessage('');

    const registrationData = {
        email, password, user_type: userType,
        first_name: firstName, last_name: lastName, phone_number: phoneNumber,
        company_name: userType === 'owner' ? companyName : null,
        nip: userType === 'owner' ? nip : null,
        country_code: countryCode
    };

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Wystąpił błąd.');
        setMessage('Rejestracja pomyślna! Za chwilę zostaniesz przekierowany do logowania.');
        setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
        setMessage(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px' }}>
      <h1>Utwórz nowe konto</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Wybierz typ konta:</h3>
        <label style={{ marginRight: '20px' }}>
            <input type="radio" value="organizer" checked={userType === 'organizer'} onChange={(e) => setUserType(e.target.value)} /> Jestem Organizatorem
        </label>
        <label>
            <input type="radio" value="owner" checked={userType === 'owner'} onChange={(e) => setUserType(e.target.value)} /> Jestem Właścicielem Food Trucka
        </label>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <legend>Dane Logowania</legend>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adres e-mail" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Potwierdź hasło" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
        </fieldset>
        
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <legend>Dane Kontaktowe</legend>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Imię" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nazwisko" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Numer telefonu" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
        </fieldset>

        {userType === 'owner' && (
             <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <legend>Dane Firmy (Właściciela)</legend>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nazwa firmy / działalności" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
                <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            </fieldset>
        )}
        
        <div style={{ marginTop: '10px' }}><label><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} /> Akceptuję regulamin serwisu.</label></div>
        
        {message && <p style={{ color: message.startsWith('Rejestracja') ? 'green' : 'red', textAlign: 'center' }}>{message}</p>}

        <button type="submit" disabled={loading} style={{ marginTop: '10px', width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>
            {loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
        </button>
      </form>

       <p style={{ marginTop: '20px', textAlign: 'center' }}>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
    </div>
  );
}
export default RegisterPage;