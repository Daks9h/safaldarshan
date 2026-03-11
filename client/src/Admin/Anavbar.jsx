/* src/Admin/Anavbar.jsx */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import './Anavbar.css';

const Anavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [adminName, setAdminName] = useState('Admin');
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
                const parsedData = JSON.parse(adminData);
                setAdminName(parsedData.name || 'Administrator');
            } catch (err) {
                console.error('Error parsing admin data:', err);
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/login?role=admin');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-nav-container">
                {/* Brand Section */}
                <div className="admin-nav-brand-group">
                    <Link to="/admin/home" className="admin-nav-brand" onClick={closeMenu}>
                        सफलDarshan
                    </Link>
                    <span className="admin-nav-badge">Admin Panel</span>
                </div>

                {/* Hamburger Switch for Mobile */}
                <button className={`admin-hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation Links */}
                <div className={`admin-nav-content ${isMenuOpen ? 'mobile-visible' : ''}`}>
                    <div className="admin-nav-links">
                        <NavLink 
                            to="/admin/home" 
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/admin/organizers" 
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            Organizers
                        </NavLink>

                        <NavLink 
                            to="/admin/users" 
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            Users
                        </NavLink>
                        <NavLink 
                            to="/admin/temples" 
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            Temples
                        </NavLink>
                        <NavLink 
                            to="/admin/bookings" 
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            Bookings
                        </NavLink>
                    </div>

                    {/* Admin Profile & Logout */}
                    <div className="admin-nav-profile-section">
                        <div className="admin-profile-info">
                            <div className="admin-avatar">A</div>
                            <span className="admin-display-name">{adminName}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-admin-logout">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Anavbar;
