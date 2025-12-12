import "../styles/MaxAmount.css";

function MaxAmount({ name, amount, currency, onClick }) {
    const handleClick = (e) => {
        e.preventDefault();
        if (onClick) onClick();
    };
    return (
        <div className="max-amount">
            <span>{name}: {amount} {currency ? currency : ''}</span>
            <a className="get-max" onClick={handleClick}>MAX</a>
        </div>
    )
}

export default MaxAmount;