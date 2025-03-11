document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const navItems = document.querySelectorAll('.nav-item');
    const screenContent = document.getElementById('screen-content');
    const screenTitle = document.getElementById('screen-title');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Contenido de las pantallas
    const screens = {
        home: `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon prospects-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="stat-value">145</div>
                    <div class="stat-label">Prospectos Activos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon clients-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-value">89</div>
                    <div class="stat-label">Clientes Totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon records-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="stat-value">78</div>
                    <div class="stat-label">Expedientes Completos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon conversion-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-value">62%</div>
                    <div class="stat-label">Tasa de Conversión</div>
                </div>
            </div>
            
            <div class="dashboard-main">
                <h2>Bienvenido a URUETA CRM</h2>
                <p>Esta es la plataforma para el seguimiento de clientes que buscan ser atendidos personalmente para un plan de fitness y nutrición.</p>
                <p>Utiliza el menú lateral para navegar entre las diferentes secciones.</p>
            </div>
        `,
        
        prospects: `
            <div class="prospects-container">
                <div class="prospects-header">
                    <h2>Gestión de Prospectos</h2>
                    <div class="prospects-actions">
                        <div class="search-wrapper">
                            <input type="text" id="prospectsSearch" placeholder="Buscar prospectos...">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="button-group">
                            <button id="refreshProspects" class="action-btn refresh-btn">
                                <i class="fas fa-sync-alt"></i> Actualizar
                            </button>
                            <button id="saveProspects" class="action-btn save-btn">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                            <button id="generateRecord" class="action-btn generate-btn">
                                <i class="fas fa-file-medical"></i> Generar Expediente
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="prospectsTable" class="data-table">
                        <thead>
                            <tr>
                                <th class="id-column" style="display: none;">ID Prospecto</th>
                                <th class="check-column">Cliente</th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Ubicación</th>
                                <th>Canal</th>
                                <th>Fecha de Registro</th>
                                <th>Contactado</th>
                                <th>Interesado</th>
                                <th>Motivo</th>
                                <th>Número Cliente</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Los datos se cargarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
                
                <div class="table-footer">
                    <div class="pagination-info">
                        Mostrando <span id="currentStart">1</span> a <span id="currentEnd">10</span> de <span id="totalItems">100</span> registros
                    </div>
                    <div class="pagination-controls">
                        <button id="prevPage" class="pagination-btn"><i class="fas fa-chevron-left"></i></button>
                        <span id="currentPage">Página 1 de 10</span>
                        <button id="nextPage" class="pagination-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="items-per-page">
                        <label for="itemsPerPage">Mostrar:</label>
                        <select id="itemsPerPage">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Modal para ver/editar el motivo -->
            <div id="motivoModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detalle del Motivo</h3>
                        <button class="close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <textarea id="motivoText" rows="5" placeholder="Ingrese el motivo..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn">Cancelar</button>
                        <button class="save-motivo-btn">Guardar</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal para generar expediente -->
            <div id="expedienteModal" class="modal">
                <div class="modal-content modal-lg">
                    <div class="modal-header">
                        <h3>Crear Expediente de Cliente</h3>
                        <button class="close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="expedienteForm" class="form-grid">
                            <div class="form-group">
                                <label for="exp-nombre">Nombre completo</label>
                                <input type="text" id="exp-nombre" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-telefono">Teléfono</label>
                                <input type="tel" id="exp-telefono" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-email">Email</label>
                                <input type="email" id="exp-email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-fecha-nacimiento">Fecha de nacimiento</label>
                                <input type="date" id="exp-fecha-nacimiento" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-genero">Género</label>
                                <select id="exp-genero" required>
                                    <option value="">Seleccionar</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-ubicacion">Ubicación</label>
                                <input type="text" id="exp-ubicacion" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-peso-inicial">Peso inicial (kg)</label>
                                <input type="number" id="exp-peso-inicial" step="0.1" min="0">
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-peso-deseado">Peso deseado (kg)</label>
                                <input type="number" id="exp-peso-deseado" step="0.1" min="0">
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-grasa-deseada">% de Grasa deseada</label>
                                <input type="number" id="exp-grasa-deseada" step="0.1" min="0" max="100">
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-grasa-actual">% de Grasa actual</label>
                                <input type="number" id="exp-grasa-actual" step="0.1" min="0" max="100">
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-fecha-prospecto">Fecha de registro como prospecto</label>
                                <input type="text" id="exp-fecha-prospecto" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-fecha-cliente">Fecha de registro como cliente</label>
                                <input type="text" id="exp-fecha-cliente" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-canal">Canal</label>
                                <input type="text" id="exp-canal" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label for="exp-numero-cliente">Número de cliente</label>
                                <input type="text" id="exp-numero-cliente" readonly>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn">Cancelar</button>
                        <button id="saveExpediente" class="save-btn">Guardar Expediente</button>
                    </div>
                </div>
            </div>
        `,
        
        clients: `
            <div class="clients-container">
                <div class="clients-header">
                    <h2>Gestión de Clientes</h2>
                    <div class="clients-actions">
                        <div class="search-wrapper">
                            <input type="text" id="clientsSearch" placeholder="Buscar clientes...">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="button-group">
                            <button id="refreshClients" class="action-btn refresh-btn">
                                <i class="fas fa-sync-alt"></i> Actualizar
                            </button>
                            <button id="saveClients" class="action-btn save-btn">
                                <i class="fas fa-save"></i> Guardar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="clientsTable" class="data-table">
                        <thead>
                            <tr>
                                <th class="id-column" style="display: none;">ID Contacto</th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Fecha de Nacimiento</th>
                                <th>Género</th>
                                <th>Ubicación</th>
                                <th>Más Detalles</th>
                                <th>Finalizado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Los datos se cargarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
                
                <div class="table-footer">
                    <div class="pagination-info">
                        Mostrando <span id="clientCurrentStart">1</span> a <span id="clientCurrentEnd">10</span> de <span id="clientTotalItems">100</span> registros
                    </div>
                    <div class="pagination-controls">
                        <button id="clientPrevPage" class="pagination-btn"><i class="fas fa-chevron-left"></i></button>
                        <span id="clientCurrentPage">Página 1 de 10</span>
                        <button id="clientNextPage" class="pagination-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="items-per-page">
                        <label for="clientItemsPerPage">Mostrar:</label>
                        <select id="clientItemsPerPage">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Modal para ver detalles del cliente -->
            <div id="clientDetailsModal" class="modal">
                <div class="modal-content modal-lg">
                    <div class="modal-header">
                        <h3>Detalles del Cliente</h3>
                        <button class="close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="clientDetailsForm" class="client-details-grid">
                            <div class="detail-section">
                                <h4>Información Personal</h4>
                                <div class="detail-row">
                                    <div class="detail-label">Nombre:</div>
                                    <input type="text" class="detail-input" id="detail-nombre">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Teléfono:</div>
                                    <input type="text" class="detail-input" id="detail-telefono">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Email:</div>
                                    <input type="email" class="detail-input" id="detail-email">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Fecha de Nacimiento:</div>
                                    <input type="text" class="detail-input" id="detail-fecha-nacimiento">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Género:</div>
                                    <select class="detail-input" id="detail-genero">
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Ubicación:</div>
                                    <input type="text" class="detail-input" id="detail-ubicacion">
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Objetivos Físicos</h4>
                                <div class="detail-row">
                                    <div class="detail-label">Peso Inicial (kg):</div>
                                    <input type="number" step="0.1" class="detail-input" id="detail-peso-inicial">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Peso Deseado (kg):</div>
                                    <input type="number" step="0.1" class="detail-input" id="detail-peso-deseado">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">% Grasa Actual:</div>
                                    <input type="number" step="0.1" class="detail-input" id="detail-grasa-actual">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">% Grasa Deseada:</div>
                                    <input type="number" step="0.1" class="detail-input" id="detail-grasa-deseada">
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Información de Registro</h4>
                                <div class="detail-row">
                                    <div class="detail-label">Fecha de Prospecto:</div>
                                    <input type="text" class="detail-input" id="detail-fecha-prospecto">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Fecha de Cliente:</div>
                                    <input type="text" class="detail-input" id="detail-fecha-cliente">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Canal:</div>
                                    <input type="text" class="detail-input" id="detail-canal">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Número de Expediente:</div>
                                    <input type="text" class="detail-input" id="detail-num-expediente">
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Número de Cliente:</div>
                                    <input type="text" class="detail-input" id="detail-num-cliente">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn">Cancelar</button>
                        <button id="saveClientDetails" class="save-btn">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `,
        
        records: `
            <div class="records-container">
                <div class="records-header">
                    <h2>Gestión de Expedientes</h2>
                    <div class="records-filters">
                        <div class="filter-group">
                            <label for="clientSelect">Cliente:</label>
                            <select id="clientSelect" class="filter-select">
                                <option value="">Seleccionar Cliente</option>
                                <option value="1">Carlos Rodríguez</option>
                                <option value="2">María González</option>
                                <option value="3">Laura Sánchez</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="dateSelect">Fecha:</label>
                            <select id="dateSelect" class="filter-select" disabled>
                                <option value="">Seleccionar Fecha</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="recordNumber">Expediente:</label>
                            <input type="text" id="recordNumber" class="filter-input" readonly>
                        </div>
                        <button id="consultRecord" class="action-btn primary-btn" disabled>
                            <i class="fas fa-search"></i> Consultar
                        </button>
                    </div>
                </div>
                
                <div id="recordContent" class="record-content hidden">
                    <div class="record-tabs">
                        <button class="tab-btn active" data-tab="details">Detalles</button>
                        <button class="tab-btn" data-tab="progress">Progreso</button>
                    </div>
                    
                    <div id="detailsTab" class="tab-content active">
                        <div class="record-form-container">
                            <form id="recordForm" class="record-form">
                                <div class="form-section">
                                    <h3>Medidas y Objetivos</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="pesoInicial">Peso Inicial (kg):</label>
                                            <input type="number" id="pesoInicial" step="0.1" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="pesoDeseado">Peso Deseado (kg):</label>
                                            <input type="number" id="pesoDeseado" step="0.1" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="pesoActual">Peso Actual (kg):</label>
                                            <input type="number" id="pesoActual" step="0.1" class="form-control">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="grasaInicial">% Grasa Inicial:</label>
                                            <input type="number" id="grasaInicial" step="0.1" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="grasaDeseada">% Grasa Deseada:</label>
                                            <input type="number" id="grasaDeseada" step="0.1" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="grasaActual">% Grasa Actual:</label>
                                            <input type="number" id="grasaActual" step="0.1" class="form-control">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h3>Información de Entrenamiento</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="diasEntrenamiento">Días de Entrenamiento:</label>
                                            <select id="diasEntrenamiento" class="form-control">
                                                <option value="1">1 día</option>
                                                <option value="2">2 días</option>
                                                <option value="3">3 días</option>
                                                <option value="4">4 días</option>
                                                <option value="5">5 días</option>
                                                <option value="6">6 días</option>
                                                <option value="7">7 días</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="horasEntrenamiento">Horas de Entrenamiento:</label>
                                            <select id="horasEntrenamiento" class="form-control">
                                                <option value="0.5">30 minutos</option>
                                                <option value="1">1 hora</option>
                                                <option value="1.5">1.5 horas</option>
                                                <option value="2">2 horas</option>
                                                <option value="2.5">2.5 horas</option>
                                                <option value="3">3 horas</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="nivel">Nivel:</label>
                                            <select id="nivel" class="form-control">
                                                <option value="Principiante">Principiante</option>
                                                <option value="Intermedio">Intermedio</option>
                                                <option value="Avanzado">Avanzado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="disciplina">Disciplina:</label>
                                            <select id="disciplina" class="form-control">
                                                <option value="Musculación">Musculación</option>
                                                <option value="Cardio">Cardio</option>
                                                <option value="CrossFit">CrossFit</option>
                                                <option value="Yoga">Yoga</option>
                                                <option value="Pilates">Pilates</option>
                                                <option value="Funcional">Funcional</option>
                                                <option value="Mixto">Mixto</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="objetivo">Objetivo:</label>
                                            <select id="objetivo" class="form-control">
                                                <option value="Pérdida de peso">Pérdida de peso</option>
                                                <option value="Tonificación">Tonificación</option>
                                                <option value="Hipertrofia">Hipertrofia</option>
                                                <option value="Definición">Definición</option>
                                                <option value="Rendimiento">Rendimiento</option>
                                                <option value="Salud general">Salud general</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h3>Información Adicional</h3>
                                    <div class="form-row">
                                        <div class="form-group full-width">
                                            <label for="condicionesMedicas">Condiciones Médicas:</label>
                                            <textarea id="condicionesMedicas" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" id="saveRecord" class="action-btn save-btn">
                                        <i class="fas fa-save"></i> Guardar
                                    </button>
                                    <button type="button" id="updateProgress" class="action-btn update-btn">
                                        <i class="fas fa-chart-line"></i> Actualizar Avance
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div id="progressTab" class="tab-content">
                        <div class="progress-container">
                            <div class="progress-section">
                                <h3>Progreso de Peso</h3>
                                <div class="progress-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Inicial:</span>
                                        <span class="stat-value" id="progressPesoInicial">85.5</span>
                                        <span class="stat-unit">kg</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Actual:</span>
                                        <span class="stat-value" id="progressPesoActual">82.3</span>
                                        <span class="stat-unit">kg</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Objetivo:</span>
                                        <span class="stat-value" id="progressPesoDeseado">78</span>
                                        <span class="stat-unit">kg</span>
                                    </div>
                                </div>
                                <div class="progress-bar-wrapper">
                                    <div class="progress-bar">
                                        <div class="progress-indicator" id="pesoIndicator" style="width: 42%;"></div>
                                    </div>
                                    <div class="progress-labels">
                                        <span class="start-label">Inicial</span>
                                        <span class="current-label">Actual</span>
                                        <span class="end-label">Objetivo</span>
                                    </div>
                                </div>
                                <button id="showWeightHistory" class="history-btn">
                                    <i class="fas fa-history"></i> Ver Historial
                                </button>
                            </div>
                            
                            <div class="progress-section">
                                <h3>Progreso de % Grasa</h3>
                                <div class="progress-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Inicial:</span>
                                        <span class="stat-value" id="progressGrasaInicial">22.5</span>
                                        <span class="stat-unit">%</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Actual:</span>
                                        <span class="stat-value" id="progressGrasaActual">19.8</span>
                                        <span class="stat-unit">%</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Objetivo:</span>
                                        <span class="stat-value" id="progressGrasaDeseada">15</span>
                                        <span class="stat-unit">%</span>
                                    </div>
                                </div>
                                <div class="progress-bar-wrapper">
                                    <div class="progress-bar">
                                        <div class="progress-indicator" id="grasaIndicator" style="width: 36%;"></div>
                                    </div>
                                    <div class="progress-labels">
                                        <span class="start-label">Inicial</span>
                                        <span class="current-label">Actual</span>
                                        <span class="end-label">Objetivo</span>
                                    </div>
                                </div>
                                <button id="showFatHistory" class="history-btn">
                                    <i class="fas fa-history"></i> Ver Historial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modal para historial de progreso -->
                <div id="historyModal" class="modal">
                    <div class="modal-content modal-lg">
                        <div class="modal-header">
                            <h3 id="historyTitle">Historial de Progreso</h3>
                            <button class="close-modal"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="history-chart-container">
                                <canvas id="historyChart"></canvas>
                            </div>
                            <div class="history-table-container">
                                <table class="history-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th id="historyValueType">Valor</th>
                                            <th>Cambio</th>
                                        </tr>
                                    </thead>
                                    <tbody id="historyTableBody">
                                        <!-- Se llenará dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    // Títulos de las pantallas
    const titles = {
        home: 'Dashboard',
        prospects: 'Prospectos',
        clients: 'Clientes',
        records: 'Expedientes de Clientes'
    };
    
    // Función para cambiar de pantalla
    function changeScreen(screenName) {
        // Actualizar contenido y título
        screenContent.innerHTML = screens[screenName];
        screenTitle.textContent = titles[screenName];
        
        // Actualizar navegación activa
        navItems.forEach(item => {
            if (item.dataset.screen === screenName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Cerrar sidebar en móvil después de la navegación
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('open');
        }
        
        // Configurar botones de regreso al inicio
        const backButtons = document.querySelectorAll('.back-to-home');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                changeScreen(btn.dataset.screen);
            });
        });
        
        // Inicializar la tabla de prospectos si estamos en esa pantalla
        if (screenName === 'prospects') {
            initProspectsTable();
        }
        
        // Inicializar la tabla de clientes si estamos en esa pantalla
        if (screenName === 'clients') {
            initClientsTable();
        }
        
        // Inicializar la sección de expedientes si estamos en esa pantalla
        if (screenName === 'records') {
            initRecordsSection();
        }
    }
    
    // Event listeners para navegación
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screenName = item.dataset.screen;
            changeScreen(screenName);
        });
    });
    
    // Toggle sidebar en móvil
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Inicializar con la pantalla de inicio
    changeScreen('home');
    
    // Añadir event listener para cerrar sidebar al hacer clic fuera de ella
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
});

// Función para inicializar la tabla de prospectos
function initProspectsTable() {
    const tableBody = document.querySelector('#prospectsTable tbody');
    const searchInput = document.getElementById('prospectsSearch');
    const refreshBtn = document.getElementById('refreshProspects');
    const saveBtn = document.getElementById('saveProspects');
    const generateBtn = document.getElementById('generateRecord');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const motivoModal = document.getElementById('motivoModal');
    const expedienteModal = document.getElementById('expedienteModal');
    
    // Datos de ejemplo para la tabla
    const prospectsData = [
        {
            id: 1,
            idProspecto: 'PP15Jun2310:30',
            isCliente: false,
            nombre: 'María González',
            telefono: '555-123-4567',
            email: 'maria@example.com',
            ubicacion: 'Ciudad de México',
            canal: 'Instagram',
            fecha: '15/06/2023 10:30:45',
            contactado: true,
            interesado: true,
            motivo: 'Interesada en programa de pérdida de peso. Tiene una boda en 3 meses y quiere bajar 10kg.',
            numeroCliente: ''
        },
        {
            id: 2,
            idProspecto: 'PP20Jun2315:45',
            isCliente: false,
            nombre: 'Juan Pérez',
            telefono: '555-987-6543',
            email: 'juan@example.com',
            ubicacion: 'Guadalajara',
            canal: 'Facebook',
            fecha: '20/06/2023 15:45:20',
            contactado: true,
            interesado: false,
            motivo: 'No está interesado actualmente por falta de tiempo. Recomendar seguimiento en 2 meses.',
            numeroCliente: ''
        },
        {
            id: 3,
            idProspecto: 'PP25Jun2309:15',
            isCliente: false,
            nombre: 'Ana Martínez',
            telefono: '555-567-8901',
            email: 'ana@example.com',
            ubicacion: 'Monterrey',
            canal: 'Recomendación',
            fecha: '25/06/2023 09:15:30',
            contactado: false,
            interesado: false,
            motivo: '',
            numeroCliente: ''
        },
        {
            id: 4,
            idProspecto: 'PP28Jun2314:20',
            isCliente: true,
            nombre: 'Carlos Rodríguez',
            telefono: '555-345-6789',
            email: 'carlos@example.com',
            ubicacion: 'Puebla',
            canal: 'Sitio Web',
            fecha: '28/06/2023 14:20:10',
            contactado: true,
            interesado: true,
            motivo: 'Busca mejorar su resistencia para maratón en octubre. Interesado en plan de nutrición deportiva.',
            numeroCliente: 'C-001'
        },
        {
            id: 5,
            idProspecto: 'PP30Jun2311:05',
            isCliente: false,
            nombre: 'Laura Sánchez',
            telefono: '555-234-5678',
            email: 'laura@example.com',
            ubicacion: 'Querétaro',
            canal: 'TikTok',
            fecha: '30/06/2023 11:05:55',
            contactado: true,
            interesado: true,
            motivo: 'Quiere tonificar y ganar masa muscular. Disponible para sesiones en la tarde.',
            numeroCliente: ''
        }
    ];
    
    // Variables para paginación
    let currentPage = 1;
    let itemsPerPage = 10;
    let filteredData = [...prospectsData];
    
    // Función para renderizar la tabla
    function renderTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredData.length);
        const paginatedData = filteredData.slice(start, end);
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Renderizar filas
        paginatedData.forEach(prospect => {
            const row = document.createElement('tr');
            row.dataset.id = prospect.id;
            
            // Determinar si debemos deshabilitar el checkbox (si ya tiene número de cliente)
            const hasClientNumber = prospect.numeroCliente && prospect.numeroCliente.trim() !== '';
            
            // Crear celdas
            row.innerHTML = `
                <td class="id-column" style="display: none;">${prospect.idProspecto}</td>
                <td class="check-column">
                    ${hasClientNumber ? 
                        `<i class="fas fa-user-check client-icon" title="Ya es cliente"></i>` :
                        `<label class="checkbox-container">
                            <input type="checkbox" class="cliente-checkbox" ${prospect.isCliente ? 'checked' : ''} ${hasClientNumber ? 'disabled' : ''}>
                            <span class="checkmark"></span>
                        </label>`
                    }
                </td>
                <td contenteditable="true">${prospect.nombre}</td>
                <td contenteditable="true">${prospect.telefono}</td>
                <td contenteditable="true">${prospect.email}</td>
                <td contenteditable="true">${prospect.ubicacion}</td>
                <td contenteditable="true">${prospect.canal}</td>
                <td>
                    <input type="datetime-local" class="date-input" value="${formatDateForInput(prospect.fecha)}" data-original="${prospect.fecha}">
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${prospect.contactado ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" class="interesado-checkbox" ${prospect.interesado ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <button class="motivo-btn" data-id="${prospect.id}">
                        <i class="fas fa-file-alt"></i>
                        ${prospect.motivo ? 'Ver' : 'Añadir'}
                    </button>
                </td>
                <td contenteditable="true">${prospect.numeroCliente}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Actualizar información de paginación
        document.getElementById('currentStart').textContent = filteredData.length > 0 ? start + 1 : 0;
        document.getElementById('currentEnd').textContent = end;
        document.getElementById('totalItems').textContent = filteredData.length;
        document.getElementById('currentPage').textContent = `Página ${currentPage} de ${Math.ceil(filteredData.length / itemsPerPage) || 1}`;
        
        // Configurar eventos para botones de motivo
        document.querySelectorAll('.motivo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const prospect = prospectsData.find(p => p.id === id);
                
                if (prospect) {
                    document.getElementById('motivoText').value = prospect.motivo;
                    document.getElementById('motivoText').dataset.id = id;
                    motivoModal.classList.add('show');
                }
            });
        });
        
        // Actualizar estado de cliente cuando cambia el checkbox
        document.querySelectorAll('.cliente-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('tr').dataset.id);
                const prospect = prospectsData.find(p => p.id === id);
                
                if (prospect) {
                    prospect.isCliente = e.target.checked;
                }
            });
        });
        
        // Actualizar estado de interesado cuando cambia el checkbox
        document.querySelectorAll('.interesado-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('tr').dataset.id);
                const prospect = prospectsData.find(p => p.id === id);
                
                if (prospect) {
                    prospect.interesado = e.target.checked;
                }
            });
        });
        
        // Añadir event listener a los inputs de fecha
        document.querySelectorAll('.date-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const formattedDate = formatDateFromInput(e.target.value);
                e.target.dataset.original = formattedDate;
            });
        });
    }
    
    // Función para filtrar la tabla
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm === '') {
            filteredData = [...prospectsData];
        } else {
            filteredData = prospectsData.filter(prospect => {
                return Object.values(prospect).some(value => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(searchTerm);
                    }
                    return false;
                });
            });
        }
        
        currentPage = 1;
        renderTable();
    }
    
    // Función para abrir el formulario de expediente
    function openExpedienteForm(prospect) {
        const expedienteModal = document.getElementById('expedienteModal');
        const form = document.getElementById('expedienteForm');
        
        // Establecer el ID del prospecto en el formulario
        form.dataset.id = prospect.id;
        
        // Llenar el formulario con los datos del prospecto
        document.getElementById('exp-nombre').value = prospect.nombre;
        document.getElementById('exp-telefono').value = prospect.telefono;
        document.getElementById('exp-email').value = prospect.email;
        document.getElementById('exp-ubicacion').value = prospect.ubicacion;
        document.getElementById('exp-fecha-prospecto').value = prospect.fecha;
        document.getElementById('exp-canal').value = prospect.canal;
        
        // Establecer la fecha actual para el registro como cliente
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        document.getElementById('exp-fecha-cliente').value = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        
        // Generar número de cliente
        const clientNumber = generateClientNumber();
        document.getElementById('exp-numero-cliente').value = clientNumber;
        
        // Mostrar el modal
        expedienteModal.classList.add('show');
    }
    
    // Función para generar un número de cliente único
    function generateClientNumber() {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear().toString().slice(-2);
        
        // Generar un número aleatorio de 3 dígitos para la parte final
        const randomNum = Math.floor(Math.random() * 900) + 100;
        
        return `C-${year}${month}-${randomNum}`;
    }
    
    // Event listeners
    searchInput.addEventListener('input', filterTable);
    
    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value);
        currentPage = 1;
        renderTable();
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
            currentPage++;
            renderTable();
        }
    });
    
    // Evento para generar expediente
    generateBtn.addEventListener('click', () => {
        // Primero, buscar filas con el checkbox de cliente marcado
        const clienteRows = Array.from(document.querySelectorAll('#prospectsTable tbody tr')).filter(row => {
            const clienteCheckbox = row.querySelector('.cliente-checkbox');
            return clienteCheckbox && clienteCheckbox.checked;
        });
        
        if (clienteRows.length === 0) {
            showNotification('No hay prospectos seleccionados para generar expediente', 'warning');
            return;
        }
        
        if (clienteRows.length > 1) {
            showNotification('Por favor, seleccione solo un prospecto a la vez para generar expediente', 'warning');
            return;
        }
        
        const selectedRow = clienteRows[0];
        const id = parseInt(selectedRow.dataset.id);
        const prospect = prospectsData.find(p => p.id === id);
        
        if (prospect) {
            // Verificar si está interesado
            const interesadoCheckbox = selectedRow.querySelector('.interesado-checkbox');
            if (!interesadoCheckbox || !interesadoCheckbox.checked) {
                showNotification('No se puede generar expediente: el cliente no está interesado', 'warning');
                return;
            }
            
            // Si llegamos aquí, el cliente está seleccionado e interesado
            openExpedienteForm(prospect);
        }
    });
    
    // Eventos para cerrar modales
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Guardar motivo
    document.querySelector('.save-motivo-btn').addEventListener('click', () => {
        const id = parseInt(document.getElementById('motivoText').dataset.id);
        const newMotivo = document.getElementById('motivoText').value;
        
        const prospect = prospectsData.find(p => p.id === id);
        if (prospect) {
            prospect.motivo = newMotivo;
            
            // Actualizar botón en la tabla
            const motivoBtn = document.querySelector(`.motivo-btn[data-id="${id}"]`);
            if (motivoBtn) {
                motivoBtn.innerHTML = `<i class="fas fa-file-alt"></i> ${newMotivo ? 'Ver' : 'Añadir'}`;
            }
        }
        
        motivoModal.classList.remove('show');
    });
    
    // Guardar expediente
    document.getElementById('saveExpediente').addEventListener('click', () => {
        const form = document.getElementById('expedienteForm');
        
        // Verificar si el formulario es válido
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const id = parseInt(form.dataset.id);
        const prospect = prospectsData.find(p => p.id === id);
        
        if (prospect) {
            // Actualizar prospecto con los datos del expediente
            prospect.numeroCliente = document.getElementById('exp-numero-cliente').value;
            prospect.isCliente = true;
            
            // Aquí se podría guardar la información adicional en un objeto de expediente
            
            // Actualizar tabla
            renderTable();
            
            // Cerrar modal
            expedienteModal.classList.remove('show');
            
            // Mostrar notificación
            showNotification(`Expediente creado con éxito: ${prospect.numeroCliente}`, 'success');
        }
    });
    
    // Evento guardar cambios
    saveBtn.addEventListener('click', () => {
        // Actualizar datos de la tabla en los objetos
        const rows = document.querySelectorAll('#prospectsTable tbody tr');
        
        rows.forEach(row => {
            const id = parseInt(row.dataset.id);
            const prospect = prospectsData.find(p => p.id === id);
            
            if (prospect) {
                const cells = row.querySelectorAll('td');
                const clienteCheckbox = cells[0].querySelector('input');
                prospect.isCliente = clienteCheckbox ? clienteCheckbox.checked : prospect.isCliente;
                prospect.nombre = cells[1].textContent;
                prospect.telefono = cells[2].textContent;
                prospect.email = cells[3].textContent;
                prospect.ubicacion = cells[4].textContent;
                prospect.canal = cells[5].textContent;
                
                // Obtener fecha del input datetime-local
                const dateInput = cells[6].querySelector('.date-input');
                prospect.fecha = dateInput.dataset.original;
                
                prospect.contactado = cells[7].querySelector('input').checked;
                prospect.interesado = cells[8].querySelector('input').checked;
                prospect.numeroCliente = cells[10].textContent;
                
                // Si se asignó número de cliente, marcar como cliente
                if (prospect.numeroCliente && prospect.numeroCliente.trim() !== '') {
                    prospect.isCliente = true;
                }
            }
        });
        
        // Aquí se implementaría la lógica para guardar los cambios en el servidor
        showNotification('Cambios guardados con éxito', 'success');
        
        // Renderizar de nuevo para actualizar la tabla con los cambios
        renderTable();
    });
    
    // Evento refrescar tabla
    refreshBtn.addEventListener('click', () => {
        // Aquí se implementaría la lógica para recargar datos del servidor
        showNotification('Datos actualizados', 'info');
        renderTable();
    });
    
    // Renderizar tabla inicial
    renderTable();
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para convertir formato de fecha dd/mm/yyyy hh:mm:ss a yyyy-mm-ddThh:mm para el input
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    
    const parts = dateStr.split(' ');
    if (parts.length !== 2) return '';
    
    const dateParts = parts[0].split('/');
    if (dateParts.length !== 3) return '';
    
    const timeParts = parts[1].split(':');
    if (timeParts.length !== 3) return '';
    
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];
    const hours = timeParts[0];
    const minutes = timeParts[1];
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Función para convertir formato de fecha de input a dd/mm/yyyy hh:mm:ss
function formatDateFromInput(inputValue) {
    if (!inputValue) return '';
    
    const dateObj = new Date(inputValue);
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = '00'; // Podemos fijar segundos a 00 ya que el input no los incluye
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Función para inicializar la tabla de clientes
function initClientsTable() {
    const tableBody = document.querySelector('#clientsTable tbody');
    const searchInput = document.getElementById('clientsSearch');
    const refreshBtn = document.getElementById('refreshClients');
    const saveBtn = document.getElementById('saveClients');
    const prevPageBtn = document.getElementById('clientPrevPage');
    const nextPageBtn = document.getElementById('clientNextPage');
    const itemsPerPageSelect = document.getElementById('clientItemsPerPage');
    const detailsModal = document.getElementById('clientDetailsModal');
    
    // Datos de ejemplo para la tabla de clientes
    const clientsData = [
        {
            id: 1,
            idContacto: 'CL001',
            nombre: 'Carlos Rodríguez',
            telefono: '555-345-6789',
            email: 'carlos@example.com',
            fechaNacimiento: '15/04/1985',
            genero: 'Masculino',
            ubicacion: 'Puebla',
            pesoInicial: 85.5,
            pesoDeseado: 78.0,
            grasaActual: 22.5,
            grasaDeseada: 15.0,
            fechaProspecto: '28/06/2023 14:20:10',
            fechaCliente: '15/07/2023 10:30:00',
            canal: 'Sitio Web',
            numeroExpediente: 'EXP-2307-001',
            numeroCliente: 'C-2307-001',
            finalizado: false
        },
        {
            id: 2,
            idContacto: 'CL002',
            nombre: 'María González',
            telefono: '555-123-4567',
            email: 'maria@example.com',
            fechaNacimiento: '22/09/1990',
            genero: 'Femenino',
            ubicacion: 'Ciudad de México',
            pesoInicial: 65.2,
            pesoDeseado: 58.0,
            grasaActual: 28.0,
            grasaDeseada: 22.0,
            fechaProspecto: '15/06/2023 10:30:45',
            fechaCliente: '18/07/2023 16:45:00',
            canal: 'Instagram',
            numeroExpediente: 'EXP-2307-002',
            numeroCliente: 'C-2307-002',
            finalizado: false
        },
        {
            id: 3,
            idContacto: 'CL003',
            nombre: 'Laura Sánchez',
            telefono: '555-234-5678',
            email: 'laura@example.com',
            fechaNacimiento: '10/03/1988',
            genero: 'Femenino',
            ubicacion: 'Querétaro',
            pesoInicial: 70.8,
            pesoDeseado: 65.0,
            grasaActual: 30.5,
            grasaDeseada: 24.0,
            fechaProspecto: '30/06/2023 11:05:55',
            fechaCliente: '20/07/2023 09:15:00',
            canal: 'TikTok',
            numeroExpediente: 'EXP-2307-003',
            numeroCliente: 'C-2307-003',
            finalizado: true
        }
    ];
    
    // Variables para paginación
    let currentPage = 1;
    let itemsPerPage = 10;
    let filteredData = [...clientsData];
    
    // Función para renderizar la tabla
    function renderTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredData.length);
        const paginatedData = filteredData.slice(start, end);
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Renderizar filas
        paginatedData.forEach(client => {
            const row = document.createElement('tr');
            row.dataset.id = client.id;
            
            // Crear celdas
            row.innerHTML = `
                <td class="id-column" style="display: none;">${client.idContacto}</td>
                <td contenteditable="true">${client.nombre}</td>
                <td contenteditable="true">${client.telefono}</td>
                <td contenteditable="true">${client.email}</td>
                <td contenteditable="true">${client.fechaNacimiento}</td>
                <td contenteditable="true">${client.genero}</td>
                <td contenteditable="true">${client.ubicacion}</td>
                <td>
                    <button class="details-btn" data-id="${client.id}">
                        <i class="fas fa-info-circle"></i> Ver Detalles
                    </button>
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" class="finalizado-checkbox" ${client.finalizado ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Actualizar información de paginación
        document.getElementById('clientCurrentStart').textContent = filteredData.length > 0 ? start + 1 : 0;
        document.getElementById('clientCurrentEnd').textContent = end;
        document.getElementById('clientTotalItems').textContent = filteredData.length;
        document.getElementById('clientCurrentPage').textContent = `Página ${currentPage} de ${Math.ceil(filteredData.length / itemsPerPage) || 1}`;
        
        // Añadir event listeners a botones de detalles
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const client = clientsData.find(c => c.id === id);
                if (client) {
                    showClientDetails(client);
                }
            });
        });
    }
    
    // Función para mostrar detalles del cliente
    function showClientDetails(client) {
        // Guardar el ID del cliente actual en el formulario
        const detailsForm = document.getElementById('clientDetailsForm');
        detailsForm.dataset.clientId = client.id;
        
        // Llenar los campos del formulario con los datos del cliente
        document.getElementById('detail-nombre').value = client.nombre;
        document.getElementById('detail-telefono').value = client.telefono;
        document.getElementById('detail-email').value = client.email;
        document.getElementById('detail-fecha-nacimiento').value = client.fechaNacimiento;
        document.getElementById('detail-genero').value = client.genero;
        document.getElementById('detail-ubicacion').value = client.ubicacion;
        
        document.getElementById('detail-peso-inicial').value = client.pesoInicial;
        document.getElementById('detail-peso-deseado').value = client.pesoDeseado;
        document.getElementById('detail-grasa-actual').value = client.grasaActual;
        document.getElementById('detail-grasa-deseada').value = client.grasaDeseada;
        
        document.getElementById('detail-fecha-prospecto').value = client.fechaProspecto;
        document.getElementById('detail-fecha-cliente').value = client.fechaCliente;
        document.getElementById('detail-canal').value = client.canal;
        document.getElementById('detail-num-expediente').value = client.numeroExpediente;
        document.getElementById('detail-num-cliente').value = client.numeroCliente;
        
        // Mostrar el modal
        detailsModal.classList.add('show');
    }
    
    // Función para filtrar la tabla
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm === '') {
            filteredData = [...clientsData];
        } else {
            filteredData = clientsData.filter(client => {
                return Object.values(client).some(value => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(searchTerm);
                    }
                    return false;
                });
            });
        }
        
        currentPage = 1;
        renderTable();
    }
    
    // Event listeners
    searchInput.addEventListener('input', filterTable);
    
    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value);
        currentPage = 1;
        renderTable();
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
            currentPage++;
            renderTable();
        }
    });
    
    // Cerrar modal de detalles
    document.querySelectorAll('.close-modal, .close-details-btn').forEach(el => {
        el.addEventListener('click', () => {
            detailsModal.classList.remove('show');
        });
    });
    
    // Evento guardar cambios
    saveBtn.addEventListener('click', () => {
        // Actualizar datos de la tabla en los objetos
        const rows = document.querySelectorAll('#clientsTable tbody tr');
        
        rows.forEach(row => {
            const id = parseInt(row.dataset.id);
            const client = clientsData.find(c => c.id === id);
            
            if (client) {
                const cells = row.querySelectorAll('td');
                client.nombre = cells[1].textContent;
                client.telefono = cells[2].textContent;
                client.email = cells[3].textContent;
                client.fechaNacimiento = cells[4].textContent;
                client.genero = cells[5].textContent;
                client.ubicacion = cells[6].textContent;
                client.finalizado = cells[8].querySelector('input').checked;
            }
        });
        
        // Aquí se implementaría la lógica para guardar los cambios en el servidor
        showNotification('Cambios guardados con éxito', 'success');
    });
    
    // Evento refrescar tabla
    refreshBtn.addEventListener('click', () => {
        // Aquí se implementaría la lógica para recargar datos del servidor
        showNotification('Datos actualizados', 'info');
        renderTable();
    });
    
    // Renderizar tabla inicial
    renderTable();
}

// Añadir evento para guardar cambios en los detalles
const saveClientDetailsBtn = document.getElementById('saveClientDetails');
saveClientDetailsBtn.addEventListener('click', () => {
    const detailsForm = document.getElementById('clientDetailsForm');
    const clientId = parseInt(detailsForm.dataset.clientId);
    const client = clientsData.find(c => c.id === clientId);
    
    if (client) {
        // Actualizar los datos del cliente con los valores del formulario
        client.nombre = document.getElementById('detail-nombre').value;
        client.telefono = document.getElementById('detail-telefono').value;
        client.email = document.getElementById('detail-email').value;
        client.fechaNacimiento = document.getElementById('detail-fecha-nacimiento').value;
        client.genero = document.getElementById('detail-genero').value;
        client.ubicacion = document.getElementById('detail-ubicacion').value;
        
        client.pesoInicial = parseFloat(document.getElementById('detail-peso-inicial').value);
        client.pesoDeseado = parseFloat(document.getElementById('detail-peso-deseado').value);
        client.grasaActual = parseFloat(document.getElementById('detail-grasa-actual').value);
        client.grasaDeseada = parseFloat(document.getElementById('detail-grasa-deseada').value);
        
        client.fechaProspecto = document.getElementById('detail-fecha-prospecto').value;
        client.fechaCliente = document.getElementById('detail-fecha-cliente').value;
        client.canal = document.getElementById('detail-canal').value;
        client.numeroExpediente = document.getElementById('detail-num-expediente').value;
        client.numeroCliente = document.getElementById('detail-num-cliente').value;
        
        // Actualizar la tabla
        renderTable();
        
        // Cerrar el modal
        detailsModal.classList.remove('show');
        
        // Mostrar notificación
        showNotification('Detalles del cliente actualizados correctamente', 'success');
    }
});

// Función para inicializar la sección de expedientes
function initRecordsSection() {
    const clientSelect = document.getElementById('clientSelect');
    const dateSelect = document.getElementById('dateSelect');
    const recordNumber = document.getElementById('recordNumber');
    const consultBtn = document.getElementById('consultRecord');
    const recordContent = document.getElementById('recordContent');
    const saveBtn = document.getElementById('saveRecord');
    const updateBtn = document.getElementById('updateProgress');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const showWeightHistoryBtn = document.getElementById('showWeightHistory');
    const showFatHistoryBtn = document.getElementById('showFatHistory');
    const historyModal = document.getElementById('historyModal');
    
    // Ejemplo de datos de expedientes para cada cliente
    const clientRecords = {
        1: [
            {
                date: '28/06/2023',
                recordNumber: 'EXP-2306-001',
                pesoInicial: 85.5,
                pesoDeseado: 78,
                pesoActual: 82.3,
                grasaInicial: 22.5,
                grasaDeseada: 15,
                grasaActual: 19.8,
                diasEntrenamiento: 3,
                horasEntrenamiento: 1,
                nivel: 'Intermedio',
                disciplina: 'Musculación',
                objetivo: 'Pérdida de peso',
                condicionesMedicas: 'Presión arterial ligeramente elevada. Evitar ejercicios de alta intensidad.'
            },
            {
                date: '15/07/2023',
                recordNumber: 'EXP-2307-001',
                pesoInicial: 85.5,
                pesoDeseado: 78,
                pesoActual: 81.2,
                grasaInicial: 22.5,
                grasaDeseada: 15,
                grasaActual: 18.5,
                diasEntrenamiento: 4,
                horasEntrenamiento: 1.5,
                nivel: 'Intermedio',
                disciplina: 'Musculación',
                objetivo: 'Pérdida de peso',
                condicionesMedicas: 'Presión arterial ligeramente elevada. Evitar ejercicios de alta intensidad.'
            },
            {
                date: '01/08/2023',
                recordNumber: 'EXP-2308-001',
                pesoInicial: 85.5,
                pesoDeseado: 78,
                pesoActual: 79.8,
                grasaInicial: 22.5,
                grasaDeseada: 15,
                grasaActual: 17.2,
                diasEntrenamiento: 4,
                horasEntrenamiento: 1.5,
                nivel: 'Intermedio',
                disciplina: 'Mixto',
                objetivo: 'Pérdida de peso',
                condicionesMedicas: 'Presión arterial normalizada. Continuar con la rutina establecida.'
            }
        ],
        2: [
            {
                date: '15/06/2023',
                recordNumber: 'EXP-2306-002',
                pesoInicial: 63.2,
                pesoDeseado: 58,
                pesoActual: 61.5,
                grasaInicial: 28.3,
                grasaDeseada: 22,
                grasaActual: 26.8,
                diasEntrenamiento: 3,
                horasEntrenamiento: 1,
                nivel: 'Principiante',
                disciplina: 'Cardio',
                objetivo: 'Tonificación',
                condicionesMedicas: 'Sin condiciones médicas relevantes.'
            }
        ]
    };
    
    // Dentro de initRecordsSection, actualizar los datos de ejemplo
    const weightHistory = {
        '1': [ // Cliente Carlos Rodríguez
            { date: '28/06/2023', value: 85.5 },
            { date: '12/07/2023', value: 84.3 },
            { date: '26/07/2023', value: 83.1 },
            { date: '09/08/2023', value: 81.8 },
            { date: '23/08/2023', value: 80.5 },
            { date: '06/09/2023', value: 79.2 },
            { date: '20/09/2023', value: 78.7 }
        ],
        '2': [ // Cliente María González
            { date: '15/06/2023', value: 67.2 },
            { date: '29/06/2023', value: 66.5 },
            { date: '13/07/2023', value: 65.8 },
            { date: '27/07/2023', value: 65.0 },
            { date: '10/08/2023', value: 64.2 }
        ]
    };
    
    const fatHistory = {
        '1': [ // Cliente Carlos Rodríguez
            { date: '28/06/2023', value: 22.5 },
            { date: '12/07/2023', value: 21.8 },
            { date: '26/07/2023', value: 20.9 },
            { date: '09/08/2023', value: 19.7 },
            { date: '23/08/2023', value: 18.5 },
            { date: '06/09/2023', value: 17.2 },
            { date: '20/09/2023', value: 16.3 }
        ],
        '2': [ // Cliente María González
            { date: '15/06/2023', value: 28.5 },
            { date: '29/06/2023', value: 27.6 },
            { date: '13/07/2023', value: 26.8 },
            { date: '27/07/2023', value: 25.9 },
            { date: '10/08/2023', value: 24.5 }
        ]
    };
    
    // Event: Cliente seleccionado
    clientSelect.addEventListener('change', () => {
        const clientId = clientSelect.value;
        dateSelect.innerHTML = '<option value="">Seleccionar Fecha</option>';
        recordNumber.value = '';
        recordContent.classList.add('hidden');
        
        if (clientId) {
            dateSelect.disabled = false;
            
            // Cargar fechas disponibles para el cliente seleccionado
            if (clientRecords[clientId]) {
                clientRecords[clientId].forEach(record => {
                    const option = document.createElement('option');
                    option.value = record.date;
                    option.textContent = record.date;
                    dateSelect.appendChild(option);
                });
            }
        } else {
            dateSelect.disabled = true;
            consultBtn.disabled = true;
        }
    });
    
    // Event: Fecha seleccionada
    dateSelect.addEventListener('change', () => {
        const clientId = clientSelect.value;
        const date = dateSelect.value;
        recordNumber.value = '';
        
        if (clientId && date) {
            // Buscar el expediente correspondiente
            const record = clientRecords[clientId].find(r => r.date === date);
            if (record) {
                recordNumber.value = record.recordNumber;
                consultBtn.disabled = false;
            }
        } else {
            consultBtn.disabled = true;
        }
    });
    
    // Event: Botón consultar
    consultBtn.addEventListener('click', () => {
        const clientId = clientSelect.value;
        const date = dateSelect.value;
        
        if (clientId && date) {
            // Buscar el expediente correspondiente
            const record = clientRecords[clientId].find(r => r.date === date);
            if (record) {
                // Llenar el formulario con los datos del expediente
                document.getElementById('pesoInicial').value = record.pesoInicial;
                document.getElementById('pesoDeseado').value = record.pesoDeseado;
                document.getElementById('pesoActual').value = record.pesoActual;
                document.getElementById('grasaInicial').value = record.grasaInicial;
                document.getElementById('grasaDeseada').value = record.grasaDeseada;
                document.getElementById('grasaActual').value = record.grasaActual;
                document.getElementById('diasEntrenamiento').value = record.diasEntrenamiento;
                document.getElementById('horasEntrenamiento').value = record.horasEntrenamiento;
                document.getElementById('nivel').value = record.nivel;
                document.getElementById('disciplina').value = record.disciplina;
                document.getElementById('objetivo').value = record.objetivo;
                document.getElementById('condicionesMedicas').value = record.condicionesMedicas;
                
                // Actualizar valores de progreso
                document.getElementById('progressPesoInicial').textContent = record.pesoInicial;
                document.getElementById('progressPesoActual').textContent = record.pesoActual;
                document.getElementById('progressPesoDeseado').textContent = record.pesoDeseado;
                document.getElementById('progressGrasaInicial').textContent = record.grasaInicial;
                document.getElementById('progressGrasaActual').textContent = record.grasaActual;
                document.getElementById('progressGrasaDeseada').textContent = record.grasaDeseada;
                
                // Calcular y actualizar indicadores de progreso
                const pesoProgress = calculateProgress(record.pesoInicial, record.pesoActual, record.pesoDeseado);
                const grasaProgress = calculateProgress(record.grasaInicial, record.grasaActual, record.grasaDeseada);
                
                document.getElementById('pesoIndicator').style.width = `${pesoProgress}%`;
                document.getElementById('grasaIndicator').style.width = `${grasaProgress}%`;
                
                // Mostrar el contenido del expediente
                recordContent.classList.remove('hidden');
            }
        }
    });
    
    // Event: Botón guardar
    saveBtn.addEventListener('click', () => {
        // Aquí iría la lógica para guardar los cambios
        showNotification('Expediente guardado con éxito', 'success');
    });
    
    // Event: Botón actualizar avance
    updateBtn.addEventListener('click', () => {
        // Aquí iría la lógica para actualizar el avance
        showNotification('Avance actualizado correctamente', 'success');
    });
    
    // Events: Botones de pestañas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Cambiar tab activo
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar contenido de tab
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Events: Botones de historial
    showWeightHistoryBtn.addEventListener('click', () => {
        showHistoryModal('peso', weightHistory);
    });
    
    showFatHistoryBtn.addEventListener('click', () => {
        showHistoryModal('grasa', fatHistory);
    });
    
    // Event: Cerrar modal de historial
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            historyModal.classList.remove('show');
        });
    });
    
    // Función para calcular el progreso
    function calculateProgress(initial, current, target) {
        // Para pérdida de peso (initial > target)
        if (initial > target) {
            const totalChange = initial - target;
            const currentChange = initial - current;
            return Math.min(Math.max((currentChange / totalChange) * 100, 0), 100);
        } 
        // Para ganancia (initial < target)
        else if (initial < target) {
            const totalChange = target - initial;
            const currentChange = current - initial;
            return Math.min(Math.max((currentChange / totalChange) * 100, 0), 100);
        }
        return 100; // Si initial === target
    }
    
    // Función para mostrar el modal de historial
    function showHistoryModal(type, historyData) {
        const clientId = clientSelect.value;
        const title = type === 'peso' ? 'Historial de Peso' : 'Historial de % Grasa';
        const unitLabel = type === 'peso' ? 'kg' : '%';
        
        document.getElementById('historyTitle').textContent = title;
        document.getElementById('historyValueType').textContent = `Valor (${unitLabel})`;
        
        // Llenar la tabla de historial
        const tableBody = document.getElementById('historyTableBody');
        tableBody.innerHTML = '';
        
        // Datos para el gráfico
        const chartLabels = [];
        const chartData = [];
        
        if (historyData[clientId]) {
            let prevValue = null;
            
            // Ordenar por fecha (más antigua primero)
            const sortedHistory = [...historyData[clientId]].sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            
            sortedHistory.forEach(item => {
                // Añadir datos para el gráfico
                chartLabels.push(item.date);
                chartData.push(item.value);
                
                // Crear fila para la tabla
                const row = document.createElement('tr');
                
                // Calcular el cambio
                let change = '';
                if (prevValue !== null) {
                    const diff = item.value - prevValue;
                    change = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                }
                
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.value}</td>
                    <td class="${change.startsWith('+') ? 'positive-change' : change.startsWith('-') ? 'negative-change' : ''}">${change}</td>
                `;
                tableBody.appendChild(row);
                prevValue = item.value;
            });
        }
        
        // Mostrar el modal
        historyModal.classList.add('show');
        
        // Crear o actualizar el gráfico
        createHistoryChart(chartLabels, chartData, type, unitLabel);
    }
    
    // Agregar función para crear gráfico
    function createHistoryChart(labels, data, type, unitLabel) {
        // Destruir gráfico existente si hay uno
        if (window.historyChartInstance) {
            window.historyChartInstance.destroy();
        }
        
        // Obtener el contexto del canvas
        const ctx = document.getElementById('historyChart').getContext('2d');
        
        // Determinar colores basados en el tipo de datos
        const lineColor = type === 'peso' ? '#3a7bd5' : '#00BFA5';
        const fillColor = type === 'peso' ? 'rgba(58, 123, 213, 0.1)' : 'rgba(0, 191, 165, 0.1)';
        
        // Crear el gráfico
        window.historyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: type === 'peso' ? `Peso (${unitLabel})` : `Grasa corporal (${unitLabel})`,
                    data: data,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    pointBackgroundColor: lineColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} ${unitLabel}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: unitLabel
                        },
                        ticks: {
                            precision: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    }
                }
            }
        });
    }
} 