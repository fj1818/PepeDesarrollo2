import React, { useState, useEffect } from 'react';

function Records({ expedientes, showToast }) {
  const [filteredExpedientes, setFilteredExpedientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Convertir objeto de expedientes a array
  useEffect(() => {
    if (expedientes) {
      const expedientesArray = Object.values(expedientes);
      setFilteredExpedientes(expedientesArray);
    }
  }, [expedientes]);

  // Filtrar expedientes al buscar
  useEffect(() => {
    if (expedientes) {
      if (!searchTerm) {
        setFilteredExpedientes(Object.values(expedientes));
      } else {
        const filtered = Object.values(expedientes).filter(expediente => {
          return Object.entries(expediente).some(([key, value]) => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
        setFilteredExpedientes(filtered);
      }
      setCurrentPage(1);
    }
  }, [searchTerm, expedientes]);

  // Manejar cambio en campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Calcular páginas e índices
  const totalPages = Math.ceil(filteredExpedientes.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredExpedientes.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Cambiar entradas por página
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Ver detalles del expediente
  const handleViewExpediente = (expedienteId) => {
    console.log('Ver expediente:', expedienteId);
    // Implementar lógica para ver expediente
    showToast('Funcionalidad no implementada', 'info');
  };

  return (
    <div id="records-section" className="screen-section active">
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              id="recordsSearch" 
              placeholder="Buscar expediente..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="table-actions">
            <button className="btn-primary">
              <i className="fas fa-plus-circle"></i> Nuevo Expediente
            </button>
            <button className="btn-secondary">
              <i className="fas fa-file-export"></i> Exportar
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table id="recordsTable">
            <thead>
              <tr>
                <th>ID Expediente</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Fecha Apertura</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-message">
                    No se encontraron expedientes
                  </td>
                </tr>
              ) : (
                currentItems.map(expediente => (
                  <tr key={expediente.id}>
                    <td>{expediente.id}</td>
                    <td>{expediente.cliente}</td>
                    <td>{expediente.tipo || 'General'}</td>
                    <td>{expediente.fechaApertura || '-'}</td>
                    <td>
                      <span className={`status-badge ${expediente.estado || 'abierto'}`}>
                        {expediente.estado || 'Abierto'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleViewExpediente(expediente.id)}
                      >
                        <i className="fas fa-eye"></i> Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredExpedientes.length)} de {filteredExpedientes.length} registros
          </div>
          <div className="pagination-length">
            <label>
              Mostrar 
              <select id="pageSize" value={entriesPerPage} onChange={handleEntriesPerPageChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              registros
            </label>
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => goToPage(1)}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <i className="fas fa-angle-left"></i>
            </button>
            
            <div className="pagination-numbers">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Mostrar páginas alrededor de la página actual
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => goToPage(totalPages)}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Records; 