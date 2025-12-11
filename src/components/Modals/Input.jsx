import '../../styles/Modals/Input.css';

function Input({label, button, type}) {
    return (
        <div className="input">
            {type == "number" ?
            <input autoComplete="off" autoCorrect="off" spellCheck="false" inputMode="decimal" type="text" />
            : <textarea />}
            <label>{label}</label>
            {button}
        </div>
    )
}

export default Input