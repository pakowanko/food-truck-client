import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig.js';

function RegisterPage() {
  const navigate = useNavigate();
  
  // Stany podstawowe
  const [userType, setUserType] = useState('organizer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Stany dla firmy
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');

  // Nowe, bardziej szczegółowe stany dla food trucka
  const [basePostalCode, setBasePostalCode] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [beverages, setBeverages] = useState([]);
  const [dietaryOptions, setDietaryOptions] = useState([]);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // NOWE, BARDZIEJ SZCZEGÓŁOWE KATEGORIE
  const CUISINE_OPTIONS = ['Burgery', 'Pizza', 'Zapiekanki', 'Hot-dogi', 'Frytki belgijskie', 'Nachos', 'Kuchnia polska', 'Kuchnia azjatycka', 'Kuchnia meksykańska'];
  const DESSERT_OPTIONS = ['Lody', 'Gofry', 'Churros', 'Słodkie wypieki'];
  const BEVERAGE_OPTIONS = ['Kawa', 'Lemoniada', 'Napoje bezalkoholowe', 'Piwo kraftowe'];
  const DIETARY_OPTIONS_LIST = ['Opcje wegetariańskie', 'Opcje wegańskie', 'Opcje bezglutenowe'];

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

    // Łączymy wybrane dania i desery w jedną listę 'cuisine_type'
    const combinedCuisine = [...cuisineTypes, ...beverages];

    const registrationData = {
        email, password, user_type: userType,
        first_name: firstName, last_name: lastName, phone_number: phoneNumber,
        company_name: userType === 'owner' ? companyName : null,
        nip: userType === 'owner' ? nip : null,
        country_code: 'PL', // Na razie na stałe
        // Nowe dane
        base_postal_code: userType === 'owner' ? basePostalCode : null,
        cuisine_type: userType === 'owner' ? combinedCuisine : [],
        dietary_options: userType === 'owner' ? dietaryOptions : [],
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
        {/* ... Pola Dane Logowania i Dane Kontaktowe bez zmian ... */}

        {userType === 'owner' && (
             <>
                <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <legend>Dane Firmy (Właściciela)</legend>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nazwa firmy / działalności" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
                    <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
                    <input value={basePostalCode} onChange={(e) => setBasePostalCode(e.target.value)} placeholder="Kod pocztowy, gdzie głównie stacjonujesz (np. 00-001)" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
                </fieldset>

                <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <legend>Oferta (zaznacz wszystko, co pasuje)</legend>
                    
                    <p>Dania i przekąski:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '5px' }}>
                      {[...CUISINE_OPTIONS, ...DESSERT_OPTIONS].sort().map(item => (
                        <label key={item}><input type="checkbox" value={item} onChange={(e) => handleCheckboxChange(e, cuisineTypes, setCuisineTypes)} /> {item}</label>
                      ))}
                    </div>

                    <p style={{marginTop: '15px'}}>Napoje:</p>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {BEVERAGE_OPTIONS.map(item => (
                        <label key={item}><input type="checkbox" value={item} onChange={(e) => handleCheckboxChange(e, beverages, setBeverages)} /> {item}</label>
                      ))}
                    </div>

                    <p style={{marginTop: '15px'}}>Opcje dietetyczne:</p>
                     <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {DIETARY_OPTIONS_LIST.map(item => (
                        <label key={item}><input type="checkbox" value={item} onChange={(e) => handleCheckboxChange(e, dietaryOptions, setDietaryOptions)} /> {item}</label>
                      ))}
                    </div>
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