import React, { useState, useEffect } from 'react';
import TruckCard from '../components/TruckCard.jsx';
import { api } from '../apiConfig.js';

const ALL_CUISINES = [
  "Burgery", "Churros", "Frytki belgijskie", "Gofry", "Granita", "Hot-dogi", 
  "Kebab", "Kuchnia azjatycka", "Kuchnia meksykańska", "Kuchnia polska", 
  "Lody", "Nachos", "Pizza", "Słodkie wypieki", "Zakręcony ziemniak", "Zapiekanki"
];

function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [postalCode, setPostalCode] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [longTermRental, setLongTermRental] = useState(false);
  
  // --- ZMIANA: Stan dla ocen został zakomentowany ---
  // const [minRating, setMinRating] = useState('');

  const fetchProfiles = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== '' && v !== false));
      const params = new URLSearchParams(activeFilters);
      
      const response = await api.get(`/profiles?${params.toString()}`);
      setProfiles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message || 'Nie udało się pobrać danych.');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {
      cuisine: cuisine,
      postal_code: postalCode,
      event_start_date: startDate,
      event_end_date: endDate,
      long_term_rental: longTermRental,
      // --- ZMIANA: Filtr ocen został zakomentowany ---
      // min_rating: minRating,
    };
    fetchProfiles(filters);
  };

  const searchInputStyle = {
      width: '100%',
      padding: '10px',
      height: '45px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      boxSizing: 'border-box'
  };
  const labelStyle = { 
    display: 'block', 
    marginBottom: '5px', 
    fontWeight: '500', 
    fontSize: '0.9rem', 
    color: '#333' 
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Znajdź food trucka na swoją imprezę</h1>
      <form onSubmit={handleSearch} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
          
          <div>
            <label htmlFor="cuisine" style={labelStyle}>Rodzaj kuchni</label>
            <select id="cuisine" value={cuisine} onChange={e => setCuisine(e.target.value)} style={searchInputStyle}>
              <option value="">Wszystkie kuchnie</option>
              {ALL_CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="postalCode" style={labelStyle}>Lokalizacja</label>
            <input id="postalCode" type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Wpisz miasto lub kod..." style={searchInputStyle}/>
          </div>
          
          <div>
            <label htmlFor="startDate" style={labelStyle}>Data od</label>
            <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={searchInputStyle} title="Data rozpoczęcia"/>
          </div>

          <div>
            <label htmlFor="endDate" style={labelStyle}>Data do</label>
            <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={searchInputStyle} title="Data zakończenia"/>
          </div>
          
          {/* --- ZMIANA: Pole filtra ocen zostało zakomentowane --- */}
          {/*
          <div>
            <label htmlFor="minRating" style={labelStyle}>Ocena</label>
            <select id="minRating" value={minRating} onChange={e => setMinRating(e.target.value)} style={searchInputStyle}>
              <option value="">Dowolna ocena</option>
              <option value="4">4 gwiazdki i więcej</option>
              <option value="3">3 gwiazdki i więcej</option>
              <option value="2">2 gwiazdki i więcej</option>
            </select>
          </div>
          */}
        </div>
        
        <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                    type="checkbox" 
                    checked={longTermRental} 
                    onChange={(e) => setLongTermRental(e.target.checked)} 
                />
                Szukam tylko wynajmu długoterminowego
            </label>
        </div>

        <button type="submit" style={{ padding: '12px 20px', width: '100%', marginTop: '20px', border: 'none', backgroundColor: 'var(--primary-red)', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>Szukaj</button>
      </form>
      
      {loading && <p style={{textAlign: 'center'}}>Ładowanie listy food trucków...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Błąd: {error}</p>}
      
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {profiles.length > 0 ? (
            profiles.map(profile => (
              <TruckCard key={profile_id} profile={profile} />
            ))
          ) : (
            <p style={{textAlign: 'center'}}>Nie znaleziono żadnych food trucków pasujących do Twoich kryteriów.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;