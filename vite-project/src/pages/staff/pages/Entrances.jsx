import { useState, useEffect } from 'react';
import { PageHeader, SectionBox, StatCard } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';
import { staffApi } from '../../../api/staff';

export default function Entrances() {
    const { user } = useAuth();
    const [entrances, setEntrances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [historyEntrance, setHistoryEntrance] = useState(null); // { entrance, checkIns, activityLog }
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        loadEntrances();
        const interval = setInterval(loadEntrances, 5000);
        return () => clearInterval(interval);
    }, []);

    async function loadEntrances() {
        try {
            const res = await staffApi.getEntrances();
            if (res.success) setEntrances(res.entrances || []);
        } catch (err) {
            console.error('Failed to load entrances:', err);
        } finally {
            setLoading(false);
        }
    }

    async function toggleStatus(entrance) {
        setUpdatingId(entrance._id);
        try {
            const newStatus = entrance.status === 'open' ? 'closed' : 'open';
            const res = await staffApi.setEntranceStatus(
                entrance._id,
                newStatus,
                user?.email || 'staff@eventsphere.com',
                user?.name || 'Staff'
            );
            if (res.success) {
                setEntrances(prev => prev.map(e => e._id === entrance._id ? res.entrance : e));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    }

    async function assignToMe(entranceId) {
        setUpdatingId(entranceId);
        try {
            const res = await staffApi.assignEntrance(
                entranceId,
                user?.email || 'staff@eventsphere.com',
                user?.name || 'Staff',
                user?._id || user?.id || null
            );
            if (res.success) {
                setEntrances(prev => prev.map(e => e._id === entranceId ? res.entrance : e));
            }
        } catch (err) {
            console.error('Failed to assign:', err);
        } finally {
            setUpdatingId(null);
        }
    }

    async function unassign(entranceId) {
        setUpdatingId(entranceId);
        try {
            const res = await staffApi.unassignEntrance(entranceId);
            if (res.success) {
                setEntrances(prev => prev.map(e => e._id === entranceId ? res.entrance : e));
            }
        } catch (err) {
            console.error('Failed to unassign:', err);
        } finally {
            setUpdatingId(null);
        }
    }

    async function openHistory(entrance) {
        setHistoryLoading(true);
        setHistoryEntrance({ entrance, checkIns: [], activityLog: [] });
        try {
            const res = await staffApi.getEntranceHistory(entrance._id);
            if (res.success) {
                setHistoryEntrance({ entrance, checkIns: res.checkIns || [], activityLog: res.activityLog || [] });
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }

    const myId = user?._id || user?.id;
    const activeCount = entrances.filter(e => e.status === 'open').length;
    const totalCheckedIn = entrances.reduce((sum, e) => sum + (e.checkedInCount || 0), 0);
    const myEntrances = entrances.filter(e => e.staffId === myId || e.staffEmail === user?.email);

    return (
        <div>
            <PageHeader title="Manage Entrances" subtitle="Monitor and control event entrances — refreshes every 5 seconds" />

            <div className="stats-grid">
                <StatCard icon="🚪" label="Total Entrances" value={entrances.length} color="#6366f1" />
                <StatCard icon="🟢" label="Open Entrances" value={activeCount} color="#10b981" />
                <StatCard icon="👥" label="Total Checked In" value={totalCheckedIn} color="#0ea5e9" />
                <StatCard icon="👤" label="My Assigned" value={myEntrances.length} color="#f59e0b" />
            </div>

            <SectionBox>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                ) : entrances.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No entrances found. Ask admin to create entrances.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    {['Entrance Name', 'Status', 'Assigned Staff', 'Checked In', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {entrances.map(e => {
                                    const isMyEntrance = e.staffId === myId || e.staffEmail === user?.email;
                                    const isAssigned = !!e.staffId || !!e.staffEmail;
                                    const busy = updatingId === e._id;
                                    return (
                                        <tr key={e._id} style={{ borderBottom: '1px solid #f1f5f9', background: isMyEntrance ? '#f0fdf4' : 'transparent' }}>
                                            <td style={{ padding: '12px 10px', fontSize: 13, fontWeight: 600 }}>
                                                {e.name}
                                                {isMyEntrance && <span style={{ marginLeft: 6, fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>MY GATE</span>}
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span className={`status-badge ${e.status === 'open' ? 'active' : 'failed'}`}>
                                                    {e.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px', fontSize: 12, color: isAssigned ? '#0f172a' : '#94a3b8' }}>
                                                {isAssigned ? (
                                                    <span>
                                                        👤 {e.staffName || (e.staffEmail ? e.staffEmail.split('@')[0] : 'Staff')}
                                                        {e.assignedAt && (
                                                            <span style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                                                                Since {new Date(e.assignedAt).toLocaleTimeString()}
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : 'Unassigned'}
                                            </td>
                                            <td style={{ padding: '12px 10px', fontSize: 14, fontWeight: 700, color: '#0ea5e9' }}>
                                                {e.checkedInCount || 0}
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {/* Open/Close */}
                                                    <button
                                                        onClick={() => toggleStatus(e)}
                                                        disabled={busy}
                                                        style={{
                                                            padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                                            background: e.status === 'open' ? '#fee2e2' : '#dcfce7',
                                                            color: e.status === 'open' ? '#b91c1c' : '#166534',
                                                            fontSize: 11, fontWeight: 600, opacity: busy ? 0.5 : 1,
                                                        }}
                                                    >
                                                        {e.status === 'open' ? '🔒 Close' : '🔓 Open'}
                                                    </button>

                                                    {/* Assign to Me / Unassign */}
                                                    {!isAssigned ? (
                                                        <button
                                                            onClick={() => assignToMe(e._id)}
                                                            disabled={busy}
                                                            style={{
                                                                padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                                                background: '#dbeafe', color: '#1e40af',
                                                                fontSize: 11, fontWeight: 600, opacity: busy ? 0.5 : 1,
                                                            }}
                                                        >
                                                            👤 Assign to Me
                                                        </button>
                                                    ) : isMyEntrance ? (
                                                        <button
                                                            onClick={() => unassign(e._id)}
                                                            disabled={busy}
                                                            style={{
                                                                padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                                                background: '#f1f5f9', color: '#64748b',
                                                                fontSize: 11, fontWeight: 600, opacity: busy ? 0.5 : 1,
                                                            }}
                                                        >
                                                            ✕ Unassign
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: '#94a3b8', padding: '6px 4px' }}>Assigned to other</span>
                                                    )}

                                                    {/* History */}
                                                    <button
                                                        onClick={() => openHistory(e)}
                                                        style={{
                                                            padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                                            background: '#f1f5f9', color: '#475569',
                                                            fontSize: 11, fontWeight: 600,
                                                        }}
                                                    >
                                                        📋 History
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                    Last updated: {new Date().toLocaleTimeString()} · Auto-refreshes every 5 seconds
                </div>
            </SectionBox>

            {/* History Modal */}
            {historyEntrance && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 28,
                        width: '100%', maxWidth: 580, maxHeight: '85vh', overflowY: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                    📋 {historyEntrance.entrance.name} — History
                                </h3>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Check-in records and activity log</p>
                            </div>
                            <button onClick={() => setHistoryEntrance(null)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>
                                ✕ Close
                            </button>
                        </div>

                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading history...</div>
                        ) : (
                            <>
                                {/* Check-in list */}
                                <div style={{ marginBottom: 20 }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                                        Check-ins ({historyEntrance.checkIns.length})
                                    </h4>
                                    {historyEntrance.checkIns.length === 0 ? (
                                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                                            No check-ins at this entrance yet.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {historyEntrance.checkIns.map((c, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{c.attendeeName}</div>
                                                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                                            🎟️ {c.ticketCode} · {c.eventTitle}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                                            Staff: {c.checkedInByName || 'Staff'}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                        {c.checkedInAt ? new Date(c.checkedInAt).toLocaleTimeString() : '—'}
                                                        <div>{c.checkedInAt ? new Date(c.checkedInAt).toLocaleDateString() : ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Activity log */}
                                {historyEntrance.activityLog.length > 0 && (
                                    <div>
                                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                                            Activity Log ({historyEntrance.activityLog.length})
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {historyEntrance.activityLog.slice(0, 20).map((a, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                                                    <span style={{ fontSize: 12, color: '#374151' }}>
                                                        {a.type === 'status-change' ? '🔄' : '👤'} {a.action} by {a.changedBy}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                                        {a.changedAt ? new Date(a.changedAt).toLocaleTimeString() : '—'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
