import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [dragY, setDragY] = useState(0);
    const startY = useRef(0);
    const currentY = useRef(0);
  
    useEffect(() => {
      if (!isOpen) {
        setIsExpanded(false);
        setDragY(0);
      }
    }, [isOpen]);
  
    const handlePointerDown = (e) => {
      startY.current = e.clientY;
      currentY.current = e.clientY;
      e.target.setPointerCapture(e.pointerId);
    };
  
    const handlePointerMove = (e) => {
      if (startY.current === 0) return;
      e.stopPropagation();
      currentY.current = e.clientY;
      const delta = currentY.current - startY.current;
      
      if (isExpanded && delta < 0) {
        setDragY(delta * 0.2); 
      } else {
        setDragY(delta);
      }
    };
  
    const handlePointerUp = (e) => {
      if (startY.current === 0) return;
      e.stopPropagation();
      const delta = currentY.current - startY.current;
      startY.current = 0;
      
      setDragY(0);
  
      if (!isExpanded && delta < -60) {
        setIsExpanded(true);
      } else if (isExpanded && delta > 60) {
        setIsExpanded(false);
      } else if (!isExpanded && delta > 60) {
        onClose();
      }
    };
  
    const transformStyle = isOpen 
    ? (dragY !== 0 ? `translateY(${dragY}px)` : 'translateY(0)') 
    : 'translateY(100%)';
  
    return (
      <>
        <div className={`sheet-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        <div 
          className={`bottom-sheet ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}
          style={{ 
            transform: transformStyle,
            transition: dragY !== 0 ? 'none' : '' 
          }}
        >
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ cursor: 'grab', paddingBottom: '16px', userSelect: 'none', touchAction: 'none' }}
          >
            <div className="sheet-handle" />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '16px',
              userSelect: 'none'
            }}>
              <h2 style={{ margin: 0, pointerEvents: 'none', userSelect: 'none' }}>{title}</h2>
              <X 
                color="var(--foregroundSecondary)" 
                onClick={(e) => {e.stopPropagation(); onClose(e);}} 
                style={{ cursor: 'pointer', flexShrink: 0 }} 
              />
            </div>
          </div>
          
          <div style={{ 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            flex: 1, 
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))' 
          }}>
            {children}
          </div>
        </div>
      </>
    );
  };