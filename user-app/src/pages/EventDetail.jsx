import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../api/config';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './EventDetail.css';

// Normalize a DB/API event to local shape
function normalize(ev) {
    return {
        id: ev.id,
        title: ev.title,
        location: ev.location || ev.venue || '',
        date: ev.date,
        price: ev.ticketPrice ?? 0,
        image: ev.img || ev.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
        category: ev.badge || ev.category || 'Event',
        organizer: ev.organizer || ev.organizerEmail || '',
        time: ev.time || '',
        venue: ev.location || ev.venue || '',
        capacity: ev.capacity ? `${Number(ev.capacity).toLocaleString()} people` : '',
        fullDescription: ev.description || ev.fullDescription || '',
    };
}

// ── Quantity & Payment Modal ─────────────────────────────
function TicketModal({ event, onClose, onProceed }) {
    const [quantity, setQuantity] = useState(1);
    const total = event.price * quantity;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Buy Tickets</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <p className="modal-event-name">{event.title}</p>

                <div className="modal-section-label">Number of Tickets</div>
                <div className="modal-quantity">
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span className="qty-num">{quantity}</span>
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.min(10, q + 1))}>+</button>
                </div>

                <div className="modal-total">
                    <span>Total</span>
                    <span className="modal-total-price">
                        {total === 0 ? 'Free' : `ETB ${total.toLocaleString()}`}
                    </span>
                </div>

                <button className="modal-proceed-btn" onClick={() => onProceed({ quantity, total })}>
                    Proceed to Payment →
                </button>
            </div>
        </div>
    );
}

// ── Payment Method Modal ─────────────────────────────────
function PaymentModal({ event, selection, user, onClose, onBack }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handlePay() {
        if (!user) { onClose(); return; }
        setLoading(true);
        setError('');
        try {
            const nameParts = (user.name || user.email || 'Guest User').split(' ');
            const firstName = nameParts[0] || 'Guest';
            const lastName = nameParts.slice(1).join(' ') || 'User';

            const res = await fetch(apiUrl('/api/payment/initialize'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selection.total || 1,
                    email: user.email,
                    firstName,
                    lastName,
                    eventId: event.id,
                    eventTitle: event.title,
                    eventDate: event.date,
                    eventVenue: event.venue,
                    userId: user._id || user.id,
                    userName: user.name || user.email,
                }),
            });
            const data = await res.json();
            if (data.success && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                // Show the real Chapa error detail if available
                const detail = data.detail
                    ? (typeof data.detail === 'object'
                        ? (data.detail.message || JSON.stringify(data.detail))
                        : String(data.detail))
                    : '';
                setError(detail || data.message || 'Payment initialization failed.');
                setLoading(false);
            }
        } catch {
            setError('Could not connect to payment server. Make sure the backend is running.');
            setLoading(false);
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <button className="modal-back" onClick={onBack}>← Back</button>
                    <h3>Payment Method</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="pay-summary">
                    <div className="pay-summary-row"><span>Event</span><span>{event.title}</span></div>
                    <div className="pay-summary-row"><span>Quantity</span><span>{selection.quantity}</span></div>
                    <div className="pay-summary-row pay-summary-total">
                        <span>Total</span>
                        <span>{selection.total === 0 ? 'Free' : `ETB ${selection.total.toLocaleString()}`}</span>
                    </div>
                </div>

                <div className="modal-section-label">Pay with</div>
                <div className="pay-method-option">
                    <img src="https://chapa.co/asset/images/chapa_logo.svg" alt="Chapa" className="pay-method-logo"
                        onError={e => { e.target.style.display = 'none'; }} />
                    <div>
                        <div className="pay-method-name">Chapa</div>
                        <div className="pay-method-desc">Pay with telebirr, CBE, bank cards & more</div>
                    </div>
                    <span className="pay-method-check">✓</span>
                </div>

                {!user && (
                    <p className="pay-login-note">
                        You need to <Link to="/login" className="pay-login-link">log in</Link> to complete your purchase.
                    </p>
                )}
                {error && <p className="pay-error">{error}</p>}

                <button className="modal-proceed-btn" onClick={handlePay} disabled={loading}>
                    {loading ? 'Redirecting…' : user ? 'Pay Now →' : 'Log In to Pay →'}
                </button>
            </div>
        </div>
    );
}

// ── Main EventDetail ─────────────────────────────────────
export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(null); // null | 'tickets' | 'payment'
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        setLoading(true);
        const numId = Number(id);

        // Integer IDs 1-6 → use local static data (no API call needed)
        if (Number.isInteger(numId) && numId >= 1 && numId <= 6) {
            setEvent(STATIC_EVENTS[numId] || null);
            setLoading(false);
            return;
        }

        // All other IDs (MongoDB ObjectIds, static 's1'-'s6') → fetch from API
        fetch(apiUrl(`/api/events/${id}`))
            .then(r => r.json())
            .then(data => {
                if (data.success && data.event) {
                    setEvent(normalize(data.event));
                } else {
                    setEvent(null);
                }
            })
            .catch(() => setEvent(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="event-details-loading">
            <div className="loading-spinner" />
            <p>Loading event details...</p>
        </div>
    );

    if (!event) return (
        <div className="event-details-not-found">
            <h2>Event Not Found</h2>
            <p>Sorry, the event you're looking for doesn't exist.</p>
            <Link to="/" className="back-home-btn">Back to Home</Link>
        </div>
    );

    const displayPrice = event.price === 0 ? 'Free' : `ETB ${Number(event.price).toLocaleString()}`;

    return (
        <div className="event-details">
            <div className="event-details-container">
                <button className="back-button" onClick={() => navigate(-1)}>← Back to Events</button>

                <div className="event-details-grid">
                    {/* Image */}
                    <div className="event-details-image">
                        <img src={event.image} alt={event.title} />
                        <span className="event-details-category">{event.category}</span>
                    </div>

                    {/* Info */}
                    <div className="event-details-info">
                        <h1 className="event-details-title">{event.title}</h1>

                        <div className="event-details-meta">
                            <div className="event-meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{event.location}</span>
                            </div>
                            <div className="event-meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>{event.date}</span>
                            </div>
                            {event.time && (
                                <div className="event-meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>{event.time}</span>
                                </div>
                            )}
                        </div>

                        <div className="event-details-price-section">
                            <span className="event-details-price">{displayPrice}</span>
                            <span className="event-details-price-label">per ticket</span>
                        </div>

                        {event.fullDescription && (
                            <div className="event-details-description">
                                <h3>About This Event</h3>
                                <p>{event.fullDescription}</p>
                            </div>
                        )}

                        <div className="event-details-additional">
                            {event.organizer && (
                                <div className="event-detail-item">
                                    <span className="detail-label">Organizer</span>
                                    <span className="detail-value">{event.organizer}</span>
                                </div>
                            )}
                            {event.venue && (
                                <div className="event-detail-item">
                                    <span className="detail-label">Venue</span>
                                    <span className="detail-value">{event.venue}</span>
                                </div>
                            )}
                            {event.capacity && (
                                <div className="event-detail-item">
                                    <span className="detail-label">Capacity</span>
                                    <span className="detail-value">{event.capacity}</span>
                                </div>
                            )}
                        </div>

                        <button className="book-ticket-btn" onClick={() => setStep('tickets')}>
                            Buy Ticket
                        </button>
                    </div>
                </div>
            </div>

            {step === 'tickets' && (
                <TicketModal
                    event={event}
                    onClose={() => setStep(null)}
                    onProceed={sel => { setSelection(sel); setStep('payment'); }}
                />
            )}

            {step === 'payment' && selection && (
                <PaymentModal
                    event={event}
                    selection={selection}
                    user={user}
                    onClose={() => setStep(null)}
                    onBack={() => setStep('tickets')}
                />
            )}
        </div>
    );
}
