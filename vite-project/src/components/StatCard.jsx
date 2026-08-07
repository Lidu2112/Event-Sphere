import './StatCard.css';

function StatCard({ icon, label, value, trend, trendLabel, color, bg }) {
    return (
        <div className="stat-card" style={{ borderTopColor: color }}>
            <div className="stat-card-top">
                <div className="stat-icon-wrap" style={{ background: bg || color + '18', color: color }}>
                    {icon}
                </div>
                {trend && (
                    <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {trendLabel && <div className="stat-trend-label">{trendLabel}</div>}
        </div>
    );
}

export default StatCard;
