import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './CreateTemple.css';

const CreateTemple = () => {
  const [formData, setFormData] = useState({ name: '', description: '', address: '', city: '', state: '', price: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [timeSlots, setTimeSlots] = useState(['']);
  const [poojaTypes, setPoojaTypes] = useState(['']);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('organizerToken');

  useEffect(() => { if (!token) navigate('/login?role=organizer'); }, [token, navigate]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDynamicChange = (index, value, type) => {
    if (type === 'slot') { const n = [...timeSlots]; n[index] = value; setTimeSlots(n); }
    else { const n = [...poojaTypes]; n[index] = value; setPoojaTypes(n); }
  };

  const addField = (type) => type === 'slot' ? setTimeSlots([...timeSlots, '']) : setPoojaTypes([...poojaTypes, '']);
  const removeField = (index, type) => {
    if (type === 'slot') setTimeSlots(timeSlots.filter((_, i) => i !== index));
    else setPoojaTypes(poojaTypes.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!formData.name) e.name = 'Temple name is required';
    if (!formData.description) e.description = 'Description is required';
    if (!formData.city) e.city = 'City is required';
    if (!formData.state) e.state = 'State is required';
    if (!formData.price) e.price = 'Price is required';
    if (!image) e.image = 'Temple image is required';
    if (timeSlots.filter(s => s.trim()).length === 0) e.slots = 'At least one time slot is required';
    if (poojaTypes.filter(p => p.trim()).length === 0) e.poojas = 'At least one pooja type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append('image', image);
    data.append('timeSlots', JSON.stringify(timeSlots.filter(s => s.trim())));
    data.append('poojaTypes', JSON.stringify(poojaTypes.filter(p => p.trim())));
    try {
      await api.post('/organizer/create-temple', data);
      navigate('/organizer/my-temples');
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Error creating temple. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="create-temple-page">
      <Onavbar />
      <div className="form-container">

        {/* Header + Back */}
        <div className="o-page-top-nav">
          <Link to="/organizer/home" className="o-back-btn">← Dashboard</Link>
          <span className="o-breadcrumb">Add New Temple</span>
        </div>

        <h2>Add a New Temple</h2>
        <p className="form-subtitle">Fill in the details below to put your temple on सफलDarshan.</p>

        <form className="temple-form" onSubmit={handleSubmit} noValidate>

          <div className="form-row">
            <div className="form-field">
              <label>Temple Name *</label>
              <input type="text" name="name" placeholder="e.g. Kashi Vishwanath Mandir" value={formData.name} onChange={handleInputChange} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-field">
              <label>Ticket Price per Person (₹) *</label>
              <input type="number" name="price" placeholder="e.g. 50" value={formData.price} onChange={handleInputChange} />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Description *</label>
            <textarea name="description" rows="3" placeholder="Describe the temple, its history and significance" value={formData.description} onChange={handleInputChange}></textarea>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-field">
            <label>Full Address</label>
            <input type="text" name="address" placeholder="Street address, landmark" value={formData.address} onChange={handleInputChange} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>City *</label>
              <input type="text" name="city" placeholder="e.g. Varanasi" value={formData.city} onChange={handleInputChange} />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            <div className="form-field">
              <label>State *</label>
              <input type="text" name="state" placeholder="e.g. Uttar Pradesh" value={formData.state} onChange={handleInputChange} />
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Available Darshan Time Slots *</label>
              <div className="dynamic-list">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className="dynamic-item">
                    <input type="text" placeholder="e.g. 6:00 AM – 8:00 AM" value={slot} onChange={(e) => handleDynamicChange(idx, e.target.value, 'slot')} />
                    {timeSlots.length > 1 && <button type="button" className="remove-btn" onClick={() => removeField(idx, 'slot')}>×</button>}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={() => addField('slot')}>+ Add Slot</button>
              </div>
              {errors.slots && <span className="error-text">{errors.slots}</span>}
            </div>

            <div className="form-field">
              <label>Pooja Types Offered *</label>
              <div className="dynamic-list">
                {poojaTypes.map((pooja, idx) => (
                  <div key={idx} className="dynamic-item">
                    <input type="text" placeholder="e.g. Abhishek Pooja" value={pooja} onChange={(e) => handleDynamicChange(idx, e.target.value, 'pooja')} />
                    {poojaTypes.length > 1 && <button type="button" className="remove-btn" onClick={() => removeField(idx, 'pooja')}>×</button>}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={() => addField('pooja')}>+ Add Pooja</button>
              </div>
              {errors.poojas && <span className="error-text">{errors.poojas}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Temple Image *</label>
            <div className="file-input-wrapper" onClick={() => document.getElementById('file-upload').click()}>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <p>📷 {image ? image.name : 'Click to upload temple photo'}</p>
              {imagePreview && <img src={imagePreview} alt="Preview" className="file-preview" />}
            </div>
            {errors.image && <span className="error-text">{errors.image}</span>}
          </div>

          {errors.server && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>{errors.server}</p>}

          <div className="form-actions-row">
            <button type="button" className="btn-cancel" onClick={() => navigate('/organizer/my-temples')}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Temple'}</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTemple;
