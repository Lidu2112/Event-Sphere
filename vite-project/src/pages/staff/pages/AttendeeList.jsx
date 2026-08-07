import { useState, useEffect } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { staffApi } from '../../../api/staff';

export default function AttendeeList() {
    const [attendees, setAttendees] = useState([]);
    const [eventOptions, setEventOptions] = useState([]);   // [{id, title}]
    const [selectedEvent, setSelectedEvent] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [searchFilter, setSearchFilter] = useState('');
    const [ticketTypeFilter, setTicketTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');

    // Load unique event list on mount
    useEffect(() => {
        (async () => {
            setLoadingEvents(true);
            try {
                // Get all paid tickets and extract unique events
                const result = await staffApi.getTickets({ status: 'paid', limit: 1000 });
                const tickets = result.tickets || [];

                // Deduplicate by eventTitle
                const seen = new Set();
                const unique = [];
                tickets.forEach(t => {
                    if (t.eventTitle && !seen.has(t.eventTitle)) {
                        seen.add(t.eventTitle);
                        unique.push({ id: t.eventId, title: t.eventTitle });
                    }
                });

                setEventOptions(unique);
                if (unique.length > 0) setSelectedEvent(unique[0].title);
            } catch (err) {
                setError('Could not load event list from MongoDB.');
                console.error(err);
            } finally {
                setLoadingEvents(false);
            }
        })();
    }, []);

    // Load attendees whenever selected event changes
    useEffect(() => {
        if (!selectedEvent) return;
        (async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all tickets (paid + pending) for this event
                const result = await staffApi.getTickets({ eventTitle: selectedEvent, limit: 500 });
                setAttendees(result.tickets || []);
            } catch (err) {
                setError('Failed to load attendees from MongoDB.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [selectedEvent]);

    // Client-side filtering
    const filtered = attendees.filter(a => {
        const q = searchFilter.toLowerCase();
        const matchSearch = !searchFilter ||
            a.userName?.toLowerCase().includes(q) ||
            a.userEmail?.toLowerCase().includes(q);
        const matchType = !ticketTypeFilter || a.ticketType === ticketTypeFilter;
        const matchStatus = !statusFilter ||
            (statusFilter === 'checked-in' && a.checkedIn === true) ||
            (statusFilter === 'not-arrived' && a.checkedIn === false) ||
            (statusFilter === 'paid' && a.status === 'paid') ||
            (statusFilter === 'pending' && a.status !== 'paid');
        return matchSearch && matchType && matchStatus;
    });

    const ticketTypes = [...new Set(attendees.map(a => a.ticketType).filter(Boolean))];
    const checkedInCount = attendees.filter(a => a.checkedIn).length;

    return (
        <div>
            <PageHeader
                title="Attendee List"
                subtitle="All registered attendees — data from MongoDB"
            />

            {/* Event Selector */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e8eaf0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                        Select Event
                    </label>
                    {loadingEvents ? (
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>Loading events from MongoDB...</div>
                    ) : eventOptions.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#ef4444' }}>No paid tickets in database yet</div>
                    ) : (
                        <select
                            value={selectedEvent}
                            onChange={e => setSelectedEvent(e.target.value)}
                            style={{ width: '100%', maxWidth: 340, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                        >
                            {eventOptions.map((ev, i) => (
                                <option key={i} value={ev.title}>{ev.title}</option>
                            ))}
                        </select>
                    )}
                </div>
                {attendees.length > 0 && (
                    <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <strong>{checkedInCount}</strong> / <strong>{attendees.length}</strong> checked in
                    </div>
                )}
            </div>

            <SectionBox>
                {/* Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 18 }}>
                    <input
                        type="text"
                        placeholder="🔍  Search by name or email..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                    />
                    <select
                        value={ticketTypeFilter}
                        onChange={e => setTicketTypeFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                    >
                        <option value="">All Ticket Types</option>
                        {ticketTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                    >
                        <option value="">All Attendance Status</option>
                        <option value="checked-in">✅ Checked In</option>
                        <option value="not-arrived">⏳ Not Arrived</option>
                    </select>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
                        Loading attendees from MongoDB...
                    </div>
                ) : !selectedEvent ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Select an event to view attendees</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                        {searchFilter || ticketTypeFilter || statusFilter ? 'No attendees match your filters' : 'No attendees found for this event'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    {['#', 'Name', 'Email', 'Ticket Type', 'Payment', 'Attendance'].map(h => (
                                        <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((a, i) => (
                                    <tr key={a._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#94a3b8' }}>{i + 1}</td>
                                        <td style={{ padding: '12px 10px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{a.userName}</td>
                                        <td style={{ padding: '12px 10px', fontSize: 12, color: '#6366f1' }}>{a.userEmail}</td>
                                        <td style={{ padding: '12px 10px', fontSize: 12 }}>
                                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                {a.ticketType || 'General'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                background: a.status === 'paid' ? '#dcfce7' : '#fef3c7',
                                                color: a.status === 'paid' ? '#16a34a' : '#d97706',
                                                padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                            }}>
                                                {a.status === 'paid' ? '✓ Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                background: a.checkedIn ? '#dcfce7' : '#f1f5f9',
                                                color: a.checkedIn ? '#16a34a' : '#64748b',
                                                padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                            }}>
                                                {a.checkedIn ? '✓ Checked In' : 'Not Arrived'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Showing <strong>{filtered.length}</strong> of <strong>{attendees.length}</strong> attendees</span>
                    <span>Source: MongoDB · tickets collection</span>
                </div>
            </SectionBox>
        </div>
    );
}
