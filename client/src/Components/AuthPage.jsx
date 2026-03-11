import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default to user, determine from query param if provided ?role=admin
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'user';
  
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already logged in for that role
  // Bypass redirection loop if manual logout was requested but cache remains
  // useEffect(() => {
  //   if (role === 'user' && localStorage.getItem('userToken')) navigate('/');
  //   if (role === 'organizer' && localStorage.getItem('organizerToken')) navigate('/organizer/home');
  //   if (role === 'admin' && localStorage.getItem('adminToken')) navigate('/admin/home');
  // }, [role, navigate]);

  // Sync route changes
  useEffect(() => {
    setIsLogin(location.pathname !== '/signup');
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, phone, city, password, confirmPassword } = formData;

    if (!email || !password) {
      setError('Email and password are mandatory.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    if (!isLogin) {
      if (!name || !phone) {
        setError('Please fill in all mandatory fields.');
        return;
      }
      if (role === 'user' && !city) {
        setError('City is mandatory for devotees.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        setError('Phone number must be exactly 10 digits.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'register';
      let payload = { email, password };
      
      if (!isLogin) {
        payload = { ...payload, name, phone };
        if (role === 'user') Object.assign(payload, { city });
      }

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${role}/${endpoint}`;
      const response = await axios.post(url, payload);

      if (isLogin) {
        // Handle Login Success
        const { token, user, organizerData, admin } = response.data;
        if (role === 'user') {
          localStorage.setItem('userToken', token);
          localStorage.setItem('userData', JSON.stringify(user));
          navigate('/');
        } else if (role === 'organizer') {
          const orgData = organizerData || response.data.organizer;
          localStorage.setItem('organizerToken', token);
          localStorage.setItem('organizerData', JSON.stringify(orgData));
          localStorage.setItem('organizerName', orgData.name);
          navigate('/organizer/home');
        } else if (role === 'admin') {
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminData', JSON.stringify(admin));
          navigate('/admin/home');
        }
      } else {
        // Handle Signup Success
        if (role === 'user') {
          const { token, user } = response.data;
          localStorage.setItem('userToken', token);
          localStorage.setItem('userData', JSON.stringify(user));
          navigate('/');
        } else if (role === 'organizer') {
          // Auto-login Organizer
          const { token, organizerData } = response.data;
          const orgData = organizerData || response.data.organizer;
          localStorage.setItem('organizerToken', token);
          localStorage.setItem('organizerData', JSON.stringify(orgData));
          localStorage.setItem('organizerName', orgData?.name || 'Organizer');
          navigate('/organizer/home');
        } else if (role === 'admin') {
          const { token, admin } = response.data;
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminData', JSON.stringify(admin));
          navigate('/admin/home');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getHeroContent = () => {
    switch(role) {
      case 'user':
        return {
          badge: 'User Portal',
          title: 'Start Your Holy Visit',
          desc: 'Connect with holy places. Book darshans, poojas, and more easily.'
        };
      case 'organizer':
        return {
          badge: 'Temple Work',
          title: 'Handle Your Holy Space',
          desc: 'Help your temple work with सफलDarshan tools. Make bookings easy.'
        };
      case 'admin':
        return {
          badge: 'Admin Panel',
          title: isLogin ? 'Admin Control' : 'Join Admin Team',
          desc: isLogin ? 'Look after everything on the सफलDarshan website.' : 'Help manage the सफलDarshan platform operations.'
        };
      default: return {};
    }
  };

  const hero = getHeroContent();

  return (
    <div className="auth-page">
      <Link to="/" className="back-home-btn">← Back to Home</Link>
      <div className="auth-container">
        
        {/* Left Side: Dynamic Hero */}
        <div className={`auth-hero auth-hero-${role}`}>
          <div className="auth-hero-overlay"></div>
          <div className="auth-hero-content">
            <span className="hero-badge">{hero.badge}</span>
            <h1>{hero.title}</h1>
            <p>{hero.desc}</p>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="auth-form-section">
          <div className="form-inner-wrapper">
            
            {/* Role Selector Tabs */}
            <div className="role-selector">
              <button className={role === 'user' ? 'active' : ''} onClick={() => { setRole('user'); setError(''); setSuccess(''); }}>Devotee</button>
              <button className={role === 'organizer' ? 'active' : ''} onClick={() => { setRole('organizer'); setError(''); setSuccess(''); }}>Organizer</button>
              <button className={role === 'admin' ? 'active' : ''} onClick={() => { setRole('admin'); setError(''); setSuccess(''); }}>Admin</button>
            </div>

            <div className="auth-header">
              <h2>{isLogin ? `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}` : `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</h2>
              <p>{isLogin ? 'Welcome back! Enter your credentials.' : 'Create your account to get started.'}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" placeholder="Rahul Sharma" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" name="email" placeholder="rahul@example.com" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" name="phone" placeholder="10 digit number" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>
                  {role === 'user' && (
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" placeholder="E.g. Varanasi" value={formData.city} onChange={handleChange} required />
                    </div>
                  )}
                </>
              )}

              {isLogin && (
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
                </div>
              )}

              {!isLogin ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Create Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Min 6 chars" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                        placeholder="Repeat password" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Now')}
              </button>
            </form>

            <div className="auth-footer">
                <p>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Sign up here' : 'Login here'}
                  </span>
                </p>
              </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
