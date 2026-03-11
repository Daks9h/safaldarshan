/* src/Users/Temples.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Unavbar from './Unavbar';
import './Temples.css';

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const [filteredTemples, setFilteredTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/user/temples`);
        setTemples(response.data);
        setFilteredTemples(response.data);
      } catch (err) {
        console.error('Error fetching temples:', err);
        setError('Failed to load temples. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemples();
  }, []);

  // Client-side filtering logic
  useEffect(() => {
    let result = [...temples];

    // Search by Name or City
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (temple) =>
          temple.name.toLowerCase().includes(query) ||
          temple.city.toLowerCase().includes(query)
      );
    }

    // Filter by State
    if (filterState !== 'All') {
      result = result.filter((temple) => temple.state === filterState);
    }

    // Filter by Min Price
    if (minPrice) {
      result = result.filter((temple) => temple.price >= parseFloat(minPrice));
    }

    // Filter by Max Price
    if (maxPrice) {
      result = result.filter((temple) => temple.price <= parseFloat(maxPrice));
    }

    // Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest') {
      // Assuming Newest is based on the array order or a createdAt field
      // If there's a createdAt field, we'd use it. For now, we'll keep the response order.
      // Suppose latest added is at the end of the array, we can reverse it if needed.
      // But usually newest are displayed first.
      // For this example, we'll just keep the default fetch order.
    }

    setFilteredTemples(result);
  }, [search, filterState, minPrice, maxPrice, sortBy, temples]);

  // Extract unique states for the dropdown
  const uniqueStates = [...new Set(temples.map((t) => t.state))].sort();

  if (loading) return <div className="loading-indicator">🙏 Bringing the temples to you...</div>;

  return (
    <div className="temples-page">
      <Unavbar />
      <div className="container" style={{ marginTop: '90px' }}>
        {/* Search and Filters Section */}
        <div className="temples-filter-section">
          <div className="filter-input-group">
            <label>Search Temples</label>
            <input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-input-group">
            <label>State</label>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
              <option value="All">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-input-group">
            <label>Price Range (₹)</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-input-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Newest">Newest First</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error && <div className="error-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>{error}</div>}

        {/* Grid Results */}
        {filteredTemples.length === 0 ? (
          <div className="empty-results">
            <h3>No temples found</h3>
            <p>We couldn't find any temples matching your criteria.</p>
            <p className="saffron-suggestion">Try adjusting your filters or searching for something else! 🙏</p>
          </div>
        ) : (
          <div className="temples-grid-container">
            {filteredTemples.map((temple) => (
              <div key={temple._id} className="user-temple-card">
                <img
                  src={temple.image || 'https://via.placeholder.com/400x250'}
                  alt={temple.name}
                  className="user-temple-image"
                />
                <div className="user-temple-card-body">
                  <h3>{temple.name}</h3>
                  <div className="user-temple-location">
                    📍 {temple.city}, {temple.state}
                  </div>
                  <p className="user-temple-desc">{temple.description}</p>
                  
                  {temple.poojaTypes && temple.poojaTypes.length > 0 && (
                    <div className="user-pooja-tags">
                      {temple.poojaTypes.map((pooja, i) => (
                        <span key={i} className="u-pooja-pill">
                          {pooja}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="user-temple-price-row">
                    <span className="user-price-label">₹{temple.price} <small>/ person</small></span>
                  </div>

                  <Link to={`/user/temple/${temple._id}`} className="view-book-btn">
                    View & Book Darshan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Temples;
