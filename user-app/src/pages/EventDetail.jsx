import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiUrl, imageUrl } from '../api/config';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Loader from '../components/Loader/Loader';
import './EventDetail.css';

// Normalize a DB/API event to local shape
function normalize(ev) {
    return {
        id: ev.id,
        title: ev.title,
        location: ev.location || ev.venue || '',
        date: ev.date,
        price: ev.ticketPrice ?? 0,
        image: imageUrl(ev.img || ev.banner) || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
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
                    <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon aria-hidden="true" /></button>
                </div>
                <p className="modal-event-name">{event.title}</p>

                <div className="modal-section-label">Number of Tickets</div>
                <div className="modal-quantity">
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease ticket quantity"><RemoveIcon aria-hidden="true" /></button>
                    <span className="qty-num">{quantity}</span>
                    <button className="qty-btn" onClick={() => setQuantity(q => Math.min(10, q + 1))} aria-label="Increase ticket quantity"><AddIcon aria-hidden="true" /></button>
                </div>

                <div className="modal-total">
                    <span>Total</span>
                    <span className="modal-total-price">
                        {total === 0 ? 'Free' : `ETB ${total.toLocaleString()}`}
                    </span>
                </div>

                <button className="modal-proceed-btn" onClick={() => onProceed({ quantity, total })}>
                    Proceed to Payment <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} />
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
                    <button className="modal-back" onClick={onBack}><ArrowBackIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /> Back</button>
                    <h3>Payment Method</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon aria-hidden="true" /></button>
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
                    <span className="pay-method-check"><CheckIcon aria-hidden="true" style={{ fontSize: 18, verticalAlign: 'middle' }} /></span>
                </div>

                {!user && (
                    <p className="pay-login-note">
                        You need to <Link to="/login" className="pay-login-link">log in</Link> to complete your purchase.
                    </p>
                )}
                {error && <p className="pay-error">{error}</p>}

                <button className="modal-proceed-btn" onClick={handlePay} disabled={loading}>
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Loader size="small" /> Redirecting…
                        </span>
                    ) : user ? (
                        <>Pay Now <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /></>
                    ) : (
                        <>Log In to Pay <ArrowForwardIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /></>
                    )}
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

        if (Number.isInteger(numId) && numId >= 1 && numId <= 6) {
            setEvent(STATIC_EVENTS?.[numId] || null);
            setLoading(false);
            return;
        }

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

    // Secure Buy Button Handler
    const handleBuyClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setStep('tickets');
    };

    if (loading) return (
        <div className="event-details-loading">
            <Loader />
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
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowBackIcon aria-hidden="true" style={{ fontSize: 16, verticalAlign: 'middle' }} /> Back to Events
                </button>

                <div className="event-details-grid">
                    {/* Image */}
                    <div className="event-details-image">
                        <img
                            src={event.image}
                            alt={event.title}
                            onError={e => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/events/banner_1792931809869.jpg';
                            }}
                        />
                        <span className="event-details-category">{event.category}</span>
                    </div>

                    {/* Info */}
                    <div className="event-details-info">
                        <h1 className="event-details-title">{event.title}</h1>

                        <div className="event-details-meta">
                            <div className="event-meta-item">
                                <PlaceIcon aria-hidden="true" />
                                <span>{event.location}</span>
                            </div>
                            <div className="event-meta-item">
                                <CalendarTodayIcon aria-hidden="true" />
                                <span>{event.date}</span>
                            </div>
                            {event.time && (
                                <div className="event-meta-item">
                                    <AccessTimeIcon aria-hidden="true" />
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

                        <button className="book-ticket-btn" onClick={handleBuyClick}>
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