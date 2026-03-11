import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './organizer-shared.css';

const Ohome = () => {
  const [stats, setStats] = useState({ totalTemples: 0, totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const organizerName = localStorage.getItem('organizerName') || 'Organizer';
  const token = localStorage.getItem('organizerToken');
  useEffect(() => {
    if (!token) { navigate('/login?role=organizer'); return; }
    api.get('/organizer/stats')
      .then(r => setStats(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="o-page">
      <Onavbar />
      <main className="o-main">

        {/* Page Header */}
        <div className="o-page-header">
          <div>
            <h1>Welcome, {organizerName}</h1>
            <p className="o-subtitle">Here is a quick look at your temple work.</p>
          </div>
        </div>

        {/* Stats Band */}
        <div className="o-stats-band">
          <div className="o-stat-item">
            <span className="o-stat-value">{loading ? '—' : stats.totalTemples}</span>
            <span className="o-stat-label">Temples Listed</span>
          </div>
          <div className="o-stat-item">
            <span className="o-stat-value">{loading ? '—' : stats.totalBookings}</span>
            <span className="o-stat-label">Total Bookings</span>
          </div>
          <div className="o-stat-item">
            <span className="o-stat-value">{loading ? '—' : `₹${stats.totalRevenue.toLocaleString()}`}</span>
            <span className="o-stat-label">Money Earned</span>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="o-section">
          <h2 className="o-section-title">Quick Actions</h2>
          <div className="o-actions-row">
            <Link to="/organizer/create-temple" className="o-action-btn primary">+ Add New Temple</Link>
            <Link to="/organizer/my-temples" className="o-action-btn secondary">My Temples</Link>
            <Link to="/organizer/bookings" className="o-action-btn secondary">View Bookings</Link>
            <Link to="/organizer/darshans" className="o-action-btn secondary">Handle Darshans</Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Ohome;
