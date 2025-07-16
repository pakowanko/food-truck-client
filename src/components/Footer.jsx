// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const footerStyles = {
    backgroundColor: '#343A40',
    color: 'white',
    padding: '40px 20px',
    marginTop: '60px',
    textAlign: 'center'
  };
  const linkStyles = {
    color: '#FFC107', // Używamy naszego koloru akcentu
    margin: '0 15px',
    textDecoration: 'none'
  };
  return (
    <footer style={footerStyles}>
      <p>© {new Date().getFullYear()} BookTheFoodTruck.eu - Wszelkie prawa zastrzeżone.</p>
      <div>
        <Link to="/regulamin" style={linkStyles}>Regulamin</Link>
        <Link to="/polityka-prywatnosci" style={linkStyles}>Polityka Prywatności</Link>
      </div>
    </footer>
  );
}
export default Footer;