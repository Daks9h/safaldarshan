/* src/Admin/Ahome.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anavbar from './Anavbar';
import './admin-shared.css';
import './Ahome.css';

const Ahome = () => {
    const [stats, setStats] = useState({
        totalOrganizers: 0,
        verifiedOrganizers: 0,
        totalUsers: 0,
        totalTemples: 0,
        activeTemples: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0
    });
    const [adminName, setAdminName] = useState('Admin');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/login?role=admin');
            return;
        }

        const adminData = localStorage.getItem('adminData');
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                setAdminName(parsed.name || 'Administrator');
            } catch (err) {
                console.error('Error parsing admin data', err);
            }
        }

        const fetchDashboardStats = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/dashboard-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, [navigate]);

    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    if (isLoading) {
        return (
            <div className="admin-loading-page">
                <Anavbar />
                <div className="admin-loader-container">
                    <div className="admin-spinner"></div>
                    <p>Loading Dashboard Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ahome-page">
            <Anavbar />
            
            <main className="ahome-main">
                <div className="ahome-container">
                    {/* Welcome Section */}
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h1>Welcome back, {adminName} 👋</h1>
                            <p className="current-date">{currentDate}</p>
                        </div>
                        <div className="system-status-badge">
                            <span className="dot"></span> System Live
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <section className="stats-section">
                        <h2 className="section-title">Platform Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon orange">👥</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalOrganizers}</span>
                                    <span className="stat-label">Total Organizers</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green">✔️</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.verifiedOrganizers}</span>
                                    <span className="stat-label">Verified Partners</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon blue">👤</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalUsers}</span>
                                    <span className="stat-label">Total Devotees</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon saffron">🕍</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalTemples}</span>
                                    <span className="stat-label">Total Temples</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">✨</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.activeTemples}</span>
                                    <span className="stat-label">Active Temples</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon yellow">🎫</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.totalBookings}</span>
                                    <span className="stat-label">Total Bookings</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon teal">✅</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.confirmedBookings}</span>
                                    <span className="stat-label">Confirmed Slots</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">❌</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.cancelledBookings}</span>
                                    <span className="stat-label">Cancellations</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions Grid */}
                    <section className="actions-section">
                        <h2 className="section-title">Quick Operational Actions</h2>
                        <div className="actions-grid">
                            <Link to="/admin/organizers" className="action-card">
                                <span className="action-icon">🏢</span>
                                <div className="action-text">
                                    <h3>Manage Organizers</h3>
                                    <p>Review and manage all temple organizers on the platform.</p>
                                </div>
                                <span className="action-arrow">→</span>
                            </Link>



                            <Link to="/admin/users" className="action-card">
                                <span className="action-icon">👥</span>
                                <div className="action-text">
                                    <h3>Manage Users</h3>
                                    <p>View and manage all registered devotee accounts.</p>
                                </div>
                                <span className="action-arrow">→</span>
                            </Link>

                            <Link to="/admin/temples" className="action-card">
                                <span className="action-icon">🛕</span>
                                <div className="action-text">
                                    <h3>Manage Temples</h3>
                                    <p>Inspect, edit, or remove listed temples from the system.</p>
                                </div>
                                <span className="action-arrow">→</span>
                            </Link>

                            <Link to="/admin/bookings" className="action-card">
                                <span className="action-icon">📝</span>
                                <div className="action-text">
                                    <h3>View All Bookings</h3>
                                    <p>Access full booking history and current status reports.</p>
                                </div>
                                <span className="action-arrow">→</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Ahome;

