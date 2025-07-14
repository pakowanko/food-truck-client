// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
// ZMIANA: Import nowej karty dla food trucka z odpowiedniego folderu
import TruckCard from '../components/TruckCard.jsx'; 
import api from '../api/apiConfig'; // Zakładam, że masz taki plik do konfiguracji API

// ZMIANA: Nowa lista rodzajów kuchni do filtra
const ALL_CUISINES = [
  "Burgery", "Pizza", "Zapiekanki", "Hot-dogi", "Frytki belgijskie", 
  "Nachos", "Kuchnia polska", "Kuchnia azjatycka", "Kuchnia meksykańska", 
  "Lody", "Gofry", "Churros", "Słodkie wypieki", "Kawa", "Lemoniada",
  "Napoje bezalkoholowe", "Piwo kraftowe", "Opcje wegetariańskie",
  "Opcje wegańskie", "Opcje bezglutenowe"
];

function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ZMIANA: Stany dla nowych filtrów
  const [postalCode, setPostalCode] = useState('');
  const [cuisine, setCuisine] = useState(''); // Zmieniono z 'specialization'

  const fetchProfiles = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(filters);
      // Używamy instancji axios z apiConfig
      const response = await api.get(`/profiles?${params.toString()}`);
      setProfiles(response.data);
    } catch (err) {
      setError(err.message || 'Nie udało się pobrać danych.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    // ZMIANA: Używamy 'cuisine' jako klucza filtra dla backendu
    if (cuisine) filters.cuisine = cuisine;
    if (postalCode) filters.postal_code = postalCode;
    fetchProfiles(filters);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* ZMIANA: Nowy nagłówek */}
      <h1>Znajdź food trucka na swoją imprezę</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        {/* ZMIANA: Filtr rodzajów kuchni */}
        <select value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ padding: '10px' }}>
          <option value="">Wybierz rodzaj kuchni...</option>
          {ALL_CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input 
          type="text" 
          value={postalCode}
          onChange={e => setPostalCode(e.target.value)}
          placeholder="Wpisz miasto lub kod pocztowy..."
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Szukaj</button>
      </form>

      {/* ZMIANA: Zaktualizowane komunikaty */}
      {loading && <p>Ładowanie listy food trucków...</p>}
      {error && <p style={{ color: 'red' }}>Błąd: {error}</p>}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {profiles.length > 0 ? (
            profiles.map(profile => (
              // ZMIANA: Użycie komponentu TruckCard
              <TruckCard key={profile.profile_id} profile={profile} />
            ))
          ) : (
            <p>Nie znaleziono żadnych food trucków spełniających Twoje kryteria.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;