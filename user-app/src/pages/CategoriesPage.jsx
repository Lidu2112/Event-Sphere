import { useState, useEffect } from 'react';
import { apiUrl, imageUrl } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InboxIcon from '@mui/icons-material/Inbox';
import './Page.css';
import './EventsPage.css';
import './CategoriesPage.css';

// Real Event Categories with count, color accent, and image artwork
const STATIC_CATEGORIES = [
    { 
        label: 'Concert', 
        count: '120+ Events',
        color: '#8b5cf6', 
        description: 'Live musical performances and band shows.', 
        image: 'https://i.pinimg.com/1200x/f6/63/a4/f663a4a0de0f2e0f5e680ca70b956fd8.jpg' 
    },
    { 
        label: 'Conference', 
        count: '85+ Events',
        color: '#0ea5e9', 
        description: 'Professional gatherings and keynotes.', 
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80' 
    },
    { 
        label: 'Exhibition', 
        count: '70+ Events',
        color: '#f59e0b', 
        description: 'Art displays, trade shows, and showcases.', 
        image: 'https://catbirdinafrica.wordpress.com/wp-content/uploads/2012/11/pb017976.jpg' 
    },
    { 
        label: 'Workshop', 
        count: '65+ Events',
        color: '#10b981', 
        description: 'Interactive learning and hands-on skill sessions.', 
        image: 'https://ehrc.org/wp-content/uploads/2026/06/DSC04821.JPG-1024x577.jpg' 
    },
    { 
        label: 'Seminar', 
        count: '80+ Events',
        color: '#6366f1', 
        description: 'Educational talks and informative lectures.', 
        image: 'https://www.ena.et/documents/d/eng/aswasaas-1-jpg' 
    },
    { 
        label: 'Festival', 
        count: '95+ Events',
        color: '#ec4899', 
        description: 'Cultural celebrations, music, and food fairs.', 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRklY1vEAk8HjPevgOm4TSNeKn63vJiXIcPR7_JHre7VHQyoWfvQN-xvGTu&s=10' 
    },
    { 
        label: 'Networking', 
        count: '60+ Events',
        color: '#3b82f6', 
        description: 'Connect with industry peers and professionals.', 
        image: 'https://eu-images.contentstack.com/v3/assets/blta47798dd33129a0c/blt4bc94877d572b0bb/671b68ff113408cb1f6fb111/map-ethiopia-polygonal-mesh-line-map-flag-map_(1)_(1).jpg' 
    },
    { 
        label: 'Webinar', 
        count: '50+ Events',
        color: '#06b6d4', 
        description: 'Online seminars and digital conferences.', 
        image: 'https://pbs.twimg.com/media/HUg__eAXkAENHCX?format=webp&name=large' 
    },
    { 
        label: 'Sports', 
        count: '75+ Events',
        color: '#10b981', 
        description: 'Athletic competitions and fitness events.', 
        image: 'https://www.tadias.com/wp-content/uploads/2020/05/result-51.jpg' 
    },
    { 
        label: 'Food', 
        count: '90+ Events',
        color: '#ef4444', 
        description: 'Culinary experiences and tasting events.', 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ79S_0Ihr62dCTtdNLD3ycPAABBcljBC97nod3nwfRJ5Rl-u0uZKoVtKo&s=10' 
    },
];

export default function CategoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const initialCategory = searchParams.get('category') || searchParams.get('filter') || null;
    const [selected, setSelected] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const catParam = searchParams.get('category') || searchParams.get('filter');
        if (catParam) {
            setSelected(catParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!selected) { 
            setEvents([]); 
            return; 
        }

        setLoading(true);
        const params = new URLSearchParams({ category: selected });
        
        fetch(apiUrl(`/api/events?${params}`))
            .then(r => r.json())
            .then(data => setEvents((data.events || []).filter(e => e.source === 'db')))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, [selected]);

    const handleSelectCategory = (categoryLabel) => {
        if (selected === categoryLabel) {
            setSelected(null);
            setSearchParams({});
        } else {
            setSelected(categoryLabel);
            setSearchParams({ category: categoryLabel });
        }
    };

    const filteredCategories = STATIC_CATEGORIES.filter(cat =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeColor = selected
        ? (STATIC_CATEGORIES.find(c => c.label.toLowerCase() === selected.toLowerCase())?.color || '#3b82f6')
        : '#3b82f6';

    return (
        <div className="cp-container">
            {/* Hero Banner with Background Image URL and Search Bar */}
           <div 
                className="page-hero ap-hero animate-hero-fade"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(30, 15, 28, 0.92) 0%, rgba(30, 15, 28, 0.75) 50%, rgba(30, 15, 28, 0.4) 100%), 
                    url(https://as1.ftcdn.net/v2/jpg/21/20/63/38/1000_F_2120633815_NptYzpAbg6W8CRasm4GxxvUitHqITkGP.jpg)`
                }}
            >
                <div className="cp-hero-content">
                    <span className="cp-hero-subtitle">— Browse by Category</span>
                    <h1 className="cp-hero-title">
                        Explore Events <br />
                        <span className="cp-highlight">Across All Categories</span>
                    </h1>
                    <p className="cp-hero-description">
                        Find the perfect events that match your interests across Ethiopia.
                    </p>

                    <div className="cp-search-box">
                        <SearchIcon className="cp-search-icon" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Search for categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Category Grid Section */}
            <div className="cp-section">
                <div className="cp-section-header">
                    <span className="cp-line"></span>
                    <h2>All Categories</h2>
                    <span className="cp-line"></span>
                </div>
                <p className="cp-section-subtitle">Discover events in your favorite categories</p>

                <div className="cp-grid">
                    {filteredCategories.map((cat) => {
                        const isSelected = selected?.toLowerCase() === cat.label.toLowerCase();
                        return (
                            <div
                                key={cat.label}
                                className={`cp-card ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSelectCategory(cat.label)}
                                style={{ '--accent-color': cat.color }}
                            >
                                <div className="cp-card-img-wrap">
                                    <img src={cat.image} alt={cat.label} />
                                </div>
                                <div className="cp-card-body">
                                    <div className="cp-card-info">
                                        <h3>{cat.label}</h3>
                                        <span>{cat.count}</span>
                                    </div>
                                    <button 
                                        className="cp-arrow-btn"
                                        aria-label={`Select ${cat.label}`}
                                    >
                                        <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16 }} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Category Events Section */}
            {selected && (
                <div className="cp-events-container">
                    <div className="cp-events-header">
                        <h2 style={{ color: activeColor }}>{selected} Events</h2>
                        <button className="btn-outline" onClick={() => handleSelectCategory(selected)}>
                            Clear Filter
                        </button>
                    </div>

                    {loading ? (
                        <div className="cp-loading">
                            <div className="cp-spinner" style={{ borderTopColor: activeColor }}></div>
                            <p>Loading {selected} events...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="ep-empty">
                            <div><InboxIcon aria-hidden="true" /></div>
                            <p>No {selected} events published yet.</p>
                        </div>
                    ) : (
                        <div className="pg-grid-4 cp-events-grid">
                            {events.map((event, index) => (
                                <Link 
                                    key={event.id || event._id} 
                                    to={`/events/${event.id || event._id}`} 
                                    className="ep-card cp-event-card-animated"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <div className="ep-img-wrap">
                                        <img
                                            src={imageUrl(event.img || event.banner) || '/images/events/banner_1792931809869.jpg'}
                                            alt={event.title}
                                            loading="lazy"
                                            onError={e => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = '/images/events/banner_1792931809869.jpg';
                                            }}
                                        />
                                        <span className="ep-badge" style={{ background: event.badgeColor || activeColor }}>
                                            {event.badge || event.category}
                                        </span>
                                    </div>
                                    <div className="ep-content">
                                        <h3>{event.title}</h3>
                                        <div className="ep-meta">
                                            <span><PlaceIcon aria-hidden="true" /> {event.location}</span>
                                            <span><CalendarTodayIcon aria-hidden="true" /> {event.date}</span>
                                        </div>
                                        <div className="ep-footer">
                                            <span className="ep-price">{event.price}</span>
                                            <span className="ep-arrow"><ArrowForwardIcon aria-hidden="true" /></span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Call-To-Action Banner */}
            <div className="cp-cta-banner">
                <div className="cp-cta-content">
                    <h2>Ready to discover amazing events?</h2>
                    <p>Join thousands of people already using EventSphere.</p>
                </div>
                <div className="cp-cta-actions">
                    <Link to="/events" className="cp-btn-primary">Browse Events <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /></Link>
                    <Link to="/register" className="cp-btn-outline">Create Account</Link>
                </div>
            </div>
        </div>
    );
}