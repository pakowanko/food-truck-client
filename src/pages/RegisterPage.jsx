// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ZMIANA: Poprawiona ścieżka do apiConfig.js
import { api } from '../apiConfig.js'; 

const offerOptions = {
  dishes: [
    "Burgery", "Pizza", "Zapiekanki", "Hot-dogi", "Frytki belgijskie", 
    "Nachos", "Kuchnia polska", "Kuchnia azjatycka", "Kuchnia meksykańska", 
    "Lody", "Gofry", "Churros", "Słodkie wypieki"
  ],
  drinks: [
    "Kawa", "Lemoniada", "Napoje bezalkoholowe", "Piwo kraftowe"
  ],
  dietary: [
    "Opcje wegetariańskie", "Opcje wegańskie", "Opcje bezglutenowe"
  ]
};

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
  
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [baseLocation, setBaseLocation] = useState('');
  const [operationRadius, setOperationRadius] = useState('');
  const [offer, setOffer] = useState({
    dishes: [],
    drinks: [],
    dietary: []
  });

  const countries = [
    { code: 'PL', name: 'Polska' }, { code: 'DE', name: 'Niemcy' },
    { code: 'CZ', name: 'Czechy' }, { code: 'SK', name: 'Słowacja' },
  ];

  const handleOfferChange = (category, value, checked) => {
    setOffer(prevOffer => {
      const currentCategoryItems = prevOffer[category];
      let updatedCategoryItems;
      if (checked) {
        updatedCategoryItems = [...currentCategoryItems, value];
      } else {
        updatedCategoryItems = currentCategoryItems.filter(item => item !== value);
      }
      return { ...prevOffer, [category]: updatedCategoryItems };
    });
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
        company_name: isCompany || userType === 'food_truck_owner' ? companyName : null,
        nip: isCompany || userType === 'food_truck_owner' ? nip : null,
        country_code: countryCode,
        ...(userType === 'food_truck_owner' && {
            base_location: baseLocation,
            operation_radius_km: operationRadius,
            offer: offer
        })
    };

    try {
        const response = await api.post('/auth/register', registrationData);
        setMessage('Rejestracja pomyślna! Za chwilę zostaniesz przekierowany do logowania.');
        setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
        setMessage(error.response?.data?.message || error.message || 'Wystąpił nieznany błąd.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Utwórz nowe konto</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Wybierz typ konta:</h3>
        <label style={{ marginRight: '20px' }}>
            <input type="radio" value="organizer" checked={userType === 'organizer'} onChange={(e) => setUserType(e.target.value)} /> Jestem Organizatorem
        </label>
        <label>
            <input type="radio" value="food_truck_owner" checked={userType === 'food_truck_owner'} onChange={(e) => setUserType(e.target.value)} /> Jestem Właścicielem Food Trucka
        </label>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <legend>Dane Podstawowe</legend>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Imię" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nazwisko" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adres e-mail" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Numer telefonu" style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            <div style={{marginTop: '10px'}}>
                <label>Kraj rezydencji podatkowej:</label>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}>
                    {countries.map(country => (<option key={country.code} value={country.code}>{country.name}</option>))}
                </select>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Potwierdź hasło" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
        </fieldset>

        {userType === 'organizer' && (
            <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <legend>Dane Firmy (Opcjonalne)</legend>
                <label><input type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)} /> Rejestruję się jako firma</label>
                {isCompany && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
                        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nazwa firmy" style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
                        <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
                    </div>
                )}
            </fieldset>
        )}

        {userType === 'food_truck_owner' && (
            <>
                <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <legend>Dane Firmy / Food Trucka</legend>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nazwa firmy / działalności" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}/>
                    <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="NIP" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
                    <input value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} placeholder="Lokalizacja bazowa (np. Warszawa, 00-001)" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
                    <input type="number" value={operationRadius} onChange={(e) => setOperationRadius(e.target.value)} placeholder="Zasięg działalności w km (np. 100)" required style={{width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px'}}/>
                </fieldset>

                <fieldset style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <legend>Oferta (zaznacz wszystko, co pasuje)</legend>
                    
                    <h4>Dania i przekąski:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {offerOptions.dishes.map(item => (
                            <label key={item}><input type="checkbox" checked={offer.dishes.includes(item)} onChange={(e) => handleOfferChange('dishes', item, e.target.checked)} /> {item}</label>
                        ))}
                    </div>

                    <h4 style={{marginTop: '20px'}}>Napoje:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {offerOptions.drinks.map(item => (
                             <label key={item}><input type="checkbox" checked={offer.drinks.includes(item)} onChange={(e) => handleOfferChange('drinks', item, e.target.checked)} /> {item}</label>
                        ))}
                    </div>

                    <h4 style={{marginTop: '20px'}}>Opcje dietetyczne:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {offerOptions.dietary.map(item => (
                             <label key={item}><input type="checkbox" checked={offer.dietary.includes(item)} onChange={(e) => handleOfferChange('dietary', item, e.target.checked)} /> {item}</label>
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