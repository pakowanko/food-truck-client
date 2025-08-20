import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { api } from '../apiConfig.js';

const StarRating = ({ rating, setRating }) => {
    return (
        <div>
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'grey', fontSize: '2rem' }} onClick={() => setRating(star)}>★</span>
            ))}
        </div>
    );
};

const ReminderModal = ({ onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '450px', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Rezerwacja Potwierdzona!</h2>
            <p>Pamiętaj o obowiązku zakupu opakowań na to wydarzenie w naszym sklepie.</p>
            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button onClick={onClose} style={{ padding: '10px 20px' }}>Zamknij</button>
                <a href="https://www.pakowanko.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '10px 20px', backgroundColor: 'var(--primary-red)', color: 'white', borderRadius: '5px' }}>
                    Przejdź do sklepu
                </a>
            </div>
        </div>
    </div>
);

function DashboardPage() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState([]); 
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchData = async () => {
    if (!token) return;
    setError('');
    try {
      const [requestsRes, profilesRes, conversationsRes] = await Promise.all([
          api.get('/requests/my-bookings'),
          user?.user_type === 'food_truck_owner' ? api.get('/profiles/my-profiles') : Promise.resolve({ data: [] }),
          api.get('/conversations')
      ]);
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      setProfiles(Array.isArray(profilesRes.data) ? profilesRes.data : []);
      setConversations(Array.isArray(conversationsRes.data) ? conversationsRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Nie udało się pobrać danych.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading && user) {
      setLoading(true);
      fetchData();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, token, navigate]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingStatusId(requestId);
    setError('');
    try {
        await api.put(`/requests/${requestId}/status`, { status: newStatus });
        if (newStatus === 'confirmed') {
            const confirmedRequest = requests.find(req => req.request_id === requestId);
            if (confirmedRequest && confirmedRequest.event_start_date?._seconds) {
                const today = new Date();
                const eventDate = new Date(confirmedRequest.event_start_date._seconds * 1000);
                const daysUntilEvent = (eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

                if (daysUntilEvent <= 7) {
                    setIsReminderModalOpen(true);
                }
            }
        }
        await fetchData(); 
    } catch (err) {
        setError(err.response?.data?.message || 'Nie udało się zmienić statusu rezerwacji.');
    } finally {
        setUpdatingStatusId(null);
    }
  };
  
  const handleCancelBooking = async (requestId) => {
    const confirmation = window.confirm("Czy na pewno chcesz anulować tę rezerwację? Tej operacji nie można cofnąć.");
    if (confirmation) {
        setUpdatingStatusId(requestId);
        setError('');
        try {
            await api.put(`/requests/${requestId}/cancel`);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Nie udało się anulować rezerwacji.');
        } finally {
            setUpdatingStatusId(null);
        }
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
        await fetchData();
    } catch (err) {
        setError(err.response?.data?.message || 'Nie udało się dodać opinii.');
    }
  };
  
  const isRequestCompleted = (req) => {
    if (!req.event_end_date?._seconds) return false;
    const eventEndDate = new Date(req.event_end_date._seconds * 1000);
    return eventEndDate < new Date() && req.status === 'confirmed';
  };

  // ✨ POPRAWKA: Funkcja do formatowania daty z obiektu Firestore
  const formatDateRange = (start, end) => {
    // Sprawdzamy, czy obiekty daty i pole _seconds istnieją
    if (!start?._seconds || !end?._seconds) return 'Invalid Date';
    
    // Tworzymy daty, mnożąc sekundy przez 1000
    const startDate = new Date(start._seconds * 1000).toLocaleDateString('pl-PL');
    const endDate = new Date(end._seconds * 1000).toLocaleDateString('pl-PL');
    
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
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
      {isReminderModalOpen && <ReminderModal onClose={() => setIsReminderModalOpen(false)} />}

      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
        {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Błąd: {error}</p>}
        
        {user.user_type === 'food_truck_owner' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2>Moje Profile Food Trucków</h2>
              <Link to="/create-profile" style={{ textDecoration: 'none', padding: '10px 15px', backgroundColor: 'var(--primary-red)', color: 'white', borderRadius: '5px' }}>
                + Dodaj nowy profil
              </Link>
            </div>
            {profiles.length > 0 ? (
              profiles.map(profile => (
                <div key={profile.profile_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px' }}>
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
              ))
            ) : (
              <div>
                <p>Nie dodałeś jeszcze żadnego profilu food trucka.</p>
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
                      <p><strong>Data:</strong> {formatDateRange(req.event_start_date, req.event_end_date)}</p>
                      <p><strong>Godziny:</strong> {req.event_time}</p>
                      <p><strong>Lokalizacja:</strong> {req.event_location}</p>
                      <p><strong>Typ wydarzenia:</strong> {req.event_type}</p>
                      <p><strong>Liczba gości:</strong> {req.guest_count}</p>
                      <p><strong>Koszty mediów (propozycja):</strong> {req.utility_costs} zł</p>
                      {/* ✨ POPRAWKA: Zmieniono 'event_description' na 'event_details' */}
                      <p><strong>Opis:</strong> {req.event_details}</p>
                  </div>
                  
                  <p style={{marginTop: '15px'}}><strong>Status rezerwacji:</strong> {req.status}</p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {user.user_type === 'food_truck_owner' && req.status === 'pending_owner_approval' && (
                      <>
                        <button onClick={() => handleUpdateStatus(req.request_id, 'confirmed')} disabled={updatingStatusId === req.request_id} style={{backgroundColor: 'green', color: 'white'}}>
                            {updatingStatusId === req.request_id ? 'Przetwarzanie...' : 'Akceptuj'}
                        </button>
                        <button onClick={() => handleUpdateStatus(req.request_id, 'rejected_by_owner')} disabled={updatingStatusId === req.request_id} style={{backgroundColor: 'red', color: 'white'}}>
                            Odrzuć
                        </button>
                      </>
                    )}
                    
                    {req.status === 'confirmed' && (
                        <>
                            <p style={{color: 'green', fontWeight: 'bold'}}>Potwierdzona!</p>
                            <button onClick={() => handleCancelBooking(req.request_id)} disabled={updatingStatusId === req.request_id} style={{backgroundColor: 'grey', color: 'white'}}>
                                {updatingStatusId === req.request_id ? 'Anulowanie...' : 'Anuluj rezerwację'}
                            </button>
                        </>
                    )}

                    {(req.status === 'cancelled_by_organizer' || req.status === 'cancelled_by_owner' || req.status === 'rejected_by_owner') && (
                        <p style={{color: 'red', fontWeight: 'bold'}}>
                            {req.status === 'rejected_by_owner' ? 'Odrzucona' : 'Anulowana'}
                        </p>
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