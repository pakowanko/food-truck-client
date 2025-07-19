import React, { useState, useEffect } from 'react';
import TruckCard from '../components/TruckCard.jsx';
import { api } from '../apiConfig.js';

const ALL_CUISINES = [
  "Burgery", "Pizza", "Zapiekanki", "Hot-dogi", "Frytki belgijskie", "Nachos", "Kuchnia polska", "Kuchnia azjatycka", "Kuchnia meksykańska", "Lody", "Gofry", "Churros", "Słodkie wypieki", "Kawa", "Lemoniada", "Napoje bezalkoholowe", "Piwo kraftowe"
];

function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stany dla filtrów
  const [postalCode, setPostalCode] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [longTermRental, setLongTermRental] = useState(false);

  const fetchProfiles = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      // Usuwamy puste filtry, aby nie wysyłać ich do API
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
      min_rating: minRating,
      long_term_rental: longTermRental
    };
    fetchProfiles(filters);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Znajdź food trucka na swoją imprezę</h1>
      <form onSubmit={handleSearch} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'flex-end' }}>
          
          <select value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ padding: '10px', height: '45px' }}>
            <option value="">Wszystkie kuchnie</option>
            {ALL_CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Wpisz miasto lub kod..." style={{ padding: '10px', height: '45px' }}/>
          
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '10px', height: '45px' }} title="Data rozpoczęcia"/>
          
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '10px', height: '45px' }} title="Data zakończenia"/>
          
          <select value={minRating} onChange={e => setMinRating(e.target.value)} style={{ padding: '10px', height: '45px' }}>
              <option value="">Dowolna ocena</option>
              <option value="4">4 gwiazdki i więcej</option>
              <option value="3">3 gwiazdki i więcej</option>
              <option value="2">2 gwiazdki i więcej</option>
          </select>
        </div>
        
        <div style={{ marginTop: '15px' }}>
            <label>
                <input 
                    type="checkbox" 
                    checked={longTermRental} 
                    onChange={(e) => setLongTermRental(e.target.checked)} 
                />
                Szukam tylko wynajmu długoterminowego
            </label>
        </div>

        <button type="submit" style={{ padding: '12px 20px', width: '100%', marginTop: '20px' }}>Szukaj</button>
      </form>
      
      {loading && <p>Ładowanie listy food trucków...</p>}
      {error && <p style={{ color: 'red' }}>Błąd: {error}</p>}
      
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {profiles.length > 0 ? (
            profiles.map(profile => (
              <TruckCard key={profile.profile_id} profile={profile} />
            ))
          ) : (
            <p>Nie znaleziono żadnych food trucków pasujących do Twoich kryteriów.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;