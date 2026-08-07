import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight, faStore, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Vendors.css';

const API_URL = 'http://localhost:5000/api';

// Categories matching image two
const DEFAULT_CATEGORIES = [
    'All Categories',
    'Photography',
    'Catering',
    'DJ & Sound',
    'Decoration',
    'Stage Setup',
    'Transport',
    'Security',
    'Other'
];

export default function Vendors() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch services
                const servicesRes = await fetch(`${API_URL}/vendor/services`);
                const servicesData = await servicesRes.json();
                const fetchedServices = servicesData.services || [];
                setServices(fetchedServices);

                // Dynamically build category list from database items
                const dbCategories = Array.from(
                    new Set(fetchedServices.map(s => s.category).filter(Boolean))
                );

                if (dbCategories.length > 0) {
                    // Combine default categories with any extra categories returned from backend
                    const mergedCategories = Array.from(
                        new Set(['All Categories', ...DEFAULT_CATEGORIES.slice(1), ...dbCategories])
                    );
                    setCategories(mergedCategories);
                }
            } catch (err) {
                console.error('Failed to load vendors or categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter logic supporting precise and loose matching (e.g. 'Decor' vs 'Decoration')
    const filteredServices = selectedCategory === 'All Categories'
        ? services
        : services.filter(s => {
            if (!s.category) return false;
            const cat = s.category.toLowerCase();
            const selected = selectedCategory.toLowerCase();
            
            return cat === selected || 
                   (selected.includes('decor') && cat.includes('decor')) ||
                   (selected.includes('dj') && cat.includes('dj'));
        });

    if (loading) {
        return (
            <section className="vd-section">
                <div className="vd-container vd-state-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="vd-spinner" />
                    <p>Fetching top vendors...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="vd-section" id="vendors">
            <div className="vd-container">

                {/* Header Row */}
                <div className="vd-header">
                    <div>
                        <h2 className="vd-title">Popular Vendors</h2>
                    </div>
                    <Link to="/vendors" className="vd-view-all">
                        View All Vendors <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>

                {/* Category Dropdown Filter */}
                <div className="vd-filter-wrapper">
                    <label htmlFor="vd-category-select" className="vd-filter-label">
                        Category:
                    </label>
                    <select
                        id="vd-category-select"
                        className="vd-filter-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Vendor Grid */}
                {filteredServices.length === 0 ? (
                    <div className="vd-empty-card">
                        <FontAwesomeIcon icon={faStore} size="2x" />
                        <p>No vendors found for this category.</p>
                    </div>
                ) : (
                    <div className="vd-grid">
                        {filteredServices.map(service => (
                            <Link
                                key={service._id}
                                to={`/vendors/${service._id}`}
                                className="vendor-card"
                            >
                                <div className="vc-avatar-wrapper">
                                    <img
                                        src={
                                            service.image
                                                ? `http://localhost:5000${service.image}`
                                                : '/default-vendor.jpg'
                                        }
                                        alt={service.name}
                                        className="vendor-avatar"
                                        loading="lazy"
                                    />
                                    {service.category && (
                                        <span className="vc-category-tag">
                                            {service.category}
                                        </span>
                                    )}
                                </div>

                                <div className="vc-info">
                                    <div className="vc-name">{service.name}</div>
                                    
                                    <div className="vc-meta">
                                        <div className="vc-rating">
                                            <FontAwesomeIcon icon={faStar} className="star-icon" />
                                            <strong>{service.rating || '0.0'}</strong>
                                            <span className="vc-reviews">
                                                ({service.reviews?.length || 0})
                                            </span>
                                        </div>

                                        <div className="vc-price">
                                            <span>{service.price ? `${service.price} ETB` : 'Contact for Price'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}