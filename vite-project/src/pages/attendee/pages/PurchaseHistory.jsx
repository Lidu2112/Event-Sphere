import { useEffect, useState } from 'react';
import { PageHeader, SectionBox } from '../../../components/SharedComponents';
import { useAuth } from '../../../context/AuthContext';

export default function PurchaseHistory() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        fetch(`http://localhost:5000/api/attendee/purchases?userEmail=${encodeURIComponent(user.email)}`)
            .then(r => r.json())
            .then(d => { setPurchases(d.bookings || []); setTotalSpent(d.totalSpent || 0); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div>
            <PageHeader title="Purchase History" subtitle={`Total spent: ETB ${totalSpent.toLocaleString()} — from MongoDB`} />
            <SectionBox>
                {loading ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                ) : purchases.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No purchases yet.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>{['Event', 'Date', 'Amount', 'Type', 'Status'].map(h => (
                                <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {purchases.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600 }}>{p.eventName}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '11px', color: '#94a3b8' }}>{p.eventDate || '—'}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600, color: '#10b981' }}>ETB {(p.amount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '12px' }}>{p.serviceName}</td>
                                    <td style={{ padding: '12px 10px' }}><span className="status-badge active">{p.paymentStatus}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </SectionBox>
        </div>
    );
}
