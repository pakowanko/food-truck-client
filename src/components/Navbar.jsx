import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    background: '#333',
    color: 'white',
    height: '60px',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    boxSizing: 'border-box'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 10px'
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{...linkStyle, fontSize: '1.5rem', fontWeight: 'bold'}}>BookTheTruck</Link>
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '20px' }}>Witaj, {user.email} (Rola: {user.user_type})</span>
            <Link to="/dashboard" style={linkStyle}>Mój Panel</Link>
            <button onClick={handleLogout} style={{...linkStyle, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem'}}>Wyloguj</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Zaloguj się</Link>
            <Link to="/register" style={linkStyle}>Zarejestruj się</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;