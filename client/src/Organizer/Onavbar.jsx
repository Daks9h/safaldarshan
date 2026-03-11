import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Onavbar.css';

const Onavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Read organizer info from localStorage
  const organizerName = localStorage.getItem('organizerName') || 'Organizer';

  const handleLogout = () => {
    localStorage.removeItem('organizerToken');
    localStorage.removeItem('organizerData');
    localStorage.removeItem('organizerName');
    navigate('/login?role=organizer');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <NavLink to="/organizer/home" className="nav-brand">
        सफलDarshan
      </NavLink>

      {/* Hamburger Menu for Mobile */}
      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Nav Links */}
      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <NavLink 
          to="/organizer/home" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/organizer/my-temples" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          My Temples
        </NavLink>
        <NavLink 
          to="/organizer/bookings" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Bookings
        </NavLink>
        <NavLink 
          to="/organizer/darshans" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Darshan Slots
        </NavLink>
        <NavLink 
          to="/organizer/create-temple" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Create Temple
        </NavLink>

        {/* Mobile-only Profile/Logout */}
        {isMenuOpen && (
          <div className="nav-mobile-footer" style={{ borderTop: '1px solid #eee', paddingTop: '1rem', width: '100%' }}>
            <span className="profile-name">Signed in as {organizerName}</span>
            <button className="logout-btn" onClick={handleLogout} style={{ marginTop: '1rem', width: '100%' }}>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="nav-profile">
        <span className="profile-name">Hello, {organizerName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout Account
        </button>
      </div>
    </nav>
  );
};

export default Onavbar;
