import './QuickAction.css';

function QuickAction({ icon, label, color, onClick }) {
    return (
        <button
            className="quick-action"
            onClick={onClick}
            style={{ background: color + '12', borderColor: color + '30', color: color }}
        >
            <span className="qa-icon">{icon}</span>
            <span className="qa-label">{label}</span>
        </button>
    );
}

export default QuickAction;
