import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './organizer-shared.css';

const Mytemple = () => {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [templeToDelete, setTempleToDelete] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('organizerToken');

  useEffect(() => {
    if (!token) { navigate('/login?role=organizer'); return; }
    api.get('/organizer/my-temples')
      .then(r => setTemples(r.data))
      .catch(() => setError('Failed to fetch temples.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const confirmDelete = async () => {
    try {
      await api.delete(`/organizer/temple/${templeToDelete}`);
      setTemples(temples.filter(t => t._id !== templeToDelete));
      setShowModal(false);
    } catch {
      alert('Failed to delete temple. Please try again.');
    }
  };

  if (loading) return <div className="o-loading">Loading your temples...</div>;

  return (
    <div className="o-page">
      <Onavbar />
      <main className="o-main">

        {/* Page Header */}
        <div className="o-page-header">
          <div>
            <div className="o-page-top-nav" style={{ marginBottom: '0.5rem' }}>
              <Link to="/organizer/home" className="o-back-btn">← Dashboard</Link>
              <span className="o-breadcrumb">My Temples</span>
            </div>
            <h1>My Temples</h1>
            <p className="o-subtitle">{temples.length} temple{temples.length !== 1 ? 's' : ''} listed on सफलDarshan.</p>
          </div>
          <Link to="/organizer/create-temple" className="o-action-btn primary">+ Add New Temple</Link>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        {temples.length === 0 ? (
          <div className="o-empty">
            <h3>No temples added yet</h3>
            <p>Start by adding your first temple.</p>
            <Link to="/organizer/create-temple" className="o-action-btn primary" style={{ marginTop: '1rem' }}>Add First Temple</Link>
          </div>
        ) : (
          <div className="o-list">
            {temples.map(temple => (
              <div key={temple._id} className="o-list-row">
                <img
                  src={temple.images?.[0] ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${temple.images[0]}` : 'https://via.placeholder.com/120x80'}
                  alt={temple.name}
                  className="o-list-thumb"
                />
                <div className="o-list-info">
                  <h3>{temple.name}</h3>
                  <p>{temple.city}, {temple.state}</p>
                  <p className="o-list-price">₹{temple.price} for one person</p>
                </div>
                <div className="o-list-actions">
                  <button className="o-btn-edit" onClick={() => navigate(`/organizer/edit-temple/${temple._id}`)}>Edit</button>
                  <Link to={`/organizer/temple/${temple._id}/darshan`} className="o-btn-edit" style={{ background: '#6b7280' }}>Darshans</Link>
                  <button className="o-btn-delete" onClick={() => { setTempleToDelete(temple._id); setShowModal(true); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirm Delete Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Temple?</h2>
            <p>This action is permanent and will also remove all associated darshan slots and bookings.</p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-confirm-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mytemple;
