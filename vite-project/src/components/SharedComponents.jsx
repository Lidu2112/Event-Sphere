import './SharedComponents.css';

export function StatCard({ icon, label, value, trend, color }) {
    return (
        <div className="scard" style={{ borderTopColor: color }}>
            <div className="scard-top">
                <div className="scard-icon" style={{ background: color + '20', color }}>{icon}</div>
                {trend && <div className={`scard-trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</div>}
            </div>
            <div className="scard-value">{value}</div>
            <div className="scard-label">{label}</div>
        </div>
    );
}

export function ActionButton({ icon, label, onClick, color = '#6366f1' }) {
    return (
        <button className="action-btn-card" onClick={onClick} style={{ borderColor: color + '30', background: color + '12', color }}>
            <span className="ab-icon">{icon}</span>
            <span className="ab-label">{label}</span>
        </button>
    );
}

export function DataTable({ columns, data, actions }) {
    return (
        <div className="dtable-wrap">
            <table className="dtable">
                <thead>
                    <tr>
                        {columns.map((col, i) => <th key={i}>{col}</th>)}
                        {actions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => <td key={j}>{cell}</td>)}
                            {actions && <td><div className="dtable-actions">{actions(row, i)}</div></td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function PageHeader({ title, subtitle, action }) {
    return (
        <div className="page-hdr">
            <div>
                <h2 className="page-h-title">{title}</h2>
                <p className="page-h-sub">{subtitle}</p>
            </div>
            {action && action}
        </div>
    );
}

export function SectionBox({ title, children, action }) {
    return (
        <div className="section-box">
            {title && (
                <div className="sbox-header">
                    <h3>{title}</h3>
                    {action && action}
                </div>
            )}
            {children}
        </div>
    );
}
