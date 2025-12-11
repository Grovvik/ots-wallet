import "../styles/ActionButton.css";

function ActionButton({ icon, label, onClick }) {
    return (
        <div className="action-button" onClick={onClick}>
            <button>
                {icon}
            </button>
            <span>{label}</span>
        </div>
    );
}

export default ActionButton;
