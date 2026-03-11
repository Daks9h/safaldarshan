/* src/Users/Mybookings.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Unavbar from './Unavbar';
import './user-shared.css';
import './Mybookings.css';

const Mybookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    if (!token) {
      navigate('/login?role=user');
      return;
    }

    const fetchMyBookings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/user/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data);
        setFilteredBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [token, navigate]);

  // Client-side filtering logic
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let result = [...bookings];

    if (activeTab === 'Upcoming') {
      result = result.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return b.status === 'Confirmed' && bookingDate >= today;
      });
    } else if (activeTab === 'Completed') {
      result = result.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return bookingDate < today && b.status !== 'Cancelled';
      });
    } else if (activeTab === 'Cancelled') {
      result = result.filter(b => b.status === 'Cancelled');
    }

    setFilteredBookings(result);
  }, [activeTab, bookings]);

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/user/cancel-booking/${bookingToCancel}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state without full reload
      const updatedBookings = bookings.map(b => 
        b._id === bookingToCancel ? { ...b, status: 'Cancelled' } : b
      );
      setBookings(updatedBookings);
      setShowModal(false);
      setBookingToCancel(null);
    } catch (err) {
      console.error('Cancellation failed:', err);
      alert('Failed to cancel the booking. Please try again.');
    }
  };

  const downloadTicket = (bookingId) => {
    // Simple way to trigger a "Download Ticket" (prints the card)
    window.print();
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  const isCancelable = (status, dateStr) => {
    if (status !== 'Confirmed') return false;
    const bookingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  };

  if (loading) return <div className="loading-spinner">🙏 Loading your sacred bookings...</div>;

  return (
    <div className="mybookings-page">
      <Unavbar />
      <div className="mybookings-container">
        <header className="mybookings-header">
          <h1>My Sacred Bookings</h1>
          <div className="booking-tabs">
            {['All', 'Upcoming', 'Completed', 'Cancelled'].map(tab => (
              <button 
                key={tab} 
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

        {filteredBookings.length === 0 ? (
          <div className="empty-bookings-state">
            <span>🕍</span>
            <p>You haven't made any bookings yet.</p>
            <Link to="/temples" className="explore-btn">
              Explore Temples Now
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((b) => (
              <div key={b._id} className="booking-item-card">
                <img 
                  src={b.templeImage || 'https://via.placeholder.com/100'} 
                  alt={b.templeName} 
                  className="booking-item-thumb"
                />
                
                <div className="booking-item-details">
                  <h3>{b.templeName}</h3>
                  <div className="booking-item-location">📍 {b.city}, {b.state}</div>
                  <div className="booking-id-text">ID: #{b._id.slice(-8).toUpperCase()}</div>
                  
                  <div className="booking-main-info">
                    <div className="info-point">Slot: <strong>{b.timeSlot}</strong></div>
                    <div className="info-point">Pooja: <strong>{b.poojaType}</strong></div>
                    <div className="info-point">Tickets: <strong>{b.tickets}</strong></div>
                    <div className="info-point">Date: <strong>{new Date(b.bookingDate).toLocaleDateString()}</strong></div>
                  </div>
                </div>

                <div className="booking-item-right">
                  <span className={`booking-status-badge ${getStatusClass(b.status)}`}>
                    {b.status}
                  </span>
                  <div className="total-price-value" style={{ fontSize: '1.25rem' }}>₹{b.totalAmount}</div>
                  
                  <div className="booking-item-actions">
                    <button 
                      onClick={() => downloadTicket(b._id)} 
                      className="btn-download-ticket"
                    >
                      Print Ticket
                    </button>
                    {isCancelable(b.status, b.bookingDate) && (
                      <button 
                        onClick={() => handleCancelClick(b._id)} 
                        className="btn-cancel-booking"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Confirm Cancellation</h2>
              <p>Are you sure you want to cancel this darshan booking? This cannot be undone. 🙏</p>
              <div className="modal-actions">
                <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                  Go Back
                </button>
                <button className="btn-modal-confirm" onClick={confirmCancel}>
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mybookings;
