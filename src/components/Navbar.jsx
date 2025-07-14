// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ZMIANA: Poprawiona ścieżka do AuthContext.jsx
import { AuthContext } from '../AuthContext.jsx';

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'var(--white)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: `3px solid var(--accent-yellow)` // Używamy nowej zmiennej kolorystycznej
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: 'var(--dark-text)', // Używamy głównego koloru tekstu
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    color: 'var(--light-text)',
    fontSize: '0.9rem',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'var(--primary-red)', // Używamy nowego koloru akcji
    border: '1px solid var(--primary-red)',
  }
};

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const roleDisplayMap = {
    organizer: 'Organizator',
    food_truck_owner: 'Właściciel'
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        🚚 BookTheTruck
      </Link>
      <div style={styles.navLinks}>
        {user ? (
          <>
            <span style={styles.userInfo}>
              Witaj, {user.email} (Rola: {roleDisplayMap[user.user_type] || user.user_type})
            </span>
            <Link to="/dashboard">Mój Panel</Link>
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