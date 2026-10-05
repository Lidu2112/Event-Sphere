import { useEffect, useState } from 'react';
import { exportExcel, exportPDF, previewHTML } from '../../../utils/export';
import { api } from '../../../api/admin';
import './AdminPages.css';

const CUSTOM_TYPES = [
    { value: 'User Growth Report', label: 'User Report' },
    { value: 'Revenue Report', label: 'Revenue Report' },
    { value: 'Event Analytics', label: 'Event Report' },
    { value: 'Vendor Performance', label: 'Vendor Report' },
];

export default function ViewReports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customModal, setCustomModal] = useState(false);
    const [customType, setCustomType] = useState('User Growth Report');
    const [customFmt, setCustomFmt] = useState('pdf');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        api.getReports()
            .then(d => { if (d.success) setData(d); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Build table data from real API response
    function getReportData(title) {
        if (!data) return { headers: [], rows: [] };
        if (title === 'User Growth Report') {
            return {
                headers: ['Month', 'New Users'],
                rows: (data.userGrowth || []).map(u => [u._id, u.count]),
            };
        }
        if (title === 'Revenue Report') {
            return {
                headers: ['Month', 'Revenue (ETB)'],
                rows: (data.revenueData || []).map(r => [r._id, r.revenue.toLocaleString()]),
            };
        }
        if (title === 'Event Analytics') {
            return {
                headers: ['Event', 'Tickets Sold', 'Revenue'],
                rows: (data.topEvents || []).map(e => [e._id, e.sold, `ETB ${e.revenue.toLocaleString()}`]),
            };
        }
        if (title === 'Vendor Performance') {
            return {
                headers: ['Vendor Email', 'Bookings', 'Revenue'],
                rows: (data.vendorPerf || []).map(v => [v._id, v.bookings, `ETB ${v.revenue.toLocaleString()}`]),
            };
        }
        return { headers: ['Metric', 'Value'], rows: [['Total Users', data.totals?.totalUsers || 0], ['Total Tickets', data.totals?.totalTickets || 0], ['Total Revenue', `ETB ${(data.totals?.totalRevenue || 0).toLocaleString()}`]] };
    }

    const metrics = loading || !data ? [] : [
        { label: 'Total Users', value: data.totals?.totalUsers || 0, change: '', up: true },
        { label: 'Total Revenue', value: `ETB ${(data.totals?.totalRevenue || 0).toLocaleString()}`, change: '', up: true },
        { label: 'Tickets Sold', value: data.totals?.totalTickets || 0, change: '', up: true },
    ];

    const reports = [
        { title: 'User Growth Report', desc: 'Monthly user registration trends', icon: '👥' },
        { title: 'Revenue Report', desc: 'Platform earnings by month', icon: '💰' },
        { title: 'Event Analytics', desc: 'Top events by ticket sales', icon: '🎪' },
        { title: 'Vendor Performance', desc: 'Vendor bookings and revenue', icon: '🏪' },
        { title: 'Platform Summary', desc: 'Overall platform statistics', icon: '📊' },
    ];

    function handleDownload(title, format) {
        const { headers, rows } = getReportData(title);
        if (format === 'excel') exportExcel(title.replace(/\s+/g, '_').toLowerCase(), title, headers, rows);
        else exportPDF(title, headers, rows);
    }

    function handlePreview(title) {
        const { headers, rows } = getReportData(title);
        previewHTML(title, headers, rows);
    }

    function handleCustomGenerate() {
        const { headers, rows } = getReportData(customType);
        if (customFmt === 'excel') exportExcel(`custom_${customType}`, customType, headers, rows);
        else exportPDF(customType, headers, rows);
        setCustomModal(false);
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">View Reports</h2>
                    <p className="page-subtitle">Real analytics from MongoDB {loading && '— Loading...'}</p>
                </div>
                <button className="btn-primary" onClick={() => setCustomModal(true)}>📈 Generate Custom Report</button>
            </div>

            {/* Quick Metrics */}
            {metrics.length > 0 && (
                <div className="metrics-grid">
                    {metrics.map((m, i) => (
                        <div key={i} className="metric-card">
                            <div className="metric-label">{m.label}</div>
                            <div className="metric-value">{m.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reports Grid */}
            <div className="reports-grid">
                {reports.map((r, i) => (
                    <div key={i} className="report-card">
                        <div className="report-icon">{r.icon}</div>
                        <div className="report-content">
                            <div className="report-title">{r.title}</div>
                            <div className="report-desc">{r.desc}</div>
                        </div>
                        <div className="report-actions">
                            <button className="btn-secondary" onClick={() => handleDownload(r.title, 'pdf')}>📄 PDF</button>
                            <button className="btn-secondary" onClick={() => handleDownload(r.title, 'excel')}>📊 Excel</button>
                            <button className="btn-secondary" onClick={() => handlePreview(r.title)}>👁️ Preview</button>
                        </div>
                    </div>
                ))}
            </div>

            {customModal && (
                <div className="modal-overlay" onClick={() => setCustomModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>📈 Generate Custom Report</h3>
                        <div className="modal-form">
                            <label>Report Type</label>
                            <select value={customType} onChange={e => setCustomType(e.target.value)}>
                                {CUSTOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <label>Export Format</label>
                            <select value={customFmt} onChange={e => setCustomFmt(e.target.value)}>
                                <option value="pdf">PDF Document</option>
                                <option value="excel">Excel Spreadsheet</option>
                            </select>
                            <label>Date From</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                            <label>Date To</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setCustomModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCustomGenerate}>⬇️ Generate & Download</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
