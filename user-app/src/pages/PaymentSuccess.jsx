import { useEffect, useState } from 'react';
import { apiUrl } from '../api/config';
import { useSearchParams, Link } from 'react-router-dom';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const txRef = searchParams.get('tx_ref');

    const [state, setState] = useState('loading'); // loading | success | failed | error
    const [ticket, setTicket] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!txRef) { setState('error'); return; }

        // Poll verify up to 3 times (Chapa may call callback slightly after redirect)
        let tries = 0;
        async function verify() {
            try {
                const res = await fetch(apiUrl(`/api/payment/verify?tx_ref=${txRef}`));
                const data = await res.json();

                if (data.ticket?.status === 'paid') {
                    setTicket(data.ticket);
                    setState('success');
                } else if (data.ticket?.status === 'failed') {
                    setState('failed');
                } else if (tries < 2) {
                    tries++;
                    setAttempt(tries);
                    setTimeout(verify, 2000);
                } else {
                    setState('failed');
                }
            } catch {
                setState('error');
            }
        }

        verify();
    }, [txRef]);

    function downloadQR() {
        if (!ticket?.qrCode) return;
        const a = document.createElement('a');
        a.href = ticket.qrCode;
        a.download = `ticket-${ticket.ticketCode}.png`;
        a.click();
    }

    if (state === 'loading') return (
        <div className="ps-page">
            <div className="ps-card">
                <div className="ps-spinner" />
                <h2>Verifying Payment…</h2>
                <p>{attempt > 0 ? `Checking again (${attempt}/2)…` : 'Please wait.'}</p>
            </div>
        </div>
    );

    if (state === 'failed') return (
        <div className="ps-page">
            <div className="ps-card ps-failed">
                <div className="ps-icon">❌</div>
                <h2>Payment Failed</h2>
                <p>Your payment could not be processed. No charge has been made.</p>
                <Link to="/events" className="ps-btn-outline">Browse Events</Link>
            </div>
        </div>
    );

    if (state === 'error') return (
        <div className="ps-page">
            <div className="ps-card ps-failed">
                <div className="ps-icon">⚠️</div>
                <h2>Something went wrong</h2>
                <p>We couldn't verify your payment. If you were charged, please contact support.</p>
                <Link to="/" className="ps-btn-outline">Go Home</Link>
            </div>
        </div>
    );

    return (
        <div className="ps-page">
            <div className="ps-card ps-success">
                <div className="ps-icon">🎉</div>
                <h2>Ticket Confirmed!</h2>
                <p>Your payment was successful. Your digital ticket is ready below.</p>

                <div className="ps-ticket">
                    {/* Header */}
                    <div className="ps-ticket-header">
                        <div className="ps-ticket-event">{ticket.eventTitle}</div>
                        <div className="ps-ticket-info">
                            {ticket.eventDate && <span>📅 {ticket.eventDate}</span>}
                            {ticket.eventVenue && <span>📍 {ticket.eventVenue}</span>}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="ps-qr-wrap">
                        {ticket.qrCode
                            ? <img src={ticket.qrCode} alt="QR Code" className="ps-qr-img" />
                            : <div className="ps-qr-placeholder">QR Code</div>
                        }
                    </div>

                    {/* Details */}
                    <div className="ps-ticket-details">
                        <div className="ps-detail-row">

                            <span>Ticket ID</span>
                            <strong>{ticket.ticketCode}</strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Holder</span>
                            <strong>{ticket.userName}</strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Email</span>
                            <strong>{ticket.userEmail}</strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Transaction ID</span>
                            <strong>{ticket.txRef}</strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Payment Method</span>
                            <strong>{ticket.paymentMethod}</strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Amount Paid</span>
                            <strong style={{ color: '#10b981' }}>ETB {ticket.amount?.toLocaleString()}</strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Payment Date</span>
                            <strong>
                                {ticket.paidAt
                                    ? new Date(ticket.paidAt).toLocaleString()
                                    : "-"}
                            </strong>
                        </div>
                        <div className="ps-detail-row">
                            <span>Status</span>
                            <strong style={{ color: '#16a34a' }}>✓ Paid</strong>
                        </div>
                    </div>

                    {/* Dashed separator */}
                    <div className="ps-dashed" />
                    <p className="ps-scan-note">Show this QR code at the entrance</p>
                </div>

                <div className="ps-actions">
                    <button className="ps-btn-primary" onClick={downloadQR}>
                        📥 Download Ticket
                    </button>
                    <Link to="/dashboard" className="ps-btn-dashboard">🏠 Go to Dashboard</Link>
                    <Link to="/events" className="ps-btn-outline">Browse More Events</Link>
                </div>
            </div>
        </div>
    );
}
