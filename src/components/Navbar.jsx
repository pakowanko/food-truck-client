// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

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
  logo: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: 'var(--dark-text)',
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
    color: 'var(--primary-red)',
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

  const getUserDisplayRole = () => {
    if (!user) return '';
    if (user.role === 'admin') {
      return 'Administrator';
    }
    return roleDisplayMap[user.user_type] || user.user_type;
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
              Witaj, {user.email} (Rola: {getUserDisplayRole()})
            </span>
            {user.role === 'admin' ? (
              <Link to="/admin">Panel Admina</Link>
            ) : (
              <Link to="/dashboard">Mój Panel</Link>
            )}
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