import React from 'react';

function Spinner({ show }) {
  if (!show) return null;
  
  return (
    <div className={`spinner-overlay ${show ? 'show' : ''}`}>
      <div className="spinnerContainer">
        <div className="spinner"></div>
        <div className="loader">
          <p>Cargando</p>
          <div className="words">
            <span className="word">prospectos</span>
            <span className="word">clientes</span>
            <span className="word">expedientes</span>
            <span className="word">indicadores</span>
            <span className="word">datos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Spinner; 