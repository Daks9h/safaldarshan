/* src/Users/Uprofile.jsx */
import React, { useState, useEffect } from 'react';
import Unavbar from './Unavbar';
import Footer from '../Components/Footer';
import './user-shared.css';
import './Uprofile.css';

const Uprofile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate backend update
    setTimeout(() => {
      localStorage.setItem('userData', JSON.stringify(userData));
      setIsEditing(false);
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Profile updated successfully! Namaste 🙏' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  return (
    <div className="profile-page">
      <Unavbar />
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-header">
            <div className="avatar-large">
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <h2>Namaste, {userData.name}</h2>
            <p>Member since {new Date().getFullYear()}</p>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Details</h3>
              {!isEditing && (
                <button className="btn-edit-trigger" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-group-profile">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={userData.name} 
                  onChange={handleChange}
                  disabled={!isEditing} 
                  required
                />
              </div>

              <div className="form-group-profile">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={userData.email} 
                  disabled={true} // Email typically not editable
                  title="Email cannot be changed"
                />
                <span className="input-hint">Restricted Field</span>
              </div>

              <div className="form-row-profile">
                <div className="form-group-profile">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={userData.phone} 
                    onChange={handleChange}
                    disabled={!isEditing} 
                    required
                  />
                </div>
                <div className="form-group-profile">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={userData.city} 
                    onChange={handleChange}
                    disabled={!isEditing} 
                    required
                  />
                </div>
              </div>

              {message.text && (
                <div className={`notification-pill ${message.type}`}>
                  {message.text}
                </div>
              )}

              {isEditing && (
                <div className="form-actions-profile">
                  <button type="button" className="btn-cancel-profile" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-save-profile" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Uprofile;

