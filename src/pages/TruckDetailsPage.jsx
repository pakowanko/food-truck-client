import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx'; 
import API_URL from '../apiConfig.js';

function TruckDetailsPage() {
  const { truckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useContext(AuthContext);
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stany dla rezerwacji
  const [event_date, setEventDate] = useState('');
  const [event_details, setEventDetails] = useState('');
  const [reservationMessage, setReservationMessage] = useState('');

  useEffect(() => {
    const fetchTruckDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/trucks/${truckId}`);
        if (!response.ok) throw new Error('Nie znaleziono food trucka.');
        const data = await response.json();
        setTruck(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTruckDetails();
  }, [truckId]);

  const handleReservation = async (e) => {
    e.preventDefault();
    if (!token) { setReservationMessage("Musisz być zalogowany, aby zrobić rezerwację."); return; }
    if (user.user_type === 'owner') { setReservationMessage("Właściciele nie mogą rezerwować."); return; }
    setReservationMessage('Wysyłanie zapytania...');
    try {
        const response = await fetch(`${API_URL}/api/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ truck_id: parseInt(truckId), event_date, event_details })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Nie udało się złożyć rezerwacji.");
        setReservationMessage("Zapytanie o rezerwację złożone pomyślnie!");
    } catch (err) {
        setReservationMessage(`Błąd: ${err.message}`);
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!truck) return <p>Nie znaleziono food trucka.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <img src={truck.main_image_url ? `${API_URL}${truck.main_image_url}` : 'https://placehold.co/900x400'} alt={truck.truck_name} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
      <h1>{truck.truck_name}</h1>
      <p><strong>Typ kuchni:</strong> {truck.cuisine_types}</p>
      <p>{truck.description}</p>
      <hr style={{ margin: '40px 0' }} />
      
      {user && (user.user_type === 'organizer') ? (
        <div>
            <h2>Zarezerwuj termin</h2>
            <form onSubmit={handleReservation}>
                <input type="date" value={event_date} onChange={e => setEventDate(e.target.value)} required />
                <textarea value={event_details} onChange={e => setEventDetails(e.target.value)} placeholder="Opisz swój event..." required />
                <button type="submit">Wyślij zapytanie</button>
            </form>
            {reservationMessage && <p>{reservationMessage}</p>}
        </div>
      ) : (
        <p>
            {user ? 'Jako właściciel nie możesz składać rezerwacji.' : <Link to="/login" state={{ from: location }}>Zaloguj się</Link>}
            {user ? '' : ', aby zrobić rezerwację.'}
        </p>
      )}
    </div>
  );
}

export default TruckDetailsPage;