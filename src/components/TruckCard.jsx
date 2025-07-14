// src/components/TruckCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Komponent do wyświetlania gwiazdek - jest uniwersalny i nie wymaga zmian.
const StarRatingDisplay = ({ rating, count }) => {
    if (count === 0) return <small style={{ color: '#6c757d' }}>Brak opinii</small>;
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
        stars.push(<span key={i} style={{ color: i <= rating ? '#ffc107' : '#e0e0e0', fontSize: '1.2rem' }}>★</span>);
    }
    return <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{stars} <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>({count})</span></div>;
};

// Style również pozostają bez zmian, są uniwersalne.
const styles = {
    card: {
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        textDecoration: 'none',
        color: 'inherit'
    },
    cardImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        display: 'block',
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
        minHeight: '40px', // Dodajemy minimalną wysokość dla spójnego wyglądu
    },
    cardLink: {
        display: 'inline-block',
        marginTop: '12px',
        fontWeight: 'bold',
    }
};

// ZMIANA: Główny komponent, teraz nazywa się TruckCard
const TruckCard = ({ profile }) => {
  // ZMIANA: Tworzymy tekst specjalizacji na podstawie dań z oferty
  const specializationsText = profile.offer?.dishes?.slice(0, 3).join(', ') || 'Różnorodna oferta';
  // ZMIANA: Używamy pól food trucka do obrazka i nazwy
  const imageUrl = profile.profile_image_url || `https://placehold.co/400x250/FFC107/000000?text=${encodeURIComponent(profile.food_truck_name)}`;

  return (
    // Cała karta jest teraz linkiem do szczegółów
    <Link to={`/profile/${profile.profile_id}`} style={styles.card} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <img 
        src={imageUrl} 
        alt={profile.food_truck_name} 
        style={styles.cardImage} 
      />
      <div style={styles.cardBody}>
        {/* ZMIANA: Wyświetlamy nazwę food trucka */}
        <h3 style={styles.cardTitle}>{profile.food_truck_name}</h3>
        <StarRatingDisplay rating={profile.average_rating} count={profile.review_count} />
        <p style={styles.cardText}>
          {/* ZMIANA: Wyświetlamy główne dania jako specjalność */}
          <strong>Specjalność:</strong> {specializationsText}{profile.offer?.dishes?.length > 3 ? '...' : ''}
        </p>
      </div>
    </Link>
  );
};

export default TruckCard;