/* src/Users/BookingSuccess.jsx */
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Unavbar from './Unavbar';
import Footer from '../Components/Footer';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!location.state || !location.state.bookingData) {
      // If no state passed (direct access), redirect to bookings
      navigate('/user/my-bookings');
      return;
    }
    setBooking(location.state.bookingData);
  }, [location, navigate]);

  if (!booking) return null;

  return (
    <div className="success-page">
      <Unavbar />
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <div className="success-icon">✓</div>
          </div>
          
          <div className="success-header">
            <h1>Booking Confirmed!</h1>
            <p>Your spiritual journey is reserved. May you find peace and blessings.</p>
          </div>

          <div className="ticket-visual">
            <div className="ticket-top">
              <div className="ticket-temple-info">
                <h3>{booking.templeName}</h3>
                <p>Booking ID: <span className="b-id">{booking.bookingId || 'DE-' + Math.floor(100000 + Math.random() * 900000)}</span></p>
              </div>
              <div className="ticket-qr-mock">
                {/* Visual mock of a QR code */}
                <div className="qr-box">
                  <div className="qr-inner"></div>
                </div>
              </div>
            </div>
            
            <div className="ticket-divider">
              <div className="notch left"></div>
              <div className="dotted-line"></div>
              <div className="notch right"></div>
            </div>

            <div className="ticket-bottom">
              <div className="ticket-grid">
                <div className="ticket-item">
                  <span>Slot Time</span>
                  <p>{booking.slot}</p>
                </div>
                <div className="ticket-item">
                  <span>Pooja Type</span>
                  <p>{booking.poojaType}</p>
                </div>
                <div className="ticket-item">
                  <span>Tickets</span>
                  <p>{booking.totalTickets} Persons</p>
                </div>
                <div className="ticket-item">
                  <span>Amount Paid</span>
                  <p>₹{booking.totalPrice}</p>
                </div>
              </div>
              
              <div className="ticket-note">
                <p>Please carry a digital or printed copy of this ticket. Valid ID proof may be required at the temple entrance.</p>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/user/my-bookings" className="btn-view-all">View All Bookings</Link>
            <Link to="/user/home" className="btn-home-success">Back to Home</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;
