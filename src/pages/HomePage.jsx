import React, { useState, useEffect } from 'react';
import API_URL from './apiConfig.js';

function HomePage() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/trucks`);
        const data = await response.json();
        setTrucks(data);
      } catch (error) {
        console.error("Błąd pobierania food trucków:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrucks();
  }, []);

  if (loading) return <p>Ładowanie food trucków...</p>;

  return (
    <div>
      <h1>Dostępne Food Trucki</h1>
      <div>
        {trucks.length > 0 ? trucks.map(truck => (
          <div key={truck.profile_id}>
             <h3>{truck.truck_name}</h3>
             <p>{truck.cuisine_type?.join(', ')}</p>
          </div>
        )) : <p>Brak dostępnych food trucków.</p>}
      </div>
    </div>
  );
}
export default HomePage;