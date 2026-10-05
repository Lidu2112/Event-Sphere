import { useState, useEffect, useRef } from 'react';
import { PageHeader, SectionBox, StatCard } from '../../../components/SharedComponents';
import { staffApi } from '../../../api/staff';

export default function CheckIn() {
    const [checkedIn, setCheckedIn] = useState([]);
    const [stats, setStats] = useState({ totalTickets: 0, checkedInCount: 0, pendingCount: 0, attendanceRate: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');
    const intervalRef = useRef(null);

    useEffect(() => {
        loadData();
        // Auto-refresh every 10 seconds
        intervalRef.current = setInterval(silentRefresh, 10000);
        return () => clearInterval(intervalRef.current);
    }, []);

    async function loadData() {
        setLoading(true);
        setError('');
        await fetchAll();
        setLoading(false);
    }

    async function silentRefresh() {
        await fetchAll();
    }

    async function fetchAll() {
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                staffApi.getTickets({ checkedIn: 'true', limit: 500 }),
                staffApi.getStats(),
            ]);
            setCheckedIn(ticketsRes.tickets || []);
            if (statsRes.success) setStats(statsRes.stats);
        } catch (err) {
            setError('Failed to load data from server. Make sure the backend is running.');
            console.error(err);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        await fetchAll();
        setRefreshing(false);
    }

    const filtered = checkedIn.filter(t => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return (
            t.userName?.toLowerCase().includes(q) ||
            t.ticketCode?.toLowerCase().includes(q) ||
            t.txRef?.toLowerCase().includes(q) ||
            t.eventTitle?.toLowerCase().includes(q)
        );
    });

    return (
        <div>
            <PageHeader
                title="Check In Records"
                subtitle="Live check-in data from MongoDB — updates every 10 seconds"
            />

            {/* Summary Stats — all from MongoDB */}
            <div className="stats-grid">
                <StatCard icon="🎟️" label="Total Registered" value={stats.totalTickets} color="#6366f1" />
                <StatCard icon="✅" label="Checked In" value={stats.checkedInCount} color="#10b981" />
                <StatCard icon="⏳" label="Remaining" value={stats.pendingCount} color="#f59e0b" />
                <StatCard icon="📊" label="Attendance Rate" value={`${stats.attendanceRate}%`} color="#0ea5e9" />
            </div>

            <SectionBox>
                {/* Search + Refresh */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="🔍  Search by name, ticket ID, QR code, or event..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ flex: 1, minWidth: 260, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                    />
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{
                            padding: '10px 18px', borderRadius: 8,
                            background: '#f1f5f9', border: '1.5px solid #e2e8f0',
                            cursor: refreshing ? 'not-allowed' : 'pointer',
                            fontWeight: 600, fontSize: 13,
                            display: 'flex', alignItems: 'center', gap: 6,
                            opacity: refreshing ? 0.7 : 1,
                        }}
                    >
                        <span style={refreshing ? { display: 'inline-block', animation: 'spin 0.7s linear infinite' } : {}}>🔄</span>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                        Loading check-in records from MongoDB...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                        {filter ? 'No records match your search' : 'No attendees have checked in yet'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    {['#', 'Attendee Name', 'Ticket ID', 'Event Name', 'Entry Time', 'Checked In By'].map(h => (
                                        <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((ticket, i) => (
                                    <tr key={ticket._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#94a3b8' }}>{i + 1}</td>
                                        <td style={{ padding: '12px 10px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                                            {ticket.userName}
                                        </td>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#6366f1', fontFamily: 'monospace', fontWeight: 600 }}>
                                            {ticket.ticketCode || ticket.txRef}
                                        </td>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#374151' }}>
                                            {ticket.eventTitle}
                                        </td>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#6b7280' }}>
                                            {ticket.checkedInAt
                                                ? new Date(ticket.checkedInAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : '—'}
                                        </td>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#6b7280' }}>
                                            {ticket.checkedInBy
                                                ? ticket.checkedInBy.includes('@')
                                                    ? ticket.checkedInBy.split('@')[0]
                                                    : ticket.checkedInBy
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Showing <strong>{filtered.length}</strong> of <strong>{checkedIn.length}</strong> checked-in records</span>
                    <span>Source: MongoDB · tickets collection</span>
                </div>
            </SectionBox>
        </div>
    );
}
