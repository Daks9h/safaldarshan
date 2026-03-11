/* src/Admin/AllUsers.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anavbar from './Anavbar';
import './admin-shared.css';
import './AllUsers.css';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/login?role=admin');
            return;
        }
        fetchUsers();
    }, [token, navigate]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side filtering
    useEffect(() => {
        let result = users;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(u => 
                u.name.toLowerCase().includes(lowerSearch) ||
                u.email.toLowerCase().includes(lowerSearch) ||
                (u.city && u.city.toLowerCase().includes(lowerSearch))
            );
        }

        if (filterStatus !== 'All') {
            const isActive = filterStatus === 'Active';
            result = result.filter(u => u.isActive === isActive);
        }

        setFilteredUsers(result);
    }, [searchTerm, filterStatus, users]);

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/user/${selectedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user.');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    if (isLoading) {
        return (
            <div className="admin-page-container">
                <Anavbar />
                <div className="admin-loading-center">
                    <div className="spinner-saffron"></div>
                    <p>Loading Devotee Directory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="all-users-page">
            <Anavbar />
            
            <main className="users-main">
                <div className="users-container">
                    {/* Summary Card */}
                    <div className="users-summary-card">
                        <div className="summary-info">
                            <span className="summary-count">{users.length}</span>
                            <span className="summary-label">Total Registered Devotees</span>
                        </div>
                        <div className="summary-icon">👥</div>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="users-controls-card">
                        <div className="search-group">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search by name, email or city..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Account Status:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="All">All Users</option>
                                <option value="Active">Active Only</option>
                                <option value="Inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="users-empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No devotees found.</h3>
                            <p>Try resetting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className="table-responsive-container">
                            <table className="users-admin-table">
                                <thead>
                                    <tr>
                                        <th>Devotee</th>
                                        <th>Contact Details</th>
                                        <th>Location</th>
                                        <th>Bookings</th>
                                        <th>Joined On</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-profile-cell">
                                                    <div className="user-avatar-init">{(user.name || 'U').charAt(0)}</div>
                                                    <span className="user-name-bold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-col">
                                                    <span className="email-sub">{user.email}</span>
                                                    <span className="phone-sub">{user.phone}</span>
                                                </div>
                                            </td>
                                            <td>{user.city || 'Not Specified'}</td>
                                            <td>
                                                <span className="booking-count-badge">
                                                    {user.bookings?.length || 0} Bookings
                                                </span>
                                            </td>
                                            <td>{formatDate(user.createdAt)}</td>
                                            <td>
                                                <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn-delete-row"
                                                    onClick={() => handleDeleteClick(user)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Grid */}
                            <div className="user-mobile-list">
                                {filteredUsers.map(user => (
                                    <div key={user._id} className="user-mobile-card">
                                        <div className="card-top-row">
                                            <div className="user-avatar-init">{(user.name || 'U').charAt(0)}</div>
                                            <div className="name-status">
                                                <h4>{user.name}</h4>
                                                <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body-details">
                                            <p><strong>Email:</strong> {user.email}</p>
                                            <p><strong>City:</strong> {user.city || 'N/A'}</p>
                                            <p><strong>Bookings:</strong> {user.bookings?.length || 0}</p>
                                        </div>
                                        <button className="btn-delete-row full-width" onClick={() => handleDeleteClick(user)}>
                                            Remove User
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <div className="modal-top-icon red">🗑️</div>
                        <h3>Confirm Account Deletion</h3>
                        <p className="modal-message">
                            Are you sure you want to permanently delete <strong>{selectedUser?.name}</strong>? 
                            This action will also cancel any active darshan bookings they have.
                        </p>
                        <div className="modal-actions-admin">
                            <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button 
                                className="btn-modal-delete" 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Devotee'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllUsers;

