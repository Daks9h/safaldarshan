/* src/components/Footer.jsx */
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              सफलDarshan
            </Link>
            <p className="footer-tagline">Helping everyone on their holy journeys.</p>
          </div>
          
          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <Link to="/user/home">Home</Link>
            <Link to="/user/temples">Explore Temples</Link>
            <Link to="/user/my-bookings">My Bookings</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} सफलDarshan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
