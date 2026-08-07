import { useEffect, useState } from 'react';
import { StatCard, PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { vendorApi } from '../../../api/vendor';

const STATUS_STYLE = {
    completed: { bg: '#dcfce7', color: '#16a34a' },
    accepted: { bg: '#dbeafe', color: '#1d4ed8' },
    pending: { bg: '#fef3c7', color: '#d97706' },
    rejected: { bg: '#fee2e2', color: '#dc2626' },
};

export default function Payments() {
    const { user } = useAuth();
    const email = user?.email || '';

    const [bookings, setBookings] = useState([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (!email) return;
        vendorApi.getPayments(email)
            .then(d => {
                setBookings(d.bookings || []);
                setTotalPaid(d.totalPaid || 0);
                setTotalPending(d.totalPending || 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [email]);

    const filtered = bookings.filter(b => {
        const matchSearch = !search ||
            b.eventName?.toLowerCase().includes(search.toLowerCase()) ||
            b.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
            b.clientName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalRevenue = totalPaid + totalPending;

    return (
        <div>
            <PageHeader title="Receive Payments" subtitle="All payment records — connected to MongoDB" />

            {/* Stats from real DB data */}
            <div className="stats-grid">
                <StatCard icon="💰" label="Total Revenue" value={`ETB ${totalRevenue.toLocaleString()}`} color="#6366f1" />
                <StatCard icon="✅" label="Paid Out" value={`ETB ${totalPaid.toLocaleString()}`} color="#10b981" />
                <StatCard icon="⏳" label="Pending" value={`ETB ${totalPending.toLocaleString()}`} color="#f59e0b" />
                <StatCard icon="📊" label="Total Bookings" value={bookings.length} color="#0ea5e9" />
            </div>

            <SectionBox>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="🔍  Search by event, service, or client..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1, minWidth: 220, padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="accepted">Accepted</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading payments from MongoDB...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        {search || statusFilter !== 'all' ? 'No records match your filters' : 'No payment records yet'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    {['Event', 'Service', 'Client', 'Amount', 'Date', 'Booking', 'Payment', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => {
                                    const bSt = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
                                    const pSt = STATUS_STYLE[p.paymentStatus === 'paid' ? 'completed' : 'pending'];
                                    return (
                                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                                            <td style={{ padding: '12px 10px', fontSize: 12, fontWeight: 600 }}>{p.eventName}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 11, color: '#64748b' }}>{p.serviceName}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 12 }}>{p.clientName}</td>
                                            <td style={{ padding: '12px 10px', fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                                                ETB {p.amount?.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '12px 10px', fontSize: 11, color: '#94a3b8' }}>
                                                {p.eventDate}
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: bSt.bg, color: bSt.color }}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: pSt.bg, color: pSt.color }}>
                                                    {p.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <button
                                                    onClick={() => setDetail(p)}
                                                    style={{ padding: '4px 10px', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                                    👁️ Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Showing <strong>{filtered.length}</strong> of <strong>{bookings.length}</strong> records</span>
                    <span>Source: MongoDB · bookings collection</span>
                </div>
            </SectionBox>

            {/* Detail Modal */}
            {detail && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setDetail(null)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Payment Details</h3>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 20 }}>Booking ID: {detail._id}</p>

                        {[
                            ['Event', detail.eventName],
                            ['Event Date', detail.eventDate],
                            ['Service', detail.serviceName],
                            ['Client', detail.clientName],
                            ['Client Email', detail.clientEmail],
                            ['Amount', `ETB ${detail.amount?.toLocaleString()}`],
                            ['Booking Status', detail.status],
                            ['Payment Status', detail.paymentStatus],
                        ].map(([k, v]) => {
                            const isStatus = k.includes('Status');
                            const st = STATUS_STYLE[v] || (v === 'paid' ? STATUS_STYLE.completed : null);
                            return (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{k}</span>
                                    {isStatus && st
                                        ? <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color }}>{v}</span>
                                        : <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{v}</span>
                                    }
                                </div>
                            );
                        })}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-primary" onClick={() => setDetail(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
