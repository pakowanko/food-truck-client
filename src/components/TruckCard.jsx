import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
    card: {
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column'
    },
    cardImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        display: 'block',
        backgroundColor: '#f0f0f0'
    },
    cardBody: {
        padding: '16px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    cardTitle: {
        margin: '0 0 8px 0',
    },
    cardText: {
        margin: '4px 0',
        color: 'var(--light-text)',
        fontSize: '0.9rem',
        flexGrow: 1,
    },
    cardLink: {
        display: 'inline-block',
        marginTop: '12px',
        fontWeight: 'bold',
    }
};

const TruckCard = ({ profile }) => {
  const offerSummary = profile.offer?.dishes?.slice(0, 3).join(', ') || 'Różnorodna kuchnia';
  const imageUrl = profile.profile_image_url || `https://placehold.co/400x250/F0AD4E/343A40?text=${encodeURIComponent(profile.food_truck_name)}`;

  return (
    // ✨ OSTATECZNA POPRAWKA: Używamy `profile.doc_id` do tworzenia linku.
    // To pole jest zawsze dostępne i unikalne.
    <Link to={`/profile/${profile.doc_id}`} style={styles.card}>
      <img 
        src={imageUrl} 
        alt={profile.food_truck_name} 
        style={styles.cardImage} 
      />
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{profile.food_truck_name}</h3>
        <p style={styles.cardText}>
          <strong>Główne dania:</strong> {offerSummary}{profile.offer?.dishes?.length > 3 ? '...' : ''}
        </p>
        <span style={styles.cardLink}>
          Zobacz szczegóły &rarr;
        </span>
      </div>
    </Link>
  );
};

export default TruckCard;