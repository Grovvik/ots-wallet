import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../../styles/Modals/Modal.css';
import CloseIcon from "../../assets/icons/close.svg?react";
import BackIcon from "../../assets/icons/back.svg?react";

const Modal = ({ title, children, isOpen, onClose, back = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef(null);
  let lastForm = false;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else if (overlayRef.current) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleOverlayClick = (e, form = false) => {
    if (e.target === e.currentTarget && !form && !lastForm) {
      onClose();
    }
    lastForm = form;
  };

  const handleTransitionEnd = useCallback((e) => {
    if (e.target === overlayRef.current && !isOpen && isAnimating) {
      setIsAnimating(false);
    }
  }, [isOpen, isAnimating]);

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <div ref={overlayRef} className={`modal-overlay${(!isOpen || !isAnimating) ? ' hidden' : ''}`}  onClick={handleOverlayClick} onTransitionEnd={handleTransitionEnd}>
      <div className="modal-form"  onClick={(e) => e.stopPropagation()}  onMouseDown={(e) => handleOverlayClick(e, true)}>
        <div className="header">
          {back ? (
            <button className="back" onClick={back}>
              <BackIcon />
            </button>
          ) : (
            <div className="back"></div>
          )}
          <span>{title}</span>
          <button className="close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;