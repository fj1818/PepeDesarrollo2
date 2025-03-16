// Variables globales para los datos
let datosAPI = null;
let prospectosArray = []; // Declaración global de prospectosArray

// Variable global para la URL de la API
const API_URL = 'https://script.google.com/macros/s/AKfycbz1HF7H07xQAHgHCEwKy7eSkk0A44om3fliN3cOr0-a8RFBVVSDuaDrn-qCLdr3aNomRA/exec';

// Variable global para rastrear los cambios
let prospectosModificados = {}; 

// Estilo para el botón de actualizar
const refreshBtnStyle = document.createElement('style');
refreshBtnStyle.textContent = `
    .refresh-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--background-color);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-right: 10px;
        transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .refresh-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    
    .refresh-btn i {
        font-size: 1.2rem;
        color: #555;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .refresh-btn.loading i {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(refreshBtnStyle);

// Agregamos estilo para centrar correctamente el checkbox
const checkboxStyle = document.createElement('style');
checkboxStyle.textContent = `
    .checkbox-center {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
    
    .custom-checkbox {
        margin: 0;
    }
`;
document.head.appendChild(checkboxStyle);

// Agregar estilos para el modal de cliente
const clientModalStyle = document.createElement('style');
clientModalStyle.textContent = `
    .client-modal {
        width: 80%;
        max-width: 800px;
    }
    
    .form-row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -10px;
    }
    
    .form-group {
        flex: 1 0 45%;
        padding: 0 10px;
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }
    
    @media (max-width: 768px) {
        .form-group {
            flex: 1 0 100%;
        }
    }
    
    .modal-body {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 10px;
    }
    
    .modal-body::-webkit-scrollbar {
        width: 8px;
    }
    
    .modal-body::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .modal-body::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }
    
    .modal-body::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    
    .modal h4 {
        margin-top: 15px;
        margin-bottom: 10px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }
`;
document.head.appendChild(clientModalStyle);

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const screenTitle = document.getElementById('screen-title');
    const screenContent = document.getElementById('screen-content');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const refreshBtn = document.getElementById('refreshBtn');
    const notificationBtn = document.querySelector('.notification-btn');
    
    // Crear contenedor para las notificaciones toast
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // Mover el botón de actualizar al lado de la campana si existe en otra ubicación
    const existingRefreshBtn = document.getElementById('refreshBtn');
    const headerRight = document.querySelector('.header-right');
    
    if (existingRefreshBtn && !headerRight.contains(existingRefreshBtn)) {
        existingRefreshBtn.remove();
        headerRight.insertAdjacentHTML('afterbegin', `
            <button class="refresh-btn" id="refreshBtn">
                <i class="fas fa-sync-alt"></i>
            </button>
        `);
        // Actualizar la referencia
        refreshBtn = document.getElementById('refreshBtn');
    }
    
    // Función para mostrar notificación toast
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="toast-content">
                <p>${message}</p>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Eliminar toast después de 4 segundos o cuando se cierre manualmente
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
    
    // Evento para mostrar notificación de prospectos al hacer clic en el ícono de campana
    notificationBtn.addEventListener('click', function() {
        // Verificar si tenemos datos de prospectos
        if (datosAPI && datosAPI.prospecto) {
            const prospectosSinContactar = Object.values(datosAPI.prospecto).filter(
                prospecto => !prospecto.contactado
            ).length;
            
            // Crear mensaje con hipervínculo a prospectos
            const message = `Tienes <strong>${prospectosSinContactar}</strong> <a href="#prospects" class="prospects-link">prospectos</a> sin contactar.`;
            
            // Mostrar notificación
            showToast(message);
            
            // Agregar evento al hipervínculo para navegar a prospectos
            setTimeout(() => {
                const prospectsLink = document.querySelector('.prospects-link');
                if (prospectsLink) {
                    prospectsLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Navegar a la sección de prospectos
                        navItems.forEach(navItem => navItem.classList.remove('active'));
                        const prospectsNavItem = document.querySelector('[data-screen="prospects"]');
                        prospectsNavItem.classList.add('active');
                        
                        updateScreenTitle('prospects');
                        loadScreenContent('prospects');
                    });
                }
            }, 100);
        } else {
            showToast('No hay datos disponibles de prospectos.');
        }
    });
    
    // Función para actualizar el badge de notificaciones
    function updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        
        if (datosAPI && datosAPI.prospecto) {
            const prospectosSinContactar = Object.values(datosAPI.prospecto).filter(
                prospecto => !prospecto.contactado
            ).length;
            
            if (prospectosSinContactar > 0) {
                badge.textContent = prospectosSinContactar;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Función para obtener datos de la API con un parámetro único para evitar caché
    async function fetchDatos() {
        // Mostrar overlay de carga
        loadingOverlay.style.display = 'flex';
        
        try {
            const uniqueParam = new Date().getTime(); // Generar un parámetro único
            const response = await fetch(`${API_URL}?nocache=${uniqueParam}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Guardar datos en variable global
            datosAPI = data;
            
            // Imprimir datos en consola para depuración
            console.log('Datos obtenidos:', datosAPI);
            
            // Actualizar contadores del dashboard con datos reales
            actualizarDashboard();
            
            // Actualizar badge de notificaciones
            updateNotificationBadge();
            
            // Si estamos en la sección de prospectos, actualizar la tabla
            if (screenTitle.textContent === 'Prospectos') {
                loadProspectsContent();
            }
            
            // Ocultar overlay de carga
            loadingOverlay.style.display = 'none';
            
            return data;
        } catch (error) {
            console.error('Error al obtener datos:', error);
            
            // Ocultar overlay de carga incluso si hay error
            loadingOverlay.style.display = 'none';
            
            // Mostrar mensaje de error al usuario
            alert('Error al cargar datos. Por favor, intente nuevamente.');
        }
    }
    
    // Función para actualizar contadores del dashboard
    function actualizarDashboard() {
        if (!datosAPI) return;
        
        // Si estamos en la pantalla de inicio, actualizar el contenido
        if (screenTitle.textContent === 'Dashboard') {
            loadDashboardContent();
        }
    }
    
    // Evento para botón de actualizar
    refreshBtn.addEventListener('click', function() {
        // Añadir clase de animación
        this.classList.add('loading');
        
        // Volver a obtener datos
        fetchDatos().finally(() => {
            // Quitar clase de animación cuando se complete
            setTimeout(() => {
                this.classList.remove('loading');
            }, 500);
        });
    });
    
    // Manejar toggle del sidebar
    menuToggle.addEventListener('click', function() {
        if (window.innerWidth < 768) {
            sidebar.classList.toggle('expanded');
        } else {
            sidebar.classList.toggle('collapsed');
            adjustMainContent();
        }
    });
    
    // Ajustar el contenido principal cuando el sidebar cambia
    function adjustMainContent() {
        const mainContent = document.querySelector('.main-content');
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = 'var(--sidebar-collapsed)';
        } else {
            mainContent.style.marginLeft = '0';
        }
    }
    
    // Manejar navegación entre pantallas
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Agregar clase active al item clickeado
            this.classList.add('active');
            
            // Obtener pantalla a cargar
            const screen = this.getAttribute('data-screen');
            
            // Actualizar título de la pantalla
            updateScreenTitle(screen);
            
            // Cargar contenido de la pantalla
            loadScreenContent(screen);
            
            // Cerrar sidebar en móvil
            if (window.innerWidth < 768) {
                sidebar.classList.remove('expanded');
            }
        });
    });
    
    // Actualizar título de la pantalla
    function updateScreenTitle(screen) {
        switch(screen) {
            case 'home':
                screenTitle.textContent = 'Dashboard';
                break;
            case 'prospects':
                screenTitle.textContent = 'Prospectos';
                break;
            case 'clients':
                screenTitle.textContent = 'Clientes';
                break;
            case 'records':
                screenTitle.textContent = 'Expedientes';
                break;
            default:
                screenTitle.textContent = 'Dashboard';
        }
    }
    
    // Cargar contenido de la pantalla
    function loadScreenContent(screen) {
        // Limpiar modales previos
        const prevModal = document.getElementById('motivoModal');
        if (prevModal) {
            prevModal.remove();
        }
        
        // Limpiar contenido actual
        screenContent.innerHTML = '';
        
        switch(screen) {
            case 'home':
                loadDashboardContent();
                break;
            case 'prospects':
                loadProspectsContent();
                break;
            case 'clients':
                loadClientsContent();
                break;
            case 'records':
                loadRecordsContent();
                break;
            default:
                loadDashboardContent();
        }
    }
    
    // Cargar Dashboard
    function loadDashboardContent() {
        // Calcular contadores basados en los datos
        let prospectosSinContactar = 0;
        let prospectosContactados = 0;
        let prospectosTotales = 0;
        let clientesActivos = 0;
        let clientesCerrados = 0;
        let clientesTotales = 0;
        let expedientesAbiertos = 0;
        let expedientesCerrados = 0;
        let expedientesTotales = 0;
        
        // Si tenemos datos, calcular contadores
        if (datosAPI) {
            // Contar prospectos
            if (datosAPI.prospecto) {
                prospectosTotales = Object.keys(datosAPI.prospecto).length;
                
                // Contar prospectos contactados y sin contactar
                for (const key in datosAPI.prospecto) {
                    if (datosAPI.prospecto[key].contactado) {
                        prospectosContactados++;
                    } else {
                        prospectosSinContactar++;
                    }
                }
            }
            
            // Contar clientes
            if (datosAPI.contactosClientes) {
                clientesTotales = Object.keys(datosAPI.contactosClientes).length;
                
                // Contar clientes activos y cerrados
                for (const key in datosAPI.contactosClientes) {
                    if (datosAPI.contactosClientes[key].finalizado) {
                        clientesCerrados++;
                    } else {
                        clientesActivos++;
                    }
                }
            }
            
            // Contar expedientes
            if (datosAPI.expedienteClientes) {
                expedientesTotales = Object.keys(datosAPI.expedienteClientes).length;
                
                // Aquí deberías adaptar según la estructura de tus datos
                // Este es un ejemplo genérico
                for (const key in datosAPI.expedienteClientes) {
                    if (datosAPI.expedienteClientes[key].estado === 'cerrado') {
                        expedientesCerrados++;
                    } else {
                        expedientesAbiertos++;
                    }
                }
            }
        }
        
        // Crear estadísticas organizadas por columnas
        const statsHTML = `
            <div class="dashboard-columns">
                <!-- Columna de Prospectos -->
                <div class="dashboard-column">
                    <h2 class="column-title">Prospectos</h2>
                    <div class="dashboard-stats-column">
                        <div class="stat-card">
                            <div class="stat-icon blue">
                                <i class="fas fa-user-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${prospectosSinContactar}</h3>
                                <p>Sin Contactar</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon blue">
                                <i class="fas fa-phone-alt"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${prospectosContactados}</h3>
                                <p>Contactados</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon blue">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${prospectosTotales}</h3>
                                <p>Totales</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Columna de Clientes -->
                <div class="dashboard-column">
                    <h2 class="column-title">Clientes</h2>
                    <div class="dashboard-stats-column">
                        <div class="stat-card">
                            <div class="stat-icon purple">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${clientesActivos}</h3>
                                <p>Activos</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon purple">
                                <i class="fas fa-user-times"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${clientesCerrados}</h3>
                                <p>Cerrados</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon purple">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${clientesTotales}</h3>
                                <p>Totales</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Columna de Expedientes -->
                <div class="dashboard-column">
                    <h2 class="column-title">Expedientes</h2>
                    <div class="dashboard-stats-column">
                        <div class="stat-card">
                            <div class="stat-icon green">
                                <i class="fas fa-folder-open"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${expedientesAbiertos}</h3>
                                <p>Abiertos</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">
                                <i class="fas fa-folder"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${expedientesCerrados}</h3>
                                <p>Cerrados</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${expedientesTotales}</h3>
                                <p>Totales</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        screenContent.innerHTML = statsHTML;
    }
    
    // Cargar Prospectos con tabla mejorada y paginación
    function loadProspectsContent() {
        // Crear modal para editar motivo
        const modalHTML = `
            <div class="modal-overlay" id="motivoModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>Editar Motivo</h3>
                        <button class="modal-close" id="closeModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="motivoText">Motivo:</label>
                            <textarea id="motivoText" placeholder="Escriba el motivo aquí..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelMotivo">Cancelar</button>
                        <button class="btn btn-primary" id="saveMotivo">Guardar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Variables para paginación
        let currentPage = 1;
        let pageSize = 10;
        
        // Estructura básica de la tabla de prospectos con barra de búsqueda y botones
        screenContent.innerHTML = `
            <div class="table-controls">
                <input type="text" id="searchInput" placeholder="Buscar...">
                <button class="btn btn-primary" id="saveBtn">Guardar</button>
                <button class="btn btn-primary" id="generateClientBtn">Generar Cliente</button>
            </div>
            <div class="data-table-container">
                <div class="table-header">
                    <h3>Listado de Prospectos</h3>
                </div>
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th class="convert-header">Conv.</th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Ubicación</th>
                                <th>Canal</th>
                                <th>Fecha</th>
                                <th>Contactado</th>
                                <th>Interesado</th>
                                <th>Motivo</th>
                                <th>N° Cliente</th>
                            </tr>
                        </thead>
                        <tbody id="prospectosTableBody">
                            <!-- Se llenarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
                <div class="pagination-container">
                    <div class="pagination-info">
                        Mostrando <span id="startRecord">1</span>-<span id="endRecord">10</span> de <span id="totalRecords">0</span> registros
                    </div>
                    <div class="pagination-controls">
                        <div class="page-size-selector">
                            <label>Mostrar:</label>
                            <select id="pageSizeSelect">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div class="pagination-buttons" id="paginationButtons">
                            <!-- Se llenarán dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const tableBody = document.getElementById('prospectosTableBody');
        const motivoModal = document.getElementById('motivoModal');
        const closeModal = document.getElementById('closeModal');
        const cancelMotivo = document.getElementById('cancelMotivo');
        const saveMotivo = document.getElementById('saveMotivo');
        const motivoText = document.getElementById('motivoText');
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        const paginationButtons = document.getElementById('paginationButtons');
        const startRecord = document.getElementById('startRecord');
        const endRecord = document.getElementById('endRecord');
        const totalRecords = document.getElementById('totalRecords');
        
        let currentProspectoId = null;
        
        // Cerrar modal
        function closeModalHandler() {
            motivoModal.classList.remove('active');
            currentProspectoId = null;
        }
        
        closeModal.addEventListener('click', closeModalHandler);
        cancelMotivo.addEventListener('click', closeModalHandler);
        
        // Guardar motivo
        saveMotivo.addEventListener('click', function() {
            if (currentProspectoId && datosAPI.prospecto[currentProspectoId]) {
                datosAPI.prospecto[currentProspectoId].motivo = motivoText.value;
                
                // Registrar que este prospecto ha sido modificado
                prospectosModificados[currentProspectoId] = true;
                
                // Solo necesitamos actualizar el atributo data-motivo, no hay texto visible
                const motivoBtn = document.querySelector(`[data-prospecto-id="${currentProspectoId}"] .motivo-btn`);
                if (motivoBtn) {
                    motivoBtn.setAttribute('data-motivo', motivoText.value);
                }
                
                console.log('Motivo actualizado:', currentProspectoId, motivoText.value);
                
                closeModalHandler();
            }
        });
        
        // Validación de teléfono (10 dígitos)
        function validatePhone(phone) {
            return /^\d{10}$/.test(phone);
        }
        
        // Validación de email
        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        
        // Manejar cambios en campos editables
        function handleFieldChange(id, field, value, element) {
            if (!datosAPI.prospecto[id]) return;
            
            // Validar según el tipo de campo
            let isValid = true;
            let errorMessage = '';
            
            switch(field) {
                case 'telefono':
                    isValid = validatePhone(value);
                    errorMessage = 'Teléfono debe tener 10 dígitos';
                    value = value.replace(/\D/g, ''); // Eliminar no-dígitos
                    break;
                case 'email':
                    isValid = validateEmail(value);
                    errorMessage = 'Email no válido';
                    break;
                case 'contactado':
                    // Siempre guardar como string "true" o "" (vacío)
                    // Importante: Asegurar que sea exactamente la cadena "true" para la API
                    value = value ? "true" : "";
                    console.log(`Valor de contactado guardado: ${value}`);
                    break;
            }
            
            // Eliminar mensajes de error anteriores
            const existingError = element.parentNode.querySelector('.field-error');
            if (existingError) existingError.remove();
            
            // Manejar estado de validación
            if (isValid) {
                element.classList.remove('invalid');
                
                // Actualizar en el objeto de datos
                datosAPI.prospecto[id][field] = value;
                
                // Registrar que este prospecto ha sido modificado
                prospectosModificados[id] = true;
                
                // Actualizar el array para paginación si es necesario
                if (prospectosArray.length > 0) {
                    const prospecto = prospectosArray.find(p => p['id-prospecto'] === id);
                    if (prospecto) {
                        prospecto[field] = value;
                    }
                }
                
                console.log('Campo actualizado:', id, field, value);
            } else {
                element.classList.add('invalid');
                
                // Mostrar mensaje de error
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.textContent = errorMessage;
                element.parentNode.appendChild(errorElement);
            }
        }
        
        // Función para renderizar la tabla con paginación
        function renderTable() {
            if (datosAPI && datosAPI.prospecto) {
                // Obtener array de prospectos y ordenarlos
                prospectosArray = Object.values(datosAPI.prospecto);
                
                // Ordenar por fecha (más reciente primero)
                prospectosArray.sort((a, b) => {
                    return new Date(b['fecha-prospecto']) - new Date(a['fecha-prospecto']);
                });
                
                // Actualizar total de registros
                totalRecords.textContent = prospectosArray.length;
                
                // Calcular total de páginas
                const totalPages = Math.ceil(prospectosArray.length / pageSize);
                
                // Actualizar paginación
                updatePagination(totalPages);
                
                // Mostrar registros de la página actual
                showPage(currentPage, totalPages);
            } else {
                // Si no hay prospectos, mostrar mensaje
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; padding: 30px;">No hay prospectos registrados</td>
                    </tr>
                `;
                
                // Actualizar información de paginación
                startRecord.textContent = '0';
                endRecord.textContent = '0';
                totalRecords.textContent = '0';
                paginationButtons.innerHTML = '';
            }
        }
        
        // Función para mostrar una página específica
        function showPage(page, totalPages) {
            // Limpiar tabla
            tableBody.innerHTML = '';
            
            // Asegurarse que la página sea válida
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            
            // Calcular índices
            const startIndex = (page - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize - 1, prospectosArray.length - 1);
            
            // Actualizar información de paginación
            startRecord.textContent = prospectosArray.length > 0 ? startIndex + 1 : 0;
            endRecord.textContent = prospectosArray.length > 0 ? endIndex + 1 : 0;
            
            // Si no hay prospectos, mostrar mensaje
            if (prospectosArray.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="11" style="text-align: center; padding: 30px;">No hay prospectos registrados</td>
                    </tr>
                `;
                return;
            }
            
            // Mostrar registros de la página actual
            for (let i = startIndex; i <= endIndex; i++) {
                const prospecto = prospectosArray[i];
                
                const row = document.createElement('tr');
                row.setAttribute('data-prospecto-id', prospecto['id-prospecto']);
                
                // Mantener el formato de fecha original sin modificarlo
                const fechaFormateada = prospecto['fecha-prospecto'] || 'N/A';
                
                // Comprobar si el prospecto ya es cliente (tiene número de cliente)
                const yaEsCliente = prospecto['numero-cliente'] && prospecto['numero-cliente'].trim() !== '';
                
                const convertColumn = yaEsCliente 
                    ? `<td class="convert-column"><i class="fas fa-user-check" style="color: #4CAF50;" title="Cliente convertido"></i></td>`
                    : `<td class="convert-column"><input type="checkbox" class="convert-checkbox" title="Convertir a cliente"></td>`;
                
                row.innerHTML = `
                    ${convertColumn}
                    <td>
                        <input type="text" class="editable-field" value="${prospecto.nombre || ''}" data-field="nombre">
                    </td>
                    <td>
                        <input type="tel" class="editable-field" value="${prospecto.telefono || ''}" data-field="telefono" maxlength="10">
                    </td>
                    <td>
                        <input type="email" class="editable-field" value="${prospecto.email || ''}" data-field="email">
                    </td>
                    <td>
                        <input type="text" class="editable-field" value="${prospecto.ubicacion || ''}" data-field="ubicacion">
                    </td>
                    <td>
                        <div class="custom-select">
                            <select class="editable-field" data-field="canal">
                                <option value="" ${!prospecto.canal ? 'selected' : ''}>Seleccionar</option>
                                <option value="instagram" ${prospecto.canal === 'instagram' ? 'selected' : ''}>Instagram</option>
                                <option value="facebook" ${prospecto.canal === 'facebook' ? 'selected' : ''}>Facebook</option>
                                <option value="tiktok" ${prospecto.canal === 'tiktok' ? 'selected' : ''}>TikTok</option>
                                <option value="youtube" ${prospecto.canal === 'youtube' ? 'selected' : ''}>YouTube</option>
                                <option value="twitter" ${prospecto.canal === 'twitter' ? 'selected' : ''}>Twitter</option>
                                <option value="otro" ${prospecto.canal === 'otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                    </td>
                    <td>${fechaFormateada}</td>
                    <td>
                        <div class="checkbox-center">
                            <input type="checkbox" class="custom-checkbox" data-field="contactado" ${prospecto.contactado ? 'checked' : ''}>
                        </div>
                    </td>
                    <td>
                        <select class="interest-select" data-field="interesado">
                            <option value="" ${!prospecto.interesado ? 'selected' : ''}>-</option>
                            <option value="si" ${prospecto.interesado === 'si' ? 'selected' : ''}>Sí</option>
                            <option value="no" ${prospecto.interesado === 'no' ? 'selected' : ''}>No</option>
                        </select>
                    </td>
                    <td>
                        <button class="motivo-btn" data-motivo="${prospecto.motivo || ''}">
                            <i class="fas fa-sticky-note"></i>
                        </button>
                    </td>
                    <td>${prospecto['numero-cliente'] || ''}</td>
                `;
                
                tableBody.appendChild(row);
            }
            
            // Asignar eventos a los campos editables
            const editableFields = document.querySelectorAll('.editable-field, .interest-select');
            editableFields.forEach(field => {
                field.addEventListener('change', function() {
                    const prospectoId = this.closest('tr').getAttribute('data-prospecto-id');
                    const fieldName = this.getAttribute('data-field');
                    let value = this.value;
                    
                    // Manejar checkboxes
                    if (this.type === 'checkbox') {
                        value = this.checked;
                        // Log adicional para verificar valores de checkbox
                        console.log(`Checkbox ${fieldName} cambiado a: ${value}`);
                    }
                    
                    handleFieldChange(prospectoId, fieldName, value, this);
                });
            });
            
            // Evento para los botones de motivo
            const motivoBtns = document.querySelectorAll('.motivo-btn');
            motivoBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    currentProspectoId = this.closest('tr').getAttribute('data-prospecto-id');
                    const motivo = this.getAttribute('data-motivo');
                    
                    motivoText.value = motivo || '';
                    motivoModal.classList.add('active');
                });
            });
            
            // Evento para los checkboxes de convertir a cliente
            const convertCheckboxes = document.querySelectorAll('.convert-checkbox');
            convertCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    // Solo marcar el checkbox, sin mostrar alerta
                    // El procesamiento real ocurrirá cuando se presione "Generar Cliente"
                });
            });
        }
        
        // Función para actualizar la paginación
        function updatePagination(totalPages) {
            paginationButtons.innerHTML = '';
            
            // Botón anterior
            const prevBtn = document.createElement('button');
            prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevBtn.disabled = currentPage === 1;
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    showPage(currentPage, totalPages);
                    updatePagination(totalPages);
                }
            });
            paginationButtons.appendChild(prevBtn);
            
            // Determinar qué botones de página mostrar
            const pagesToShow = [];
            
            if (totalPages <= 7) {
                // Mostrar todas las páginas si son 7 o menos
                for (let i = 1; i <= totalPages; i++) {
                    pagesToShow.push(i);
                }
            } else {
                // Mostrar siempre la primera página
                pagesToShow.push(1);
                
                // Determinar páginas intermedias
                if (currentPage <= 3) {
                    // Cerca del inicio
                    pagesToShow.push(2, 3, 4, '...');
                } else if (currentPage >= totalPages - 2) {
                    // Cerca del final
                    pagesToShow.push('...', totalPages - 3, totalPages - 2, totalPages - 1);
                } else {
                    // En medio
                    pagesToShow.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
                }
                
                // Mostrar siempre la última página
                pagesToShow.push(totalPages);
            }
            
            // Añadir botones de página
            pagesToShow.forEach(page => {
                if (page === '...') {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    paginationButtons.appendChild(ellipsis);
                } else {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = `pagination-btn ${currentPage === page ? 'active' : ''}`;
                    pageBtn.textContent = page;
                    pageBtn.addEventListener('click', () => {
                        currentPage = page;
                        showPage(currentPage, totalPages);
                        updatePagination(totalPages);
                    });
                    paginationButtons.appendChild(pageBtn);
                }
            });
            
            // Botón siguiente
            const nextBtn = document.createElement('button');
            nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    showPage(currentPage, totalPages);
                    updatePagination(totalPages);
                }
            });
            paginationButtons.appendChild(nextBtn);
        }
        
        // Evento para cambiar el tamaño de página
        pageSizeSelect.addEventListener('change', function() {
            pageSize = parseInt(this.value, 10);
            currentPage = 1; // Volver a la primera página
            renderTable(); // Volver a renderizar con el nuevo tamaño
        });
        
        // Después de renderizar la tabla inicialmente
        renderTable();
        
        // Agregar funcionalidad de búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterTable(this.value.toLowerCase());
            });
        }

        // Después de insertar el contenido HTML en screenContent dentro de loadProspectsContent()
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                // Mostrar overlay de carga durante el guardado
                loadingOverlay.style.display = 'flex';
                
                // Llamar a la función para guardar datos
                saveDataToAPI()
                    .then(response => {
                        loadingOverlay.style.display = 'none';
                        showToast('Datos guardados correctamente');
                    })
                    .catch(error => {
                        loadingOverlay.style.display = 'none';
                        console.error('Error al guardar:', error);
                        showToast('Error al guardar los datos. Por favor, intente nuevamente.');
                    });
            });
        }

        const generateClientBtn = document.getElementById('generateClientBtn');
        if (generateClientBtn) {
            generateClientBtn.addEventListener('click', function() {
                // Verificar si hay algún prospecto seleccionado para convertir
                const selectedProspectos = [];
                
                document.querySelectorAll('.convert-checkbox:checked').forEach(checkbox => {
                    const prospectoId = checkbox.closest('tr').getAttribute('data-prospecto-id');
                    const prospecto = datosAPI.prospecto[prospectoId];
                    
                    // Verificar si el prospecto cumple con las condiciones
                    if (prospecto) {
                        const row = checkbox.closest('tr');
                        const contactadoCheck = row.querySelector('[data-field="contactado"]');
                        const interesadoSelect = row.querySelector('[data-field="interesado"]');
                        
                        if (contactadoCheck && contactadoCheck.checked) {
                            if (interesadoSelect && interesadoSelect.value === 'si') {
                                // Cumple todas las condiciones
                                selectedProspectos.push(prospecto);
                            } else {
                                // Contactado pero no interesado
                                showToast(`El prospecto <strong>${prospecto.nombre || 'seleccionado'}</strong> no está interesado.`);
                                checkbox.checked = false; // Desmarcar el checkbox
                            }
                        } else {
                            // No está contactado
                            showToast(`El prospecto <strong>${prospecto.nombre || 'seleccionado'}</strong> no ha sido contactado.`);
                            checkbox.checked = false; // Desmarcar el checkbox
                        }
                    }
                });
                
                // Si hay prospectos válidos, mostrar el modal
                if (selectedProspectos.length > 0) {
                    showClientFormModal(selectedProspectos[0]); // Mostrar el modal con el primer prospecto válido
                } else {
                    showToast('No hay prospectos seleccionados o elegibles para convertir a cliente.');
                }
            });
        }
    }
    
    // Función para filtrar la tabla de prospectos
    function filterTable(searchTerm) {
        // Si no hay término de búsqueda, mostrar todos los registros
        if (!searchTerm) {
            // Reiniciar la tabla y mostrar la página actual
            renderTable();
            return;
        }
        
        const tableBody = document.getElementById('prospectosTableBody');
        if (!tableBody) return;
        
        // Filtrar el array de prospectos
        const filteredProspectos = prospectosArray.filter(prospecto => {
            return Object.values(prospecto).some(value => {
                // Solo buscar en valores de texto o número
                if (value && (typeof value === 'string' || typeof value === 'number')) {
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            });
        });
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Mostrar resultados filtrados
        if (filteredProspectos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" style="text-align: center; padding: 30px;">No se encontraron coincidencias</td>
                </tr>
            `;
            
            // Actualizar información de paginación
            document.getElementById('startRecord').textContent = '0';
            document.getElementById('endRecord').textContent = '0';
            document.getElementById('totalRecords').textContent = '0';
            document.getElementById('paginationButtons').innerHTML = '';
        } else {
            // Mostrar todos los resultados filtrados (ignorar paginación)
            filteredProspectos.forEach(prospecto => {
                const row = document.createElement('tr');
                row.setAttribute('data-prospecto-id', prospecto['id-prospecto']);
                
                // Comprobar si el prospecto ya es cliente (tiene número de cliente)
                const yaEsCliente = prospecto['numero-cliente'] && prospecto['numero-cliente'].trim() !== '';
                
                const convertColumn = yaEsCliente 
                    ? `<td class="convert-column"><i class="fas fa-user-check" style="color: #4CAF50;" title="Cliente convertido"></i></td>`
                    : `<td class="convert-column"><input type="checkbox" class="convert-checkbox" title="Convertir a cliente"></td>`;
                
                row.innerHTML = `
                    ${convertColumn}
                    <td>
                        <input type="text" class="editable-field" value="${prospecto.nombre || ''}" data-field="nombre">
                    </td>
                    <td>
                        <input type="tel" class="editable-field" value="${prospecto.telefono || ''}" data-field="telefono" maxlength="10">
                    </td>
                    <td>
                        <input type="email" class="editable-field" value="${prospecto.email || ''}" data-field="email">
                    </td>
                    <td>
                        <input type="text" class="editable-field" value="${prospecto.ubicacion || ''}" data-field="ubicacion">
                    </td>
                    <td>
                        <div class="custom-select">
                            <select class="editable-field" data-field="canal">
                                <option value="" ${!prospecto.canal ? 'selected' : ''}>Seleccionar</option>
                                <option value="instagram" ${prospecto.canal === 'instagram' ? 'selected' : ''}>Instagram</option>
                                <option value="facebook" ${prospecto.canal === 'facebook' ? 'selected' : ''}>Facebook</option>
                                <option value="tiktok" ${prospecto.canal === 'tiktok' ? 'selected' : ''}>TikTok</option>
                                <option value="youtube" ${prospecto.canal === 'youtube' ? 'selected' : ''}>YouTube</option>
                                <option value="twitter" ${prospecto.canal === 'twitter' ? 'selected' : ''}>Twitter</option>
                                <option value="otro" ${prospecto.canal === 'otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                    </td>
                    <td>${prospecto['fecha-prospecto'] || 'N/A'}</td>
                    <td>
                        <div class="checkbox-center">
                            <input type="checkbox" class="custom-checkbox" data-field="contactado" ${prospecto.contactado ? 'checked' : ''}>
                        </div>
                    </td>
                    <td>
                        <select class="interest-select" data-field="interesado">
                            <option value="" ${!prospecto.interesado ? 'selected' : ''}>-</option>
                            <option value="si" ${prospecto.interesado === 'si' ? 'selected' : ''}>Sí</option>
                            <option value="no" ${prospecto.interesado === 'no' ? 'selected' : ''}>No</option>
                        </select>
                    </td>
                    <td>
                        <button class="motivo-btn" data-motivo="${prospecto.motivo || ''}">
                            <i class="fas fa-sticky-note"></i>
                        </button>
                    </td>
                    <td>${prospecto['numero-cliente'] || ''}</td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Actualizar información de paginación para mostrar que se están viendo resultados filtrados
            document.getElementById('startRecord').textContent = '1';
            document.getElementById('endRecord').textContent = filteredProspectos.length.toString();
            document.getElementById('totalRecords').textContent = filteredProspectos.length.toString();
            document.getElementById('paginationButtons').innerHTML = ''; // Ocultar paginación durante búsqueda
            
            // Volver a asignar eventos a los elementos de la tabla filtrada
            assignTableEvents();
        }
    }
    
    // Función para asignar eventos a los elementos de la tabla
    function assignTableEvents() {
        // Asignar eventos a los campos editables
        const editableFields = document.querySelectorAll('.editable-field, .interest-select');
        editableFields.forEach(field => {
            field.addEventListener('change', function() {
                const prospectoId = this.closest('tr').getAttribute('data-prospecto-id');
                const fieldName = this.getAttribute('data-field');
                let value = this.value;
                
                // Manejar checkboxes
                if (this.type === 'checkbox') {
                    value = this.checked;
                    // Log adicional para verificar valores de checkbox
                    console.log(`Checkbox ${fieldName} cambiado a: ${value}`);
                }
                
                handleFieldChange(prospectoId, fieldName, value, this);
            });
        });
        
        // Evento para los botones de motivo
        const motivoBtns = document.querySelectorAll('.motivo-btn');
        motivoBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                currentProspectoId = this.closest('tr').getAttribute('data-prospecto-id');
                const motivo = this.getAttribute('data-motivo');
                
                motivoText.value = motivo || '';
                motivoModal.classList.add('active');
            });
        });
        
        // Evento para los checkboxes de convertir a cliente
        const convertCheckboxes = document.querySelectorAll('.convert-checkbox');
        convertCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Solo marcar el checkbox, sin mostrar alerta
                // El procesamiento real ocurrirá cuando se presione "Generar Cliente"
            });
        });
    }
    
    // Cargar Clientes
    function loadClientsContent() {
        let clientesRows = '';
        
        if (datosAPI && datosAPI.contactosClientes) {
            // Convertir objeto a array
            const clientesArray = Object.values(datosAPI.contactosClientes);
            
            // Generar filas de la tabla
            clientesArray.forEach(cliente => {
                // Determinar estado
                let estado = 'Activo';
                let estadoClass = 'active';
                
                if (cliente.finalizado) {
                    estado = 'Cerrado';
                    estadoClass = 'inactive';
                }
                
                // Formatear fecha
                let fechaDesde = 'N/A';
                if (cliente['fecha-cliente']) {
                    const fecha = new Date(cliente['fecha-cliente']);
                    fechaDesde = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
                }
                
                clientesRows += `
                    <tr>
                        <td>${cliente.nombre || 'Sin nombre'}</td>
                        <td>${cliente.email || 'N/A'}<br>${cliente.telefono || 'N/A'}</td>
                        <td>${cliente.canal || 'N/A'}</td>
                        <td>${fechaDesde}</td>
                        <td><span class="status ${estadoClass}">${estado}</span></td>
                        <td>
                            <button class="action-btn" data-id="${cliente['id-contacto']}"><i class="fas fa-ellipsis-v"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
        
        // Si no hay clientes, mostrar mensaje
        if (!clientesRows) {
            clientesRows = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px;">No hay clientes registrados</td>
                </tr>
            `;
        }
        
        screenContent.innerHTML = `
            <div class="data-table">
                <div class="table-header">
                    <h3>Listado de Clientes</h3>
                    <button class="btn btn-primary"><i class="fas fa-plus"></i> Nuevo Cliente</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Contacto</th>
                            <th>Canal</th>
                            <th>Desde</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientesRows}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Cargar Expedientes
    function loadRecordsContent() {
        let expedientesRows = '';
        
        if (datosAPI && datosAPI.expedienteClientes) {
            // Convertir objeto a array
            const expedientesArray = Object.values(datosAPI.expedienteClientes);
            
            // Generar filas de la tabla
            expedientesArray.forEach(expediente => {
                // Determinar cliente asociado
                let nombreCliente = 'N/A';
                if (datosAPI.contactosClientes && expediente['numero-cliente']) {
                    const cliente = datosAPI.contactosClientes[expediente['numero-cliente']];
                    if (cliente) {
                        nombreCliente = cliente.nombre || 'Sin nombre';
                    }
                }
                
                expedientesRows += `
                    <tr>
                        <td>${expediente['numero-expediente'] || 'Sin número'}</td>
                        <td>${nombreCliente}</td>
                        <td>${expediente.tipo || 'N/A'}</td>
                        <td>${expediente['fecha-apertura'] || 'N/A'}</td>
                        <td><span class="status active">En Proceso</span></td>
                        <td>
                            <button class="action-btn" data-id="${expediente['numero-expediente']}"><i class="fas fa-ellipsis-v"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
        
        // Si no hay expedientes, mostrar mensaje
        if (!expedientesRows) {
            expedientesRows = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px;">No hay expedientes registrados</td>
                </tr>
            `;
        }
        
        screenContent.innerHTML = `
            <div class="data-table">
                <div class="table-header">
                    <h3>Listado de Expedientes</h3>
                    <button class="btn btn-primary"><i class="fas fa-plus"></i> Nuevo Expediente</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Fecha Apertura</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expedientesRows}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Manejar responsividad
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('expanded');
            if (sidebar.classList.contains('collapsed')) {
                adjustMainContent();
            }
        }
    });
    
    // Quitar la barra de búsqueda si existe
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.remove();
    }
    
    // Cargar datos iniciales
    fetchDatos().then(() => {
        // Cargar el dashboard por defecto al iniciar
        loadDashboardContent();
    });

    // Eventos para los botones
    document.getElementById('generateClientBtn').addEventListener('click', function() {
        alert('Cliente generado correctamente.');
        // Aquí puedes añadir la lógica para generar un cliente
    });
    
    // Función para guardar datos a la API
    async function saveDataToAPI() {
        try {
            // Si no hay prospectos modificados, no hacer nada
            const idsModificados = Object.keys(prospectosModificados);
            if (idsModificados.length === 0) {
                showToast('No hay cambios para guardar');
                return { success: true, message: "No hay cambios" };
            }
            
            // Crear un objeto con solo los prospectos modificados
            const prospectosAActualizar = {};
            idsModificados.forEach(id => {
                prospectosAActualizar[id] = datosAPI.prospecto[id];
            });
            
            // Agregar timestamp para evitar caché
            const uniqueParam = new Date().getTime();
            const urlWithParams = `${API_URL}?timestamp=${uniqueParam}`;
            
            const dataToSend = {
                action: 'updateprospecto',
                data: {
                    prospecto: prospectosAActualizar
                }
            };
            
            await fetch(urlWithParams, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            // Limpiar el registro de modificaciones después de guardar
            prospectosModificados = {};
            
            // No podemos verificar la respuesta con no-cors
            showToast(`${idsModificados.length} prospecto(s) actualizado(s) correctamente`);
            return { success: true };
        } catch (error) {
            console.error('Error al guardar datos:', error);
            throw error;
        }
    }

    // Función para mostrar el modal con el formulario de cliente
    function showClientFormModal(prospecto) {
        // Eliminar el modal anterior si existe
        const prevModal = document.getElementById('clientFormModal');
        if (prevModal) {
            prevModal.remove();
        }
        
        // Formatear la fecha de prospecto de ISO a formato legible
        let fechaProspectoFormateada = 'N/A';
        if (prospecto['fecha-prospecto']) {
            const fechaProsp = new Date(prospecto['fecha-prospecto']);
            fechaProspectoFormateada = `${fechaProsp.getDate().toString().padStart(2, '0')}/${(fechaProsp.getMonth()+1).toString().padStart(2, '0')}/${fechaProsp.getFullYear()} ${fechaProsp.getHours().toString().padStart(2, '0')}:${fechaProsp.getMinutes().toString().padStart(2, '0')}:${fechaProsp.getSeconds().toString().padStart(2, '0')}`;
        }
        
        // Obtener fecha actual en formato DD/MM/YYYY HH:MM:SS
        const now = new Date();
        const fechaClienteFormateada = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        // Generar número de expediente si no existe
        let numeroExpediente = '';
        let consecutivoExpediente = 1;
        
        if (datosAPI) {
            // Buscar en expedientes existentes
            const expedientesExistentes = datosAPI.expedienteClientes 
                ? Object.values(datosAPI.expedienteClientes)
                    .filter(exp => exp['numero-expediente'] && exp['numero-expediente'].startsWith('EXP'))
                    .map(exp => exp['numero-expediente'])
                : [];
                
            // Buscar en clientes existentes que puedan tener número de expediente
            const clientesConExpediente = datosAPI.contactosClientes 
                ? Object.values(datosAPI.contactosClientes)
                    .filter(c => c['numero-expediente'] && c['numero-expediente'].startsWith('EXP'))
                    .map(c => c['numero-expediente'])
                : [];
                
            // Combinar todos los números de expediente
            const todosLosExpedientes = [...expedientesExistentes, ...clientesConExpediente];
                
            // Buscar el número más alto
            todosLosExpedientes.forEach(num => {
                try {
                    const numActual = parseInt(num.substring(3));
                    if (!isNaN(numActual) && numActual >= consecutivoExpediente) {
                        consecutivoExpediente = numActual + 1;
                    }
                } catch (error) {
                    console.error('Error al procesar número de expediente:', num, error);
                }
            });
        }
        numeroExpediente = `EXP${consecutivoExpediente.toString().padStart(5, '0')}`;
        
        // Generar número de cliente correctamente
        let numeroCliente = prospecto['numero-cliente'] || '';
        let consecutivoCliente = 1;
        
        if (!numeroCliente) {
            if (datosAPI && datosAPI.contactosClientes) {
                // Encontrar el último número de cliente
                const clientesArray = Object.values(datosAPI.contactosClientes);
                
                // También buscar en prospectos que ya tienen número de cliente asignado
                const prospectosConCliente = Object.values(datosAPI.prospecto || {})
                    .filter(p => p['numero-cliente'] && p['numero-cliente'].startsWith('NMC'))
                    .map(p => p['numero-cliente']);
                    
                // Combinar todos los números de cliente existentes
                const todosLosNumeros = [...clientesArray.map(c => c['numero-cliente']), ...prospectosConCliente]
                    .filter(num => num && num.startsWith('NMC'));
                    
                // Buscar el número más alto
                todosLosNumeros.forEach(num => {
                    try {
                        const numActual = parseInt(num.substring(3));
                        if (!isNaN(numActual) && numActual >= consecutivoCliente) {
                            consecutivoCliente = numActual + 1;
                        }
                    } catch (error) {
                        console.error('Error al procesar número de cliente:', num, error);
                    }
                });
            }
            numeroCliente = `NMC${consecutivoCliente.toString().padStart(5, '0')}`;
        }
        
        // Crear opciones para el campo planes
        let planesOptions = '';
        for (let i = 1; i <= 10; i++) {
            planesOptions += `<option value="Plan ${i}">Plan ${i}</option>`;
        }
        
        // Crear la estructura del modal con scroll
        const modalHTML = `
            <div class="modal-overlay active" id="clientFormModal">
                <div class="modal client-modal">
                    <div class="modal-header">
                        <h3>Generar Cliente</h3>
                        <button class="modal-close" id="closeClientFormModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
                        <form id="clientForm">
                            <!-- Sección 1: Campos automáticos (se toman de la fila) -->
                            <h4>Datos del prospecto</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientName">Nombre completo</label>
                                    <input type="text" id="clientName" value="${prospecto.nombre || ''}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="clientPhone">Teléfono</label>
                                    <input type="tel" id="clientPhone" value="${prospecto.telefono || ''}" readonly>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientEmail">Email</label>
                                    <input type="email" id="clientEmail" value="${prospecto.email || ''}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="clientLocation">Ubicación</label>
                                    <input type="text" id="clientLocation" value="${prospecto.ubicacion || ''}" readonly>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientCanal">Canal</label>
                                    <input type="text" id="clientCanal" value="${prospecto.canal || ''}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="clientFechaProsp">Fecha de prospecto</label>
                                    <input type="text" id="clientFechaProsp" value="${fechaProspectoFormateada}" readonly>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientFechaCliente">Fecha de cliente</label>
                                    <input type="text" id="clientFechaCliente" value="${fechaClienteFormateada}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="clientPlan">Plan</label>
                                    <select id="clientPlan" required>
                                        <option value="">Seleccionar plan</option>
                                        ${planesOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Sección 2: Campos a llenar manualmente -->
                            <h4>Información adicional</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientDOB">Fecha de nacimiento</label>
                                    <input type="date" id="clientDOB" required>
                                </div>
                                <div class="form-group">
                                    <label for="clientGender">Género</label>
                                    <select id="clientGender" required>
                                        <option value="" selected>Seleccionar</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientInitialWeight">Peso inicial (kg)</label>
                                    <input type="number" id="clientInitialWeight" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label for="clientTargetWeight">Peso deseado (kg)</label>
                                    <input type="number" id="clientTargetWeight" step="0.1" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientCurrentFat">Grasa inicial (%)</label>
                                    <input type="number" id="clientCurrentFat" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label for="clientTargetFat">Grasa deseada (%)</label>
                                    <input type="number" id="clientTargetFat" step="0.1" required>
                                </div>
                            </div>
                            
                            <!-- Sección 3: Campos de expediente y número de cliente -->
                            <h4>Información de registro</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="clientExpNumber">Número de expediente</label>
                                    <input type="text" id="clientExpNumber" value="${numeroExpediente}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="clientNumber">Número de cliente</label>
                                    <input type="text" id="clientNumber" value="${numeroCliente}" readonly>
                                </div>
                            </div>
                            
                            <input type="hidden" id="prospectoId" value="${prospecto['id-prospecto']}">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelClientForm">Cancelar</button>
                        <button class="btn btn-primary" id="generateClientForm">Generar Cliente</button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Agregar eventos a los botones
        document.getElementById('closeClientFormModal').addEventListener('click', closeClientFormModal);
        document.getElementById('cancelClientForm').addEventListener('click', closeClientFormModal);
        document.getElementById('generateClientForm').addEventListener('click', async function() {
            // Verificar que todos los campos requeridos estén completos
            const form = document.getElementById('clientForm');
            const requiredInputs = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('invalid');
                    isValid = false;
                } else {
                    input.classList.remove('invalid');
                }
            });
            
            if (!isValid) {
                showToast('Por favor complete todos los campos requeridos.');
                return;
            }
            
            // Obtener todos los valores del formulario
            const prospectoId = document.getElementById('prospectoId').value;
            const nombre = document.getElementById('clientName').value;
            const telefono = document.getElementById('clientPhone').value;
            const email = document.getElementById('clientEmail').value;
            const fechaNacimiento = document.getElementById('clientDOB').value;
            const genero = document.getElementById('clientGender').value;
            const ubicacion = document.getElementById('clientLocation').value;
            const pesoInicial = document.getElementById('clientInitialWeight').value;
            const pesoDeseado = document.getElementById('clientTargetWeight').value;
            const grasaInicial = document.getElementById('clientCurrentFat').value;
            const grasaDeseada = document.getElementById('clientTargetFat').value;
            const fechaProspecto = document.getElementById('clientFechaProsp').value;
            const fechaCliente = document.getElementById('clientFechaCliente').value;
            const canal = document.getElementById('clientCanal').value;
            const numeroExpediente = document.getElementById('clientExpNumber').value;
            const numeroCliente = document.getElementById('clientNumber').value;
            const plan = document.getElementById('clientPlan').value;
            
            // Crear objeto con los datos del cliente
            const clienteData = {
                nombre,
                telefono,
                email,
                'fecha-nacimiento': fechaNacimiento,
                genero,
                ubicacion,
                'peso-inicial': pesoInicial,
                'peso-deseado': pesoDeseado,
                'grasa-inicial': grasaInicial,
                'grasa-deseada': grasaDeseada,
                'fecha-prospecto': fechaProspecto,
                'fecha-cliente': fechaCliente,
                canal,
                'numero-expediente': numeroExpediente,
                'numero-cliente': numeroCliente,
                plan,
                finalizado: false
            };
            
            try {
                // Insertar el nuevo cliente
                await insertCliente(clienteData);
                
                // Actualizar el prospecto correspondiente
                if (datosAPI.prospecto[prospectoId]) {
                    // Además de actualizar el número de cliente, asegurarse que contactado=true
                    datosAPI.prospecto[prospectoId]['numero-cliente'] = numeroCliente;
                    datosAPI.prospecto[prospectoId]['contactado'] = "true"; // Asegurar que sea string
                    
                    // Marcar como modificado para guardarse en la API
                    prospectosModificados[prospectoId] = true;
                    
                    // Guardar inmediatamente el prospecto actualizado
                    saveDataToAPI()
                        .then(() => {
                            console.log('Prospecto actualizado con número de cliente');
                        })
                        .catch(error => {
                            console.error('Error al actualizar prospecto:', error);
                        });
                }
                
                // Cerrar el modal y mostrar mensaje
                closeClientFormModal();
                showToast(`Cliente <strong>${nombre || 'Nuevo cliente'}</strong> generado correctamente.`);
            } catch (error) {
                console.error('Error al generar cliente:', error);
                showToast('Error al generar cliente. Por favor, intente nuevamente.');
            }
        });
        
        // Función para cerrar el modal
        function closeClientFormModal() {
            const modal = document.getElementById('clientFormModal');
            if (modal) {
                modal.remove();
            }
        }
    }

    // Implementar la función para insertar cliente
    async function insertCliente(clientData) {
        try {
            // Mostrar overlay de carga
            loadingOverlay.style.display = 'flex';
            
            // Generar ID único para el cliente con formato CC + fecha y hora actual
            const now = new Date();
            const idPart = `CC${now.getDate().toString().padStart(2, '0')}${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}${now.getFullYear()}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            
            // Asignar el ID generado
            clientData['id-contacto'] = idPart;
            
            // Convertir finalizado a string "false"
            clientData.finalizado = "false";
            
            // Agregar timestamp para evitar caché
            const uniqueParam = new Date().getTime();
            const urlWithParams = `${API_URL}?timestamp=${uniqueParam}`;
            
            const dataToSend = {
                action: 'insertcliente',
                data: {
                    cliente: clientData
                }
            };
            
            // Log para verificar los datos que se están enviando
            console.log('Datos de cliente a enviar:', dataToSend);
            
            // Enviar datos
            await fetch(urlWithParams, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            // Ocultar overlay
            loadingOverlay.style.display = 'none';
            
            // Retornar éxito (no podemos verificar la respuesta en modo no-cors)
            return { success: true, clientId: idPart };
        } catch (error) {
            // Ocultar overlay en caso de error
            loadingOverlay.style.display = 'none';
            console.error('Error al insertar cliente:', error);
            throw error;
        }
    }
}); 