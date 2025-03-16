import React from 'react';

function Toast({ message, type = 'default', show, onClose }) {
  if (!show) return null;
  
  let iconClass = 'fas ';
  switch (type) {
    case 'success':
      iconClass += 'fa-check-circle';
      break;
    case 'error':
      iconClass += 'fa-exclamation-circle';
      break;
    case 'info':
      iconClass += 'fa-info-circle';
      break;
    default:
      iconClass += 'fa-bell';
  }

  return (
    <div className={`toast-notification ${type} ${show ? 'show' : ''}`}>
      <div className="toast-content">
        <i className={`toast-icon ${iconClass}`}></i>
        <div className="toast-message" dangerouslySetInnerHTML={{ __html: message }}></div>
        <button className="toast-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

export default Toast; 