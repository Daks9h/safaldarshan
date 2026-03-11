/* src/Users/BookDarshan.jsx */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Unavbar from './Unavbar';
import './BookDarshan.css';

const BookDarshan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Booking state from previous page
  const bookingMeta = location.state || null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    specialRequests: ''
  });

  useEffect(() => {
    // Auth redirect
    if (!token) {
      navigate('/login?role=user');
      return;
    }

    // Direct navigation check
    if (!bookingMeta) {
      navigate('/temples');
      return;
    }

    window.scrollTo(0, 0);
  }, [token, bookingMeta, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required devotee details.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/user/book-darshan', {
        ...bookingMeta,
        devotee: formData
      });

      // Redirect to Success Page with data
      navigate('/user/booking-success', { 
        state: { 
          bookingData: {
            templeName: bookingMeta.templeName,
            slot: bookingMeta.slot,
            poojaType: bookingMeta.pooja,
            totalTickets: bookingMeta.tickets,
            totalPrice: bookingMeta.totalAmount,
            bookingId: response.data.bookingId || null
          }
        } 
      });
    } catch (err) {
      console.error('Booking confirmation failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Booking failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookingMeta) return <div className="booking-loading">Redirecting to temples...</div>;

  return (
    <div className="book-darshan-page">
      <Unavbar />
      <div className="book-darshan-container">
        {/* Left Column: Booking Summary */}
        <div className="booking-summary-card">
          <div className="summary-header">
            <img 
              src={bookingMeta.image || 'https://via.placeholder.com/100'} 
              alt={bookingMeta.templeName} 
              className="summary-thumb"
            />
            <div className="summary-temple-info">
              <h2>{bookingMeta.templeName}</h2>
              <p>Darshan Selection Review</p>
            </div>
          </div>

          <div className="booking-details-list">
            <div className="detail-row">
              <span className="label">Selected Slot:</span>
              <span className="value">{bookingMeta.slot}</span>
            </div>
            <div className="detail-row">
              <span className="label">Pooja Ritual:</span>
              <span className="value">{bookingMeta.pooja}</span>
            </div>
            <div className="detail-row">
              <span className="label">Devotee Count:</span>
              <span className="value">{bookingMeta.tickets} Persons</span>
            </div>
            <div className="detail-row">
              <span className="label">Ticket Price:</span>
              <span className="value">₹{bookingMeta.pricePerTicket}</span>
            </div>
          </div>

          <div className="total-amount-row">
            <span className="total-amount-label">Total Amount:</span>
            <span className="total-amount-value">₹{bookingMeta.totalAmount}</span>
          </div>
        </div>

        {/* Right Column: Devotee Details Form */}
        <div className="devotee-form-card">
          <h2 className="form-title">Devotee Information</h2>
          <form className="booking-form" onSubmit={handleConfirmBooking}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your full name" 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your email" 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your phone" 
                />
              </div>

              <div className="form-group full-width">
                <label>Special Requests (Optional)</label>
                <textarea 
                  name="specialRequests" 
                  value={formData.specialRequests} 
                  onChange={handleInputChange} 
                  placeholder="Any special requirements or requests?" 
                />
              </div>
            </div>

            <div className="booking-actions">
              <button 
                type="submit" 
                className="confirm-pay-btn" 
                disabled={isLoading}
              >
                {isLoading ? 'Wait, Processing...' : `Confirm & Pay ₹${bookingMeta.totalAmount}`}
              </button>
              
              <Link to={`/user/temple/${bookingMeta.templeId}`} className="cancel-booking-btn">
                Cancel & Change Selection
              </Link>
            </div>

            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookDarshan;
