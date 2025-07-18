// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import TruckCard from '../components/TruckCard.jsx';
import { api } from '../apiConfig.js';

const ALL_CUISINES = [ /* ... lista kuchni bez zmian ... */ ];

function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stany dla filtrów
  const [postalCode, setPostalCode] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [eventDate, setEventDate] = useState(''); // <-- NOWY STAN
  const [minRating, setMinRating] = useState(''); // <-- NOWY STAN

  const fetchProfiles = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      // Usuwamy puste filtry, aby nie wysyłać ich do API
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''));
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
      event_date: eventDate, // <-- NOWY FILTR
      min_rating: minRating  // <-- NOWY FILTR
    };
    fetchProfiles(filters);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Znajdź food trucka na swoją imprezę</h1>
      <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px', alignItems: 'flex-end' }}>
        
        {/* Pole kuchni (bez zmian) */}
        <select value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ padding: '10px' }}>
          <option value="">Wszystkie kuchnie</option>
          {ALL_CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        {/* Pole lokalizacji (bez zmian) */}
        <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Wpisz miasto lub kod..." style={{ padding: '10px' }}/>
        
        {/* --- NOWE POLA --- */}
        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ padding: '10px' }} title="Wybierz datę wydarzenia"/>
        
        <select value={minRating} onChange={e => setMinRating(e.target.value)} style={{ padding: '10px' }}>
            <option value="">Dowolna ocena</option>
            <option value="4">4 gwiazdki i więcej</option>
            <option value="3">3 gwiazdki i więcej</option>
            <option value="2">2 gwiazdki i więcej</option>
        </select>
        
        <button type="submit" style={{ padding: '10px 20px', gridColumn: '1 / -1' }}>Szukaj</button>
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