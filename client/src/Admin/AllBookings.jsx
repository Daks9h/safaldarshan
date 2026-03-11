/* src/Admin/AllBookings.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anavbar from './Anavbar';
import './admin-shared.css';
import './AllBookings.css';

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Summary Stats
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        cancelled: 0,
        pending: 0,
        revenue: 0
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/login?role=admin');
            return;
        }
        fetchBookings();
    }, [token, navigate]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/admin/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || [];
            // Sort by latest first
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sortedData);
            setFilteredBookings(sortedData);
            calculateStats(sortedData);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        let confirmed = 0;
        let cancelled = 0;
        let pending = 0;
        let revenue = 0;

        data.forEach(booking => {
            if (booking.status === 'Confirmed') {
                confirmed++;
                revenue += (booking.totalAmount || 0);
            } else if (booking.status === 'Cancelled') {
                cancelled++;
            } else if (booking.status === 'Pending') {
                pending++;
            }
        });

        setStats({ total, confirmed, cancelled, pending, revenue });
    };

    // Apply Client-Side Filters
    useEffect(() => {
        let result = bookings;

        // Search Filter (ID, User Name, Temple Name)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(b => 
                (b._id && b._id.toLowerCase().includes(lowerSearch)) ||
                (b.userId && b.userId.name && b.userId.name.toLowerCase().includes(lowerSearch)) ||
                (b.templeId && b.templeId.name && b.templeId.name.toLowerCase().includes(lowerSearch))
            );
        }

        // Status Filter
        if (filterStatus !== 'All') {
            result = result.filter(b => b.status === filterStatus);
        }

        // Date Range Filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom).setHours(0, 0, 0, 0);
            result = result.filter(b => new Date(b.createdAt).getTime() >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo).setHours(23, 59, 59, 999);
            result = result.filter(b => new Date(b.createdAt).getTime() <= toDate);
        }

        setFilteredBookings(result);
    }, [searchTerm, filterStatus, dateFrom, dateTo, bookings]);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount || 0);
    };

    if (isLoading) {
        return (
            <div className="admin-page-container">
                <Anavbar />
                <div className="admin-loading-center">
                    <div className="spinner-saffron"></div>
                    <p>Loading Global Bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="all-bookings-page">
            <Anavbar />
            
            <main className="bookings-main-admin">
                <div className="bookings-container-admin">
                    <header className="page-header-admin">
                        <h1>Bookings Overview</h1>
                        <p>See all bookings and money earned on the सफलDarshan website.</p>
                    </header>

                    {/* Summary Stats Banner */}
                    <div className="stats-banner-row">
                        <div className="stat-box">
                            <span className="sb-label">Total Bookings</span>
                            <span className="sb-value dark-saffron">{stats.total}</span>
                        </div>
                        <div className="stat-box">
                            <span className="sb-label">Confirmed</span>
                            <span className="sb-value text-green">{stats.confirmed}</span>
                        </div>
                        <div className="stat-box">
                            <span className="sb-label">Cancelled</span>
                            <span className="sb-value text-red">{stats.cancelled}</span>
                        </div>
                        <div className="stat-box revenue-box">
                            <span className="sb-label text-white">Total Revenue</span>
                            <span className="sb-value text-white">₹{formatCurrency(stats.revenue)}</span>
                        </div>
                    </div>

                    {/* Controls Card */}
                    <div className="admin-controls-card wrap-mobile">
                        <div className="search-box-admin flex-2">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search by Booking ID, Devotee, or Temple..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-controls-group flex-3">
                            <div className="filter-item">
                                <label>Status:</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="All">All Statuses</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            
                            <div className="filter-item">
                                <label>From:</label>
                                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            
                            <div className="filter-item">
                                <label>To:</label>
                                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                            
                            {(searchTerm || filterStatus !== 'All' || dateFrom || dateTo) && (
                                <button className="btn-clear-filters" onClick={() => {
                                    setSearchTerm(''); setFilterStatus('All'); setDateFrom(''); setDateTo('');
                                }}>Reset</button>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    {filteredBookings.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="empty-icon">🧾</div>
                            <h3>No bookings found.</h3>
                            <p>Adjust your filters or <span className="saffron-text" style={{cursor:'pointer'}} onClick={() => {
                                setSearchTerm(''); setFilterStatus('All'); setDateFrom(''); setDateTo('');
                            }}>view all bookings</span>.</p>
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper">
                            <table className="admin-organizer-table bookings-table">
                                <thead>
                                    <tr>
                                        <th>Booking ID & Date</th>
                                        <th>Devotee Details</th>
                                        <th>Temple & Organizer</th>
                                        <th>Darshan Info</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map(booking => (
                                        <tr key={booking._id}>
                                            <td>
                                                <div className="b-id-cell">
                                                <span className="b-id">SD-{booking._id.substring(0,8).toUpperCase()}</span>
                                                    <span className="b-date">{formatDate(booking.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="b-user-cell">
                                                    <span className="b-name">{booking.userId?.name || 'Unknown User'}</span>
                                                    <span className="b-email">{booking.userId?.email || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="b-temple-cell">
                                                    <span className="b-tname">{booking.templeId?.name || 'Unknown Temple'}</span>
                                                    <span className="b-tloc">{booking.templeId?.city}, {booking.templeId?.state}</span>
                                                    <span className="b-torg">Org: {booking.templeId?.organizerId?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="b-info-cell">
                                                    <span className="b-slot">Time: {booking.slot}</span>
                                                    <span className="b-pooja">Pooja: {booking.pooja}</span>
                                                    <span className="b-tickets">Ticket: {booking.tickets} Persons</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="b-amount">₹{formatCurrency(booking.totalAmount)}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge-b ${booking.status?.toLowerCase() || 'pending'}`}>
                                                    {booking.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Mobile View */}
                            <div className="bookings-mobile-grid">
                                {filteredBookings.map(booking => (
                                    <div key={booking._id} className="b-mobile-card">
                                        <div className="b-mc-header">
                                            <span className="b-id">SD-{booking._id.substring(0,8).toUpperCase()}</span>
                                            <span className={`status-badge-b ${booking.status?.toLowerCase() || 'pending'}`}>
                                                {booking.status || 'Pending'}
                                            </span>
                                        </div>
                                        
                                        <div className="b-mc-content">
                                            <h4 className="b-mc-tname">{booking.templeId?.name || 'Unknown Temple'}</h4>
                                            <p className="b-mc-sub">Person: {booking.userId?.name || 'Unknown'} ({booking.userId?.email || 'N/A'})</p>
                                            <div className="b-mc-grid">
                                                <span><strong>Slot:</strong> {booking.slot}</span>
                                                <span><strong>Pooja:</strong> {booking.pooja}</span>
                                                <span><strong>Tickets:</strong> {booking.tickets}</span>
                                                <span><strong>Date:</strong> {formatDate(booking.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="b-mc-footer">
                                            <span className="b-mc-org">Org: {booking.templeId?.organizerId?.name || 'Unknown'}</span>
                                            <span className="b-mc-amount">₹{formatCurrency(booking.totalAmount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AllBookings;

