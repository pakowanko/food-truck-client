import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx'; 
import API_URL from '../apiConfig.js';

function DashboardPage() {
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!token || !user) return;
    setLoading(true);
    setError('');
    try {
      const authHeaders = { 'Authorization': `Bearer ${token}` };
      const reservationsRes = await fetch(`${API_URL}/api/reservations/my-reservations`, { headers: authHeaders });
      if (!reservationsRes.ok) throw new Error('Nie udało się pobrać rezerwacji.');
      const reservationsData = await reservationsRes.json();
      setReservations(reservationsData);

      if (user.user_type === 'owner') {
        const truckRes = await fetch(`${API_URL}/api/trucks/my-truck`, { headers: authHeaders });
        if (truckRes.status === 404) {
          setTruck(null);
        } else if (truckRes.ok) {
          const truckData = await truckRes.json();
          setTruck(truckData);
        } else {
          throw new Error('Nie udało się pobrać danych food trucka.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [authLoading, user]);

  const handleUpdateStatus = async (reservationId, newStatus) => {
    // ... (logika aktualizacji statusu)
  };

  if (authLoading || loading) return <p>Ładowanie panelu...</p>;

  return (
    <div>
      <h1>Panel</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {user.user_type === 'owner' && (
        <section>
          <h2>Mój Food Truck</h2>
          {truck ? (
            <div>
              <h3>{truck.truck_name}</h3>
              <Link to={`/edit-truck/${truck.truck_id}`}>Edytuj</Link>
            </div>
          ) : (
            <Link to="/add-truck">Dodaj swojego food trucka</Link>
          )}
        </section>
      )}

      <section>
        <h2>Moje Rezerwacje</h2>
        {reservations.length > 0 ? (
          reservations.map(res => (
            <div key={res.reservation_id} style={{border: '1px solid black', margin: '10px', padding: '10px'}}>
              <p>Data: {new Date(res.event_date).toLocaleDateString()}</p>
              <p>Status: {res.status}</p>
              {/* Tutaj reszta szczegółów i przycisków */}
            </div>
          ))
        ) : (
          <p>Brak rezerwacji.</p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;