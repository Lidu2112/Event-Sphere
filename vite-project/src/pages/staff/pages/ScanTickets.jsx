import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { staffApi } from '../../../api/staff';
import { useAuth } from '../../../context/AuthContext';

export default function ScanTickets() {
    const { user } = useAuth();
    const [ticketCode, setTicketCode] = useState('');
    const [ticket, setTicket] = useState(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [useCamera, setUseCamera] = useState(true);
    const [selectedEntranceId, setSelectedEntranceId] = useState('');
    const [entrances, setEntrances] = useState([]);

    useEffect(() => {
        async function loadEntrances() {
            try {
                const res = await staffApi.getEntrances();
                const list = res.entrances || [];
                setEntrances(list);
                if (list[0]) setSelectedEntranceId(list[0]._id);
            } catch (err) {
                console.error(err);
            }
        }
        loadEntrances();
    }, []);

    async function validateTicket(code) {
        if (!code.trim()) {
            setMessage('Enter or scan a ticket code.');
            return;
        }

        setLoading(true);
        try {
            const result = await staffApi.getTicket(code.trim());
            const found = result.ticket;
            setTicket(found);
            if (!found.status || found.status !== 'paid') {
                setStatus('invalid');
                setMessage('❌ Invalid ticket or unpaid ticket.');
            } else if (found.checkedIn) {
                setStatus('already');
                setMessage(`⚠ Already checked in at ${new Date(found.checkedInAt).toLocaleTimeString()}.`);
            } else {
                setStatus('valid');
                setMessage('✅ Valid ticket. Ready to check in.');
            }
        } catch (err) {
            setStatus('invalid');
            setMessage(err.message || 'Ticket not found.');
            setTicket(null);
        } finally {
            setLoading(false);
        }
    }
function handleScan(result) {
    if (result && result.length > 0) {
        let scannedCode = result[0].rawValue;

        try {
            // If the QR contains JSON, extract the ticketCode
            const qrData = JSON.parse(scannedCode);

            if (qrData.ticketCode) {
                scannedCode = qrData.ticketCode;
            }
        } catch (err) {
            // Not JSON, so use the raw value
        }

        console.log("Ticket Code:", scannedCode);

        setTicketCode(scannedCode);
        setMessage('');
        setStatus('');
        setTicket(null);

        validateTicket(scannedCode);
    }
}
    async function handleCheckIn() {
        if (!ticket) return;
        setLoading(true);
        try {
            const result = await staffApi.checkInTicket({
                ticketCode: ticket.ticketCode || ticket.txRef,
                staffEmail: user?.email || 'staff@eventsphere.com',
                staffName: user?.name || 'Staff',
                staffId: user?._id || user?.id || null,
                entranceId: selectedEntranceId,
            });
            setTicket(result.ticket);
            setStatus('checked');
            setMessage('✅ Check in successful. Entry recorded.');
            setTicketCode('');
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Check in failed.');
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        setTicket(null);
        setTicketCode('');
        setMessage('');
        setStatus('');
    }

    return (
        <div>
            <PageHeader title="Scan Tickets" subtitle="Scan attendee tickets for validation and check-in" />
            <SectionBox>
                <div style={{ display: 'grid', gap: 20 }}>
                    {/* Toggle Camera/Manual */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => setUseCamera(true)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 8,
                                border: '1.5px solid #cbd5e1',
                                background: useCamera ? '#6366f1' : '#fff',
                                color: useCamera ? '#fff' : '#000',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            📷 Camera Scanner
                        </button>
                        <button
                            onClick={() => setUseCamera(false)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 8,
                                border: '1.5px solid #cbd5e1',
                                background: !useCamera ? '#6366f1' : '#fff',
                                color: !useCamera ? '#fff' : '#000',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            ⌨️ Manual Entry
                        </button>
                    </div>

                    {/* Camera Scanner */}
                    {useCamera && (
                        <div>
                            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                                📸 Allow camera access when prompted by the browser.
                            </p>
                            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '4/3', maxWidth: 480, margin: '0 auto' }}>
                                <Scanner
                                    onScan={handleScan}
                                    onError={(err) => {
                                        console.warn('Scanner error:', err);
                                        setMessage('⚠️ Camera error: ' + (err?.message || 'Could not access camera. Check browser permissions.'));
                                        setStatus('error');
                                    }}
                                    components={{ audio: false, torch: true }}
                                    styles={{ container: { width: '100%', height: '100%' } }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
                        <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                            Entrance
                            <select
                                value={selectedEntranceId}
                                onChange={(e) => setSelectedEntranceId(e.target.value)}
                                style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                            >
                                {entrances.map((entry) => (
                                    <option key={entry._id} value={entry._id}>{entry.name}</option>
                                ))}
                            </select>
                        </label>
                        <div style={{ fontSize: 12, color: '#64748b', alignSelf: 'end' }}>
                            Assigned staff: {entrances.find((entry) => entry._id === selectedEntranceId)?.staffName || 'Unassigned'}
                        </div>
                    </div>

                    {/* Manual Entry */}
                    {!useCamera && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                value={ticketCode}
                                onChange={e => setTicketCode(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && validateTicket(ticketCode)}
                                placeholder="Enter ticket code or scan QR code"
                                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #cbd5e1' }}
                            />
                            <button className="btn-primary" onClick={() => validateTicket(ticketCode)} disabled={loading}>
                                {loading ? 'Checking…' : 'Validate'}
                            </button>
                        </div>
                    )}

                    {/* Message */}
                    {message && (
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: 10,
                            background: status === 'valid' || status === 'checked' ? '#dcfce7' : '#fee2e2',
                            color: status === 'valid' || status === 'checked' ? '#166534' : '#b91c1c',
                            fontWeight: 500,
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Ticket Info */}
                    {ticket && (
                        <div style={{ borderRadius: 16, background: '#f8fafc', padding: 20, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700 }}>{ticket.userName}</div>
                                    <div style={{ fontSize: 13, color: '#6b7280' }}>{ticket.eventTitle}</div>
                                </div>
                                <span className={`status-badge ${ticket.checkedIn ? 'failed' : 'active'}`} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                                    {ticket.checkedIn ? '✓ Checked In' : '✓ Valid Ticket'}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Ticket Code</div>
                                    <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>{ticket.ticketCode || ticket.txRef}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Type</div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ticket.ticketType || 'General'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ticket.status}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Check In Time</div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ticket.checkedIn ? new Date(ticket.checkedInAt).toLocaleTimeString() : 'Pending'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleCheckIn}
                                    disabled={loading || ticket.checkedIn}
                                    style={{ flex: 1, opacity: ticket.checkedIn ? 0.5 : 1 }}
                                >
                                    {ticket.checkedIn ? '✓ Already Checked In' : '✅ Check In Now'}
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: 8,
                                        border: '1px solid #cbd5e1',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SectionBox>
        </div>
    );
}