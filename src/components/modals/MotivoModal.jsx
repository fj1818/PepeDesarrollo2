import React, { useEffect, useRef } from 'react';

function MotivoModal({ show, motivo, onSave, onClose }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (show && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div id="motivoModal" className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Motivo</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="motivoText">Ingrese el motivo:</label>
            <textarea 
              id="motivoText"
              ref={textareaRef}
              defaultValue={motivo || ''}
              rows="4" 
              placeholder="Ingrese el motivo aquí..."
            ></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button id="cancelarMotivo" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            id="guardarMotivo" 
            className="btn-primary" 
            onClick={() => {
              if (onSave && textareaRef.current) {
                onSave(textareaRef.current.value);
              }
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default MotivoModal; 