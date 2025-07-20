import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { api } from '../apiConfig.js';

// Komponent do wyświetlania gwiazdek
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

// Komponent Lightbox do powiększania zdjęć
const ImageLightbox = ({ imageUrl, onClose }) => {
    return (
        <div 
            onClick={onClose} 
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 2000, cursor: 'pointer'
            }}
        >
            <img 
                src={imageUrl} 
                alt="Powiększone zdjęcie food trucka" 
                style={{ maxHeight: '90%', maxWidth: '90%', borderRadius: '8px' }}
            />
            <span style={{ position: 'absolute', top: '20px', right: '35px', color: 'white', fontSize: '2rem' }}>&times;</span>
        </div>
    );
};


function TruckDetailsPage() {
  const { profileId } = useParams();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/profiles/${profileId}`),
          api.get(`/reviews/profile/${profileId}`)
        ]);
        
        setProfile(profileRes.data);
        const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
        setReviews(reviewsData);

        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(totalRating / reviewsData.length);
        } else {
          setAverageRating(0);
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
    galleryImage: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' },
    tag: { background: '#e9e9e9', padding: '5px 10px', borderRadius: '15px' },
    bookButton: { display: 'inline-block', padding: '15px 30px', fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none', color: 'white', backgroundColor: 'var(--primary-red)', borderRadius: '5px', textAlign: 'center' }
  };

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Ładowanie profilu food trucka...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</p>;
  if (!profile) return <p style={{textAlign: 'center', marginTop: '50px'}}>Nie znaleziono tego food trucka.</p>;

  return (
    <>
      {selectedImage && <ImageLightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        
        <h1>{profile.food_truck_name}</h1>
        <p>{profile.food_truck_description}</p>
        <p style={{ color: '#6c757d' }}>
          <strong>Lokalizacja:</strong> {profile.base_location} (działamy w promieniu {profile.operation_radius_km || 'N/A'} km)
        </p>
        
        <section style={styles.section}>
          <h2>Galeria Food Trucka</h2>
          {profile.gallery_photo_urls && profile.gallery_photo_urls.length > 0 ? (
            <div style={styles.gallery}>
              {profile.gallery_photo_urls.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`${profile.food_truck_name} ${index + 1}`} 
                  style={styles.galleryImage}
                  onClick={() => setSelectedImage(url)}
                />
              ))}
            </div>
          ) : (
            <p>Właściciel nie dodał jeszcze żadnych zdjęć.</p>
          )}
        </section>
        
        <section style={styles.section}>
          <h2>Opinie</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <StarRatingDisplay rating={averageRating} />
            <span>({averageRating.toFixed(1)} / 5 na podstawie {reviews.length} opinii)</span>
          </div>
          {reviews.length > 0 ? (
            <div>
              {reviews.map(review => (
                <div key={review.review_id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                  <StarRatingDisplay rating={review.rating} />
                  <p style={{ fontStyle: 'italic', marginTop: '5px' }}>"{review.comment}"</p>
                  <small>– {review.first_name}, {new Date(review.created_at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
        ) : <p>Ten food truck nie ma jeszcze żadnych opinii.</p>}
        </section>

        <div style={{margin: '40px 0', textAlign: 'center'}}>
            {!user && (
              <Link to="/register" style={styles.bookButton}>
                  Zarejestruj się, aby dokonać rezerwacji
              </Link>
            )}
            {user && user.user_type === 'organizer' && (
              <Link to={`/booking/${profile.profile_id}`} style={styles.bookButton}>
                  Zarezerwuj ten Food Truck
              </Link>
            )}
            {user && user.user_type === 'food_truck_owner' && (
              <p style={{fontStyle: 'italic', color: '#6c757d'}}>Aby zarezerwować, zaloguj się na konto organizatora.</p>
            )}
        </div>

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
            {profile.offer.dietary?.length > 0 && (
              <div>
                <h4>Opcje dietetyczne</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                  {profile.offer.dietary.map(item => <span key={item} style={styles.tag}>{item}</span>)}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default TruckDetailsPage;
