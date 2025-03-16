import React, { useState, useEffect } from 'react';

function Prospects({ prospectos, showToast, setMotivoModal, setClienteModal }) {
  // Estados para paginación y filtrado
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filteredProspectos, setFilteredProspectos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modifiedRows, setModifiedRows] = useState({});

  // Convertir objeto de prospectos a array ordenado
  useEffect(() => {
    if (prospectos) {
      const prospectosArray = Object.values(prospectos);
      // Ordenar por fecha descendente
      prospectosArray.sort((a, b) => {
        const dateA = new Date(a['fecha-prospecto']);
        const dateB = new Date(b['fecha-prospecto']);
        return dateB - dateA;
      });
      
      setFilteredProspectos(prospectosArray);
    }
  }, [prospectos]);

  // Filtrar prospectos al buscar
  useEffect(() => {
    if (prospectos) {
      if (!searchTerm) {
        // Si no hay término de búsqueda, mostrar todos
        setFilteredProspectos(Object.values(prospectos));
      } else {
        // Filtrar por término de búsqueda
        const filtered = Object.values(prospectos).filter(prospecto => {
          return Object.entries(prospecto).some(([key, value]) => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
        setFilteredProspectos(filtered);
      }
      setCurrentPage(1); // Volver a la primera página cuando se filtra
    }
  }, [searchTerm, prospectos]);

  // Manejar cambio en campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Calcular páginas e índices
  const totalPages = Math.ceil(filteredProspectos.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredProspectos.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Cambiar entradas por página
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Resetear a página 1
  };

  // Abrir modal de motivo
  const handleOpenMotivoModal = (motivo, id) => {
    setMotivoModal({
      show: true,
      motivo: motivo || '',
      onSave: (nuevoMotivo) => {
        // Marcar fila como modificada
        setModifiedRows(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            motivo: nuevoMotivo
          }
        }));
        
        showToast('Motivo actualizado correctamente', 'success');
      }
    });
  };

  // Manejar cambios en los campos de la tabla
  const handleFieldChange = (id, field, value) => {
    setModifiedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Función para formatear fecha
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const parts = dateStr.split(' ');
      if (parts.length < 2) return '';
      
      const dateParts = parts[0].split('/');
      if (dateParts.length !== 3) return '';
      
      const dateObj = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]} ${parts[1]} ${parts[2] || ''}`);
      
      if (isNaN(dateObj.getTime())) return '';
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return '';
    }
  };

  // Guardar cambios
  const saveChanges = () => {
    if (Object.keys(modifiedRows).length === 0) {
      showToast('No hay cambios para guardar', 'info');
      return;
    }

    // Aquí se implementaría la lógica para guardar en backend
    console.log('Cambios a guardar:', modifiedRows);
    
    // Simulamos éxito
    showToast('Cambios guardados correctamente', 'success');
    setModifiedRows({});
  };

  return (
    <div id="prospects-section" className="screen-section active">
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              id="prospectsSearch" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="table-actions">
            <button className="btn-primary" onClick={saveChanges}>
              <i className="fas fa-save"></i> Guardar Cambios
            </button>
            <button className="btn-secondary">
              <i className="fas fa-file-export"></i> Exportar
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table id="prospectsTable">
            <thead>
              <tr>
                <th style={{ display: 'none' }}>ID</th>
                <th className="check-column">Convertir</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Canal</th>
                <th>Fecha</th>
                <th className="check-column">Contactado</th>
                <th className="check-column">Interesado</th>
                <th>Motivo</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="12" className="empty-message">
                    No se encontraron prospectos
                  </td>
                </tr>
              ) : (
                currentItems.map(prospecto => (
                  <tr 
                    key={prospecto['id-prospecto']} 
                    className={modifiedRows[prospecto['id-prospecto']] ? 'modified' : ''}
                  >
                    <td style={{ display: 'none' }}>{prospecto['id-prospecto']}</td>
                    <td className="check-column">
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          className="convert-checkbox" 
                          disabled={prospecto['numero-cliente']}
                        />
                      </div>
                    </td>
                    <td>{prospecto['nombre-prospecto']}</td>
                    <td>
                      <input 
                        type="tel" 
                        value={
                          modifiedRows[prospecto['id-prospecto']]?.telefono !== undefined
                            ? modifiedRows[prospecto['id-prospecto']].telefono
                            : prospecto.telefono
                        }
                        onChange={(e) => handleFieldChange(prospecto['id-prospecto'], 'telefono', e.target.value)}
                        pattern="[0-9]*"
                      />
                    </td>
                    <td>
                      <input 
                        type="email" 
                        value={
                          modifiedRows[prospecto['id-prospecto']]?.email !== undefined
                            ? modifiedRows[prospecto['id-prospecto']].email
                            : prospecto.email
                        }
                        onChange={(e) => handleFieldChange(prospecto['id-prospecto'], 'email', e.target.value)}
                      />
                    </td>
                    <td>{prospecto.ubicacion}</td>
                    <td>
                      <select 
                        value={
                          modifiedRows[prospecto['id-prospecto']]?.canal !== undefined
                            ? modifiedRows[prospecto['id-prospecto']].canal
                            : prospecto.canal
                        }
                        onChange={(e) => handleFieldChange(prospecto['id-prospecto'], 'canal', e.target.value)}
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="web">Web</option>
                        <option value="referido">Referido</option>
                        <option value="otro">Otro</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="datetime-local" 
                        value={
                          modifiedRows[prospecto['id-prospecto']]?.['fecha-prospecto'] !== undefined
                            ? modifiedRows[prospecto['id-prospecto']]['fecha-prospecto']
                            : formatDateForInput(prospecto['fecha-prospecto'])
                        }
                        onChange={(e) => handleFieldChange(prospecto['id-prospecto'], 'fecha-prospecto', e.target.value)}
                      />
                    </td>
                    <td className="check-column">
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          className="contactado-check" 
                          checked={
                            modifiedRows[prospecto['id-prospecto']]?.contactado !== undefined
                              ? modifiedRows[prospecto['id-prospecto']].contactado
                              : prospecto.contactado
                          }
                          onChange={(e) => handleFieldChange(prospecto['id-prospecto'], 'contactado', e.target.checked)}
                        />
                      </div>
                    </td>
                    <td className="check-column">
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          className="interesado-check" 
                          checked={
                            modifiedRows[prospecto['id-prospecto']]?.interesado !== undefined
                              ? modifiedRows[prospecto['id-prospecto']].interesado
                              : prospecto.interesado
                          }
                          onChange={(e) => handleFieldChange(prospecto['id-prospecto'], 'interesado', e.target.checked)}
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn-motivo"
                        onClick={() => handleOpenMotivoModal(
                          modifiedRows[prospecto['id-prospecto']]?.motivo !== undefined
                            ? modifiedRows[prospecto['id-prospecto']].motivo
                            : prospecto.motivo,
                          prospecto['id-prospecto']
                        )}
                      >
                        <i className="fas fa-eye"></i> Ver
                      </button>
                    </td>
                    <td className="cliente-cell">{prospecto['numero-cliente'] || ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredProspectos.length)} de {filteredProspectos.length} registros
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

export default Prospects; 