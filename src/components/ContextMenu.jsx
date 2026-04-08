import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ContextMenu({ options }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
      <div className="context-menu-container" ref={menuRef}>
        <MoreVertical 
          color="var(--foregroundSecondary)" 
          onClick={() => setOpen(!open)} 
          style={{ cursor: 'pointer' }}
        />
        {open && (
          <div className="context-menu">
            {options.map((opt, i) => (
              <button 
                key={i} 
                className={opt.danger ? 'danger' : ''} 
                onClick={() => { opt.action(); setOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };