import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import Onavbar from './Onavbar';
import './organizer-shared.css';

const EditTemple = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('organizerToken');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    price: '',
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [timeSlots, setTimeSlots] = useState(['']);
  const [poojaTypes, setPoojaTypes] = useState(['']);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/login?role=organizer');
      return;
    }

    const fetchTemple = async () => {
      try {
        const response = await api.get(`/organizer/temple/${templeId}`);
        const temple = response.data;
        setFormData({
          name: temple.name,
          description: temple.description,
          address: temple.address || '',
          city: temple.city || '',
          state: temple.state || '',
          price: temple.price || '',
        });
        // Use the first image if it exists
        if (temple.images && temple.images.length > 0) {
          setCurrentImage(temple.images[0]);
        }
        setTimeSlots(temple.timeSlots || ['']);
        setPoojaTypes(temple.poojaTypes || ['']);
      } catch (err) {
        console.error('Error fetching temple:', err);
        setErrors({ fetch: 'Failed to load temple data.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemple();
  }, [templeId, token, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDynamicChange = (index, value, type) => {
    if (type === 'slot') {
      const newSlots = [...timeSlots];
      newSlots[index] = value;
      setTimeSlots(newSlots);
    } else {
      const newPoojas = [...poojaTypes];
      newPoojas[index] = value;
      setPoojaTypes(newPoojas);
    }
  };

  const addField = (type) => {
    if (type === 'slot') {
      setTimeSlots([...timeSlots, '']);
    } else {
      setPoojaTypes([...poojaTypes, '']);
    }
  };

  const removeField = (index, type) => {
    if (type === 'slot') {
      const newSlots = timeSlots.filter((_, i) => i !== index);
      setTimeSlots(newSlots);
    } else {
      const newPoojas = poojaTypes.filter((_, i) => i !== index);
      setPoojaTypes(newPoojas);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Temple name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.price) newErrors.price = 'Ticket price is required';
    
    // Address is optional in CreateTemple, let's keep it optional here too
    
    if (timeSlots.filter(s => s.trim()).length === 0) newErrors.slots = 'At least one time slot is required';
    if (poojaTypes.filter(p => p.trim()).length === 0) newErrors.poojas = 'At least one pooja type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUpdating(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('address', formData.address);
    data.append('city', formData.city);
    data.append('state', formData.state);
    data.append('price', formData.price);
    if (image) {
      data.append('image', image);
    } else if (currentImage) {
      data.append('existingImage', currentImage);
    }
    
    data.append('timeSlots', JSON.stringify(timeSlots.filter(s => s.trim())));
    data.append('poojaTypes', JSON.stringify(poojaTypes.filter(p => p.trim())));

    try {
      await api.put(`/organizer/temple/${templeId}`, data);
      alert('Temple updated successfully!');
      navigate('/organizer/my-temples');
    } catch (err) {
      console.error('Error updating temple:', err);
      const msg = err.response?.data?.message || 'Error updating temple. Please try again.';
      setErrors({ server: msg });
      alert(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="loading-overlay">Loading temple data...</div>;

  return (
    <div className="edit-temple-page">
      <Onavbar />
      <div className="form-container">

        {/* Back nav */}
        <div className="o-page-top-nav">
          <Link to="/organizer/my-temples" className="o-back-btn">← My Temples</Link>
          <span className="o-breadcrumb">Edit Temple</span>
        </div>

        <h2>Update Temple Details</h2>
        <p className="form-subtitle">Make changes to your temple listing below.</p>

        <form className="temple-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label>Temple Name*</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-field">
            <label>Description*</label>
            <textarea 
              name="description" 
              rows="4" 
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-field">
            <label>Address (Optional)</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address}
              onChange={handleInputChange}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>City*</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            <div className="form-field">
              <label>State*</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} />
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
          </div>

          <div className="form-field">
            <label>Ticket Price per person (₹)*</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price}
              onChange={handleInputChange}
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="form-field">
            <label>Darshan Time Slots*</label>
            <div className="dynamic-list">
              {timeSlots.map((slot, index) => (
                <div key={index} className="dynamic-item">
                  <input 
                    type="text" 
                    value={slot}
                    onChange={(e) => handleDynamicChange(index, e.target.value, 'slot')}
                  />
                  {timeSlots.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeField(index, 'slot')}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={() => addField('slot')}>+ Add Slot</button>
            </div>
            {errors.slots && <span className="error-text">{errors.slots}</span>}
          </div>

          <div className="form-field">
            <label>Pooja Types*</label>
            <div className="dynamic-list">
              {poojaTypes.map((pooja, index) => (
                <div key={index} className="dynamic-item">
                  <input 
                    type="text" 
                    value={pooja}
                    onChange={(e) => handleDynamicChange(index, e.target.value, 'pooja')}
                  />
                  {poojaTypes.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeField(index, 'pooja')}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={() => addField('pooja')}>+ Add Pooja</button>
            </div>
            {errors.poojas && <span className="error-text">{errors.poojas}</span>}
          </div>

          <div className="form-field">
            <label>Temple Image</label>
            <div className="image-upload-section">
              <img 
                src={imagePreview || (currentImage ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${currentImage}` : 'https://via.placeholder.com/120')} 
                alt="Current" 
                className="current-preview" 
              />
              <div className="file-input-container">
                <div className="file-input-wrapper" onClick={() => document.getElementById('edit-file-upload').click()}>
                  <input 
                    id="edit-file-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <p>{image ? image.name : 'Choose new image (optional)'}</p>
                </div>
              </div>
            </div>
          </div>

          {errors.server && <p className="error-msg" style={{ color: '#ef4444', textAlign: 'center' }}>{errors.server}</p>}

          <div className="form-actions-row">
            <button type="button" className="btn-cancel" onClick={() => navigate('/organizer/my-temples')}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Temple'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemple;
