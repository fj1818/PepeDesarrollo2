import React from 'react';

function Sidebar({ activeScreen, changeScreen, unattendedCount, isOpen, toggleSidebar }) {
  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>URUETA CRM</h1>
        </div>
        
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-menu-item ${activeScreen === 'home' ? 'active' : ''}`}
            onClick={() => changeScreen('home')}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </li>
          
          <li 
            className={`sidebar-menu-item ${activeScreen === 'prospects' ? 'active' : ''}`}
            onClick={() => changeScreen('prospects')}
          >
            <i className="fas fa-user-plus"></i>
            <span>Prospectos</span>
            {unattendedCount > 0 && <span className="badge">{unattendedCount}</span>}
          </li>
          
          <li 
            className={`sidebar-menu-item ${activeScreen === 'clients' ? 'active' : ''}`}
            onClick={() => changeScreen('clients')}
          >
            <i className="fas fa-users"></i>
            <span>Clientes</span>
          </li>
          
          <li 
            className={`sidebar-menu-item ${activeScreen === 'records' ? 'active' : ''}`}
            onClick={() => changeScreen('records')}
          >
            <i className="fas fa-folder-open"></i>
            <span>Expedientes</span>
          </li>
          
          <li className="sidebar-menu-item">
            <i className="fas fa-cog"></i>
            <span>Configuración</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar; 