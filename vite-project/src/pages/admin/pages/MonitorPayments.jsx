import { useEffect, useState } from 'react';
import { exportExcel, exportPDF } from '../../../utils/export';
import { api } from '../../../api/admin';
import './AdminPages.css';

const STATUS_COLOR = { paid: 'active', pending: 'pending', failed: 'failed' };

export default function MonitorPayments() {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({ totalProcessed: 0, totalPending: 0, failedCount: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFlt, setStatusFlt] = useState('all');
    const [selected, setSelected] = useState(null);
    const [exportMenu, setExportMenu] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try {
            const d = await api.getPayments();
            setPayments(d.payments || []);
            setSummary(d.summary || {});
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    const displayed = payments.filter(p => {
        const matchSearch = !search ||
            (p.eventTitle || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.userName || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.txRef || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFlt === 'all' || p.status === statusFlt;
        return matchSearch && matchStatus;
    });

    function handleExport(format) {
        setExportMenu(false);
        const headers = ['Ticket ID', 'Event', 'Attendee', 'Amount', 'Date', 'Status', 'Method'];
        const rows = displayed.map(p => [p.ticketCode || p.txRef, p.eventTitle, p.userName, `ETB ${p.amount}`, p.eventDate || new Date(p.createdAt).toLocaleDateString(), p.status, p.paymentMethod]);
        if (format === 'excel') exportExcel('payments_report', 'Payments', headers, rows);
        else exportPDF('Payment Report', headers, rows);
    }

    const summaryCards = [
        { label: 'Total Processed', value: `ETB ${(summary.totalProcessed || 0).toLocaleString()}`, icon: '💰', color: '#10b981' },
        { label: 'Pending Payments', value: `ETB ${(summary.totalPending || 0).toLocaleString()}`, icon: '⏳', color: '#f59e0b' },
        { label: 'Failed Transactions', value: summary.failedCount || 0, icon: '⚠️', color: '#ef4444' },
        { label: 'Total Tickets', value: payments.length, icon: '🎟️', color: '#6366f1' },
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Monitor Payments</h2>
                    <p className="page-subtitle">Real ticket transactions from MongoDB</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <button className="btn-primary" onClick={() => setExportMenu(m => !m)}>📊 Export ▾</button>
                    {exportMenu && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 50, minWidth: 160 }}>
                            <button onClick={() => handleExport('pdf')} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>📄 Export as PDF</button>
                            <button onClick={() => handleExport('excel')} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>📊 Export as Excel</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="payment-summary">
                {summaryCards.map((s, i) => (
                    <div key={i} className="payment-summary-card" style={{ borderLeftColor: s.color }}>
                        <div className="psc-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
                        <div><div className="psc-label">{s.label}</div><div className="psc-value">{s.value}</div></div>
                    </div>
                ))}
            </div>

            <div className="table-box">
                <div className="box-header">
                    <h3>Transactions {loading && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Loading...</span>}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input type="text" className="table-search" placeholder="Search event, attendee, ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                        <select value={statusFlt} onChange={e => setStatusFlt(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            {['Ticket ID', 'Event', 'Attendee', 'Amount', 'Date', 'Method', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.length === 0 && !loading && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 28, color: '#94a3b8' }}>No payments found</td></tr>
                        )}
                        {displayed.map(p => (
                            <tr key={p._id}>
                                <td className="td-mono" style={{ fontSize: 11 }}>{p.ticketCode || p.txRef}</td>
                                <td className="td-bold">{p.eventTitle}</td>
                                <td className="td-muted">{p.userName}</td>
                                <td className="td-bold" style={{ color: '#10b981' }}>ETB {(p.amount || 0).toLocaleString()}</td>
                                <td className="td-muted">{p.eventDate || new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="td-muted">{p.paymentMethod || 'Chapa'}</td>
                                <td><span className={`status-badge ${STATUS_COLOR[p.status] || 'pending'}`}>{p.status}</span></td>
                                <td>
                                    <button className="action-btn" title="View" onClick={() => setSelected(p)}>👁️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Payment Details</h3>
                        <div className="view-detail-grid">
                            {[['Ticket ID', selected.ticketCode || selected.txRef], ['Event', selected.eventTitle], ['Attendee', selected.userName], ['Email', selected.userEmail], ['Amount', `ETB ${(selected.amount || 0).toLocaleString()}`], ['Method', selected.paymentMethod || 'Chapa'], ['Status', selected.status], ['Paid At', selected.paidAt ? new Date(selected.paidAt).toLocaleString() : '—']].map(([k, v]) => (
                                <div key={k} className="view-detail-row">
                                    <span className="view-detail-key">{k}</span>
                                    <span className="view-detail-val">{k === 'Status' ? <span className={`status-badge ${STATUS_COLOR[v] || 'pending'}`}>{v}</span> : v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
