import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="header">
      <div>
        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
          <h1>Letter Editor</h1>
        </Link>
      </div>
      {currentUser && (
        <div className="flex">
          <div style={{ marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
            {currentUser.photoURL && (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }} 
              />
            )}
            <span>{currentUser.displayName || currentUser.email}</span>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
