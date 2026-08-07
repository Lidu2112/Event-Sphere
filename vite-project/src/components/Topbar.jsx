import './Topbar.css';

function Topbar({ title, subtitle, icon, color, actions }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className="topbar-icon" style={{ background: color + '20', color: color }}>
                    {icon}
                </div>
                <div>
                    <h1 className="topbar-title">{title}</h1>
                    <p className="topbar-subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="topbar-right">
                <div className="topbar-search">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search..." />
                </div>
                <button className="notif-btn">
                    🔔
                    <span className="notif-badge">3</span>
                </button>
                {actions && actions}
            </div>
        </div>
    );
}

export default Topbar;
