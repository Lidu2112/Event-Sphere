import { useState, useEffect } from 'react';
import { apiUrl, imageUrl } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import './Page.css';
import './EventsPage.css';
import './CategoriesPage.css';

// Real Event Categories with added descriptions and image paths
const STATIC_CATEGORIES = [
    { 
        label: 'Concert', 
        color: '#8b5cf6', 
        description: 'Live musical performances and band shows.', 
        image: 'https://i.pinimg.com/1200x/f6/63/a4/f663a4a0de0f2e0f5e680ca70b956fd8.jpg' 
    },
    { 
        label: 'Conference', 
        color: '#0ea5e9', 
        description: 'Professional gatherings and keynotes.', 
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80' 
    },
    { 
        label: 'Exhibition', 
        color: '#f59e0b', 
        description: 'Art displays, trade shows, and showcases.', 
        image: 'https://catbirdinafrica.wordpress.com/wp-content/uploads/2012/11/pb017976.jpg' 
    },
    { 
        label: 'Workshop', 
        color: '#10b981', 
        description: 'Interactive learning and hands-on skill sessions.', 
        image: 'https://ehrc.org/wp-content/uploads/2026/06/DSC04821.JPG-1024x577.jpg' 
    },
    { 
        label: 'Seminar', 
        color: '#6366f1', 
        description: 'Educational talks and informative lectures.', 
        image: 'https://www.ena.et/documents/d/eng/aswasaas-1-jpg' 
    },
    { 
        label: 'Festival', 
        color: '#ec4899', 
        description: 'Cultural celebrations, music, and food fairs.', 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRklY1vEAk8HjPevgOm4TSNeKn63vJiXIcPR7_JHre7VHQyoWfvQN-xvGTu&s=10' 
    },
    { 
        label: 'Networking', 
        color: '#3b82f6', 
        description: 'Connect with industry peers and professionals.', 
        image: 'https://eu-images.contentstack.com/v3/assets/blta47798dd33129a0c/blt4bc94877d572b0bb/671b68ff113408cb1f6fb111/map-ethiopia-polygonal-mesh-line-map-flag-map_(1)_(1).jpg' 
    },
    { 
        label: 'Webinar', 
        color: '#06b6d4', 
        description: 'Online seminars and digital conferences.', 
        image: 'https://pbs.twimg.com/media/HUg__eAXkAENHCX?format=webp&name=large' 
    },
    { 
        label: 'Sports', 
        color: '#10b981', 
        description: 'Athletic competitions and fitness events.', 
        image: 'https://www.tadias.com/wp-content/uploads/2020/05/result-51.jpg' 
    },
    { 
        label: 'Cultural', 
        color: '#f97316', 
        description: 'Traditional heritage and community meetups.', 
        image: 'https://ethiopianembassy.org/wp-content/uploads/2019/01/download-10.jpg' 
    },
    { 
        label: 'Food', 
        color: '#ef4444', 
        description: 'Culinary experiences and tasting events.', 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ79S_0Ihr62dCTtdNLD3ycPAABBcljBC97nod3nwfRJ5Rl-u0uZKoVtKo&s=10' 
    },
];

export default function CategoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Support reading both 'category' and 'filter' query parameters from URL
    const initialCategory = searchParams.get('category') || searchParams.get('filter') || null;
    const [selected, setSelected] = useState(initialCategory);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Synchronize state if URL query parameter changes
    useEffect(() => {
        const catParam = searchParams.get('category') || searchParams.get('filter');
        if (catParam) {
            setSelected(catParam);
        }
    }, [searchParams]);

    // Fetch events from DB whenever a category is selected
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

    const activeColor = selected
        ? (STATIC_CATEGORIES.find(c => c.label.toLowerCase() === selected.toLowerCase())?.color || '#6366f1')
        : '#6366f1';

    return (
        <div>
            <div className="page-hero">
                <div className="page-hero-inner">
                    <div className="page-breadcrumb">
                        {/* <Link to="/">Home</Link> / Categories */}
                    </div>
                    <h1>Browse by Category</h1>
                    <p>Explore events across all categories</p>
                </div>
            </div>

            <div className="page-body">
                {/* Category selection grid */}
                <div className="cp-grid">
                    {STATIC_CATEGORIES.map((cat, i) => {
                        const isSelected = selected?.toLowerCase() === cat.label.toLowerCase();
                        return (
                            <button
                                key={i}
                                className={`cp-card ${isSelected ? 'active' : ''}`}
                                style={isSelected
                                    ? { 
                                        background: cat.color, 
                                        borderColor: cat.color,
                                        borderWidth: '2px',
                                        borderStyle: 'solid'
                                      }
                                    : { 
                                        borderTopColor: cat.color,
                                        borderTopWidth: '6px', // Increased top border accent size
                                        borderWidth: '2px',    // Increased surrounding border thickness
                                        borderStyle: 'solid',
                                        borderColor: '#e5e7eb'
                                      }}
                                onClick={() => handleSelectCategory(cat.label)}
                            >
                                <div className="cp-icon" style={
                                    isSelected
                                        ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                                        : { background: cat.color + '20', color: cat.color }
                                }>
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                    ) : (
                                        cat.icon
                                    )}
                                </div>
                                <div className={`cp-label ${isSelected ? 'cp-label-white' : ''}`}>
                                    {cat.label}
                                </div>
                                {/* Simple Description added below title */}
                                <p style={{
                                    fontSize: '12px',
                                    color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#6b7280',
                                    margin: '6px 0 0 0',
                                    lineHeight: '1.3'
                                }}>
                                    {cat.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Events section — only shows when a category is selected */}
                {selected && (
                    <>
                        <div className="cp-events-header">
                            <h2 style={{ color: activeColor }}>{selected} Events</h2>
                            <button className="btn-outline" onClick={() => handleSelectCategory(selected)}>
                                Clear Filter
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                                Loading {selected} events...
                            </div>
                        ) : events.length === 0 ? (
                            <div className="ep-empty">
                                <div>📭</div>
                                <p>No {selected} events published yet.</p>
                            </div>
                        ) : (
                            <div className="pg-grid-4">
                                {events.map(event => (
                                    <Link key={event.id || event._id} to={`/events/${event.id || event._id}`} className="ep-card">
                                        <div className="ep-img-wrap">
                                            <img src={imageUrl(event.img || event.banner)} alt={event.title} loading="lazy" />
                                            <span className="ep-badge" style={{ background: event.badgeColor || activeColor }}>
                                                {event.badge || event.category}
                                            </span>
                                        </div>
                                        <div className="ep-content">
                                            <h3>{event.title}</h3>
                                            <div className="ep-meta">
                                                <span>📍 {event.location}</span>
                                                <span>📅 {event.date}</span>
                                            </div>
                                            <div className="ep-footer">
                                                <span className="ep-price">{event.price}</span>
                                                <span className="ep-arrow">→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}