/* src/Users/Uhome.jsx */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Unavbar from './Unavbar';
import Footer from '../components/Footer';
import './user-shared.css';
import './Uhome.css';

const Uhome = () => {
  const [featuredTemples, setFeaturedTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedTemples = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/user/featured-temples`);
        setFeaturedTemples(response.data);
      } catch (err) {
        console.error('Error fetching featured temples:', err);
        // Fallback or empty state if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTemples();
  }, []);

  return (
    <div className="uhome-page">
      <Unavbar />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>Book Your Darshan Easily</h1>
            <p>Book your holy darshan slots at temples across India from your home.</p>
            <Link to="/user/temples" className="cta-button">Explore Temples</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Feel the Peace</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon"></span>
              <h3>Easy Online Booking</h3>
              <p>Book your tickets online in minutes. No need to stand in long lines.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon"></span>
              <h3>Choose Your Slot</h3>
              <p>Pick a time slot that conveniently fits your schedule and travel plans.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon"></span>
              <h3>Many Pooja Types</h3>
              <p>See all the different poojas and rituals at each holy temple.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Temples Section */}
      <section className="featured-temples-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Temples</h2>
            <Link to="/user/temples" className="view-all-link" style={{ color: '#FF6B00', fontWeight: 'bold', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          <div className="temples-grid">
            {loading ? (
              <p style={{ textAlign: 'center', width: '100%', color: '#6b7280' }}>Loading temples...</p>
            ) : featuredTemples.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%', color: '#6b7280' }}>No featured temples available yet.</p>
            ) : (
              featuredTemples.map((temple) => (
                <div key={temple._id} className="u-temple-card">
                  <img src={temple.image || 'https://via.placeholder.com/300x200'} alt={temple.name} className="u-temple-img" />
                  <div className="u-temple-info">
                    <h4>{temple.name}</h4>
                    <p>{temple.city}, {temple.state}</p>
                    <p className="u-temple-price">₹{temple.price} for one person</p>
                    <Link to={`/user/temple/${temple._id}`} className="book-btn">
                      Book Now
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Find Temples</h3>
              <p>Search and see holy places and temples across India.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Pick Time & Pooja</h3>
              <p>Pick your time and the pooja you want at the temple.</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Book Now</h3>
              <p>Pay safely and get your ticket right away.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="partner-section">
        <div className="container partner-container">
          <div className="partner-content">
            <span className="partner-badge">Temple Partnership</span>
            <h2>Do you run a temple?</h2>
            <p>Help your temple with सफलDarshan. Put your temple online, handle darshan times, and see bookings in your manager area. Join 500+ other holy temples.</p>
            <div className="partner-btns">
              <Link to="/signup?role=organizer" className="btn-partner-solid">Start Now</Link>
              <Link to="/login?role=organizer" className="btn-partner-outline">Staff Login</Link>
            </div>
          </div>
          <div className="partner-image">
            <div className="abstract-ui-preview">
              <div className="preview-card">
                <div className="preview-header">Dashboard</div>
                <div className="preview-body">
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>
                  <div className="preview-bars">
                    <div className="bar"></div>
                    <div className="bar pulse"></div>
                    <div className="bar"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default Uhome;

