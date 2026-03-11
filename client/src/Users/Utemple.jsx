/* src/Users/Utemple.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Unavbar from './Unavbar';
import './Utemple.css';

const Utemple = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection states
  const [selectedSlot, setSelectedSlot] = useState(null); // Stores the full slot object
  const [selectedPooja, setSelectedPooja] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const fetchTempleDetails = async () => {
      try {
        const response = await api.get(`/user/temple/${templeId}`);
        setTemple(response.data);
      } catch (err) {
        console.error('Error fetching temple details:', err);
        setError('Failed to fetch temple details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTempleDetails();
    window.scrollTo(0, 0); // Scroll to top on mount
  }, [templeId]);

  const handleIncrement = () => {
    setTicketCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };

  const handleProceed = () => {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      navigate('/login?role=user');
      return;
    }

    if (!selectedSlot || !selectedPooja) {
      alert('Please select both a darshan time slot and a pooja type.');
      return;
    }

    // Navigate to booking page with selection state
    navigate(`/user/book/${templeId}`, {
      state: {
        templeId: templeId,
        templeName: temple.name,
        slot: selectedSlot.time,
        pooja: selectedPooja,
        tickets: ticketCount,
        pricePerTicket: selectedSlot.price || temple.price,
        totalAmount: (selectedSlot.price || temple.price) * ticketCount,
        image: temple.images?.[0] || 'https://via.placeholder.com/300',
        darshanId: selectedSlot._id,
        date: selectedSlot.date
      }
    });
  };

  if (loading) return <div className="utemple-loading">Fetching holy temple details...</div>;
  if (error) return <div className="utemple-loading" style={{ color: 'red' }}>{error}</div>;
  if (!temple) return <div className="utemple-loading">Temple not found.</div>;

  const totalPrice = temple.price * ticketCount;

  return (
    <div className="utemple-page">
      <Unavbar />
      {/* Banner Section */}
      <div className="temple-banner-container">
        <img 
          src={temple.image || 'https://via.placeholder.com/1200x600'} 
          alt={temple.name} 
          className="temple-banner-img" 
        />
        <div className="temple-banner-overlay">
          <h1>{temple.name}</h1>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="utemple-main-container">
        {/* Left Column: Details & Selections */}
        <div className="temple-details-left">
          <div className="location-info">
            Location: {temple.city}, {temple.state}
          </div>
          
          <p className="description-text">{temple.description}</p>

          {/* Slot Selection Section */}
          <h2 className="utemple-section-title">Select Darshan Slot</h2>
          <div className="slots-selection-grid">
            {temple.darshanSlots && temple.darshanSlots.map((slot, index) => {
              const available = slot.capacity - slot.booked;
              const isFull = available <= 0;
              const isSelected = selectedSlot?._id === slot._id;
              
              return (
                <div 
                  key={index} 
                  className={`slot-selection-card ${isFull ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isFull && setSelectedSlot(slot)}
                >
                  <div className="slot-time-info">{slot.time}</div>
                  <div className="slot-availability">
                    <span className={`slot-badge ${isFull ? 'badge-full' : 'badge-available'}`}>
                      {isFull ? 'Full' : `${available} Seats Left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pooja Selection Section */}
          <h2 className="utemple-section-title">Select Pooja Type</h2>
          <div className="pooja-selection-container">
            {temple.poojaTypes && temple.poojaTypes.map((pooja, index) => (
              <div 
                key={index} 
                className={`pooja-selection-pill ${selectedPooja === pooja ? 'selected' : ''}`}
                onClick={() => setSelectedPooja(pooja)}
              >
                {pooja}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Booking Summary */}
        <div className="booking-summary-panel">
          <h3 className="summary-title">Booking Summary</h3>
          
          <div className="summary-item">
            <span className="label">Holy Temple:</span>
            <span className="value">{temple.name}</span>
          </div>

          <div className="summary-item">
            <span className="label">Darshan Slot:</span>
            <span className="value">{selectedSlot ? selectedSlot.time : 'Not Selected'}</span>
          </div>

          <div className="summary-item">
            <span className="label">Pooja Type:</span>
            <span className="value">{selectedPooja || 'Not Selected'}</span>
          </div>

          <div className="summary-item">
            <span className="label">Base Price:</span>
            <span className="value">₹{temple.price}</span>
          </div>

          {/* Ticket Counter */}
          <div className="ticket-counter-container">
            <span className="label" style={{ fontWeight: 600, color: '#4b5563' }}>Number of Tickets:</span>
            <div className="ticket-counter-controls">
              <button 
                className="counter-btn" 
                onClick={handleDecrement}
                disabled={ticketCount <= 1}
              >−</button>
              <span className="ticket-count-display">{ticketCount}</span>
              <button 
                className="counter-btn" 
                onClick={handleIncrement}
              >+</button>
            </div>
          </div>

          {/* Total Price Row */}
          <div className="total-price-row">
            <span className="label" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Total Price:</span>
            <span className="total-price-value">₹{totalPrice}</span>
          </div>

          {/* Proceed Button */}
          <button 
            className="proceed-book-btn" 
            onClick={handleProceed}
            disabled={!selectedSlot || !selectedPooja}
          >
            {selectedSlot && selectedPooja ? 'Confirm & Proceed to Book' : 'Select Slot & Pooja'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Utemple;
