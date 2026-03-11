/* src/Admin/AllTemples.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anavbar from './Anavbar';
import './admin-shared.css';
import './AllTemples.css';

const AllTemples = () => {
    const [temples, setTemples] = useState([]);
    const [filteredTemples, setFilteredTemples] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/login?role=admin');
            return;
        }
        fetchTemples();
    }, [token, navigate]);

    const fetchTemples = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/temples`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemples(response.data);
            setFilteredTemples(response.data);
        } catch (err) {
            console.error('Error fetching temples:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side filtering
    useEffect(() => {
        let result = temples;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(t => 
                t.name.toLowerCase().includes(lowerSearch) ||
                t.city.toLowerCase().includes(lowerSearch) ||
                (t.organizerId && t.organizerId.name && t.organizerId.name.toLowerCase().includes(lowerSearch))
            );
        }

        if (filterStatus !== 'All') {
            const isActive = filterStatus === 'Active';
            result = result.filter(t => t.isActive === isActive);
        }

        setFilteredTemples(result);
    }, [searchTerm, filterStatus, temples]);

    const handleToggleClick = (temple) => {
        setSelectedTemple(temple);
        setShowModal(true);
    };

    const confirmToggle = async () => {
        if (!selectedTemple) return;
        setIsProcessing(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/temple/toggle/${selectedTemple._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state without reload
            setTemples(prev => prev.map(t => 
                t._id === selectedTemple._id ? { ...t, isActive: !t.isActive } : t
            ));
            setShowModal(false);
            setSelectedTemple(null);
        } catch (err) {
            console.error('Error toggling temple status:', err);
            alert('Failed to update temple status.');
        } finally {
            setIsProcessing(false);
        }
    };

    const stats = {
        total: temples.length,
        active: temples.filter(t => t.isActive).length
    };

    if (isLoading) {
        return (
            <div className="admin-page-container">
                <Anavbar />
                <div className="admin-loading-center">
                    <div className="admin-spinner-saffron"></div>
                    <p>Loading Temple List...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="all-temples-page">
            <Anavbar />
            
            <main className="temples-main">
                <div className="temples-container">
                    {/* Summary Header */}
                    <div className="temples-summary-banner">
                        <div className="summary-text-group">
                            <h1>Temple List</h1>
                            <p>See all holy places on the website.</p>
                        </div>
                        <div className="summary-status-grid">
                            <div className="summary-item">
                                <span className="s-val">{stats.total}</span>
                                <span className="s-lab">Total Temples</span>
                            </div>
                            <div className="summary-item accent">
                                <span className="s-val">{stats.active}</span>
                                <span className="s-lab">Active Status</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="temples-controls-card">
                        <div className="search-group-admin">
                            <span className="sc-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search by name, city or manager..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group-admin">
                            <label>Display Status:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="All">All Temples</option>
                                <option value="Active">Active Only</option>
                                <option value="Inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>

                    {filteredTemples.length === 0 ? (
                        <div className="temples-empty-state">
                            <div className="empty-img"></div>
                            <h3>No temples found.</h3>
                            <p>Try refining your search or filter criteria.</p>
                        </div>
                    ) : (
                        <div className="temples-grid">
                            {filteredTemples.map(temple => (
                                <div key={temple._id} className="temple-admin-card">
                                    <div className="t-card-img">
                                        <img src={temple.image || 'https://via.placeholder.com/400x200?text=No+Image'} alt={temple.name} />
                                        <span className={`t-status-badge ${temple.isActive ? 'active' : 'inactive'}`}>
                                            {temple.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="t-card-content">
                                        <div className="t-header-info">
                                            <h3>{temple.name}</h3>
                                            <p className="t-location">📍 {temple.city}, {temple.state}</p>
                                        </div>
                                        
                                        <div className="t-meta-details">
                                            <div className="t-meta-row">
                                                <span className="m-label">Partner:</span>
                                                <span className="m-val">{temple.organizerId?.name || 'N/A'}</span>
                                            </div>
                                            <div className="t-meta-row">
                                                <span className="m-label">Ticket Price:</span>
                                                <span className="m-val saffron-text">₹{temple.price || 0}</span>
                                            </div>
                                            <div className="t-meta-row">
                                                <span className="m-label">Reg. Date:</span>
                                                <span className="m-val">{new Date(temple.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        <div className="t-card-actions">
                                            <button 
                                                className={`btn-toggle-status ${temple.isActive ? 'deactivate' : 'activate'}`}
                                                onClick={() => handleToggleClick(temple)}
                                            >
                                                {temple.isActive ? 'Stop Temple' : 'Start Temple'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-box">
                            {selectedTemple?.isActive ? '!' : '✓'}
                        <h3>Confirm Status Change</h3>
                        <p className="modal-text">
                            Are you sure you want to <strong>{selectedTemple?.isActive ? 'deactivate' : 'activate'}</strong> 
                            <br /> "{selectedTemple?.name}"?
                        </p>
                        {selectedTemple?.isActive && (
                            <p className="modal-warning">Deactivated temples will not be visible to users for booking.</p>
                        )}
                        <div className="modal-btns">
                            <button className="btn-m-cancel" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</button>
                            <button 
                                className={`btn-m-confirm ${selectedTemple?.isActive ? 'red' : 'green'}`} 
                                onClick={confirmToggle}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Working...' : (selectedTemple?.isActive ? 'Yes, Stop' : 'Yes, Start')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTemples;

