import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig.js';
// Załóżmy, że TruckCard jest w folderze components
// import TruckCard from '../components/TruckCard.jsx'; 

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

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div>
      <h1>Dostępne Food Trucki</h1>
      <div>
        {trucks.map(truck => (
          // <TruckCard key={truck.truck_id} truck={truck} />
          <div key={truck.truck_id}>
             <h3>{truck.truck_name}</h3>
             <p>{truck.cuisine_types}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default HomePage;