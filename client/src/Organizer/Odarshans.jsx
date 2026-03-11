import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './organizer-shared.css';

const Odarshans = () => {
  const [allDarshans, setAllDarshans] = useState([]);
  const [filteredDarshans, setFilteredDarshans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [temples, setTemples] = useState([]);
  const [filterTemple, setFilterTemple] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const navigate = useNavigate();
  const token = localStorage.getItem('organizerToken');

  useEffect(() => {
    if (!token) { navigate('/login?role=organizer'); return; }

    api.get('/organizer/darshans')
      .then(r => {
        setAllDarshans(r.data);
        setFilteredDarshans(r.data);
        const uniqueTemples = r.data.reduce((acc, d) => {
          if (d.templeId && !acc.find(t => t._id === d.templeId._id)) acc.push(d.templeId);
          return acc;
        }, []);
        setTemples(uniqueTemples);
      })
      .catch(() => setError('Failed to fetch darshan slots. Please try again.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  useEffect(() => {
    let result = allDarshans;
    if (filterTemple !== 'All') result = result.filter(d => d.templeId?._id === filterTemple);
    if (filterStatus !== 'All') result = result.filter(d => {
      const available = d.capacity - (d.booked || 0);
      if (filterStatus === 'Available') return available > 0;
      if (filterStatus === 'Full') return available <= 0;
      return true;
    });
    setFilteredDarshans(result);
  }, [filterTemple, filterStatus, allDarshans]);

  if (loading) return <div className="o-loading">Loading darshan slots...</div>;

  return (
    <div className="o-page">
      <Onavbar />
      <main className="o-main">

        {/* Page Header */}
        <div className="o-page-header">
          <div>
            <div className="o-page-top-nav" style={{ marginBottom: '0.5rem' }}>
              <Link to="/organizer/home" className="o-back-btn">← Dashboard</Link>
              <span className="o-breadcrumb">Darshan Slots</span>
            </div>
            <h1>Darshan Slots</h1>
            <p className="o-subtitle">Overview of all darshan slots across your temples.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="o-filter-row">
          <div className="filter-group">
            <label>Temple</label>
            <select value={filterTemple} onChange={(e) => setFilterTemple(e.target.value)}>
              <option value="All">All Temples</option>
              {temples.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Availability</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Full">Full</option>
            </select>
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', margin: '1rem 0' }}>{error}</p>}

        {filteredDarshans.length === 0 ? (
          <div className="o-empty">
            <h3>No darshan slots found</h3>
            <p>Create darshan slots from the My Temples page by selecting a temple.</p>
            <Link to="/organizer/my-temples" className="o-action-btn primary" style={{ marginTop: '1rem' }}>Go to My Temples</Link>
          </div>
        ) : (
          <div className="o-list">
            {filteredDarshans.map((slot, idx) => {
              const available = slot.capacity - (slot.booked || 0);
              const isFull = available <= 0;
              return (
                <div key={idx} className="o-list-row">
                  <div className="o-list-info">
                    <h3>{slot.templeId?.name || 'Temple'}</h3>
                    <p>🕐 {slot.timeSlot} &nbsp;|&nbsp; 🙏 {slot.poojaType}</p>
                    <p>₹{slot.price} per person &nbsp;|&nbsp; Capacity: {slot.capacity} &nbsp;|&nbsp; Booked: {slot.booked || 0}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`o-status-pill ${isFull ? 'full' : 'available'}`}>
                      {isFull ? 'House Full' : `${available} available`}
                    </span>
                    <button className="o-btn-edit" onClick={() => navigate(`/organizer/temple/${slot.templeId?._id}/darshan`)}>
                      Manage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Odarshans;
