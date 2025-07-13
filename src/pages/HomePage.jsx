import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Dodajemy Link
import API_URL from '../apiConfig.js'; // POPRAWIONA ŚCIEŻKA IMPORTU

// Prosty komponent karty dla food trucka
const TruckCard = ({ truck }) => {
  const imageUrl = truck.profile_image_url || `https://placehold.co/400x250/FF5722/FFFFFF?text=${encodeURIComponent(truck.truck_name)}`;
  const cuisineText = truck.cuisine_type?.join(', ') || 'Brak danych';

  const styles = {
    card: {
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out',
        width: '300px'
    },
    cardImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    cardBody: {
        padding: '16px',
    },
    cardTitle: {
        margin: '0 0 8px 0',
    },
    cardText: {
        margin: '4px 0',
        color: 'var(--light-text)',
        fontSize: '0.9rem',
    },
    cardLink: {
        display: 'inline-block',
        marginTop: '12px',
        fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.card}>
      <img src={imageUrl} alt={truck.truck_name} style={styles.cardImage} />
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{truck.truck_name}</h3>
        <p style={styles.cardText}>
          <strong>Kuchnia:</strong> {cuisineText}
        </p>
        <Link to={`/truck/${truck.profile_id}`} style={styles.cardLink}>
          Zobacz szczegóły &rarr;
        </Link>
      </div>
    </div>
  );
};


function HomePage() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrucks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/api/trucks`);
        if (!response.ok) throw new Error("Błąd ładowania danych.");
        const data = await response.json();
        setTrucks(data);
      } catch (error) {
        console.error("Błąd pobierania food trucków:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrucks();
  }, []);


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Znajdź najlepszego Food Trucka na swoje wydarzenie</h1>
        <p style={{fontSize: '1.2rem', color: 'var(--light-text)'}}>Przeglądaj, rezerwuj i ciesz się smakiem!</p>
      </div>

      {loading && <p>Ładowanie food trucków...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      {!loading && !error && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {trucks.length > 0 ? (
            trucks.map(truck => (
              <TruckCard key={truck.profile_id} truck={truck} />
            ))
          ) : (
            <p>Obecnie nie ma żadnych dostępnych food trucków.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;