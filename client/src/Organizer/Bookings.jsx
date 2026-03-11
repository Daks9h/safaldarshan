import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './organizer-shared.css';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [temples, setTemples] = useState([]);
  const [filterTemple, setFilterTemple] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('organizerToken');

  useEffect(() => {
    if (!token) { navigate('/login?role=organizer'); return; }

    const fetchData = async () => {
      try {
        const [bookingsRes, templesRes] = await Promise.all([
          api.get('/organizer/bookings'),
          api.get('/organizer/my-temples')
        ]);
        
        setBookings(bookingsRes.data);
        setFilteredBookings(bookingsRes.data);
        setTemples(templesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch bookings data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Client-side filtering logic
  useEffect(() => {
    let result = bookings;

    if (filterTemple !== 'All') {
      result = result.filter(b => b.templeName === filterTemple);
    }

    if (filterStatus !== 'All') {
      result = result.filter(b => b.status === filterStatus);
    }

    if (fromDate) {
      result = result.filter(b => new Date(b.bookingDate) >= new Date(fromDate));
    }

    if (toDate) {
      result = result.filter(b => new Date(b.bookingDate) <= new Date(toDate));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.userName.toLowerCase().includes(q) || 
        b._id.toLowerCase().includes(q) ||
        b.userPhone.toLowerCase().includes(q)
      );
    }

    setFilteredBookings(result);
  }, [filterTemple, filterStatus, fromDate, toDate, searchQuery, bookings]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  if (loading) return <div className="loading-spinner">Loading Bookings...</div>;

  return (
    <div className="o-page">
      <Onavbar />
      <main className="o-main">

        {/* Page Header with Back */}
        <div className="o-page-header">
          <div>
            <div className="o-page-top-nav" style={{ marginBottom: '0.5rem' }}>
              <Link to="/organizer/home" className="o-back-btn">← Dashboard</Link>
              <span className="o-breadcrumb">Bookings</span>
            </div>
            <h1>Bookings</h1>
            <p className="o-subtitle">See all bookings for your temples.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Filter by Temple</label>
            <select value={filterTemple} onChange={(e) => setFilterTemple(e.target.value)}>
              <option value="All">All Temples</option>
              {temples.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group search-group">
            <label>Search User</label>
            <input 
              type="text" 
              placeholder="Name, Phone, or ID..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <span>to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </div>

        {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

        {filteredBookings.length === 0 ? (
          <div className="empty-bookings">
            <p>No bookings received matching the criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User Name</th>
                    <th>Phone</th>
                    <th>Temple</th>
                    <th>Pooja Type</th>
                    <th>Time Slot</th>
                    <th>Tickets</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td>#{b._id.slice(-6).toUpperCase()}</td>
                      <td style={{ fontWeight: 600 }}>{b.userName}</td>
                      <td>{b.userPhone}</td>
                      <td>{b.templeName}</td>
                      <td>{b.poojaType}</td>
                      <td>{b.timeSlot}</td>
                      <td>{b.tickets}</td>
                      <td>₹{b.totalAmount}</td>
                      <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="booking-mobile-cards">
              {filteredBookings.map((b) => (
                <div key={b._id} className="booking-mobile-card">
                  <div><span className="mobile-label">Booking ID</span> <span className="mobile-value">#{b._id.slice(-6).toUpperCase()}</span></div>
                  <div><span className="mobile-label">User</span> <span className="mobile-value">{b.userName}</span></div>
                  <div><span className="mobile-label">Temple</span> <span className="mobile-value">{b.templeName}</span></div>
                  <div><span className="mobile-label">Pooja</span> <span className="mobile-value">{b.poojaType}</span></div>
                  <div><span className="mobile-label">Tickets</span> <span className="mobile-value">{b.tickets}</span></div>
                  <div><span className="mobile-label">Total Amount</span> <span className="mobile-value" style={{ color: '#FF6B00' }}>₹{b.totalAmount}</span></div>
                  <div><span className="mobile-label">Status</span> 
                    <span className={`status-badge ${getStatusClass(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Bookings;
