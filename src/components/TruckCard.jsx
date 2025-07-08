import React from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig.js';

const TruckCard = ({ truck }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', margin: '10px' }}>
      <img 
        src={truck.main_image_url ? `${API_URL}${truck.main_image_url}` : 'https://placehold.co/300x200/eee/ccc?text=Brak+zdj%C4%99cia'} 
        alt={truck.truck_name} 
        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} 
      />
      <h3>{truck.truck_name}</h3>
      <p><strong>Typ kuchni:</strong> {truck.cuisine_types}</p>
      <Link to={`/truck/${truck.truck_id}`}>
        Zobacz szczegóły i zarezerwuj
      </Link>
    </div>
  );
};

export default TruckCard;