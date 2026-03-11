/* src/Admin/AllOrganizers.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anavbar from './Anavbar';
import './admin-shared.css';
import './AllOrganizers.css';

const AllOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);
    const [filteredOrganizers, setFilteredOrganizers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrganizer, setSelectedOrganizer] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/login?role=admin');
            return;
        }

        fetchOrganizers();
    }, [token, navigate]);

    const fetchOrganizers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/organizers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrganizers(response.data);
            setFilteredOrganizers(response.data);
        } catch (err) {
            console.error('Error fetching organizers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side filtering logic
    useEffect(() => {
        let result = organizers;

        if (searchTerm) {
            result = result.filter(org => 
                org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'All') {
            const isVerified = filterStatus === 'Verified';
            result = result.filter(org => org.isVerified === isVerified);
        }

        setFilteredOrganizers(result);
    }, [searchTerm, filterStatus, organizers]);

    const handleDeleteClick = (organizer) => {
        setSelectedOrganizer(organizer);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedOrganizer) return;
        
        setIsDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/organizer/${selectedOrganizer._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setOrganizers(prev => prev.filter(org => org._id !== selectedOrganizer._id));
            setShowDeleteModal(false);
            setSelectedOrganizer(null);
        } catch (err) {
            console.error('Error deleting organizer:', err);
            alert('Failed to delete organizer. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="all-organizers-page">
            <Anavbar />
            
            <main className="organizers-main">
                <div className="organizers-container">
                    <header className="page-header-admin">
                        <h1>Manage Managers</h1>
                        <p>See all temple managers on the सफलDarshan website.</p>
                    </header>

                    {/* Controls Section */}
                    <div className="admin-controls-card">
                        <div className="search-box-admin">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-box-admin">
                            <label>Verification:</label>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Verified">Verified Only</option>
                                <option value="Unverified">Unverified Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Section */}
                    {isLoading ? (
                        <div className="admin-table-loader">
                            <div className="spinner-saffron"></div>
                            <p>Fetching organizers data...</p>
                        </div>
                    ) : filteredOrganizers.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="empty-icon"></div>
                            <h3>No organizers matched your search.</h3>
                            <p>Try adjusting your filters or <span className="saffron-text" style={{cursor:'pointer'}} onClick={() => {setSearchTerm(''); setFilterStatus('All');}}>reset everything</span>.</p>
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper">
                            <table className="admin-organizer-table">
                                <thead>
                                    <tr>
                                        <th>Organizer</th>
                                        <th>Contact Info</th>
                                        <th>Temples</th>
                                        <th>Reg. Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrganizers.map(org => (
                                        <tr key={org._id}>
                                            <td>
                                                <div className="org-name-cell">
                                                    <div className="org-avatar-small">{org.name.charAt(0)}</div>
                                                    <div className="org-info-text">
                                                        <span className="primary-text">{org.name}</span>
                                                        <span className={`status-pill ${org.isActive ? 'active' : 'inactive'}`}>
                                                            {org.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-info-cell">
                                                    <span className="email-text">{org.email}</span>
                                                    <span className="phone-text">Phone: {org.phone}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="temple-count-badge">
                                                    {org.templeCount || 0} Listed
                                                </div>
                                            </td>
                                            <td>{formatDate(org.createdAt)}</td>
                                            <td>
                                                <span className={`verify-badge ${org.isVerified ? 'verified' : 'unverified'}`}>
                                                    {org.isVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn-delete-admin"
                                                    onClick={() => handleDeleteClick(org)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Mobile Grid View (Hidden on Tablet/Desktop) */}
                            <div className="organizer-mobile-grid">
                                {filteredOrganizers.map(org => (
                                    <div key={org._id} className="org-mobile-card">
                                        <div className="card-top">
                                            <div className="avatar-m">{org.name.charAt(0)}</div>
                                            <div className="name-m">
                                                <h4>{org.name}</h4>
                                                <span className={`verify-badge ${org.isVerified ? 'verified' : 'unverified'}`}>
                                                    {org.isVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <p><strong>Email:</strong> {org.email}</p>
                                            <p><strong>Phone:</strong> {org.phone}</p>
                                            <p><strong>Temples:</strong> {org.templeCount || 0}</p>
                                        </div>
                                        <div className="card-actions">
                                            <button 
                                                className="btn-delete-admin w-full"
                                                onClick={() => handleDeleteClick(org)}
                                            >
                                                Permanently Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-box">
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                            <button className="close-x" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{selectedOrganizer?.name}</strong>?</p>
                            <div className="warning-box">
                                <span className="warning-icon">!</span>
                                <p>This action is irreversible. It will also delete all temples and darshan slots associated with this organizer.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button 
                                className="btn-modal-confirm" 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Organizer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllOrganizers;

