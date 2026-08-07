import { useEffect, useState } from 'react';
import { api } from '../../../api/admin';
import './AdminPages.css';

export default function EntrancesManagement() {
    const [entrances, setEntrances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [historyModal, setHistoryModal] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [assignModal, setAssignModal] = useState(null);
    const [globalHistory, setGlobalHistory] = useState([]);
    const [tab, setTab] = useState('entrances');

    useEffect(() => {
        loadAll();
        const interval = setInterval(loadEntrances, 5000);
        return () => clearInterval(interval);
    }, []);

    async function loadAll() {
        await Promise.all([loadEntrances(), loadStaff(), loadGlobalHistory()]);
        setLoading(false);
    }

    async function loadEntrances() {
        try {
            const res = await api.getEntrances();
            setEntrances(res.entrances || []);
        } catch (err) { console.error(err); }
    }

    async function loadStaff() {
        try {
            const res = await api.getUsers({ role: 'event-staff' });
            let list = res.users || [];
            if (list.length === 0) {
                const res2 = await api.getUsers({ role: 'staff' });
                list = res2.users || [];
            }
            setStaffList(list);
        } catch (err) { console.error(err); }
    }

    async function loadGlobalHistory() {
        try {
            const res = await api.getCheckinHistory();
            if (res.success) setGlobalHistory(res.history || []);
        } catch (err) { console.error(err); }
    }

    async function toggleStatus(entrance) {
        setUpdatingId(entrance._id);
        try {
            const next = entrance.status === 'open' ? 'closed' : 'open';
            const res = await api.setEntranceStatus(entrance._id, next);
            if (res.success) setEntrances(prev => prev.map(e => e._id === entrance._id ? res.entrance : e));
        } catch (err) { console.error(err); }
        finally { setUpdatingId(null); }
    }

    async function handleAssign(entrance, staffUser) {
        setUpdatingId(entrance._id);
        try {
            const res = await api.assignEntrance(
                entrance._id,
                staffUser?.email || null,
                staffUser?.name || null,
                staffUser?._id || staffUser?.id || null
            );
            if (res.success) setEntrances(prev => prev.map(e => e._id === entrance._id ? res.entrance : e));
        } catch (err) { console.error(err); }
        finally { setUpdatingId(null); setAssignModal(null); }
    }

    async function handleUnassign(entranceId) {
        setUpdatingId(entranceId);
        try {
            const res = await api.unassignEntrance(entranceId);
            if (res.success) setEntrances(prev => prev.map(e => e._id === entranceId ? res.entrance : e));
        } catch (err) { console.error(err); }
        finally { setUpdatingId(null); }
    }

    async function openHistory(entrance) {
        setHistoryLoading(true);
        setHistoryModal({ entrance, checkIns: [], activityLog: [] });
        try {
            const res = await api.getEntranceHistory(entrance._id);
            if (res.success) {
                setHistoryModal({ entrance, checkIns: res.checkIns || [], activityLog: res.activityLog || [] });
            }
        } catch (err) { console.error(err); }
        finally { setHistoryLoading(false); }
    }

    const openCount = entrances.filter(e => e.status === 'open').length;
    const closedCount = entrances.filter(e => e.status !== 'open').length;
    const totalCheckedIn = entrances.reduce((s, e) => s + (e.checkedInCount || 0), 0);
    const assignedCount = entrances.filter(e => e.staffId || e.staffEmail).length;

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Entrance Monitor</h2>
                    <p className="page-subtitle">Real-time entrance control and check-in monitoring — auto refreshes every 5s</p>
                </div>
                <button className="btn-secondary" onClick={loadAll}>🔄 Refresh</button>
            </div>

            <div className="stats-grid">
                {[
                    { icon: '🚪', label: 'Total Entrances', value: entrances.length, color: '#6366f1', bg: '#eef2ff' },
                    { icon: '🟢', label: 'Open', value: openCount, color: '#10b981', bg: '#dcfce7' },
                    { icon: '🔴', label: 'Closed', value: closedCount, color: '#ef4444', bg: '#fee2e2' },
                    { icon: '✅', label: 'Total Checked In', value: totalCheckedIn, color: '#0ea5e9', bg: '#e0f2fe' },
                    { icon: '👤', label: 'Assigned', value: assignedCount, color: '#f59e0b', bg: '#fef3c7' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <div className="sc-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        </div>
                        <div className="sc-value">{s.value}</div>
                        <div className="sc-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="filter-tabs">
                <button className={tab === 'entrances' ? 'active' : ''} onClick={() => setTab('entrances')}>🚪 Entrances</button>
                <button className={tab === 'history' ? 'active' : ''} onClick={() => { setTab('history'); loadGlobalHistory(); }}>
                    📋 Check-in History ({globalHistory.length})
                </button>
            </div>

            {tab === 'entrances' && (
                <div className="section-box">
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading entrances…</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Entrance</th>
                                        <th>Status</th>
                                        <th>Assigned Staff</th>
                                        <th>Checked In</th>
                                        <th>Last Activity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entrances.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                                No entrances found. Use the Staff panel to seed default entrances.
                                            </td>
                                        </tr>
                                    ) : entrances.map(entrance => (
                                        <tr key={entrance._id}>
                                            <td className="td-bold">{entrance.name}</td>
                                            <td>
                                                <span className={`status-badge ${entrance.status === 'open' ? 'active' : 'failed'}`}>
                                                    {entrance.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                                                </span>
                                            </td>
                                            <td>
                                                {(entrance.assignedStaffName && entrance.assignedStaffName !== 'Unassigned') || entrance.staffEmail ? (
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                                                            👤 {entrance.assignedStaffName || entrance.staffName || entrance.staffEmail?.split('@')[0]}
                                                        </div>
                                                        {entrance.staffEmail && (
                                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{entrance.staffEmail}</div>
                                                        )}
                                                        {entrance.assignedAt && (
                                                            <div style={{ fontSize: 10, color: '#94a3b8' }}>
                                                                Since {new Date(entrance.assignedAt).toLocaleTimeString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="td-muted">— Unassigned</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: 18, fontWeight: 800, color: '#0ea5e9' }}>
                                                {entrance.checkedInCount || 0}
                                            </td>
                                            <td className="td-muted">
                                                {entrance.lastCheckedInAt
                                                    ? new Date(entrance.lastCheckedInAt).toLocaleTimeString()
                                                    : entrance.updatedAt
                                                        ? new Date(entrance.updatedAt).toLocaleTimeString()
                                                        : '—'}
                                            </td>
                                            <td>
                                                <div className="action-btns" style={{ flexWrap: 'wrap', gap: 6 }}>
                                                    <button
                                                        onClick={() => toggleStatus(entrance)}
                                                        disabled={updatingId === entrance._id}
                                                        style={{
                                                            padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                                            background: entrance.status === 'open' ? '#fee2e2' : '#dcfce7',
                                                            color: entrance.status === 'open' ? '#b91c1c' : '#166534',
                                                            fontSize: 11, fontWeight: 600,
                                                        }}
                                                    >
                                                        {entrance.status === 'open' ? '🔒 Close' : '🔓 Open'}
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => setAssignModal(entrance)}
                                                        disabled={updatingId === entrance._id}
                                                        style={{ padding: '6px 10px', fontSize: 11 }}
                                                    >
                                                        👤 Assign
                                                    </button>
                                                    {(entrance.staffId || entrance.staffEmail) && (
                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() => handleUnassign(entrance._id)}
                                                            disabled={updatingId === entrance._id}
                                                            style={{ padding: '6px 10px', fontSize: 11, color: '#ef4444' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => openHistory(entrance)}
                                                        style={{ padding: '6px 10px', fontSize: 11 }}
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === 'history' && (
                <div className="section-box">
                    <div className="box-header">
                        <h3>Global Check-in History</h3>
                        <button className="btn-secondary" onClick={loadGlobalHistory}>🔄 Reload</button>
                    </div>
                    {globalHistory.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No check-ins recorded yet.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Attendee</th>
                                        <th>Ticket Code</th>
                                        <th>Event</th>
                                        <th>Entrance</th>
                                        <th>Staff</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {globalHistory.map((h, i) => (
                                        <tr key={i}>
                                            <td className="td-bold">{h.attendeeName}</td>
                                            <td className="td-mono">{h.ticketCode}</td>
                                            <td>{h.eventTitle}</td>
                                            <td>
                                                <span style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    🚪 {h.entranceName}
                                                </span>
                                            </td>
                                            <td className="td-muted">{h.checkedInByName || 'Staff'}</td>
                                            <td className="td-muted">
                                                {h.checkedInAt ? (
                                                    <>
                                                        <div>{new Date(h.checkedInAt).toLocaleDateString()}</div>
                                                        <div>{new Date(h.checkedInAt).toLocaleTimeString()}</div>
                                                    </>
                                                ) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Assign Staff Modal */}
            {assignModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Assign Staff — "{assignModal.name}"</h3>
                        {staffList.length === 0 ? (
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                                No staff accounts found. Create users with role "event-staff" under Manage Users.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 320, overflowY: 'auto' }}>
                                {staffList.map(s => {
                                    const isCurrent = assignModal.staffId === (s._id || s.id) || assignModal.staffEmail === s.email;
                                    return (
                                        <button
                                            key={s._id || s.id}
                                            onClick={() => handleAssign(assignModal, s)}
                                            disabled={!!updatingId}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '12px 14px', borderRadius: 10,
                                                border: `1.5px solid ${isCurrent ? '#6366f1' : '#e2e8f0'}`,
                                                background: isCurrent ? '#eef2ff' : '#fff',
                                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                            }}
                                        >
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                                {(s.name || s.email || 'S')[0].toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{s.name || 'Staff'}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.email}</div>
                                            </div>
                                            {isCurrent && (
                                                <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>Current</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entrance History Modal */}
            {historyModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 620 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0 }}>📋 {historyModal.entrance.name}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Check-in records and activity log</p>
                            </div>
                            <button onClick={() => setHistoryModal(null)} className="btn-secondary">✕</button>
                        </div>

                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading...</div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                                    {[
                                        { label: 'Check-ins', value: historyModal.checkIns.length, color: '#10b981' },
                                        { label: 'Status', value: (historyModal.entrance.status || 'unknown').toUpperCase(), color: historyModal.entrance.status === 'open' ? '#10b981' : '#ef4444' },
                                        { label: 'Activity Log', value: historyModal.activityLog.length, color: '#6366f1' },
                                    ].map(s => (
                                        <div key={s.label} style={{ flex: 1, padding: 12, background: '#f8fafc', borderRadius: 10, textAlign: 'center' }}>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                                    Check-in Records
                                </h4>
                                {historyModal.checkIns.length === 0 ? (
                                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                                        No check-ins at this entrance yet.
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                                        {historyModal.checkIns.map((c, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.attendeeName}</div>
                                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>🎟️ {c.ticketCode} · {c.eventTitle}</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>by {c.checkedInByName || 'Staff'}</div>
                                                </div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
                                                    <div>{c.checkedInAt ? new Date(c.checkedInAt).toLocaleDateString() : '—'}</div>
                                                    <div>{c.checkedInAt ? new Date(c.checkedInAt).toLocaleTimeString() : ''}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {historyModal.activityLog.length > 0 && (
                                    <>
                                        <h4 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                                            Activity Log
                                        </h4>
                                        <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {historyModal.activityLog.map((a, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                                                    <span style={{ fontSize: 12, color: '#374151' }}>
                                                        {a.type === 'status-change' ? '🔄' : '👤'} <strong>{a.action}</strong> by {a.changedBy}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                        {a.changedAt ? new Date(a.changedAt).toLocaleTimeString() : '—'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
