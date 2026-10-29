import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Page.css';
import './VendorDetail.css';

import { apiUrl, imageUrl } from '../api/config';

const API_URL = apiUrl('/api');

export default function VendorDetail() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking modal states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingEventName, setBookingEventName] = useState('');
    const [bookingEventDate, setBookingEventDate] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    // Review modal states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${API_URL}/vendor/services/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    setError(data.message || 'Service not found');
                    return;
                }
                setService(data.service);
            })
            .catch(err => {
                console.error('Failed to load service:', err);
                setError('Failed to load service.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Handle Request Booking Submission
    const handleRequestBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setFeedbackMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/vendor/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    serviceId: id, 
                    vendorId: service?.vendorId,
                    eventName: bookingEventName,
                    eventDate: bookingEventDate,
                    notes: bookingNotes,
                    amount: service?.price || 0
                })
            });
            const data = await res.json();
            if (res.ok && (data.success !== false)) {
                setFeedbackMessage({ type: 'success', text: 'Booking request sent successfully to the vendor!' });
                setShowBookingModal(false);
                setBookingEventName('');
                setBookingEventDate('');
                setBookingNotes('');
            } else {
                setFeedbackMessage({ type: 'error', text: data.message || 'Failed to send booking request.' });
            }
        } catch (err) {
            console.error('Booking error:', err);
            setFeedbackMessage({ type: 'error', text: 'An error occurred while requesting booking.' });
        } finally {
            setBookingLoading(false);
        }
    };

    // Handle Review Submission
    const handleSendReview = async (e) => {
        e.preventDefault();
        setReviewSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/vendor/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    vendorEmail: service.vendorEmail,
                    vendorId: service.vendorId,
                    serviceId: id,
                    rating: Number(reviewRating),
                    comment: reviewComment
                })
            });
            const data = await res.json();
            if (res.ok && (data.success !== false)) {
                setFeedbackMessage({ type: 'success', text: 'Review and message sent to vendor successfully!' });
                setShowReviewModal(false);
                setReviewComment('');
                setReviewRating(5);
            } else {
                alert(data.message || 'Failed to submit review.');
            }
        } catch (err) {
            console.error('Review error:', err);
            alert('An error occurred while submitting your review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="not-found">
                <h2>Loading service...</h2>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="not-found">
                <h2>{error || 'Service not found'}</h2>
                <Link to="/vendors" className="btn-purple">← Back to Vendors</Link>
            </div>
        );
    }

    return (
        <div>
            <div className="page-hero">
                <div className="page-hero-inner">
                    <div className="page-breadcrumb">
                        <Link to="/">Home</Link> / <Link to="/vendors">Vendors</Link> / {service.name}
                    </div>
                    <h1>{service.name}</h1>
                    <p>{service.category} · {service.status?.toUpperCase() || 'SERVICE'}</p>
                </div>
            </div>

            <div className="page-body vd-body">
                <div className="vd-main">
                    <div className="vd-img-wrap">
                        <img
                            src={service.image ? imageUrl(service.image) : '/images/default-vendor.svg'}
                            alt={service.name}
                            onError={e => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/default-vendor.svg';
                            }}
                        />
                    </div>

                    {feedbackMessage.text && (
                        <div className={`vd-alert ${feedbackMessage.type}`}>
                            {feedbackMessage.text}
                        </div>
                    )}

                    <div className="vd-section">
                        <h3>About</h3>
                        <p>{service.description || 'No description provided.'}</p>
                    </div>

                    <div className="vd-section">
                        <h3>Service Details</h3>
                        <div className="vd-services">
                            <div className="vd-service">✓ Price: ETB {Number(service.price || 0).toLocaleString()}</div>
                            <div className="vd-service">✓ Unit: {service.priceUnit || 'per event'}</div>
                            <div className="vd-service">✓ Status: {service.status || 'active'}</div>
                            <div className="vd-service">✓ Bookings: {service.bookings || 0}</div>
                            <div className="vd-service">✓ Revenue: ETB {Number(service.revenue || 0).toLocaleString()}</div>
                            <div className="vd-service">✓ Rating: {service.rating || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="vd-sidebar">
                    <div className="vd-contact-box" style={{ borderTopColor: '#8b5cf6' }}>
                        <div className="vd-cb-header">
                            <div className="vd-cb-avatar" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                                {service.name[0]}
                            </div>
                            <div>
                                <div className="vd-cb-name">{service.name}</div>
                                <div className="vd-cb-cat">{service.category}</div>
                            </div>
                        </div>

                        <div className="vd-stats">
                            <div className="vd-stat">
                                <div className="vd-stat-val">⭐ {service.rating || 0}</div>
                                <div className="vd-stat-lbl">Rating</div>
                            </div>
                            <div className="vd-stat">
                                <div className="vd-stat-val">{service.bookings || 0}</div>
                                <div className="vd-stat-lbl">Bookings</div>
                            </div>
                            <div className="vd-stat">
                                <div className="vd-stat-val">{service.status || 'active'}</div>
                                <div className="vd-stat-lbl">Status</div>
                            </div>
                        </div>

                        <div className="vd-price-tag">ETB {Number(service.price || 0).toLocaleString()}</div>

                        <button 
                            className="btn-purple" 
                            onClick={() => setShowBookingModal(true)}
                            style={{ background: '#8b5cf6', border: 'none', width: '100%', justifyContent: 'center', padding: '13px', cursor: 'pointer' }}
                        >
                            📩 Request Booking
                        </button>
                        <button 
                            className="btn-outline" 
                            onClick={() => setShowReviewModal(true)}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', cursor: 'pointer' }}
                        >
                            💬 Send Message
                        </button>
                    </div>
                </div>
            </div>

            {/* Request Booking Form Modal */}
            {showBookingModal && (
                <div className="vd-modal-overlay">
                    <div className="vd-modal">
                        <h3>Request Booking with {service.name}</h3>
                        <p>Fill out your event details to send a request to this vendor.</p>
                        <form onSubmit={handleRequestBookingSubmit}>
                            <div className="vd-form-group">
                                <label>Event Name</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Wedding Reception"
                                    value={bookingEventName}
                                    onChange={(e) => setBookingEventName(e.target.value)}
                                    className="vd-select"
                                />
                            </div>
                            <div className="vd-form-group">
                                <label>Event Date</label>
                                <input 
                                    type="date"
                                    required
                                    value={bookingEventDate}
                                    onChange={(e) => setBookingEventDate(e.target.value)}
                                    className="vd-select"
                                />
                            </div>
                            <div className="vd-form-group">
                                <label>Additional Notes / Requirements</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Any specific instructions..."
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    className="vd-textarea"
                                />
                            </div>
                            <div className="vd-modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-outline" 
                                    onClick={() => setShowBookingModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-purple" 
                                    disabled={bookingLoading}
                                    style={{ background: '#8b5cf6', border: 'none', cursor: 'pointer' }}
                                >
                                    {bookingLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Form Modal */}
            {showReviewModal && (
                <div className="vd-modal-overlay">
                    <div className="vd-modal">
                        <h3>Write a Review & Message Vendor</h3>
                        <p>Share your experience or inquiry with {service.name}</p>
                        <form onSubmit={handleSendReview}>
                            <div className="vd-form-group">
                                <label>Rating (1 - 5 Stars)</label>
                                <select 
                                    value={reviewRating} 
                                    onChange={(e) => setReviewRating(e.target.value)}
                                    className="vd-select"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                    <option value="3">⭐⭐⭐ (3/5)</option>
                                    <option value="2">⭐⭐ (2/5)</option>
                                    <option value="1">⭐ (1/5)</option>
                                </select>
                            </div>
                            <div className="vd-form-group">
                                <label>Your Message / Review</label>
                                <textarea 
                                    rows="4"
                                    required
                                    placeholder="Write your review or questions here..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="vd-textarea"
                                />
                            </div>
                            <div className="vd-modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-outline" 
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-purple" 
                                    disabled={reviewSubmitting}
                                    style={{ background: '#8b5cf6', border: 'none', cursor: 'pointer' }}
                                >
                                    {reviewSubmitting ? 'Sending...' : 'Send to Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}