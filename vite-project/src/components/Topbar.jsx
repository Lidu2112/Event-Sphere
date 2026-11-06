import AppIcon from './AppIcon.jsx';
import './Topbar.css';

function Topbar({ title, subtitle, icon, color, actions }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <div className="topbar-icon" style={{ background: color + '20', color: color }}>
                    <AppIcon name={icon} />
                </div>
                <div>
                    <h1 className="topbar-title">{title}</h1>
                    <p className="topbar-subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="topbar-right">
                <div className="topbar-search">
                    <span className="search-icon"><AppIcon name="search" /></span>
                    <input type="text" placeholder="Search..." aria-label="Search" />
                </div>
                <button className="notif-btn" aria-label="Notifications">
                    <AppIcon name="notifications" />
                    <span className="notif-badge">3</span>
                </button>
                {actions && actions}
            </div>
        </div>
    );
}

export default Topbar;
