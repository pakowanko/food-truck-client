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

  // Nowe stany dla formularza właściciela food trucka
  const [basePostalCode, setBasePostalCode] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [avgPriceRange, setAvgPriceRange] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Opcje do wyboru w formularzu
  const CUISINE_OPTIONS = ['Burgery', 'Pizza', 'Włoska', 'Azjatycka', 'Meksykańska', 'Wegetariańska/Wegańska', 'Kawa i Desery', 'Polska'];
  const DIETARY_OPTIONS = ['Wegetariańskie', 'Wegańskie', 'Bezglutenowe'];
  const PRICE_RANGES = ['do 30 zł', '30-50 zł', 'powyżej 50 zł'];

  const handleCheckboxChange = (e, state, setState) => {
    const { value, checked } = e.target;
    if (checked) {
      setState([...state, value]);
    } else {
      setState(state.filter((item) => item !== value));
    }
  };

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
        country_code: countryCode,
        // Nowe dane wysyłane do API
        base_postal_code: userType === 'owner' ? basePostalCode : null,
        cuisine_type: userType === 'owner' ? cuisineTypes : [],
        dietary_options: userType === 'owner' ? dietaryOptions : [],
        avg_price_range: userType === 'owner' ? avgPriceRange : null,
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
             <>
                <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <legend>Dane Firmy (Właściciela)</legend>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nazwa firmy / działalności" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
                    <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
                </fieldset>

                <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <legend>Informacje o Food Trucku</legend>
                    <input value={basePostalCode} onChange={(e) => setBasePostalCode(e.target.value)} placeholder="Kod pocztowy, gdzie głównie stacjonujesz" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px'}}/>
                    
                    <p>Rodzaj kuchni (zaznacz główne):</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '5px' }}>
                        {CUISINE_OPTIONS.map(cuisine => (
                        <label key={cuisine}><input type="checkbox" value={cuisine} onChange={(e) => handleCheckboxChange(e, cuisineTypes, setCuisineTypes)} /> {cuisine}</label>
                        ))}
                    </div>

                    <p style={{marginTop: '15px'}}>Dostępne opcje dietetyczne:</p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {DIETARY_OPTIONS.map(option => (
                        <label key={option}><input type="checkbox" value={option} onChange={(e) => handleCheckboxChange(e, dietaryOptions, setDietaryOptions)} /> {option}</label>
                        ))}
                    </div>

                    <p style={{marginTop: '15px'}}>Średnia cena za posiłek:</p>
                    <select value={avgPriceRange} onChange={(e) => setAvgPriceRange(e.target.value)} required style={{width: '100%', padding: '8px'}}>
                        <option value="">Wybierz przedział...</option>
                        {PRICE_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                    </select>
                </fieldset>
             </>
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