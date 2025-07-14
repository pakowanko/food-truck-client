// src/pages/TruckDetailsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
// ZMIANA: Poprawione ścieżki
import { AuthContext } from '../AuthContext.jsx';
import { api } from '../apiConfig.js'; 

// Komponent do wyświetlania gwiazdek (bez zmian)
const StarRatingDisplay = ({ rating }) => {
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <span key={i} style={{ color: i <= rating ? 'gold' : 'grey', fontSize: '1.5rem' }}>★</span>
        );
    }
    return <div>{stars}</div>;
};

function TruckDetailsPage() {
  const { profileId } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/profiles/${profileId}`),
          api.get(`/reviews/profile/${profileId}`)
        ]);
        
        setProfile(profileRes.data);
        setReviews(reviewsRes.data);

        if (reviewsRes.data.length > 0) {
          const totalRating = reviewsRes.data.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(totalRating / reviewsRes.data.length);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Nie udało się pobrać danych.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileId]);
  
  const styles = {
    section: { marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' },
    gallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
    galleryImage: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' },
    tag: { background: '#e9e9e9', padding: '5px 10px', borderRadius: '15px' },
    bookButton: { display: 'inline-block', padding: '15px 30px', fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none', color: 'white', backgroundColor: '#D9534F', borderRadius: '5px', textAlign: 'center' } // Używamy koloru z nowego CSS
  };

  if (loading) return <p>Ładowanie profilu food trucka...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>Nie znaleziono tego food trucka.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1>{profile.food_truck_name}</h1>
      <p>{profile.food_truck_description}</p>
      {profile.website_url && <p><strong>Strona WWW:</strong> <a href={profile.website_url} target="_blank" rel="noopener noreferrer">{profile.website_url}</a></p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
        <StarRatingDisplay rating={averageRating} />
        <span>({averageRating.toFixed(2)} / 5 na podstawie {reviews.length} opinii)</span>
      </div>
      
      {user && user.user_type === 'organizer' && (
        <div style={{margin: '30px 0'}}>
            <Link to={`/booking/${profile.profile_id}`} style={styles.bookButton}>
                Zarezerwuj ten Food Truck
            </Link>
        </div>
      )}

      <section style={styles.section}>
        <h3>Kluczowe informacje</h3>
        <ul>
          <li><strong>Doświadczenie w branży:</strong> {profile.experience_years || 'Nie podano'} lat</li>
          <li><strong>Obszar działania:</strong> Do {profile.operation_radius_km || 'N/A'} km od {profile.base_location || 'N/A'}</li>
          {profile.certifications?.length > 0 && <li><strong>Certyfikaty:</strong> {profile.certifications.join(', ')}</li>}
        </ul>
      </section>

      {profile.offer && (
        <section style={styles.section}>
          <h3>Oferta</h3>
          {profile.offer.dishes?.length > 0 && (
            <div style={{marginBottom: '15px'}}>
              <h4>Dania i przekąski</h4>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                {profile.offer.dishes.map(item => <span key={item} style={styles.tag}>{item}</span>)}
              </div>
            </div>
          )}
          {profile.offer.drinks?.length > 0 && (
            <div style={{marginBottom: '15px'}}>
              <h4>Napoje</h4>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                {profile.offer.drinks.map(item => <span key={item} style={styles.tag}>{item}</span>)}
              </div>
            </div>
          )}
          {profile.offer.dietary?.length >  0 && (
            <div>
              <h4>Opcje dietetyczne</h4>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                {profile.offer.dietary.map(item => <span key={item} style={styles.tag}>{item}</span>)}
              </div>
            </div>
          )}
        </section>
      )}

      <section style={styles.section}>
        <h2>Galeria Food Trucka</h2>
        {profile.gallery_photo_urls && profile.gallery_photo_urls.length > 0 ? (
          <div style={styles.gallery}>
            {profile.gallery_photo_urls.map((url, index) => (
              <img key={index} src={url} alt={`${profile.food_truck_name} ${index + 1}`} style={styles.galleryImage} />
            ))}
          </div>
        ) : (
          <p>Właściciel nie dodał jeszcze żadnych zdjęć.</p>
        )}
      </section>

      <section style={styles.section}>
        <h2>Opinie</h2>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.review_id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
              <StarRatingDisplay rating={review.rating} />
              <p style={{ fontStyle: 'italic', marginTop: '5px' }}>"{review.comment}"</p>
              <small>– {review.first_name}, {new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          ))
        ) : (
          <p>Ten food truck nie ma jeszcze żadnych opinii.</p>
        )}
      </section>
    </div>
  );
}

export default TruckDetailsPage;