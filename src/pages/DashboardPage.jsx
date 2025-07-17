import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { api } from '../apiConfig.js';

const StarRating = ({ rating, setRating }) => {
    return (
        <div>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'grey', fontSize: '2rem' }}
                    onClick={() => setRating(star)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

function DashboardPage() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Ta funkcja zostaje bez zmian
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [requestsRes, profileRes, conversationsRes] = await Promise.all([
          api.get('/requests/my-bookings'),
          user?.user_type === 'food_truck_owner' ? api.get('/profiles/my-profile') : Promise.resolve(null),
          api.get('/conversations')
      ]);
      
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      if (profileRes) setProfile(profileRes.data);
      setConversations(Array.isArray(conversationsRes.data) ? conversationsRes.data : []);

    } catch (err) {
      if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Nie udało się pobrać danych.');
          console.error("Błąd pobierania danych w panelu:", err);
      } else {
          setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, token, navigate]);

  // JEDYNA ZMIANA JEST TUTAJ
  const handleUpdateStatus = async (requestId, newStatus) => {
    setError('');
    try {
        await api.put(`/requests/${requestId}/status`, { status: newStatus });
        await fetchData(); // ZMIANA: Dodajemy 'await', aby poczekać na odświeżenie danych
    } catch (err) {
        setError(err.response?.data?.message || 'Nie udało się zmienić statusu rezerwacji.');
    }
  };

  const handleInitiateBookingChat = async (requestId) => {
    try {
        const { data } = await api.post('/conversations/initiate/booking', { requestId });
        navigate(`/chat/${data.conversation_id}`);
    } catch (err) {
        setError(`Nie można rozpocząć czatu o rezerwację: ${err.response?.data?.message || err.message}`);
    }
  };

  const openReviewModal = (requestId) => {
    setCurrentRequestId(requestId);
    setIsReviewModalOpen(true);
  };
  
  const handleSendReview = async (e) => {
    e.preventDefault();
    setError('');
    if (rating === 0) { setError("Ocena musi wynosić od 1 do 5 gwiazdek."); return; }
    try {
        await api.post('/reviews', {
            request_id: currentRequestId,
            rating: rating,
            comment: comment
        });
        alert("Dziękujemy za wystawienie opinii!");
        setIsReviewModalOpen(false);
        setRating(0); 
        setComment('');
        await fetchData(); // Tutaj też warto dodać 'await' dla spójności
    } catch (err) {
        setError(err.response?.data?.message || 'Nie udało się dodać opinii.');
    }
  };
  
  const isRequestCompleted = (req) => {
    const eventDate = req.event_date;
    return new Date(eventDate) < new Date() && req.status === 'confirmed';
  };

  if (authLoading || loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Ładowanie panelu...</p>;
  if (!user) return null;

  return (
    <>
      {isReviewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h2>Wystaw opinię</h2>
            <form onSubmit={handleSendReview}>
              <p>Oceń realizację (1-5):</p>
              <StarRating rating={rating} setRating={setRating} />
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Napisz kilka słów komentarza..."
                style={{ width: '100%', height: '100px', marginTop: '15px', boxSizing: 'border-box' }}
              />
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsReviewModalOpen(false)}>Anuluj</button>
                <button type="submit">Wyślij opinię</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Błąd: {error}</p>}
        
        {user.user_type === 'food_truck_owner' && (
          <section>
            <h2>Mój Profil Food Trucka</h2>
            {profile ? (
              <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img 
                  src={profile.profile_image_url || 'https://placehold.co/100x100/F0AD4E/343A40?text=Brak+zdjęcia'} 
                  alt={profile.food_truck_name}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <h3>{profile.food_truck_name}</h3>
                  <p style={{margin: '5px 0'}}>{profile.food_truck_description}</p>
                  <Link to={`/edit-profile/${profile.profile_id}`}>Edytuj profil</Link>
                </div>
              </div>
            ) : (
              <div>
                <p>Nie uzupełniłeś jeszcze swojego profilu food trucka.</p>
                <Link to="/create-profile">Uzupełnij profil teraz</Link>
              </div>
            )}
          </section>
        )}
        
        <section style={{ marginTop: '40px' }}>
            <h2>Moje Rozmowy</h2>
            {conversations.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {conversations.map(conv => (
                        <li key={conv.conversation_id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <Link to={`/chat/${conv.conversation_id}`}>
                                Rozmowa: <strong>{conv.title}</strong>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Brak rozpoczętych rozmów.</p>
            )}
        </section>

        <section style={{ marginTop: '40px' }}>
          <h2>{user.user_type === 'food_truck_owner' ? 'Otrzymane Rezerwacje' : 'Moje Rezerwacje'}</h2>
          {Array.isArray(requests) && requests.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {requests.map(req => (
                <li key={req.request_id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                  
                  {user.user_type === 'food_truck_owner' ? (
                    <div>
                      <p><strong>Organizator:</strong> {req.organizer_first_name} {req.organizer_last_name} ({req.organizer_email})</p>
                      <p><strong>Telefon organizatora:</strong> {req.organizer_phone}</p>
                    </div>
                  ) : (
                    <p><strong>Food Truck:</strong> {req.food_truck_name}</p>
                  )}
                  <hr style={{margin: '10px 0'}} />
                  
                  <div style={{background: '#f9f9f9', padding: '10px', marginTop: '10px', borderRadius: '5px'}}>
                      <h4 style={{marginTop: 0}}>Szczegóły wydarzenia</h4>
                      <p><strong>Data:</strong> {new Date(req.event_date).toLocaleDateString()}</p>
                      <p><strong>Godziny:</strong> {req.event_time}</p>
                      <p><strong>Lokalizacja:</strong> {req.event_location}</p>
                      <p><strong>Typ wydarzenia:</strong> {req.event_type}</p>
                      <p><strong>Liczba gości:</strong> {req.guest_count}</p>
                      <p><strong>Koszty mediów (propozycja):</strong> {req.utility_costs} zł</p>
                      <p><strong>Opis:</strong> {req.event_description}</p>
                  </div>
                  
                  <p style={{marginTop: '15px'}}><strong>Status rezerwacji:</strong> {req.status}</p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {user.user_type === 'food_truck_owner' && req.status === 'pending_owner_approval' && (
                      <>
                        <button onClick={() => handleUpdateStatus(req.request_id, 'confirmed')} style={{backgroundColor: 'green', color: 'white'}}>Akceptuj</button>
                        <button onClick={() => handleUpdateStatus(req.request_id, 'rejected_by_owner')} style={{backgroundColor: 'red', color: 'white'}}>Odrzuć</button>
                      </>
                    )}
                    {user.user_type === 'food_truck_owner' && req.status === 'confirmed' && (
                        <p style={{color: 'blue', fontWeight: 'bold'}}>Zaakceptowano!</p>
                    )}
                    
                    <button onClick={() => handleInitiateBookingChat(req.request_id)}>Rozmawiaj o tej rezerwacji</button>

                    {user.user_type === 'organizer' && isRequestCompleted(req) && (
                        <button onClick={() => openReviewModal(req.request_id)}>Wystaw opinię</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Brak rezerwacji do wyświetlenia.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default DashboardPage;