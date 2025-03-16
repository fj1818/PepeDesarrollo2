import React, { useEffect, useState } from 'react';

function Dashboard({ prospectos, clientes, expedientes, refreshData }) {
  const [stats, setStats] = useState({
    // Prospectos
    totalProspectos: 0,
    prospectosAtendidos: 0,
    prospectosSinAtender: 0,
    // Clientes
    totalClientes: 0,
    clientesActivos: 0,
    clientesBaja: 0,
    // Expedientes
    expedientesTotales: 0,
    expedientesActivos: 0,
    expedientesCerrados: 0
  });

  useEffect(() => {
    try {
      if (prospectos || clientes || expedientes) {
        const prospectosList = Object.values(prospectos || {});
        const clientesList = Object.values(clientes || {});
        const expedientesList = Object.values(expedientes || {});
        
        // Calcular estadísticas
        setStats({
          totalProspectos: prospectosList.length,
          prospectosAtendidos: prospectosList.filter(p => p['numero-cliente']).length,
          prospectosSinAtender: prospectosList.filter(p => !p['numero-cliente']).length,
          totalClientes: clientesList.length,
          clientesActivos: clientesList.filter(c => c.estado === 'activo').length,
          clientesBaja: clientesList.filter(c => c.estado === 'inactivo' || c.estado === 'baja').length,
          expedientesTotales: expedientesList.length,
          expedientesActivos: expedientesList.filter(e => e.estado === 'abierto').length,
          expedientesCerrados: expedientesList.filter(e => e.estado === 'cerrado').length
        });
      }
    } catch (error) {
      console.error('Error al procesar datos:', error);
    }
  }, [prospectos, clientes, expedientes]);

  const handleRefresh = () => {
    // Mostrar el spinner y ejecutar la actualización
    refreshData();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Indicadores</h1>
        <p className="subtitle">Resumen de actividad de tu negocio</p>
        <button className="refresh-button pulse-effect" onClick={handleRefresh}>
          <i className="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>
      
      <div className="metrics-grid">
        {/* Columna de Prospectos */}
        <div className="metrics-column">
          <h3 className="column-title">Prospectos</h3>
          
          <div className="metric-card prospects">
            <div className="metric-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.totalProspectos}</h2>
              <p className="metric-label">Prospectos Totales</p>
            </div>
          </div>
          
          <div className="metric-card attended">
            <div className="metric-icon">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.prospectosAtendidos}</h2>
              <p className="metric-label">Prospectos Atendidos</p>
            </div>
          </div>
          
          <div className="metric-card unattended">
            <div className="metric-icon">
              <i className="fas fa-user-clock"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.prospectosSinAtender}</h2>
              <p className="metric-label">Prospectos Sin Atender</p>
            </div>
          </div>
        </div>
        
        {/* Columna de Clientes */}
        <div className="metrics-column">
          <h3 className="column-title">Clientes</h3>
          
          <div className="metric-card clients">
            <div className="metric-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.totalClientes}</h2>
              <p className="metric-label">Clientes Totales</p>
            </div>
          </div>
          
          <div className="metric-card clients-active">
            <div className="metric-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.clientesActivos}</h2>
              <p className="metric-label">Clientes Activos</p>
            </div>
          </div>
          
          <div className="metric-card clients-inactive">
            <div className="metric-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.clientesBaja}</h2>
              <p className="metric-label">Clientes Dados de Baja</p>
            </div>
          </div>
        </div>
        
        {/* Columna de Expedientes */}
        <div className="metrics-column">
          <h3 className="column-title">Expedientes</h3>
          
          <div className="metric-card records">
            <div className="metric-icon">
              <i className="fas fa-folder"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.expedientesTotales}</h2>
              <p className="metric-label">Expedientes Totales</p>
            </div>
          </div>
          
          <div className="metric-card records-active">
            <div className="metric-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.expedientesActivos}</h2>
              <p className="metric-label">Expedientes Abiertos</p>
            </div>
          </div>
          
          <div className="metric-card records-closed">
            <div className="metric-icon">
              <i className="fas fa-folder-minus"></i>
            </div>
            <div className="metric-content">
              <h2 className="metric-value">{stats.expedientesCerrados}</h2>
              <p className="metric-label">Expedientes Cerrados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 