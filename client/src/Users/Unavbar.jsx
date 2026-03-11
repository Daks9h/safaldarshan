/* src/Users/Unavbar.jsx */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import './Unavbar.css';

const Unavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Effect to check auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setIsLoggedIn(true);
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name || 'Devotee');
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/login?role=user');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="user-navbar">
      <Link to="/" className="user-nav-brand">
        <span>सफलDarshan</span>
      </Link>

      {/* Hamburger Icon for Mobile */}
      <button className="user-hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Main Nav Links Section */}
      <div className={`user-nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
        <NavLink 
          to="/user/home" 
          className={({ isActive }) => `user-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMenu}
        >
          Home
        </NavLink>
        <NavLink 
          to="/user/temples" 
          className={({ isActive }) => `user-nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMenu}
        >
          Temples
        </NavLink>
        {isLoggedIn && (
          <>
            <NavLink 
              to="/user/my-bookings" 
              className={({ isActive }) => `user-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              My Bookings
            </NavLink>
            <NavLink 
              to="/user/profile" 
              className={({ isActive }) => `user-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Profile
            </NavLink>
          </>
        )}
        


        {/* Auth Section for Mobile */}
        <div className="user-auth-section">
          {isLoggedIn ? (
            <div className="user-profile-info">
              <span className="user-name-display">Welcome, {userName}</span>
              <button onClick={handleLogout} className="btn-logout-user">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login-outline" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="btn-signup-solid" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Unavbar;
