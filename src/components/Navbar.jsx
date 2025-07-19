import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

// URL do Twojego logo
const logoUrl = 'https://storage.googleapis.com/foodtruck_storage/Logo%20BookTheFoodTruck.jpeg';

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'var(--white)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: `3px solid var(--accent-yellow)`
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'var(--dark-text)',
  },
  logoImg: {
    height: '80px', // Dopasuj wysokość logo
    width: 'auto',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    color: '#6c757d',
    fontSize: '0.9rem',
  },
  logoutButton: {
    padding: '8px 15px',
    backgroundColor: 'transparent',
    color: 'var(--primary-red)',
    border: '1px solid var(--primary-red)',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logoLink}>
        <img src={logoUrl} alt="Book The Food Truck Logo" style={styles.logoImg} />
        <span style={styles.logoText}>Book The Food Truck</span>
      </Link>
      <div style={styles.navLinks}>
        {user ? (
          <>
            <span style={styles.userInfo}>
              Witaj, {user.first_name || user.email}!
            </span>
            
            {user.role === 'admin' ? (
              <Link to="/admin">Panel Admina</Link>
            ) : (
              <Link to="/dashboard">Mój Panel</Link>
            )}
            
            <Link to="/my-account">Moje Konto</Link>
            <button onClick={handleLogout} style={styles.logoutButton}>Wyloguj</button>
          </>
        ) : (
          <>
            <Link to="/login">Zaloguj się</Link>
            <Link to="/register">Zarejestruj się</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;