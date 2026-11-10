import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useLang } from '../context/LanguageContext';
import { t } from '../data/translations';
import { apiUrl, imageUrl } from '../api/config';
import './Vendors.css';

const API_URL = apiUrl('/api');

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
    const { lang } = useLang();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const servicesRes = await fetch(`${API_URL}/vendor/services`);
                const servicesData = await servicesRes.json();
                const fetchedServices = servicesData.services || [];
                setServices(fetchedServices);

                const dbCategories = Array.from(
                    new Set(fetchedServices.map(s => s.category).filter(Boolean))
                );

                if (dbCategories.length > 0) {
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
                    <AutorenewIcon className="vd-spinner" aria-hidden="true" />
                    <p>{t(lang, 'vendors_loading')}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="vd-section" id="vendors">
            <div className="vd-container">
                <div className="vd-header">
                    <div></div>
                    <Link to="/vendors" className="vd-view-all">
                        {t(lang, 'vendors_view_all')} <ArrowForwardIcon aria-hidden="true" />
                    </Link>
                </div>

                <div className="vd-filter-wrapper">
                    <label htmlFor="vd-category-select" className="vd-filter-label">
                        {t(lang, 'vendors_category')}
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

                {filteredServices.length === 0 ? (
                    <div className="vd-empty-card">
                        <StorefrontIcon aria-hidden="true" style={{ fontSize: 48 }} />
                        <p>{t(lang, 'vendors_empty')}</p>
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
                                                ? imageUrl(service.image)
                                                : '/images/default-vendor.svg'
                                        }
                                        alt={service.name}
                                        className="vendor-avatar"
                                        loading="lazy"
                                        onError={e => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = '/images/default-vendor.svg';
                                        }}
                                    />
                                    {service.category && (
                                        <span className="vc-category-tag">
                                            {service.category}
                                        </span>
                                    )}
                                </div>

                                <div className="vc-info">
                                    <div className="vc-name">{service.name}</div>
                                    <p className="vc-description">
                                        {service.description
                                            ? (service.description.length > 90
                                                ? service.description.substring(0, 90) + '...'
                                                : service.description)
                                            : 'Explore professional services tailored for your unique event experience.'}
                                    </p>

                                    <div className="vc-meta">
                                        <div className="vc-rating">
                                            <StarIcon className="star-icon" aria-hidden="true" />
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