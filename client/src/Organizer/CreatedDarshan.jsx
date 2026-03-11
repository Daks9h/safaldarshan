import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './organizer-shared.css';
import './CreatedDarshan.css';

const CreatedDarshan = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('organizerToken');

  const [templeData, setTempleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new slot
  const [newSlot, setNewSlot] = useState({
    date: '',
    timeSlot: '',
    poojaType: '',
    price: '',
    capacity: ''
  });

  const fetchData = async () => {
    if (!token) { navigate('/login?role=organizer'); return; }
    try {
      const r = await api.get(`/organizer/temple/${templeId}/darshan`);
      setTempleData(r.data);
      // Set default price from temple if not already set
      if (r.data.price) {
        setNewSlot(prev => ({ ...prev, price: r.data.price }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch darshan info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [templeId, token, navigate]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.timeSlot || !newSlot.capacity) {
      alert('Please fill mandatory fields (Date, Time, Capacity)');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/organizer/create-darshan', { ...newSlot, templeId });
      setNewSlot({ date: '', timeSlot: '', poojaType: '', price: '', capacity: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this darshan slot?')) return;
    try {
      await api.delete(`/organizer/darshan/${slotId}`);
      fetchData();
    } catch {
      alert('Failed to delete slot.');
    }
  };

  if (loading) return <div className="o-loading">Loading darshan slots...</div>;
  if (error) return <div className="o-empty"><h3>{error}</h3><Link to="/organizer/my-temples" className="o-action-btn secondary" style={{ marginTop: '1rem' }}>← Back to My Temples</Link></div>;
  if (!templeData) return <div className="o-empty"><h3>No data found for this temple.</h3></div>;

  return (
    <div className="o-page">
      <Onavbar />
      <main className="o-main">

        {/* Back nav + Header */}
        <div className="o-page-header">
          <div>
            <div className="o-page-top-nav" style={{ marginBottom: '0.5rem' }}>
              <Link to="/organizer/my-temples" className="o-back-btn">← My Temples</Link>
              <span className="o-breadcrumb">Darshan Slots</span>
            </div>
            <h1>{templeData.name}</h1>
            <p className="o-subtitle">📍 {templeData.city}, {templeData.state} &nbsp;|&nbsp; Current Base Price: ₹{templeData.price}</p>
          </div>
          <button className="o-action-btn primary" onClick={() => navigate(`/organizer/edit-temple/${templeId}`)}>
            Edit Temple
          </button>
        </div>

        <div className="o-grid-split">
          {/* Left: Create Slot Form */}
          <section className="o-section form-section">
            <h2 className="o-section-title">Add New Darshan Slot</h2>
            <form onSubmit={handleCreateSlot} className="o-slot-form">
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Time Slot *</label>
                <select value={newSlot.timeSlot} onChange={e => setNewSlot({...newSlot, timeSlot: e.target.value})} required>
                  <option value="">Select a Slot</option>
                  {(templeData.timeSlots && templeData.timeSlots.length > 0) ? (
                    templeData.timeSlots.map((s, i) => <option key={i} value={s}>{s}</option>)
                  ) : (
                    <option disabled>No time slots defined for this temple</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Pooja Type</label>
                <select value={newSlot.poojaType} onChange={e => setNewSlot({...newSlot, poojaType: e.target.value})}>
                  <option value="">General Darshan</option>
                  {(templeData.poojaTypes && templeData.poojaTypes.length > 0) && 
                    templeData.poojaTypes.map((p, i) => <option key={i} value={p}>{p}</option>)
                  }
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tickets Price (₹)</label>
                  <input type="number" placeholder={templeData.price} value={newSlot.price} onChange={e => setNewSlot({...newSlot, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Max Capacity *</label>
                  <input type="number" placeholder="e.g. 50" value={newSlot.capacity} onChange={e => setNewSlot({...newSlot, capacity: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="o-action-btn primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </section>

          {/* Right: Existing Slots List */}
          <section className="o-section list-section">
            <h2 className="o-section-title">Existing Slots</h2>
            {(templeData.darshanSlots || []).length === 0 ? (
              <p style={{ color: '#6b7280' }}>No slots have been added for this temple yet.</p>
            ) : (
              <div className="o-list">
                {(templeData.darshanSlots || []).map((slot, idx) => {
                  const remaining = slot.capacity - (slot.booked || 0);
                  const isFull = remaining <= 0;
                  const dateStr = new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <div key={idx} className="o-list-row">
                      <div className="o-list-info">
                        <h3 style={{ fontSize: '0.95rem' }}>{dateStr} &nbsp;|&nbsp; 🕐 {slot.timeSlot}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.2rem 0' }}>🙏 {slot.poojaType} &nbsp;|&nbsp; ₹{slot.price}</p>
                        <p style={{ fontSize: '0.85rem' }}>{slot.booked || 0} booked / {slot.capacity} max</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`o-status-pill ${isFull ? 'full' : 'available'}`} style={{ fontSize: '0.75rem' }}>
                          {isFull ? 'Full' : `${remaining} left`}
                        </span>
                        <button className="o-btn-delete" style={{ padding: '0.4rem' }} onClick={() => handleDeleteSlot(slot._id)}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

      </main>
    </div>
  );
};

export default CreatedDarshan;
