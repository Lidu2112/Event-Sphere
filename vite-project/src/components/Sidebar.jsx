import './Sidebar.css';

const roles = [
    {
        id: 'platform-admin',
        label: 'Platform Administrator',
        color: '#6366f1',
    },
    {
        id: 'event-organizer',
        label: 'Event Organizer',
        color: '#0ea5e9',
    },
    {
        id: 'event-staff',
        label: 'Event Staff',
        color: '#10b981',
    },
    {
        id: 'vendor',
        label: 'Vendor',
        color: '#ec4899',
    },
];

function Sidebar({ currentRole, setCurrentRole }) {
    const active = roles.find(r => r.id === currentRole);

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">✦</div>
                <div>
                    <div className="brand-name">EventSphere</div>
                    <div className="brand-sub">Platform Dashboard</div>
                </div>
            </div>

            <div className="sidebar-section-label">SWITCH ROLE</div>

            <nav className="sidebar-nav">
                {roles.map(role => (
                    <button
                        key={role.id}
                        className={`nav-role-btn ${currentRole === role.id ? 'active' : ''}`}
                        onClick={() => setCurrentRole(role.id)}
                        style={currentRole === role.id ? { borderLeftColor: role.color, background: role.color + '18' } : {}}
                    >
                        <span className="role-label">{role.label}</span>
                        {currentRole === role.id && <span className="active-dot" style={{ background: role.color }} />}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-user">
                    <div className="footer-avatar" style={{ background: active?.color }}>
                        {active?.label.charAt(0)}
                    </div>
                    <div>
                        <div className="footer-name">Demo User</div>
                        <div className="footer-role">{active?.label}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;