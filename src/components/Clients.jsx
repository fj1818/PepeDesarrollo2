import React, { useState, useEffect } from 'react';

function Clients({ clientes, showToast }) {
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Convertir objeto de clientes a array
  useEffect(() => {
    if (clientes) {
      const clientesArray = Object.values(clientes);
      setFilteredClientes(clientesArray);
    }
  }, [clientes]);

  // Filtrar clientes al buscar
  useEffect(() => {
    if (clientes) {
      if (!searchTerm) {
        setFilteredClientes(Object.values(clientes));
      } else {
        const filtered = Object.values(clientes).filter(cliente => {
          return Object.entries(cliente).some(([key, value]) => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
        setFilteredClientes(filtered);
      }
      setCurrentPage(1);
    }
  }, [searchTerm, clientes]);

  // Manejar cambio en campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Calcular páginas e índices
  const totalPages = Math.ceil(filteredClientes.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Cambiar entradas por página
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Abrir expediente
  const handleOpenExpediente = (clienteId) => {
    console.log('Abrir expediente para cliente:', clienteId);
    // Implementar lógica para abrir expediente
    showToast('Funcionalidad no implementada', 'info');
  };

  return (
    <div id="clients-section" className="screen-section active">
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              id="clientsSearch" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="table-actions">
            <button className="btn-primary">
              <i className="fas fa-plus-circle"></i> Nuevo Cliente
            </button>
            <button className="btn-secondary">
              <i className="fas fa-file-export"></i> Exportar
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table id="clientsTable">
            <thead>
              <tr>
                <th>Número de Cliente</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Fecha Alta</th>
                <th>Expediente</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-message">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                currentItems.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.telefono || '-'}</td>
                    <td>{cliente.email || '-'}</td>
                    <td>{cliente.ubicacion || '-'}</td>
                    <td>{cliente.fechaAlta || '-'}</td>
                    <td>
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleOpenExpediente(cliente.id)}
                      >
                        <i className="fas fa-folder-open"></i> Ver
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
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredClientes.length)} de {filteredClientes.length} registros
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

export default Clients; 