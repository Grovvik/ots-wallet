import React from 'react';
import '../../styles/Modals/SlideModal.css';
import CloseIcon from "../../assets/icons/close.svg?react";
import BackIcon from "../../assets/icons/back.svg?react";

const SlideModal = ({ title, children, isOpen, onClose, back = false}) => {
  return (
    <div className={`modal-overlay${!isOpen ? ' hidden' : ''}`} onClick={onClose}>
      <div className="modal-form" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          {back ? <button className="back" onClick={back}><BackIcon /></button> : <div className="back"></div>}
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

export default SlideModal;