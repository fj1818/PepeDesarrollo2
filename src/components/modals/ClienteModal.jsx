import React, { useState, useEffect } from 'react';

function ClienteModal({ show, prospecto, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    telefono: '',
    email: '',
    ubicacion: '',
    canal: '',
    fecha: '',
    motivo: ''
  });

  // Actualizar datos del formulario cuando cambia el prospecto
  useEffect(() => {
    if (prospecto) {
      setFormData({
        id: prospecto['id-prospecto'] || '',
        nombre: prospecto['nombre-prospecto'] || '',
        telefono: prospecto.telefono || '',
        email: prospecto.email || '',
        ubicacion: prospecto.ubicacion || '',
        canal: prospecto.canal || '',
        fecha: prospecto['fecha-prospecto'] || '',
        motivo: prospecto.motivo || ''
      });
    }
  }, [prospecto]);

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generar número de cliente
  const generateClientNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `CLI-${randomNum}`;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generar número de cliente
    const clientNumber = generateClientNumber();
    
    if (onSave) {
      onSave({
        ...formData,
        numeroCliente: clientNumber
      });
    }
    
    onClose();
  };

  if (!show) return null;

  return (
    <div id="clienteModal" className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Generar Cliente</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <input type="hidden" id="cliente-id" value={formData.id} />
            
            <div className="form-group">
              <label htmlFor="cliente-nombre">Nombre:</label>
              <input 
                type="text" 
                id="cliente-nombre" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cliente-telefono">Teléfono:</label>
              <input 
                type="tel" 
                id="cliente-telefono" 
                name="telefono" 
                value={formData.telefono} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cliente-email">Email:</label>
              <input 
                type="email" 
                id="cliente-email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cliente-ubicacion">Ubicación:</label>
              <input 
                type="text" 
                id="cliente-ubicacion" 
                name="ubicacion" 
                value={formData.ubicacion} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cliente-canal">Canal:</label>
              <select 
                id="cliente-canal" 
                name="canal" 
                value={formData.canal} 
                onChange={handleChange}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="web">Web</option>
                <option value="referido">Referido</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="cliente-fecha">Fecha de Contacto:</label>
              <input 
                type="text" 
                id="cliente-fecha" 
                name="fecha" 
                value={formData.fecha} 
                onChange={handleChange} 
                readOnly 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cliente-motivo">Motivo / Observaciones:</label>
              <textarea 
                id="cliente-motivo" 
                name="motivo" 
                value={formData.motivo} 
                onChange={handleChange} 
                rows="3"
              ></textarea>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button id="cancelarCliente" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            id="guardarCliente" 
            className="btn-primary" 
            onClick={handleSubmit}
          >
            Generar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClienteModal; 