import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';

const ALL_CATEGORIES = 'All Categories';

export default function BrowseEvents() {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([ALL_CATEGORIES]);
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadEvents(category = ALL_CATEGORIES) {
            try {
                setLoading(true);
                setError('');

                const url = category === ALL_CATEGORIES
                    ? 'http://localhost:5000/api/events'
                    : `http://localhost:5000/api/events?category=${encodeURIComponent(category)}`;

                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.message || 'Unable to load events');
                }

                const fetchedEvents = data.events || [];
                setEvents(fetchedEvents);

                if (category === ALL_CATEGORIES) {
                    const uniqueCategories = [ALL_CATEGORIES, ...new Set(fetchedEvents.map(event => event.badge).filter(Boolean))];
                    setCategories(uniqueCategories);
                }
            } catch (err) {
                setError(err.message || 'Something went wrong while loading events.');
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }

        loadEvents(activeCategory);
    }, [activeCategory]);

    return (
        <div>
            <PageHeader title="Browse Events" subtitle="Discover and register for upcoming events" />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 999,
                            border: activeCategory === category ? '1px solid #6366f1' : '1px solid #d1d5db',
                            background: activeCategory === category ? '#eef2ff' : '#fff',
                            color: activeCategory === category ? '#4338ca' : '#374151',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {loading && <div style={{ color: '#64748b' }}>Loading events from the database...</div>}
            {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

            {!loading && !error && events.length === 0 && (
                <div style={{ color: '#64748b' }}>No events found for this category.</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {events.map((event) => (
                    <SectionBox key={event.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{event.title}</div>
                            {event.badge && (
                                <span style={{ background: '#eef2ff', color: '#4338ca', padding: '4px 8px', borderRadius: 999, fontSize: '10px', fontWeight: 700 }}>
                                    {event.badge}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
                            📅 {event.date} • 📍 {event.location}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>{event.description || 'Upcoming event'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>{event.price}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{event.sold || 0} sold</div>
                            </div>
                            <button className="btn-primary" style={{ fontSize: '11px', padding: '7px 14px' }}>Buy Ticket</button>
                        </div>
                    </SectionBox>
                ))}
            </div>
        </div>
    );
}
