import { useEffect, useState } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

export default function TicketManagement() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => { loadTickets(); }, [search, statusFilter]);

    async function loadTickets() {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const data = await api.getTickets(params);
            setTickets(data.tickets || []);
        } catch (err) {
            console.error(err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleRefund(ticket) {
        if (!window.confirm(`Refund ticket ${ticket.ticketCode || ticket.txRef}?`)) return;
        setActionLoading(true);
        try {
            await api.refundTicket(ticket._id);
            setMessage('Ticket refunded successfully.');
            loadTickets();
        } catch (err) {
            setMessage(err.message || 'Refund failed.');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCancel(ticket) {
        if (!window.confirm(`Cancel ticket ${ticket.ticketCode || ticket.txRef}?`)) return;
        setActionLoading(true);
        try {
            await api.cancelTicket(ticket._id);
            setMessage('Ticket cancelled successfully.');
            loadTickets();
        } catch (err) {
            setMessage(err.message || 'Cancel failed.');
        } finally {
            setActionLoading(false);
        }
    }

    function handleDownload(ticket) {
        if (ticket.qrCode) {
            const link = document.createElement('a');
            link.href = ticket.qrCode;
            link.download = `${ticket.ticketCode || ticket.txRef || 'ticket'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const content = `Ticket Code: ${ticket.ticketCode || ticket.txRef || '—'}\nBuyer: ${ticket.userName || ticket.userEmail || '—'}\nEvent: ${ticket.eventTitle || '—'}\nPayment: ETB ${ticket.amount || '0'}\nStatus: ${ticket.status || '—'}\nUsed: ${ticket.checkedIn ? 'Yes' : 'No'}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${ticket.ticketCode || ticket.txRef || 'ticket'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const statuses = ['all', 'paid', 'pending', 'refunded', 'cancelled'];

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Ticket Management</h2>
                    <p className="page-subtitle">Monitor ticket sales, check status, refund, cancel, and download ticket details.</p>
                </div>
                <button className="btn-primary" onClick={loadTickets}>Refresh</button>
            </div>

            {message && (
                <div style={{ marginBottom: 16, color: '#1e293b', fontSize: 13, fontWeight: 600 }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <input
                    className="table-search"
                    placeholder="🔍 Search ticket code, buyer, or event..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 220 }}
                />
                <select
                    className="table-search"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ width: 180 }}
                >
                    {statuses.map(status => (
                        <option key={status} value={status}>{status === 'all' ? 'All status' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="table-box">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Ticket Code</th>
                            <th>Buyer</th>
                            <th>Event</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>QR</th>
                            <th>Used?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>Loading tickets...</td></tr>
                        ) : tickets.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No tickets found</td></tr>
                        ) : tickets.map((ticket, index) => (
                            <tr key={ticket._id || ticket.id || index}>
                                <td className="td-mono">{ticket.ticketCode || ticket.txRef || '—'}</td>
                                <td className="td-bold">{ticket.userName || ticket.userEmail || '—'}</td>
                                <td>{ticket.eventTitle || '—'}</td>
                                <td className="td-muted">{ticket.amount ? `ETB ${ticket.amount}` : '—'} {ticket.paymentMethod ? ` / ${ticket.paymentMethod}` : ''}</td>
                                <td><span className={`status-badge ${ticket.status || 'pending'}`}>{ticket.status || 'pending'}</span></td>
                                <td>{ticket.qrCode ? 'Yes' : 'No'}</td>
                                <td>{ticket.checkedIn ? 'Yes' : 'No'}</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn" title="View" onClick={() => setSelectedTicket(ticket)}>👁️</button>
                                        <button className="action-btn" title="Refund" onClick={() => handleRefund(ticket)} disabled={actionLoading || ticket.status === 'refunded' || ticket.status === 'cancelled'}>💸</button>
                                        <button className="action-btn" title="Cancel" onClick={() => handleCancel(ticket)} disabled={actionLoading || ticket.status === 'cancelled'}>❌</button>
                                        <button className="action-btn" title="Download" onClick={() => handleDownload(ticket)}>⬇️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTicket && (
                <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
                        <h3>Ticket Details</h3>
                        <div className="view-detail-grid" style={{ gap: 14 }}>
                            {[
                                ['Ticket Code', selectedTicket.ticketCode || selectedTicket.txRef || '—'],
                                ['Buyer', selectedTicket.userName || selectedTicket.userEmail || '—'],
                                ['Event', selectedTicket.eventTitle || '—'],
                                ['Payment', selectedTicket.amount ? `ETB ${selectedTicket.amount}` : '—'],
                                ['Status', selectedTicket.status || 'pending'],
                                ['Used', selectedTicket.checkedIn ? 'Yes' : 'No'],
                                ['Created', selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '—'],
                            ].map(([key, value]) => (
                                <div key={key} className="view-detail-row">
                                    <span className="view-detail-key">{key}</span>
                                    <span className="view-detail-val">{key === 'Status' ? <span className={`status-badge ${selectedTicket.status || 'pending'}`}>{value}</span> : value}</span>
                                </div>
                            ))}
                            {selectedTicket.qrCode && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                                    <strong style={{ fontSize: 12, color: '#64748b' }}>QR Code</strong>
                                    <img src={selectedTicket.qrCode} alt="Ticket QR" style={{ width: 220, height: 220, borderRadius: 16, objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0' }} />
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedTicket(null)}>Close</button>
                            <button className="btn-primary" onClick={() => { handleDownload(selectedTicket); }}>Download</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
