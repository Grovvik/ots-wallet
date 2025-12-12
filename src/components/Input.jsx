import React, { useState } from 'react';
import '../styles/Input.css';

function Input({ label, button, type, state }) {
    const [value, setValue] = state;
    const handleChange = (e) => {
        let val = e.target.value;
        if (type === "number") {
            val = val
                .replace(/,/g, '.')            // remove commas
                .replace(/[^\d.]/g, '')        // remove chars
                .replace(/(\..*)\./g, '$1')    // remove others points
                .replace(/(\.\d{3}).+/, '$1'); // keep only 3 digits
        }
        setValue(val);
        e.target.value = val;
    };

    const isNotEmpty = value.trim() !== '';

    return (
        <div className="input">
            {type === "number" ? (
                <input autoComplete="off" autoCorrect="off" spellCheck="false" inputMode="decimal" type="text" value={value} onChange={handleChange} />
            ) : (
                <textarea value={value} onChange={handleChange} />
            )}
            <label className={isNotEmpty ? "c" : ""}>{label}</label>
            {button}
        </div>
    );
}

export default Input;