// src/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';

// Style pozostają bez zmian
const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'var(--white)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: `3px solid var(--primary-yellow)`
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: 'var(--primary-blue)',
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
    color: 'var(--primary-blue)',
    border: '1px solid var(--primary-blue)',
  }
};

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // ZMIANA: Dodano obiekt do tłumaczenia nazw ról
  const roleDisplayMap = {
    organizer: 'Organizator',
    food_truck_owner: 'Właściciel'
  };

  return (
    <nav style={styles.nav}>
      {/* ZMIANA: Nowa nazwa i logo aplikacji */}
      <Link to="/" style={styles.logo}>
        🚚 BookTheTruck
      </Link>
      <div style={styles.navLinks}>
        {user ? (
          <>
            <span style={styles.userInfo}>
              {/* ZMIANA: Wyświetlanie przetłumaczonej roli */}
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