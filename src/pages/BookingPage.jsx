import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';

function BookingPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [utilityCosts, setUtilityCosts] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Musisz być zalogowany, aby dokonać rezerwacji.');
      setLoading(false);
      return;
    }

    const bookingData = {
      profile_id: parseInt(profileId),
      event_date: eventDate,
      event_time: eventTime,
      event_location: eventLocation,
      event_type: eventType,
      guest_count: parseInt(guestCount) || 0,
      utility_costs: parseFloat(utilityCosts) || 0.00,
      event_description: eventDescription,
    };

    try {
      await api.post('/requests', bookingData);
      alert('Twoja prośba o rezerwację została wysłana!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Błąd sieci lub serwera.';
      setMessage(`Błąd: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px' }}>
      <nav style={{ padding: '1rem 0' }}>
        <Link to={`/profile/${profileId}`}>&larr; Powrót do profilu food trucka</Link>
      </nav>
      <h1>Zarezerwuj Food Trucka</h1>
      <p>Proszę wypełnić szczegóły Twojego wydarzenia.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label>Data wydarzenia:</label>
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
        </div>
        <div>
          <label>Godziny wydarzenia (np. 14:00 - 22:00):</label>
          <input type="text" value={eventTime} onChange={e => setEventTime(e.target.value)} placeholder="np. 14:00 - 22:00" required />
        </div>
        <div>
          <label>Adres wydarzenia:</label>
          <input type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="np. ul. Radosna 1, Warszawa" required />
        </div>
        <div>
          <label>Rodzaj wydarzenia:</label>
          <select value={eventType} onChange={e => setEventType(e.target.value)} required>
            <option value="" disabled>Wybierz z listy...</option>
            <option value="Festiwal">Festiwal</option>
            <option value="Impreza firmowa">Impreza firmowa</option>
            <option value="Wesele">Wesele</option>
            <option value="Urodziny">Urodziny</option>
            <option value="Targi">Targi</option>
            <option value="Inne">Inne</option>
          </select>
        </div>
        <div>
          <label>Szacunkowa liczba gości:</label>
          <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="np. 150" required />
        </div>
        <div>
          <label>Twoja propozycja pokrycia kosztów mediów (prąd, woda) (zł):</label>
          <input type="number" step="0.01" value={utilityCosts} onChange={e => setUtilityCosts(e.target.value)} placeholder="np. 150.00" />
        </div>
        <div>
          <label>Opis wydarzenia i specjalne wymagania:</label>
          <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} rows="4" required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Wysyłanie...' : 'Wyślij prośbę o rezerwację'}
        </button>
        {message && <p style={{color: 'red', marginTop: '10px'}}>{message}</p>}
      </form>
    </div>
  );
}

export default BookingPage;