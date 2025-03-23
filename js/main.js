// Variables globales para los datos
let datosAPI = null;
let prospectosArray = []; // Declaración global de prospectosArray

// Variable global para la URL de la API - ACTUALIZADA
const API_URL = 'https://script.google.com/macros/s/AKfycbzgPrxGlctWVNokR1ydEwgJjVG2LmPSOs8vU59H2jG7iahKxxrl_zOfHGo43rNUS1gq0g/exec';
// Si fuera necesario, se puede agregar un console.log para depurar las llamadas API
console.log('API_URL actualizado a:', API_URL);

// Variable global para rastrear los cambios
let prospectosModificados = {}; 

// Variable global para rastrear cambios en clientes
let clientesModificados = {};

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

// Agregar estilos para el campo de búsqueda mejorado
const searchFieldStyle = document.createElement('style');
searchFieldStyle.textContent = `
    .table-controls {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
    }
    
    .search-container {
        position: relative;
        width: 300px;
    }
    
    .search-container i {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #777;
    }
    
    #searchClientInput {
        width: 100%;
        padding: 10px 10px 10px 40px;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: all 0.3s ease;
        font-size: 14px;
    }
    
    #searchClientInput:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
        outline: none;
    }
`;
document.head.appendChild(searchFieldStyle);

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
    
    // Estas funciones deberían estar en scope global, fuera de cualquier otra función

    // Validación de teléfono (10 dígitos)
    function validatePhone(phone) {
        return /^\d{10}$/.test(phone);
    }

    // Validación de email
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Cargar Clientes con la estructura actualizada
    function loadClientsContent() {
        let clientesRows = '';
        
        if (datosAPI && datosAPI.contactosClientes) {
            // Convertir objeto a array
            const clientesArray = Object.values(datosAPI.contactosClientes);
            
            // Generar filas de la tabla
            clientesArray.forEach(cliente => {
                // Formatear fecha de cliente
                let fechaCliente = 'N/A';
                if (cliente['fecha-cliente']) {
                    try {
                        // Verificar si la fecha ya está en formato DD/MM/YYYY o si es formato ISO
                        if (cliente['fecha-cliente'].includes('T')) {
                            // Es formato ISO, convertir a DD/MM/YYYY
                            const fecha = new Date(cliente['fecha-cliente']);
                            fechaCliente = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
                        } else if (cliente['fecha-cliente'].includes('/')) {
                            // Ya está en formato DD/MM/YYYY, posiblemente con hora
                            const fechaParts = cliente['fecha-cliente'].split(' ')[0].split('/');
                            if (fechaParts.length === 3) {
                                fechaCliente = `${fechaParts[0]}/${fechaParts[1]}/${fechaParts[2]}`;
                            } else {
                                fechaCliente = cliente['fecha-cliente'].split(' ')[0];
                            }
                        } else {
                            fechaCliente = cliente['fecha-cliente'];
                        }
                    } catch (e) {
                        console.error('Error al formatear fecha cliente:', e);
                        fechaCliente = cliente['fecha-cliente'];
                    }
                }
                
                clientesRows += `
                    <tr data-cliente-id="${cliente['id-contacto']}">
                        <td>
                            <input type="text" class="editable-field cliente-field" style="min-width: 180px;" value="${cliente.nombre || ''}" data-field="nombre">
                        </td>
                        <td>
                            <input type="tel" class="editable-field cliente-field" value="${cliente.telefono || ''}" data-field="telefono" maxlength="10" pattern="\\d{10}" inputmode="numeric">
                        </td>
                        <td>
                            <input type="email" class="editable-field cliente-field" value="${cliente.email || ''}" data-field="email">
                        </td>
                        <td>${fechaCliente}</td>
                        <td>${cliente['numero-cliente'] || 'N/A'}</td>
                        <td>${cliente['numero-expediente'] || 'N/A'}</td>
                        <td>
                            <div class="checkbox-center">
                                <input type="checkbox" class="custom-checkbox cliente-field" data-field="finalizado" ${cliente.finalizado === "true" ? 'checked' : ''}>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary detalle-btn" data-id="${cliente['id-contacto']}">
                                <i class="fas fa-info-circle"></i> Detalle
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        // Si no hay clientes, mostrar mensaje
        if (!clientesRows) {
            clientesRows = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px;">No hay clientes registrados</td>
                </tr>
            `;
        }
        
        screenContent.innerHTML = `
            <div class="table-controls">
                <div class="search-container">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchClientInput" placeholder="Buscar cliente...">
                </div>
            </div>
            <div class="data-table-container">
                <div class="table-header">
                    <h3>Listado de Clientes</h3>
                </div>
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Fecha Cliente</th>
                                <th>N° Cliente</th>
                                <th>N° Expediente</th>
                                <th>Finalizado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="clientesTableBody">
                            ${clientesRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Asignar eventos a los campos editables
        const editableFields = document.querySelectorAll('.cliente-field');
        editableFields.forEach(field => {
            field.addEventListener('change', function() {
                const clienteId = this.closest('tr').getAttribute('data-cliente-id');
                const fieldName = this.getAttribute('data-field');
                let value = this.value;
                
                // Manejar checkboxes
                if (this.type === 'checkbox') {
                    value = this.checked ? "true" : "false";
                    console.log(`Checkbox ${fieldName} cambiado a: ${value}`);
                }
                
                // Validar según el tipo de campo
                let isValid = true;
                let errorMessage = '';
                
                switch(fieldName) {
                    case 'telefono':
                        isValid = validatePhone(value);
                        errorMessage = 'Teléfono debe tener 10 dígitos';
                        value = value.replace(/\D/g, ''); // Eliminar no-dígitos
                        break;
                    case 'email':
                        isValid = validateEmail(value);
                        errorMessage = 'Email no válido';
                        break;
                }
                
                // Eliminar mensajes de error anteriores
                const existingError = this.parentNode.querySelector('.field-error');
                if (existingError) existingError.remove();
                
                // Manejar estado de validación
                if (isValid) {
                    this.classList.remove('invalid');
                    
                    // Actualizar en el objeto de datos
                    if (datosAPI.contactosClientes[clienteId]) {
                        datosAPI.contactosClientes[clienteId][fieldName] = value;
                        
                        // Registrar que este cliente ha sido modificado
                        clientesModificados[clienteId] = true;
                        
                        console.log('Cliente campo actualizado:', clienteId, fieldName, value);
                    }
                } else {
                    this.classList.add('invalid');
                    
                    // Mostrar mensaje de error
                    const errorElement = document.createElement('div');
                    errorElement.className = 'field-error';
                    errorElement.textContent = errorMessage;
                    this.parentNode.appendChild(errorElement);
                }
            });
        });
        
        // Asignar eventos a los botones de detalle
        const detalleBtns = document.querySelectorAll('.detalle-btn');
        detalleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const clienteId = this.getAttribute('data-id');
                if (clienteId && datosAPI.contactosClientes[clienteId]) {
                    mostrarDetalleCliente(datosAPI.contactosClientes[clienteId]);
                }
            });
        });
        
        // Agregar funcionalidad de búsqueda
        const searchClientInput = document.getElementById('searchClientInput');
        if (searchClientInput) {
            searchClientInput.addEventListener('input', function() {
                filterClientesTable(this.value.toLowerCase());
            });
        }
    }

    // Función para mostrar el modal con los detalles del cliente (editable)
    function mostrarDetalleCliente(cliente) {
        // Eliminar modal anterior si existe
        const prevModal = document.getElementById('detalleClienteModal');
        if (prevModal) {
            prevModal.remove();
        }
        
        // Formatear fechas para mejor visualización
        let fechaNacimiento = cliente['fecha-nacimiento'] || '';
        // Convertir la fecha de nacimiento si está en formato ISO
        if (fechaNacimiento.includes('T')) {
            try {
                const fecha = new Date(fechaNacimiento);
                fechaNacimiento = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
            } catch (e) {
                console.error('Error al formatear fecha nacimiento:', e);
            }
        }
        
        // Formatear otras fechas para visualización
        let fechaProspecto = 'N/A';
        if (cliente['fecha-prospecto']) {
            try {
                if (cliente['fecha-prospecto'].includes('T')) {
                    const fecha = new Date(cliente['fecha-prospecto']);
                    fechaProspecto = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
                } else {
                    fechaProspecto = cliente['fecha-prospecto'].split(' ')[0];
                }
            } catch (e) {
                fechaProspecto = cliente['fecha-prospecto'];
            }
        }
        
        let fechaCliente = 'N/A';
        if (cliente['fecha-cliente']) {
            try {
                if (cliente['fecha-cliente'].includes('T')) {
                    const fecha = new Date(cliente['fecha-cliente']);
                    fechaCliente = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
                } else {
                    fechaCliente = cliente['fecha-cliente'].split(' ')[0];
                }
            } catch (e) {
                fechaCliente = cliente['fecha-cliente'];
            }
        }
        
        // Crear estructura del modal
        const modalHTML = `
            <div class="modal-overlay active" id="detalleClienteModal">
                <div class="modal client-modal">
                    <div class="modal-header">
                        <h3>Detalles del Cliente</h3>
                        <button class="modal-close" id="closeDetalleModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
                        <form id="detalleClienteForm">
                            <input type="hidden" id="detalleClienteId" value="${cliente['id-contacto']}">
                            
                            <h4>Información Personal</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_nombre">Nombre:</label>
                                    <input type="text" id="detalle_nombre" class="detalle-editable" data-field="nombre" value="${cliente.nombre || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="detalle_telefono">Teléfono:</label>
                                    <input type="tel" id="detalle_telefono" class="detalle-editable" data-field="telefono" value="${cliente.telefono || ''}" 
                                           maxlength="10" pattern="\\d{10}" inputmode="numeric" 
                                           oninput="this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10)">
                                    <div class="field-info">10 dígitos numéricos</div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_email">Email:</label>
                                    <input type="email" id="detalle_email" class="detalle-editable" data-field="email" value="${cliente.email || ''}">
                                    <div class="field-info">Formato: ejemplo@dominio.com</div>
                                </div>
                                <div class="form-group">
                                    <label for="detalle_fecha_nacimiento">Fecha de Nacimiento (DD/MM/YYYY):</label>
                                    <input type="text" id="detalle_fecha_nacimiento" class="detalle-editable" data-field="fecha-nacimiento" value="${fechaNacimiento}" placeholder="DD/MM/YYYY">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_genero">Género:</label>
                                    <select id="detalle_genero" class="detalle-editable" data-field="genero">
                                        <option value="" ${!cliente.genero ? 'selected' : ''}>Seleccionar</option>
                                        <option value="masculino" ${cliente.genero === 'masculino' ? 'selected' : ''}>Masculino</option>
                                        <option value="femenino" ${cliente.genero === 'femenino' ? 'selected' : ''}>Femenino</option>
                                        <option value="otro" ${cliente.genero === 'otro' ? 'selected' : ''}>Otro</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="detalle_ubicacion">Ubicación:</label>
                                    <input type="text" id="detalle_ubicacion" class="detalle-editable" data-field="ubicacion" value="${cliente.ubicacion || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_canal">Canal:</label>
                                    <select id="detalle_canal" class="detalle-editable" data-field="canal">
                                        <option value="" ${!cliente.canal ? 'selected' : ''}>Seleccionar</option>
                                        <option value="instagram" ${cliente.canal === 'instagram' ? 'selected' : ''}>Instagram</option>
                                        <option value="facebook" ${cliente.canal === 'facebook' ? 'selected' : ''}>Facebook</option>
                                        <option value="tiktok" ${cliente.canal === 'tiktok' ? 'selected' : ''}>TikTok</option>
                                        <option value="youtube" ${cliente.canal === 'youtube' ? 'selected' : ''}>YouTube</option>
                                        <option value="twitter" ${cliente.canal === 'twitter' ? 'selected' : ''}>Twitter</option>
                                        <option value="otro" ${cliente.canal === 'otro' ? 'selected' : ''}>Otro</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="detalle_plan">Plan:</label>
                                    <select id="detalle_plan" class="detalle-editable" data-field="plan">
                                        <option value="" ${!cliente.plan ? 'selected' : ''}>Seleccionar plan</option>
                                        ${[1,2,3,4,5,6,7,8,9,10].map(num => 
                                            `<option value="Plan ${num}" ${cliente.plan === `Plan ${num}` ? 'selected' : ''}>Plan ${num}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <h4>Información Física</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_peso_inicial">Peso Inicial (kg):</label>
                                    <input type="number" id="detalle_peso_inicial" class="detalle-editable" data-field="peso-inicial" step="0.1" value="${cliente['peso-inicial'] || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="detalle_peso_deseado">Peso Deseado (kg):</label>
                                    <input type="number" id="detalle_peso_deseado" class="detalle-editable" data-field="peso-deseado" step="0.1" value="${cliente['peso-deseado'] || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_grasa_inicial">Grasa Inicial (%):</label>
                                    <input type="number" id="detalle_grasa_inicial" class="detalle-editable" data-field="grasa-inicial" step="0.1" value="${cliente['grasa-inicial'] || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="detalle_grasa_deseada">Grasa Deseada (%):</label>
                                    <input type="number" id="detalle_grasa_deseada" class="detalle-editable" data-field="grasa-deseada" step="0.1" value="${cliente['grasa-deseada'] || ''}">
                                </div>
                            </div>
                            
                            <h4>Información de Registro</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_fecha_prospecto">Fecha de Prospecto:</label>
                                    <input type="text" id="detalle_fecha_prospecto" value="${fechaProspecto}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="detalle_fecha_cliente">Fecha de Cliente:</label>
                                    <input type="text" id="detalle_fecha_cliente" value="${fechaCliente}" readonly>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_numero_cliente">Número de Cliente:</label>
                                    <input type="text" id="detalle_numero_cliente" value="${cliente['numero-cliente'] || 'N/A'}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="detalle_numero_expediente">Número de Expediente:</label>
                                    <input type="text" id="detalle_numero_expediente" value="${cliente['numero-expediente'] || 'N/A'}" readonly>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="detalle_finalizado">Finalizado:</label>
                                    <div class="checkbox-center" style="justify-content: flex-start;">
                                        <input type="checkbox" id="detalle_finalizado" class="custom-checkbox detalle-editable" data-field="finalizado" ${cliente.finalizado === "true" ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>ID de Contacto:</label>
                                    <input type="text" value="${cliente['id-contacto'] || 'N/A'}" readonly>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelDetalleBtn">Cancelar</button>
                        <button class="btn btn-primary" id="guardarDetalleBtn">Guardar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Asignar eventos a campos editables del detalle
        const detalleEditables = document.querySelectorAll('.detalle-editable');
        detalleEditables.forEach(field => {
            field.addEventListener('change', function() {
                // Identificar este formulario como modificado para la validación posterior
                field.classList.add('modified');
            });
        });
        
        // Agregar eventos para los botones
        document.getElementById('closeDetalleModal').addEventListener('click', cerrarDetalleModal);
        document.getElementById('cancelDetalleBtn').addEventListener('click', cerrarDetalleModal);
        document.getElementById('guardarDetalleBtn').addEventListener('click', guardarDetalleCliente);
        
        function guardarDetalleCliente() {
            const clienteId = document.getElementById('detalleClienteId').value;
            if (!clienteId || !datosAPI.contactosClientes[clienteId]) {
                showToast('Error: Cliente no encontrado');
                return;
            }
            
            // Obtener referencia al cliente original para las propiedades de solo lectura
            const clienteOriginal = datosAPI.contactosClientes[clienteId];
            
            // Recopilar todos los datos del cliente
            const clienteData = {
                'id-contacto': clienteId,
                'nombre': document.getElementById('detalle_nombre').value,
                'telefono': document.getElementById('detalle_telefono').value,
                'email': document.getElementById('detalle_email').value,
                'fecha-nacimiento': document.getElementById('detalle_fecha_nacimiento').value,
                'genero': document.getElementById('detalle_genero').value,
                'ubicacion': document.getElementById('detalle_ubicacion').value,
                'canal': document.getElementById('detalle_canal').value,
                'plan': document.getElementById('detalle_plan').value,
                'peso-inicial': document.getElementById('detalle_peso_inicial').value,
                'peso-deseado': document.getElementById('detalle_peso_deseado').value,
                'grasa-inicial': document.getElementById('detalle_grasa_inicial').value,
                'grasa-deseada': document.getElementById('detalle_grasa_deseada').value,
                'finalizado': document.getElementById('detalle_finalizado').checked ? "true" : "false",
                // Mantener los campos de solo lectura
                'fecha-prospecto': clienteOriginal['fecha-prospecto'],
                'fecha-cliente': clienteOriginal['fecha-cliente'],
                'numero-cliente': clienteOriginal['numero-cliente'],
                'numero-expediente': clienteOriginal['numero-expediente']
            };
            
            // Validar los campos
            let isValid = true;
            
            // Eliminar todos los mensajes de error existentes
            document.querySelectorAll('.field-error').forEach(el => el.remove());
            
            // Validar teléfono
            const telefonoEl = document.getElementById('detalle_telefono');
            if (clienteData.telefono && !validatePhone(clienteData.telefono)) {
                telefonoEl.classList.add('invalid');
                const errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                errorEl.textContent = 'El teléfono debe tener 10 dígitos';
                telefonoEl.parentNode.appendChild(errorEl);
                isValid = false;
            } else {
                telefonoEl.classList.remove('invalid');
            }
            
            // Validar email
            const emailEl = document.getElementById('detalle_email');
            if (clienteData.email && !validateEmail(clienteData.email)) {
                emailEl.classList.add('invalid');
                const errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                errorEl.textContent = 'El email no es válido';
                emailEl.parentNode.appendChild(errorEl);
                isValid = false;
            } else {
                emailEl.classList.remove('invalid');
            }
            
            if (!isValid) {
                showToast('Por favor corrija los campos inválidos');
                return;
            }
            
            // Mostrar overlay de carga
            loadingOverlay.style.display = 'flex';
            
            // Enviar actualización a la API
            updateCliente(clienteData)
                .then(() => {
                    // Cerrar el modal primero
                    cerrarDetalleModal();
                    
                    // Mostrar mensaje
                    showToast('Datos del cliente actualizados correctamente');
                    
                    // Recargar todos los datos desde la API para asegurar sincronización
                    return fetchDatos();
                })
                .then(() => {
                    // Una vez que los datos se han recargado, actualizar la vista
                    if (screenTitle.textContent === 'Clientes') {
                        loadClientsContent();
                    }
                    
                    // Ocultar overlay de carga
                    loadingOverlay.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error al actualizar cliente:', error);
                    showToast('Error al actualizar cliente. Por favor, intente nuevamente.');
                    loadingOverlay.style.display = 'none';
                });
        }
        
        function cerrarDetalleModal() {
            const modal = document.getElementById('detalleClienteModal');
            if (modal) {
                modal.remove();
            }
        }
    }

    // Función para actualizar un cliente individual
    async function updateCliente(clienteData) {
        try {
            // Mostrar overlay de carga
            loadingOverlay.style.display = 'flex';
            
            // Agregar timestamp para evitar caché
            const uniqueParam = new Date().getTime();
            const urlWithParams = `${API_URL}?timestamp=${uniqueParam}`;
            
            // Modificar el formato de datos para que coincida con lo que espera el servidor
            const dataToSend = {
                action: 'updateclientes',  // El servidor espera 'updateclientes' (plural)
                data: {
                    cliente: clienteData   // El servidor espera un objeto cliente único, no un array
                }
            };
            
            // Log para verificar los datos que se están enviando
            console.log('Datos de cliente a actualizar:', dataToSend);
            
            // Enviar datos
            await fetch(urlWithParams, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            throw error;
        }
    }

    // Función para cargar y mostrar expedientes con filtros mejorados y selección de fecha
    function loadRecordsContent() {
        // Importar Chart.js mediante CDN
        if (!document.getElementById('chartjs-script')) {
            const chartScript = document.createElement('script');
            chartScript.id = 'chartjs-script';
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            document.head.appendChild(chartScript);
        }
        
        // Crear la estructura con filtros mejorados
        screenContent.innerHTML = `
            <div class="filter-controls">
                <div class="filter-section">
                    <div class="filter-group">
                        <label for="clienteNameFilter">Nombre de Cliente:</label>
                        <div class="filter-input-container">
                            <input type="text" id="clienteNameFilter" class="filter-input" placeholder="Buscar cliente...">
                            <i class="fas fa-search search-icon"></i>
                            <div id="clienteNameOptions" class="filter-options"></div>
                        </div>
                    </div>
                    <div class="filter-group">
                        <label for="clienteNumFilter">Número de Cliente:</label>
                        <div class="filter-input-container">
                            <input type="text" id="clienteNumFilter" class="filter-input" placeholder="NMC...">
                            <i class="fas fa-search search-icon"></i>
                            <div id="clienteNumOptions" class="filter-options"></div>
                        </div>
                    </div>
                    <div class="filter-group">
                        <label for="expedienteNumFilter">Número de Expediente:</label>
                        <div class="filter-input-container">
                            <input type="text" id="expedienteNumFilter" class="filter-input" placeholder="EXP...">
                            <i class="fas fa-search search-icon"></i>
                            <div id="expedienteNumOptions" class="filter-options"></div>
                        </div>
                    </div>
                    <div class="filter-group">
                        <label for="fechaRegistroFilter">Fecha de Registro:</label>
                        <div class="filter-input-container">
                            <input type="text" id="fechaRegistroFilter" class="filter-input" placeholder="Seleccione fecha..." readonly>
                            <i class="fas fa-calendar search-icon"></i>
                            <div id="fechaRegistroOptions" class="filter-options"></div>
                        </div>
                    </div>
                    <button id="clearFilters" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Limpiar filtros
                    </button>
                </div>
            </div>
            
            <div class="action-buttons-container">
                <button class="btn btn-primary" id="createExpedienteBtn">
                    <i class="fas fa-plus"></i> Crear Registro
                </button>
                <button class="btn btn-success" id="loadExpedienteBtn" style="display: none;">
                    <i class="fas fa-download"></i> Cargar Registro
                </button>
            </div>
            
            <div class="tabs-container">
                <div class="tabs">
                    <button class="tab-btn active" data-tab="expedientes">Expedientes</button>
                    <button class="tab-btn" data-tab="avance">Avance</button>
                </div>
                
                <div class="tab-content active" id="expedientes-tab">
                    <!-- Ya no es necesario el action-container aquí porque se movió arriba -->
                </div>
                
                <div class="tab-content" id="avance-tab">
                    <div class="avance-container">
                        <h3>Avance del Cliente</h3>
                        <div id="no-expediente-message" class="placeholder-message">
                            Seleccione un expediente para ver el avance
                        </div>
                        <div id="graficos-container" style="display: none;">
                            <div class="grafico-section">
                                <h4>Progreso de Peso</h4>
                                <div class="canvas-container">
                                    <canvas id="peso-chart"></canvas>
                                </div>
                            </div>
                            <div class="grafico-section">
                                <h4>Progreso de Grasa Corporal</h4>
                                <div class="canvas-container">
                                    <canvas id="grasa-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Contenedor para el formulario de registro -->
            <div id="expedienteFormContainer" class="expediente-form-container" style="display: none;">
                <div class="form-header">
                    <h3>Registro de Expediente</h3>
                    <button id="closeExpedienteForm" class="btn btn-icon">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="expedienteForm" class="expediente-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="exp-numero-expediente">Número de Expediente:</label>
                            <input type="text" id="exp-numero-expediente" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label for="exp-fecha-registro">Fecha de Registro:</label>
                            <input type="date" id="exp-fecha-registro" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Información Física</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="exp-peso-inicial">Peso Inicial (kg):</label>
                                <input type="number" step="0.1" id="exp-peso-inicial" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="exp-peso-deseado">Peso Deseado (kg):</label>
                                <input type="number" step="0.1" id="exp-peso-deseado" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="exp-peso-actual">Peso Actual (kg):</label>
                                <input type="number" step="0.1" id="exp-peso-actual" class="form-control">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="exp-grasa-inicial">Grasa Inicial (%):</label>
                                <input type="number" step="0.1" id="exp-grasa-inicial" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="exp-grasa-deseada">Grasa Deseada (%):</label>
                                <input type="number" step="0.1" id="exp-grasa-deseada" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="exp-grasa-actual">Grasa Actual (%):</label>
                                <input type="number" step="0.1" id="exp-grasa-actual" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Información de Entrenamiento</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="exp-dias-entrenamiento">Días de Entrenamiento:</label>
                                <select id="exp-dias-entrenamiento" class="form-control">
                                    <option value="">Seleccionar</option>
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
                                <label for="exp-horas-entrenamiento">Horas de Entrenamiento:</label>
                                <select id="exp-horas-entrenamiento" class="form-control">
                                    <option value="">Seleccionar</option>
                                    <option value="0.5">30 minutos</option>
                                    <option value="1">1 hora</option>
                                    <option value="1.5">1 hora 30 minutos</option>
                                    <option value="2">2 horas</option>
                                    <option value="2.5">2 horas 30 minutos</option>
                                    <option value="3">3 horas</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="exp-nivel">Nivel:</label>
                                <select id="exp-nivel" class="form-control">
                                    <option value="">Seleccionar</option>
                                    <option value="Principiante">Principiante</option>
                                    <option value="Intermedio">Intermedio</option>
                                    <option value="Avanzado">Avanzado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="exp-disciplina">Disciplina (selección múltiple):</label>
                                <div class="checkbox-group">
                                    <div class="checkbox-item">
                                        <input type="checkbox" id="disciplina-musculacion" class="disciplina-checkbox" value="Musculación">
                                        <label for="disciplina-musculacion">Musculación</label>
                                    </div>
                                    <div class="checkbox-item">
                                        <input type="checkbox" id="disciplina-cardio" class="disciplina-checkbox" value="Cardio">
                                        <label for="disciplina-cardio">Cardio</label>
                                    </div>
                                    <div class="checkbox-item">
                                        <input type="checkbox" id="disciplina-crossfit" class="disciplina-checkbox" value="CrossFit">
                                        <label for="disciplina-crossfit">CrossFit</label>
                                    </div>
                                    <div class="checkbox-item">
                                        <input type="checkbox" id="disciplina-funcional" class="disciplina-checkbox" value="Funcional">
                                        <label for="disciplina-funcional">Entrenamiento Funcional</label>
                                    </div>
                                    <div class="checkbox-item">
                                        <input type="checkbox" id="disciplina-mixto" class="disciplina-checkbox" value="Mixto">
                                        <label for="disciplina-mixto">Mixto</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Información Adicional</h4>
                        <div class="form-group">
                            <label for="exp-objetivo">Objetivo (selección múltiple):</label>
                            <div class="checkbox-group">
                                <div class="checkbox-item">
                                    <input type="checkbox" id="objetivo-perdida" class="objetivo-checkbox" value="Pérdida de peso">
                                    <label for="objetivo-perdida">Pérdida de peso</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="objetivo-ganancia" class="objetivo-checkbox" value="Ganancia muscular">
                                    <label for="objetivo-ganancia">Ganancia muscular</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="objetivo-tonificacion" class="objetivo-checkbox" value="Tonificación">
                                    <label for="objetivo-tonificacion">Tonificación</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="objetivo-definicion" class="objetivo-checkbox" value="Definición">
                                    <label for="objetivo-definicion">Definición</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="objetivo-mantenimiento" class="objetivo-checkbox" value="Mantenimiento">
                                    <label for="objetivo-mantenimiento">Mantenimiento</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox" id="objetivo-rendimiento" class="objetivo-checkbox" value="Rendimiento deportivo">
                                    <label for="objetivo-rendimiento">Rendimiento deportivo</label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="exp-condiciones-medicas">Condiciones Médicas:</label>
                            <textarea id="exp-condiciones-medicas" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="cancelExpedienteBtn" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" id="saveExpedienteBtn" class="btn btn-primary">Guardar Registro</button>
                    </div>
                </form>
            </div>
        `;
        
        // Añadir estilos para los gráficos y botones
        const chartStyles = document.createElement('style');
        chartStyles.textContent = `
            .grafico-section {
                margin-bottom: 30px;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .grafico-section h4 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #333;
                font-size: 18px;
            }
            
            .canvas-container {
                height: 300px;
                position: relative;
            }
            
            #graficos-container {
                margin-top: 20px;
            }
            
            .action-buttons-container {
                display: flex;
                gap: 10px;
                margin: 15px 0;
            }
        `;
        document.head.appendChild(chartStyles);
        
        // Agregar estilos para el resto de elementos
        const recordsStylesElement = document.createElement('style');
        recordsStylesElement.textContent = `
            .filter-controls {
                margin-bottom: 20px;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .filter-section {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                align-items: flex-end;
            }
            
            .filter-group {
                flex: 1;
                min-width: 200px;
                position: relative;
            }
            
            .filter-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #444;
                font-size: 14px;
            }
            
            .filter-input-container {
                position: relative;
            }
            
            .filter-input {
                width: 100%;
                padding: 10px 35px 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .filter-input:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
                outline: none;
            }
            
            .search-icon {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #777;
                pointer-events: none;
            }
            
            .filter-options {
                position: absolute;
                width: 100%;
                max-height: 200px;
                overflow-y: auto;
                background: white;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 4px 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                z-index: 10;
                display: none;
            }
            
            .option-item {
                padding: 8px 12px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .option-item:hover, .option-item.selected {
                background: #f0f0f0;
            }
            
            /* Estilos para las pestañas */
            .tabs-container {
                margin-bottom: 20px;
            }
            
            .tabs {
                display: flex;
                border-bottom: 1px solid #ddd;
                margin-bottom: 15px;
            }
            
            .tab-btn {
                padding: 10px 20px;
                border: none;
                background: none;
                cursor: pointer;
                font-weight: 500;
                color: #666;
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
            }
            
            .tab-btn.active {
                color: var(--primary-color);
                border-bottom-color: var(--primary-color);
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .placeholder-message {
                text-align: center;
                padding: 30px;
                color: #888;
                font-style: italic;
            }
            
            /* Estilos para el formulario de expediente */
            .expediente-form-container {
                margin-top: 20px;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .form-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .expediente-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .form-section {
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 6px;
                background: #fafafa;
            }
            
            .form-section h4 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #444;
                font-size: 16px;
            }
            
            .form-row {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .form-group {
                flex: 1;
                min-width: 200px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                font-size: 14px;
                color: #555;
            }
            
            .form-control {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                transition: border 0.3s;
            }
            
            .form-control:focus {
                border-color: var(--primary-color);
                outline: none;
            }
            
            textarea.form-control {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            
            /* Estilos para checkboxes */
            .checkbox-group {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .checkbox-item {
                display: flex;
                align-items: center;
                min-width: 150px;
                margin-bottom: 5px;
            }
            
            .checkbox-item input[type="checkbox"] {
                margin-right: 5px;
            }
        `;
        document.head.appendChild(recordsStylesElement);
        
        // Crear la nueva URL de la API
        const API_URL = "https://script.google.com/macros/s/AKfycbwfGB6ZTG0I3tff4o4z6LZG76eML2C4hXJaosGcD88tdfGRdi8YZ2GKpFFUk1V8H-Eb/exec";

        // Obtener referencias a los elementos (declarar las variables solo una vez)
        const clienteNameFilter = document.getElementById('clienteNameFilter');
        const clienteNumFilter = document.getElementById('clienteNumFilter');
        const expedienteNumFilter = document.getElementById('expedienteNumFilter');
        const fechaRegistroFilter = document.getElementById('fechaRegistroFilter');
        const clearFiltersBtn = document.getElementById('clearFilters');
        const createExpedienteBtn = document.getElementById('createExpedienteBtn');
        const loadExpedienteBtn = document.getElementById('loadExpedienteBtn');
        const updateExpedienteBtn = document.getElementById('updateExpedienteBtn');
        
        // Referencias para tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const expedienteFormContainer = document.getElementById('expedienteFormContainer');
        const closeExpedienteForm = document.getElementById('closeExpedienteForm');
        const cancelExpedienteBtn = document.getElementById('cancelExpedienteBtn');
        
        // Verificar si existen los elementos antes de usar addEventListener
        if (fechaRegistroFilter) {
            fechaRegistroFilter.addEventListener('click', function() {
                updateFechaOptions();
            });
        } else {
            console.warn('fechaRegistroFilter no encontrado');
        }
        
        // Opciones de filtros
        const clienteNameOptions = document.getElementById('clienteNameOptions');
        const clienteNumOptions = document.getElementById('clienteNumOptions');
        const expedienteNumOptions = document.getElementById('expedienteNumOptions');
        const fechaRegistroOptions = document.getElementById('fechaRegistroOptions');

        // Crear arrays con los datos de clientes
        let clientesArray = [];
        
        if (datosAPI && datosAPI.contactosClientes) {
            clientesArray = Object.values(datosAPI.contactosClientes);
        }

        // Extraer los expedientes directamente de los clientes
        const expedientesArray = clientesArray.filter(cliente => 
            cliente['numero-expediente'] && cliente['numero-expediente'].trim() !== ''
        );

        // Función para manejar cambio de tabs
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover clase active de todos los botones y contenidos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Añadir clase active al botón seleccionado y su contenido
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });

        // Función auxiliar para encontrar un cliente por su número
        function findClienteByNumero(numeroCliente) {
            if (!numeroCliente) return null;
            return clientesArray.find(cliente => cliente['numero-cliente'] === numeroCliente);
        }

        // Función auxiliar para encontrar un expediente por su número
        function findExpedienteByNumero(numeroExpediente) {
            if (!numeroExpediente) return null;
            return clientesArray.find(cliente => cliente['numero-expediente'] === numeroExpediente);
        }

        // Función para mostrar opciones desplegables para cada filtro
        function showOptions(filterInput, optionsContainer, items, valueField, displayField, onSelect) {
            optionsContainer.innerHTML = '';
            
            // Si no hay elementos, mostrar mensaje
            if (items.length === 0) {
                const noResultItem = document.createElement('div');
                noResultItem.className = 'option-item';
                noResultItem.textContent = 'No hay opciones disponibles';
                optionsContainer.appendChild(noResultItem);
                optionsContainer.style.display = 'block';
                return;
            }
            
            // Crear un elemento para cada opción
            items.forEach(item => {
                const optionItem = document.createElement('div');
                optionItem.className = 'option-item';
                optionItem.textContent = item[displayField] || item[valueField] || 'Sin valor';
                optionItem.addEventListener('click', () => {
                    filterInput.value = item[displayField] || item[valueField] || '';
                    onSelect(item);
                    optionsContainer.style.display = 'none';
                });
                
                optionsContainer.appendChild(optionItem);
            });
            
            optionsContainer.style.display = 'block';
        }

        // Función para filtrar opciones según el texto ingresado
        function filterOptions(filterText, items, filterField) {
            if (!filterText) return items;
            
            return items.filter(item => {
                const fieldValue = item[filterField] || '';
                return fieldValue.toString().toLowerCase().includes(filterText.toLowerCase());
            });
        }

        // Función para llenar el formulario con datos del cliente
        function fillExpedienteForm(expediente) {
            console.log('Llenando formulario con datos del expediente:', expediente);
            
            // Función auxiliar para establecer valores de forma segura
            function setElementValue(id, value) {
                console.log(`Intentando establecer valor para campo con ID: ${id}, valor: ${value}`);
                const element = document.getElementById(id);
                if (element) {
                    if (value === undefined || value === null) {
                        element.value = '';
                    } else {
                        // Convertir diferentes tipos de datos a string para mostrar en el input
                        if (typeof value === 'object' && value instanceof Date) {
                            element.value = value.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                        } else {
                            element.value = String(value);
                        }
                    }
                    
                    // Agregar clase visual para indicar que el campo ha sido llenado
                    if (element.value && element.value.trim() !== '') {
                        element.classList.add('filled-field');
                    } else {
                        element.classList.remove('filled-field');
                    }
                    
                    // Disparar evento de cambio para activar cualquier listener que pueda existir
                    const event = new Event('change', { bubbles: true });
                    element.dispatchEvent(event);
                    console.log(`Campo con ID ${id} establecido correctamente con valor: ${element.value}`);
                } else {
                    console.warn(`Elemento con ID '${id}' no encontrado. Buscando alternativas...`);
                    
                    // Intentar encontrar el campo por nombre, placeholder o label cercano
                    const inputsByName = document.getElementsByName(id);
                    if (inputsByName.length > 0) {
                        inputsByName[0].value = value || '';
                        console.log(`Campo encontrado por nombre: ${id}`);
                        return;
                    }
                    
                    // Intentar buscar por otros atributos
                    const possibleSelectors = [
                        `input[placeholder*="${id.replace('exp-', '')}"]`,
                        `input[placeholder*="${id}"]`,
                        `input[data-field="${id}"]`,
                        `input[data-field="${id.replace('exp-', '')}"]`
                    ];
                    
                    for (const selector of possibleSelectors) {
                        const elements = document.querySelectorAll(selector);
                        if (elements.length > 0) {
                            elements[0].value = value || '';
                            console.log(`Campo encontrado por selector: ${selector}`);
                            return;
                        }
                    }
                    
                    // Buscar por labels cercanos
                    const labels = document.querySelectorAll('label');
                    for (const label of labels) {
                        if (label.textContent.toLowerCase().includes(id.replace('exp-', '').replace(/-/g, ' '))) {
                            const input = label.nextElementSibling;
                            if (input && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
                                input.value = value || '';
                                console.log(`Campo encontrado por label: ${label.textContent}`);
                                return;
                            }
                        }
                    }
                }
            }
            
            // Mapeo alternativo de campos para cuando los IDs no son 'exp-XXX'
            const fieldMapping = {
                'exp-numero-expediente': ['numero-expediente', 'expediente'],
                'exp-fecha-registro': ['fecha-registro', 'fecha'],
                'exp-numero-cliente': ['numero-cliente', 'cliente'],
                'exp-nombre-cliente': ['nombre-cliente', 'nombre'],
                'exp-email-cliente': ['email-cliente', 'email'],
                'exp-telefono-cliente': ['telefono-cliente', 'telefono'],
                'exp-dias-entrenamiento': ['dias-entrenamiento', 'dias'],
                'exp-horas-entrenamiento': ['horas-entrenamiento', 'horas'],
                'exp-nivel': ['nivel'],
                'exp-peso-inicial': ['peso-inicial', 'peso_inicial'],
                'exp-peso-actual': ['peso-actual', 'peso_actual'],
                'exp-peso-deseado': ['peso-deseado', 'peso_deseado'],
                'exp-grasa-inicial': ['grasa-inicial', 'grasa_inicial'],
                'exp-grasa-actual': ['grasa-actual', 'grasa_actual'],
                'exp-grasa-deseada': ['grasa-deseada', 'grasa_deseada'],
                'exp-altura': ['altura'],
                'exp-condiciones-medicas': ['condiciones-medicas', 'condiciones']
            };
            
            // Si el expediente es null o undefined, crear uno vacío para evitar errores
            if (!expediente) {
                console.warn('El expediente es null o undefined. Creando un objeto vacío para evitar errores.');
                expediente = {};
            }
            
            // Asegurarse de que todos los campos tengan valores predeterminados
            expediente = {
                // Información básica
                'numero-expediente': '',
                'fecha-registro': new Date().toISOString().split('T')[0],
                
                // Información del cliente
                'numero-cliente': '',
                'nombre-cliente': '',
                'email-cliente': '',
                'telefono-cliente': '',
                
                // Detalles de entrenamiento
                'dias-entrenamiento': '',
                'horas-entrenamiento': '',
                'nivel': '',
                
                // Disciplinas y objetivos
                'disciplina': '',
                'objetivo': '',
                
                // Medidas físicas
                'peso-inicial': '',
                'peso-actual': '',
                'peso-deseado': '',
                'grasa-inicial': '',
                'grasa-actual': '',
                'grasa-deseada': '',
                'altura': '',
                
                // Salud
                'condiciones-medicas': '',
                
                // Si hay un registroActual, fusionarlo con el expediente principal
                ...(expediente.registroActual || {}),
                
                // Sobrescribir con los valores del expediente principal
                ...expediente
            };
            
            // Retirar la referencia circular para evitar problemas
            if (expediente.registroActual) {
                delete expediente.registroActual;
            }
            
            console.log('Expediente procesado para llenar formulario:', expediente);

            // Obtener todos los inputs y selects del formulario visible
            const formInputs = document.querySelectorAll('form input, form select, form textarea');
            console.log('Campos encontrados en el formulario:', formInputs.length);

            // Lista de todos los IDs de elementos en el formulario para depuración
            const formElementIds = Array.from(formInputs).map(el => ({
                id: el.id,
                name: el.name,
                type: el.type,
                placeholder: el.placeholder
            }));
            console.log('IDs de elementos en el formulario:', formElementIds);
            
            // Intentar llenar todos los campos conocidos con sus diversos nombres posibles
            for (const [stdId, alternativeIds] of Object.entries(fieldMapping)) {
                const fieldValue = expediente[stdId.replace('exp-', '')] || 
                                 expediente[stdId] || 
                                 alternativeIds.find(id => expediente[id]);
                
                // Intentar con ID estándar primero
                setElementValue(stdId, fieldValue);
                
                // Intentar con IDs alternativos
                for (const altId of alternativeIds) {
                    setElementValue(altId, fieldValue);
                }
            }

            // Método alternativo: llenar campos por tipo y posición en el formulario
            const typeOrder = {
                'numero-expediente': 0,
                'fecha-registro': 1,
                'peso-inicial': 2,
                'peso-deseado': 3,
                'peso-actual': 4,
                'grasa-inicial': 5,
                'grasa-deseada': 6,
                'grasa-actual': 7
            };
            
            // Agrupar inputs por tipo
            const textInputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
            const dateInputs = Array.from(document.querySelectorAll('input[type="date"]'));
            const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
            
            console.log('Inputs de texto:', textInputs.length);
            console.log('Inputs de fecha:', dateInputs.length);
            console.log('Inputs numéricos:', numberInputs.length);
            
            // Si hay exactamente un input de tipo fecha en el formulario y tenemos fecha-registro
            if (dateInputs.length === 1 && expediente['fecha-registro']) {
                dateInputs[0].value = expediente['fecha-registro'];
                console.log('Fecha de registro establecida en el único input de fecha');
            }
            
            // Si hay un número específico de inputs numéricos, asignarles los valores en orden
            if (numberInputs.length >= 6) {
                // Pesos
                if (expediente['peso-inicial']) numberInputs[0].value = expediente['peso-inicial'];
                if (expediente['peso-deseado']) numberInputs[1].value = expediente['peso-deseado'];
                if (expediente['peso-actual']) numberInputs[2].value = expediente['peso-actual'];
                
                // Grasas
                if (expediente['grasa-inicial']) numberInputs[3].value = expediente['grasa-inicial'];
                if (expediente['grasa-deseada']) numberInputs[4].value = expediente['grasa-deseada'];
                if (expediente['grasa-actual']) numberInputs[5].value = expediente['grasa-actual'];
                
                console.log('Valores numéricos establecidos por posición');
            }
            
            // Notificar que el formulario ha sido completado
            console.log('Formulario llenado correctamente con los datos del expediente');
            
            // Mostrar formulario y contenedor si existen
            const expedienteForm = document.getElementById('expedienteForm');
            const expedienteFormContainer = document.getElementById('expedienteFormContainer');
            
            if (expedienteForm) expedienteForm.style.display = 'block';
            if (expedienteFormContainer) expedienteFormContainer.style.display = 'block';
        }

        // Función para generar un ID de expediente único con el formato requerido
        function generateExpedienteId() {
            const now = new Date();
            const day = now.getDate().toString().padStart(2, '0');
            const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
            const year = now.getFullYear();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            
            return `EXP${day}${month}${year}${hours}${minutes}${seconds}`;
        }

        // Función para insertar un expediente en la API
        async function insertExpediente(expedienteData) {
            try {
                // Mostrar overlay de carga
                loadingOverlay.style.display = 'flex';
                
                // Agregar timestamp para evitar caché
                const uniqueParam = new Date().getTime();
                const urlWithParams = `${API_URL}?timestamp=${uniqueParam}`;
                
                // Modificar el formato de datos para que coincida con lo que espera el servidor
                const dataToSend = {
                    action: 'insertexpediente',
                    data: {
                        expediente: expedienteData
                    }
                };
                
                // Log para verificar los datos que se están enviando
                console.log('Datos de expediente a insertar:', dataToSend);
                
                // Enviar datos
                const response = await fetch(urlWithParams, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });

                // Ocultar overlay de carga después de recibir la respuesta
                loadingOverlay.style.display = 'none';

                return { success: true };
            } catch (error) {
                console.error('Error al insertar expediente:', error);
                
                // Ocultar overlay de carga incluso si hay un error
                loadingOverlay.style.display = 'none';
                
                throw error;
            }
        }

        // Eventos para los campos de filtro
        clienteNameFilter.addEventListener('focus', function() {
            showOptions(
                clienteNameFilter,
                clienteNameOptions,
                clientesArray,
                'nombre',
                'nombre',
                (cliente) => {
                    clienteNumFilter.value = cliente['numero-cliente'] || '';
                    
                    if (cliente['numero-expediente']) {
                        expedienteNumFilter.value = cliente['numero-expediente'] || '';
                    }
                    
                    // Mostrar botón de crear registro
                    if (cliente['numero-cliente'] && cliente['numero-expediente']) {
                        createExpedienteBtn.style.display = 'block';
                    }
                }
            );
        });
        
        clienteNameFilter.addEventListener('input', function() {
            const filteredClientes = filterOptions(this.value, clientesArray, 'nombre');
            showOptions(
                clienteNameFilter,
                clienteNameOptions,
                filteredClientes,
                'nombre',
                'nombre',
                (cliente) => {
                    clienteNumFilter.value = cliente['numero-cliente'] || '';
                    
                    if (cliente['numero-expediente']) {
                        expedienteNumFilter.value = cliente['numero-expediente'] || '';
                    }
                    
                    if (cliente['numero-cliente'] && cliente['numero-expediente']) {
                        createExpedienteBtn.style.display = 'block';
                    }
                }
            );
        });
        
        clienteNumFilter.addEventListener('focus', function() {
            showOptions(
                clienteNumFilter,
                clienteNumOptions,
                clientesArray,
                'numero-cliente',
                'numero-cliente',
                (cliente) => {
                    clienteNameFilter.value = cliente.nombre || '';
                    
                    if (cliente['numero-expediente']) {
                        expedienteNumFilter.value = cliente['numero-expediente'] || '';
                    }
                    
                    if (cliente['numero-cliente'] && cliente['numero-expediente']) {
                        createExpedienteBtn.style.display = 'block';
                    }
                }
            );
        });
        
        expedienteNumFilter.addEventListener('focus', function() {
            showOptions(
                expedienteNumFilter,
                expedienteNumOptions,
                expedientesArray,
                'numero-expediente',
                'numero-expediente',
                (expediente) => {
                    if (expediente['numero-cliente']) {
                        clienteNumFilter.value = expediente['numero-cliente'];
                        
                        const clienteAsociado = findClienteByNumero(expediente['numero-cliente']);
                        if (clienteAsociado) {
                            clienteNameFilter.value = clienteAsociado.nombre || '';
                        }
                    }
                    
                    if (expediente['numero-cliente'] && expediente['numero-expediente']) {
                        createExpedienteBtn.style.display = 'block';
                    }
                }
            );
        });
        
        // Evento para limpiar filtros
        clearFiltersBtn.addEventListener('click', function() {
            clienteNameFilter.value = '';
            clienteNumFilter.value = '';
            expedienteNumFilter.value = '';
            fechaRegistroFilter.value = '';
            
            // Cerrar listas desplegables
            clienteNameOptions.style.display = 'none';
            clienteNumOptions.style.display = 'none';
            expedienteNumOptions.style.display = 'none';
            fechaRegistroOptions.style.display = 'none';
            
            // Ocultar botones y formulario
            createExpedienteBtn.style.display = 'none';
            loadExpedienteBtn.style.display = 'none';
            expedienteFormContainer.style.display = 'none';
        });
        
        // Evento para botón de crear registro
        createExpedienteBtn.addEventListener('click', function() {
            // Verificar que tengamos cliente y expediente seleccionados
            if (!clienteNumFilter.value || !expedienteNumFilter.value) {
                showToast('Debe seleccionar un cliente y un expediente');
                return;
            }
            
            // Obtener datos del cliente para autocompletar
            const cliente = findClienteByNumero(clienteNumFilter.value);
            if (!cliente) {
                showToast('Cliente no encontrado');
                return;
            }
            
            // Llenar el formulario con datos del cliente y mostrarlo
            fillExpedienteForm(cliente);
        });
        
        // Evento para cerrar el formulario
        if (closeExpedienteForm) {
            closeExpedienteForm.addEventListener('click', function() {
                if (expedienteFormContainer) {
                    expedienteFormContainer.style.display = 'none';
                }
                window.formularioActivo = false;
                
                // Restaurar la visibilidad de los botones según el estado
                if (window.expedienteActual) {
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'none';
                    if (updateExpedienteBtn) updateExpedienteBtn.style.display = 'inline-block';
                } else {
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'inline-block';
                    if (updateExpedienteBtn) updateExpedienteBtn.style.display = 'none';
                }
            });
        } else {
            console.warn('closeExpedienteForm no encontrado');
        }
        
        // Evento para el botón cancelar
        if (cancelExpedienteBtn) {
            cancelExpedienteBtn.addEventListener('click', function() {
                if (expedienteFormContainer) {
                    expedienteFormContainer.style.display = 'none';
                }
                window.formularioActivo = false;
                
                // Restaurar la visibilidad de los botones según el estado
                if (window.expedienteActual) {
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'none';
                    if (updateExpedienteBtn) updateExpedienteBtn.style.display = 'inline-block';
                } else {
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'inline-block';
                    if (updateExpedienteBtn) updateExpedienteBtn.style.display = 'none';
                }
            });
        } else {
            console.warn('cancelExpedienteBtn no encontrado');
        }
        
        // Evento para guardar el formulario
        expedienteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obtener valores de los checkboxes de disciplina
            const disciplinaCheckboxes = document.querySelectorAll('.disciplina-checkbox:checked');
            const disciplinas = Array.from(disciplinaCheckboxes).map(cb => cb.value).join(', ');
            
            // Obtener valores de los checkboxes de objetivo
            const objetivoCheckboxes = document.querySelectorAll('.objetivo-checkbox:checked');
            const objetivos = Array.from(objetivoCheckboxes).map(cb => cb.value).join(', ');
            
            // Recopilar datos del formulario
            const expedienteData = {
                'id-expediente': generateExpedienteId(),
                'fecha-registro': document.getElementById('exp-fecha-registro').value,
                'numero-expediente': document.getElementById('exp-numero-expediente').value,
                'numero-cliente': clienteNumFilter.value,
                'peso-inicial': document.getElementById('exp-peso-inicial').value,
                'peso-deseado': document.getElementById('exp-peso-deseado').value,
                'peso-actual': document.getElementById('exp-peso-actual').value,
                'grasa-inicial': document.getElementById('exp-grasa-inicial').value,
                'grasa-deseada': document.getElementById('exp-grasa-deseada').value,
                'grasa-actual': document.getElementById('exp-grasa-actual').value,
                'dias-entrenamiento': document.getElementById('exp-dias-entrenamiento').value,
                'horas-entrenamiento': document.getElementById('exp-horas-entrenamiento').value,
                'nivel': document.getElementById('exp-nivel').value,
                'disciplina': disciplinas,
                'objetivo': objetivos,
                'condiciones-medicas': document.getElementById('exp-condiciones-medicas').value
            };
            
            try {
                // Guardar en la API
                const result = await insertExpediente(expedienteData);
                
                if (result.success) {
                    // Mostrar mensaje de éxito
                    showToast('Expediente guardado con éxito');
                    
                    // Ocultar el formulario
                    if (expedienteFormContainer) {
                        expedienteFormContainer.style.display = 'none';
                    }
                    
                    // Reiniciar formulario
                    expedienteForm.reset();
                    window.formularioActivo = false;
                    window.expedienteActual = null;
                    
                    // Restaurar la visibilidad de los botones
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'inline-block';
                    if (updateExpedienteBtn) updateExpedienteBtn.style.display = 'none';
                    
                    // Limpiar gráficos previos
                    clearCharts();
                    
                    // Recargar los datos para actualizar la información
                    await fetchDatos();
                    
                    // Actualizar las opciones de fecha por si se agregó un nuevo registro
                    updateFechaOptions();
                } else {
                    showToast('Error al guardar el expediente');
                }
            } catch (error) {
                console.error('Error al guardar expediente:', error);
                showToast('Error al guardar el expediente');
            }
        });

        // Función para actualizar las opciones de fecha basadas en el cliente y expediente seleccionados
        function updateFechaOptions() {
            const expedienteNumero = expedienteNumFilter.value;
            
            console.log('updateFechaOptions - Filtros actuales:');
            console.log('Expediente Número:', expedienteNumero);
            console.log('Datos API expedienteClientes:', datosAPI.expedienteClientes);
            
            // Solo proceder a buscar fechas si tenemos el número de expediente
            if (expedienteNumero) {
                // Verificar si datosAPI.expedienteClientes existe y tiene datos
                if (!datosAPI.expedienteClientes || Object.keys(datosAPI.expedienteClientes).length === 0) {
                    console.log('No hay datos de expedientes disponibles');
                    fechaRegistroFilter.value = '';
                    fechaRegistroOptions.innerHTML = '';
                    // Mostrar "Crear Registro" y ocultar "Cargar Registros"
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'inline-block';
                    loadExpedienteBtn.style.display = 'none';
                    return;
                }
                
                // Filtrar los expedientes por número de expediente
                let expedientes = Object.values(datosAPI.expedienteClientes).filter(
                    expediente => {
                        console.log(`Comparando número de expediente: ${expediente['numero-expediente']} con ${expedienteNumero}`);
                        return expediente['numero-expediente'] === expedienteNumero;
                    }
                );
                
                console.log('Expedientes filtrados por número de expediente:', expedientes);
                
                // Extraer las fechas de registro de los expedientes encontrados
                let fechasObjetos = [];
                if (expedientes.length > 0) {
                    // Procesar las fechas en formato "DD/MM/YYYY HH:MM:SS"
                    fechasObjetos = expedientes.map(expediente => {
                        console.log('Procesando fecha de expediente:', expediente);
                        const fechaRegistro = expediente['fecha-registro'] || '';
                        if (!fechaRegistro) {
                            console.log('Expediente sin fecha de registro');
                            return null;
                        }
                        
                        console.log('Fecha original:', fechaRegistro);
                        
                        try {
                            // Si la fecha ya está en formato "DD/MM/YYYY HH:MM:SS"
                            if (fechaRegistro.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                                // Extraer solo la parte de la fecha (DD/MM/YYYY)
                                const fechaFormateada = fechaRegistro.substring(0, 10);
                                console.log(`Usando fecha ya formateada: ${fechaRegistro} -> ${fechaFormateada}`);
                                return { original: fechaRegistro, formateada: fechaFormateada };
                            }
                            
                            // Si es fecha ISO, intentar parsearla
                            const fecha = new Date(fechaRegistro);
                            if (isNaN(fecha.getTime())) {
                                console.log('Fecha inválida, usando formato original:', fechaRegistro);
                                return { original: fechaRegistro, formateada: fechaRegistro };
                            }
                            
                            // Formatear como DD/MM/YYYY
                            const dia = fecha.getDate().toString().padStart(2, '0');
                            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                            const anio = fecha.getFullYear();
                            
                            const fechaFormateada = `${dia}/${mes}/${anio}`;
                            console.log(`Fecha convertida: ${fechaRegistro} -> ${fechaFormateada}`);
                            
                            return { original: fechaRegistro, formateada: fechaFormateada };
                        } catch (error) {
                            console.error('Error al procesar fecha:', error);
                            return { original: fechaRegistro, formateada: fechaRegistro };
                        }
                    }).filter(fecha => fecha !== null);
                }
                
                console.log('Fechas procesadas:', fechasObjetos);
                
                // Mostrar las fechas como opciones seleccionables en el menú desplegable
                showOptions(
                    fechaRegistroFilter,
                    fechaRegistroOptions,
                    fechasObjetos,
                    'original',
                    'formateada',
                    function(fechaObj) {
                        console.log('Fecha seleccionada:', fechaObj);
                        fechaRegistroFilter.value = fechaObj.formateada;
                        fechaRegistroFilter.dataset.originalValue = fechaObj.original;
                        
                        // Habilitar el botón "Cargar Registros" y ocultar "Crear Registro"
                        if (loadExpedienteBtn) loadExpedienteBtn.style.display = 'inline-block';
                        if (createExpedienteBtn) createExpedienteBtn.style.display = 'none';
                    }
                );
                
                // Mostrar botones según si hay fechas disponibles
                if (fechasObjetos.length > 0) {
                    // Si hay fechas, mostrar "Cargar Registros" y ocultar "Crear Registro"
                    if (loadExpedienteBtn) loadExpedienteBtn.style.display = 'inline-block';
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'none';
                } else {
                    // Si no hay fechas, ocultar "Cargar Registros" y mostrar "Crear Registro"
                    if (loadExpedienteBtn) loadExpedienteBtn.style.display = 'none';
                    if (createExpedienteBtn) createExpedienteBtn.style.display = 'inline-block';
                }
            } else {
                // Si no hay número de expediente, limpiar el filtro de fecha y ocultar las opciones
                fechaRegistroFilter.value = '';
                fechaRegistroOptions.innerHTML = '';
                // Mostrar "Crear Registro" y ocultar "Cargar Registros"
                if (createExpedienteBtn) createExpedienteBtn.style.display = 'inline-block';
                if (loadExpedienteBtn) loadExpedienteBtn.style.display = 'none';
            }
        }

        // Función para limpiar los gráficos existentes
        function clearCharts() {
            console.log('Limpiando gráficos existentes');
            
            // Obtener los contenedores de los gráficos
            const weightChartContainer = document.getElementById('weight-chart-container');
            const fatChartContainer = document.getElementById('fat-chart-container');
            
            // Limpiar los contenedores si existen
            if (weightChartContainer) {
                weightChartContainer.innerHTML = '<canvas id="weightChart"></canvas>';
            }
            
            if (fatChartContainer) {
                fatChartContainer.innerHTML = '<canvas id="fatChart"></canvas>';
            }
            
            // Si hay instancias de gráficos anteriores en variables globales, destruirlas
            if (window.weightChart) {
                window.weightChart.destroy();
                window.weightChart = null;
            }
            
            if (window.fatChart) {
                window.fatChart.destroy();
                window.fatChart = null;
            }
            
            console.log('Gráficos limpiados correctamente');
        }

        // Añadir event listeners para los filtros de cliente y expediente
        clienteNumFilter.addEventListener('change', updateFechaOptions);
        clienteNumFilter.addEventListener('input', updateFechaOptions);
        expedienteNumFilter.addEventListener('change', updateFechaOptions);
        expedienteNumFilter.addEventListener('input', updateFechaOptions);
        
        // También llamar a updateFechaOptions cuando se selecciona un nombre de cliente
        clienteNameFilter.addEventListener('change', () => {
            const clienteNombre = clienteNameFilter.value;
            const cliente = clientesArray.find(c => c['nombre'] === clienteNombre);
            if (cliente) {
                clienteNumFilter.value = cliente['numero-cliente'] || '';
                updateFechaOptions();
            }
        });
        
        // Evento para el botón Crear Registro (siempre visible)
        if (createExpedienteBtn) {
            createExpedienteBtn.addEventListener('click', function() {
                // Aquí puede ir la lógica para crear un nuevo registro
                console.log('Creando nuevo registro');
                
                // Limpiar expediente actual
                window.expedienteActual = null;
                
                // Generar un ID para el nuevo expediente (solo para el id interno)
                const nuevoId = generateExpedienteId();
                
                // Obtener datos del cliente desde los filtros
                const clienteNumero = clienteNumFilter ? clienteNumFilter.value || '' : '';
                const clienteNombre = clienteNameFilter ? clienteNameFilter.value || '' : '';
                
                // Buscar información completa del cliente por número
                const clienteInfo = findClienteByNumero(clienteNumero);
                console.log('Información del cliente encontrada:', clienteInfo);
                
                // Fecha actual formateada como YYYY-MM-DD para el input date
                const fechaActual = new Date().toISOString().split('T')[0];
                
                // Obtener el número de expediente correcto (propiedad 'expediente' del cliente o numeración EXP00003)
                // Si no existe, usar el nuevoId generado
                const numeroExpedienteCliente = clienteInfo && clienteInfo['expediente'] ? 
                    clienteInfo['expediente'] : 
                    (clienteInfo && clienteInfo['numero-expediente'] ? clienteInfo['numero-expediente'] : nuevoId);
                
                console.log('Número de expediente a usar:', numeroExpedienteCliente);
                
                // Crear un objeto expediente con la información del cliente encontrado
                const nuevoExpediente = {
                    // Información básica
                    'id-expediente': nuevoId,
                    'numero-expediente': numeroExpedienteCliente, // Usar número de expediente del cliente
                    'fecha-registro': fechaActual, // Siempre usar fecha actual
                    
                    // Información del cliente
                    'numero-cliente': clienteNumero,
                    'nombre-cliente': clienteNombre,
                    'email-cliente': clienteInfo ? clienteInfo['email'] || '' : '',
                    'telefono-cliente': clienteInfo ? clienteInfo['telefono'] || '' : '',
                    
                    // Mapear los campos específicos del cliente para peso y grasa
                    'peso-inicial': clienteInfo ? clienteInfo['peso-inicial'] || '' : '',
                    'peso-actual': '', // Dejar vacío como solicitó el usuario
                    'peso-deseado': clienteInfo ? clienteInfo['peso-deseado'] || '' : '',
                    'grasa-inicial': clienteInfo ? clienteInfo['grasa-inicial'] || '' : '',
                    'grasa-actual': '', // Dejar vacío como solicitó el usuario
                    'grasa-deseada': clienteInfo ? clienteInfo['grasa-deseada'] || '' : '',
                    'altura': clienteInfo ? clienteInfo['altura'] || '' : '',
                    
                    // Detalles de entrenamiento
                    'dias-entrenamiento': clienteInfo ? clienteInfo['dias-entrenamiento'] || '' : '',
                    'horas-entrenamiento': clienteInfo ? clienteInfo['horas-entrenamiento'] || '' : '',
                    'nivel': clienteInfo ? clienteInfo['nivel'] || '' : '',
                    
                    // Disciplinas y objetivos
                    'disciplina': clienteInfo ? clienteInfo['disciplina'] || '' : '',
                    'objetivo': clienteInfo ? clienteInfo['objetivo'] || '' : '',
                    
                    // Condiciones médicas
                    'condiciones-medicas': clienteInfo ? clienteInfo['condiciones-medicas'] || '' : ''
                };
                
                console.log('Nuevo expediente creado con los datos correctos del cliente:', nuevoExpediente);
                
                // Cambiar a la pestaña de Expedientes si no estamos en ella
                const expedientesTab = document.querySelector('.tab-btn[data-tab="expedientes"]');
                if (expedientesTab && !expedientesTab.classList.contains('active')) {
                    expedientesTab.click();
                }
                
                // Cambiar la visibilidad de los botones
                if (createExpedienteBtn) {
                    createExpedienteBtn.style.display = 'inline-block';
                }
                
                // Verificar que updateExpedienteBtn existe antes de intentar acceder a su propiedad style
                if (updateExpedienteBtn) {
                    updateExpedienteBtn.style.display = 'none';
                } else {
                    console.warn('updateExpedienteBtn no encontrado');
                }
                
                // Mostrar el formulario con los datos completos
                fillExpedienteForm(nuevoExpediente);
                
                // Verificar que expedienteFormContainer existe antes de manipularlo
                if (expedienteFormContainer) {
                    expedienteFormContainer.style.display = 'block';
                    
                    // Hacer scroll hacia el formulario para asegurar que sea visible (solo si existe)
                    expedienteFormContainer.scrollIntoView({ behavior: 'smooth' });
                } else {
                    console.warn('expedienteFormContainer no encontrado');
                }
                
                window.formularioActivo = true;
            });
        } else {
            console.warn('createExpedienteBtn no encontrado');
        }

        // Función para crear gráficos de progreso basados en los datos del expediente
        function createProgressCharts(expediente) {
            // Asegurarse de que Chart.js esté cargado
            if (typeof Chart === 'undefined') {
                console.log('Chart.js aún no está cargado, esperando...');
                setTimeout(() => createProgressCharts(expediente), 500);
                return;
            }
            
            console.log('Creando gráficos de tendencias para el expediente:', expediente);
            
            // Mostrar el contenedor de gráficos y ocultar el mensaje
            document.getElementById('no-expediente-message').style.display = 'none';
            document.getElementById('graficos-container').style.display = 'block';
            
            // Obtener todos los registros asociados a este expediente
            const numeroExpediente = expediente['numero-expediente'];
            
            // Buscar todos los registros de este expediente en datosAPI.expedienteClientes
            let registros = Object.values(datosAPI.expedienteClientes || {})
                .filter(exp => exp['numero-expediente'] === numeroExpediente)
                .sort((a, b) => {
                    // Ordenar por fecha de registro
                    const fechaA = new Date(a['fecha-registro'] || 0);
                    const fechaB = new Date(b['fecha-registro'] || 0);
                    return fechaA - fechaB;
                });
            
            console.log('Registros históricos encontrados:', registros);
            
            // Asegurarse de que siempre haya al menos un registro (incluso si está vacío)
            if (registros.length === 0) {
                // Si no hay registros históricos, usar solo los datos actuales
                registros = [expediente];
            }
            
            // Extraer fechas para el eje X
            const fechas = registros.map(registro => {
                let fecha = registro['fecha-registro'];
                
                // Si no hay fecha, usar un placeholder
                if (!fecha) {
                    return 'Sin fecha';
                }
                
                // Convertir la fecha a un formato más legible
                try {
                    if (fecha.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                        // Si está en formato DD/MM/YYYY (o DD/MM/YYYY HH:MM:SS)
                        return fecha.substring(0, 10); // Extraer solo DD/MM/YYYY
                    } else {
                        // Intentar convertir desde ISO
                        const fechaObj = new Date(fecha);
                        if (!isNaN(fechaObj.getTime())) {
                            const dia = fechaObj.getDate().toString().padStart(2, '0');
                            const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
                            const anio = fechaObj.getFullYear();
                            return `${dia}/${mes}/${anio}`;
                        }
                    }
                } catch (e) {
                    console.error('Error al formatear fecha:', e);
                }
                
                // Si hay algún error, devolver la fecha original o un placeholder
                return fecha || 'Sin fecha';
            });
            
            // Si no hay fechas o solo hay fechas inválidas, agregar una fecha dummy
            if (fechas.length === 0 || fechas.every(f => f === 'Sin fecha')) {
                fechas.push('Fecha inicial');
            }
            
            // Extraer pesos y grasas para cada fecha
            const pesos = registros.map(registro => parseFloat(registro['peso-actual'] || 0));
            const grasas = registros.map(registro => parseFloat(registro['grasa-actual'] || 0));
            
            // Si no hay datos de peso o grasa, añadir valores cero
            if (pesos.length === 0 || pesos.every(p => p === 0 || isNaN(p))) {
                pesos.push(0);
            }
            
            if (grasas.length === 0 || grasas.every(g => g === 0 || isNaN(g))) {
                grasas.push(0);
            }
            
            // Añadir el peso y grasa deseados como línea horizontal de referencia
            const pesoDeseado = parseFloat(expediente['peso-deseado'] || 0);
            const grasaDeseada = parseFloat(expediente['grasa-deseada'] || 0);
            
            // Destruir gráficos existentes si los hay
            const pesoChartCanvas = document.getElementById('peso-chart');
            const grasaChartCanvas = document.getElementById('grasa-chart');
            
            if (window.pesoChart) window.pesoChart.destroy();
            if (window.grasaChart) window.grasaChart.destroy();
            
            // Crear gráfico de tendencia de peso
            window.pesoChart = new Chart(pesoChartCanvas, {
                type: 'line',
                data: {
                    labels: fechas,
                    datasets: [
                        {
                            label: 'Peso Actual (kg)',
                            data: pesos,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            tension: 0.3,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: 'Peso Deseado (kg)',
                            data: Array(fechas.length).fill(pesoDeseado),
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Kilogramos (kg)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Fechas de registro'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y} kg`;
                                }
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
            
            // Crear gráfico de tendencia de grasa corporal
            window.grasaChart = new Chart(grasaChartCanvas, {
                type: 'line',
                data: {
                    labels: fechas,
                    datasets: [
                        {
                            label: 'Grasa Corporal Actual (%)',
                            data: grasas,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            tension: 0.3,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: 'Grasa Corporal Deseada (%)',
                            data: Array(fechas.length).fill(grasaDeseada),
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointRadius: 0,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Porcentaje (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Fechas de registro'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y}%`;
                                }
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
        }

        // Modificar la función que maneja el clic en el botón "Crear registro"
        document.getElementById('newRecordBtn').addEventListener('click', function() {
            // Verificar si se ha seleccionado un cliente, expediente y fecha
            const selectedClient = document.getElementById('clienteInput').value;
            const selectedExpediente = document.getElementById('expedienteInput').value;
            const selectedFecha = document.getElementById('fechaInput').value;

            if (selectedClient && selectedExpediente && selectedFecha) {
                // Filtrar el objeto expediente por la fecha seleccionada
                const filteredExpediente = filterExpedienteByFecha(selectedExpediente, selectedFecha);

                // Rellenar el formulario con los datos filtrados
                fillExpedienteForm(filteredExpediente);
            } else {
                // Mostrar un mensaje de error o realizar alguna acción apropiada
                console.log('Por favor, seleccione un cliente, expediente y fecha.');
            }
        });

        // Función para filtrar el objeto expediente por fecha
        function filterExpedienteByFecha(expedienteId, fecha) {
            console.log('Filtrando expediente:', expedienteId, 'por fecha:', fecha);
            
            // Buscar el expediente por su ID
            let expediente = null;
            if (datosAPI && datosAPI.expedienteClientes) {
                // Buscar en todos los expedientes
                for (const key in datosAPI.expedienteClientes) {
                    const exp = datosAPI.expedienteClientes[key];
                    if (exp['numero-expediente'] === expedienteId) {
                        expediente = exp;
                        break;
                    }
                }
            }
            
            if (!expediente) {
                console.error('No se encontró el expediente con ID:', expedienteId);
                return {};
            }
            
            console.log('Expediente encontrado:', expediente);
            
            // Normalizar formato de fecha para comparación
            let fechaNormalizada = null;
            try {
                // Intentar diferentes formatos de fecha
                if (fecha.includes('/')) {
                    // Formato DD/MM/YYYY
                    const partes = fecha.split('/');
                    if (partes.length === 3) {
                        fechaNormalizada = new Date(partes[2], partes[1] - 1, partes[0]);
                    }
                } else if (fecha.includes('-')) {
                    // Formato YYYY-MM-DD
                    fechaNormalizada = new Date(fecha);
                } else {
                    // Intentar parsear directamente
                    fechaNormalizada = new Date(fecha);
                }
                
                // Verificar que la fecha es válida
                if (isNaN(fechaNormalizada.getTime())) {
                    console.warn('No se pudo normalizar la fecha:', fecha);
                    fechaNormalizada = null;
                } else {
                    console.log('Fecha normalizada:', fechaNormalizada);
                }
            } catch (error) {
                console.error('Error al normalizar la fecha:', error);
                fechaNormalizada = null;
            }
            
            // Filtrar registros del expediente por fecha
            // Si el expediente tiene un array de registros, filtrarlo por fecha
            if (expediente.registros && Array.isArray(expediente.registros) && fechaNormalizada) {
                let registroFiltrado = null;
                
                // Primero buscar coincidencia exacta de fecha
                registroFiltrado = expediente.registros.find(reg => {
                    // Convertir la fecha del registro a formato comparable
                    let fechaReg = null;
                    try {
                        fechaReg = new Date(reg.fecha);
                        
                        // Verificar si es una fecha válida
                        if (isNaN(fechaReg.getTime())) return false;
                        
                        // Comparar solo año, mes y día
                        return fechaReg.getFullYear() === fechaNormalizada.getFullYear() &&
                               fechaReg.getMonth() === fechaNormalizada.getMonth() &&
                               fechaReg.getDate() === fechaNormalizada.getDate();
                    } catch (error) {
                        console.error('Error al convertir fecha del registro:', error);
                        return false;
                    }
                });
                
                if (registroFiltrado) {
                    console.log('Registro encontrado para la fecha seleccionada:', registroFiltrado);
                    // Devolver un objeto que combine el expediente con el registro filtrado
                    return { 
                        ...expediente, 
                        registroActual: registroFiltrado
                    };
                }
            }
            
            console.log('No se encontraron registros para la fecha seleccionada. Usando datos base del expediente.');
            
            // Si el expediente no tiene registros o la fecha no coincide, devolvemos el expediente base
            // Esto permite que al menos se muestren los datos básicos del expediente
            return { 
                ...expediente,
                // Si hay fecha válida, la usamos; de lo contrario, usamos la fecha actual
                'fecha-registro': fechaNormalizada ? 
                                `${fechaNormalizada.getFullYear()}-${(fechaNormalizada.getMonth() + 1).toString().padStart(2, '0')}-${fechaNormalizada.getDate().toString().padStart(2, '0')}` 
                                : new Date().toISOString().split('T')[0],
                registroActual: {
                    fecha: fechaNormalizada ? 
                          `${fechaNormalizada.getFullYear()}-${(fechaNormalizada.getMonth() + 1).toString().padStart(2, '0')}-${fechaNormalizada.getDate().toString().padStart(2, '0')}`
                          : new Date().toISOString().split('T')[0],
                    // Agregar campos vacíos o predeterminados para el formulario
                    avance: 0,
                    status: '',
                    observaciones: ''
                }
            };
        }

        // Modificar la función que maneja el clic en el botón "Cargar Registro"
        document.getElementById('loadRecordBtn').addEventListener('click', function() {
            console.log('Botón "Cargar Registro" clickeado');

            // Verificar si se ha seleccionado un cliente, expediente y fecha
            const selectedClient = document.getElementById('clienteInput').value;
            const selectedExpediente = document.getElementById('expedienteInput').value;
            const selectedFecha = document.getElementById('fechaInput').value;

            console.log('Cliente seleccionado:', selectedClient);
            console.log('Expediente seleccionado:', selectedExpediente);
            console.log('Fecha seleccionada:', selectedFecha);

            if (selectedClient && selectedExpediente && selectedFecha) {
                // Filtrar el objeto expediente por la fecha seleccionada
                const filteredExpediente = filterExpedienteByFecha(selectedExpediente, selectedFecha);

                console.log('Expediente filtrado:', filteredExpediente);

                // Rellenar el formulario con los datos filtrados
                fillExpedienteForm(filteredExpediente);

                // Desplegar el formulario directamente
                const expedienteFormContainer = document.getElementById('expedienteFormContainer');
                if (expedienteFormContainer) {
                    console.log('Mostrando formulario de expediente');
                    expedienteFormContainer.style.display = 'block';
                    
                    // Hacer scroll hacia el formulario
                    expedienteFormContainer.scrollIntoView({ behavior: 'smooth' });
                    
                    // Establecer variable global
                    window.formularioActivo = true;
                } else {
                    console.error('No se encontró el contenedor del formulario de expediente (expedienteFormContainer)');
                    
                    // Intentar buscar el formulario por otros medios
                    const possibleForms = document.querySelectorAll('form');
                    console.log('Formularios disponibles:', possibleForms);
                    
                    // Verificar si existe algún elemento que podría contener el formulario
                    const possibleContainers = document.querySelectorAll('.expediente-form-container, .form-container, .modal-content');
                    console.log('Posibles contenedores de formulario:', possibleContainers);
                    
                    // Si encontramos algún contenedor, intentar mostrarlo
                    if (possibleContainers.length > 0) {
                        possibleContainers[0].style.display = 'block';
                        console.log('Mostrando contenedor alternativo:', possibleContainers[0]);
                    }
                }
            } else {
                // Mostrar un mensaje de error o realizar alguna acción apropiada
                console.log('Por favor, seleccione un cliente, expediente y fecha.');
                alert('Por favor, seleccione un cliente, expediente y fecha.');
            }
        });
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

    // Función para filtrar la tabla de clientes
    function filterClientesTable(searchTerm) {
        const tableBody = document.getElementById('clientesTableBody');
        if (!tableBody) return;
        
        // Si no hay término de búsqueda, mostrar todos los registros
        if (!searchTerm) {
            loadClientsContent();
            return;
        }
        
        // Filtrar clientes
        const clientesArray = Object.values(datosAPI.contactosClientes || {});
        const filteredClientes = clientesArray.filter(cliente => {
            return Object.values(cliente).some(value => {
                // Solo buscar en valores de texto o número
                if (value && (typeof value === 'string' || typeof value === 'number')) {
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            });
        });
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Si no hay resultados
        if (filteredClientes.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px;">No se encontraron coincidencias</td>
                </tr>
            `;
            return;
        }
        
        // Renderizar resultados filtrados
        filteredClientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.setAttribute('data-cliente-id', cliente['id-contacto']);
            
            // Formatear fecha
            let fechaCliente = 'N/A';
            if (cliente['fecha-cliente']) {
                try {
                    if (cliente['fecha-cliente'].includes('T')) {
                        const fecha = new Date(cliente['fecha-cliente']);
                        fechaCliente = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth()+1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
                    } else if (cliente['fecha-cliente'].includes('/')) {
                        const fechaParts = cliente['fecha-cliente'].split(' ')[0].split('/');
                        if (fechaParts.length === 3) {
                            fechaCliente = `${fechaParts[0]}/${fechaParts[1]}/${fechaParts[2]}`;
                        } else {
                            fechaCliente = cliente['fecha-cliente'].split(' ')[0];
                        }
                    } else {
                        fechaCliente = cliente['fecha-cliente'];
                    }
                } catch (e) {
                    fechaCliente = cliente['fecha-cliente'];
                }
            }
            
            row.innerHTML = `
                <td>
                    <input type="text" class="editable-field cliente-field" style="min-width: 180px;" value="${cliente.nombre || ''}" data-field="nombre">
                </td>
                <td>
                    <input type="tel" class="editable-field cliente-field" value="${cliente.telefono || ''}" data-field="telefono" maxlength="10">
                </td>
                <td>
                    <input type="email" class="editable-field cliente-field" value="${cliente.email || ''}" data-field="email">
                </td>
                <td>${fechaCliente}</td>
                <td>${cliente['numero-cliente'] || 'N/A'}</td>
                <td>${cliente['numero-expediente'] || 'N/A'}</td>
                <td>
                    <div class="checkbox-center">
                        <input type="checkbox" class="custom-checkbox cliente-field" data-field="finalizado" ${cliente.finalizado === "true" ? 'checked' : ''}>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary detalle-btn" data-id="${cliente['id-contacto']}">
                        <i class="fas fa-info-circle"></i> Detalle
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Reasignar eventos a los campos editables
        const editableFields = document.querySelectorAll('.cliente-field');
        editableFields.forEach(field => {
            field.addEventListener('change', function() {
                const clienteId = this.closest('tr').getAttribute('data-cliente-id');
                const fieldName = this.getAttribute('data-field');
                let value = this.value;
                
                if (this.type === 'checkbox') {
                    value = this.checked ? "true" : "false";
                }
                
                if (datosAPI.contactosClientes[clienteId]) {
                    datosAPI.contactosClientes[clienteId][fieldName] = value;
                    clientesModificados[clienteId] = true;
                }
            });
        });
        
        // Reasignar eventos a los botones de detalle
        const detalleBtns = document.querySelectorAll('.detalle-btn');
        detalleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const clienteId = this.getAttribute('data-id');
                if (clienteId && datosAPI.contactosClientes[clienteId]) {
                    mostrarDetalleCliente(datosAPI.contactosClientes[clienteId]);
                }
            });
        });
    }

    // Evento para manejar los tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remover la clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar la clase active al botón y contenido actual
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Si se cambia a la pestaña de Avance:
            if (tabName === 'avance') {
                // 1. Ocultar el formulario de expediente
                expedienteFormContainer.style.display = 'none';
                
                // 2. Mostrar los gráficos si hay un expediente cargado
                if (window.expedienteActual) {
                    createProgressCharts(window.expedienteActual);
                }
            } else if (tabName === 'expedientes') {
                // Si volvemos a la pestaña de expedientes y hay un expediente cargado
                // mostrar el formulario si estaba activo
                if (window.expedienteActual && window.formularioActivo) {
                    expedienteFormContainer.style.display = 'block';
                }
            }
        });
    });
    
    // Evento para cargar los valores del expediente seleccionado al hacer clic en "Cargar Registros"
    if (loadExpedienteBtn) {
        loadExpedienteBtn.addEventListener('click', function() {
            const clienteNumero = clienteNumFilter ? clienteNumFilter.value : '';
            const expedienteNumero = expedienteNumFilter ? expedienteNumFilter.value : '';
            const fechaRegistroFormateada = fechaRegistroFilter ? fechaRegistroFilter.value : '';
            const fechaRegistroOriginal = fechaRegistroFilter && fechaRegistroFilter.dataset ? 
                fechaRegistroFilter.dataset.originalValue : '';
            
            console.log('Buscando expediente con:');
            console.log('Número de cliente:', clienteNumero);
            console.log('Número de expediente:', expedienteNumero);
            console.log('Fecha de registro formateada (DD/MM/YYYY):', fechaRegistroFormateada);
            console.log('Fecha de registro original (completa):', fechaRegistroOriginal);
            console.log('Datos disponibles en datosAPI.expedienteClientes:', datosAPI.expedienteClientes);
            
            // Buscar el expediente que coincida con los criterios seleccionados
            // Primero intentamos buscar con la fecha original exacta
            let expediente = Object.values(datosAPI.expedienteClientes || {}).find(
                exp => exp['numero-expediente'] === expedienteNumero &&
                       exp['fecha-registro'] === fechaRegistroOriginal
            );
            
            // Si no encontramos, intentamos con la fecha formateada
            if (!expediente) {
                expediente = Object.values(datosAPI.expedienteClientes || {}).find(
                    exp => exp['numero-expediente'] === expedienteNumero &&
                           exp['fecha-registro'].includes(fechaRegistroFormateada)
                );
            }
            
            if (expediente) {
                console.log('Expediente encontrado:', expediente);
                
                // Limpiar gráficos previos
                clearCharts();
                
                // Guardar el expediente actual en una variable global para poder acceder a él desde otras funciones
                window.expedienteActual = expediente;
                window.formularioActivo = true;
                
                // Cambiar la visibilidad de los botones
                if (createExpedienteBtn) createExpedienteBtn.style.display = 'none';
                if (updateExpedienteBtn) updateExpedienteBtn.style.display = 'inline-block';
                
                // Cargar los valores del expediente en el formulario
                fillExpedienteForm(expediente);
                
                // Mostrar el formulario del expediente solo si estamos en la pestaña Expedientes
                const expedientesTabActive = document.querySelector('.tab-btn[data-tab="expedientes"]');
                if (expedientesTabActive && expedientesTabActive.classList.contains('active')) {
                    if (expedienteFormContainer) expedienteFormContainer.style.display = 'block';
                } else {
                    if (expedienteFormContainer) expedienteFormContainer.style.display = 'none';
                }
                
                // Crear los gráficos de avance (incluso si no hay datos)
                // Solo si estamos en la pestaña de Avance
                const avanceTabActive = document.querySelector('.tab-btn[data-tab="avance"]');
                if (avanceTabActive && avanceTabActive.classList.contains('active')) {
                    createProgressCharts(expediente);
                }
            } else {
                console.log('No se encontró un expediente con los criterios seleccionados');
                showToast('No se encontró un expediente con los criterios seleccionados');
            }
        });
    } else {
        console.warn('loadExpedienteBtn no encontrado');
    }

    // Verificar y añadir event listener al botón "Crear registro"
    const newRecordBtn = document.getElementById('newRecordBtn');
    if (newRecordBtn) {
        newRecordBtn.addEventListener('click', function() {
            // Verificar si se ha seleccionado un cliente, expediente y fecha
            const selectedClient = document.getElementById('clienteInput').value;
            const selectedExpediente = document.getElementById('expedienteInput').value;
            const selectedFecha = document.getElementById('fechaInput').value;

            if (selectedClient && selectedExpediente && selectedFecha) {
                // Filtrar el objeto expediente por la fecha seleccionada
                const filteredExpediente = filterExpedienteByFecha(selectedExpediente, selectedFecha);

                // Rellenar el formulario con los datos filtrados
                fillExpedienteForm(filteredExpediente);
            } else {
                // Mostrar un mensaje de error o realizar alguna acción apropiada
                console.log('Por favor, seleccione un cliente, expediente y fecha.');
            }
        });
    } else {
        console.error('Botón "Crear registro" no encontrado');
    }

    // Función para filtrar el objeto expediente por fecha
    function filterExpedienteByFecha(expedienteId, fecha) {
        // Lógica para filtrar el objeto expediente por fecha
        // Por ahora devolvemos un objeto vacío para que no cause errores
        return {};
    }

    // Verificar y añadir event listener al botón "Cargar Registro"
    // Intentar localizar el botón de diversas maneras
    console.log('Buscando botón "Cargar Registro"...');
    
    // 1. Buscar directamente por ID loadExpedienteBtn (que se ve en el código)
    const loadRecordBtn = document.getElementById('loadExpedienteBtn') || 
                        document.querySelector('.btn i.fa-download')?.closest('button') || 
                        document.querySelector('button:has(i.fa-download)') ||
                        document.querySelector('button[id="cargarRegistroBtn"]');
    
    if (loadRecordBtn) {
        console.log('Botón "Cargar Registro" encontrado:', loadRecordBtn);
        
        // Quitar cualquier evento anterior para evitar duplicados
        const newBtn = loadRecordBtn.cloneNode(true);
        if (loadRecordBtn.parentNode) {
            loadRecordBtn.parentNode.replaceChild(newBtn, loadRecordBtn);
        }
        
        // Agregar el evento
        newBtn.onclick = function(event) {
            if (event) event.preventDefault();
            console.log('Botón "Cargar Registro" clickeado');
            
            // Verificar si se ha seleccionado un expediente y fecha
            const selectedExpediente = document.getElementById('expedienteNumFilter')?.value || '';
            const selectedFecha = document.getElementById('fechaRegistroFilter')?.value || '';
            
            console.log('Expediente seleccionado:', selectedExpediente);
            console.log('Fecha seleccionada:', selectedFecha);
            
            if (selectedExpediente && selectedFecha) {
                try {
                    // Usar la función filterExpedienteByFecha que está definida correctamente
                    const filteredExpediente = filterExpedienteByFecha(selectedExpediente, selectedFecha);
                    console.log('Expediente filtrado:', filteredExpediente);
                    
                    // Llenar el formulario con los datos
                    fillExpedienteForm(filteredExpediente);
                    
                    // Hacer visible el formulario y contenedores
                    const formContainers = document.querySelectorAll('form, .form-container, .modal-content');
                    formContainers.forEach(container => {
                        if (container && getComputedStyle(container).display === 'none') {
                            container.style.display = 'block';
                            console.log('Contenedor de formulario hecho visible:', container);
                        }
                    });
                } catch (error) {
                    console.error('Error al procesar el expediente:', error);
                    alert('Ocurrió un error al cargar el expediente: ' + error.message);
                }
            } else {
                alert('Por favor, seleccione un expediente y una fecha.');
            }
            
            return false; // Evitar comportamiento por defecto
        };
    } else {
        console.error('Botón "Cargar Registro" no encontrado. Intentando con alternativas...');
        
        // AÑADIR: Búsqueda directa por texto "Cargar Registro"
        const cargarRegistroButton = Array.from(document.querySelectorAll('button')).find(
            btn => btn.textContent.trim() === 'Cargar Registro'
        );
        
        if (cargarRegistroButton) {
            console.log('Botón encontrado por texto "Cargar Registro":', cargarRegistroButton);
            cargarRegistroButton.onclick = function(event) {
                if (event) event.preventDefault();
                console.log('Botón "Cargar Registro" (encontrado por texto) clickeado');
                
                // Obtener expediente y fecha seleccionados
                const selectedExpediente = document.getElementById('expedienteNumFilter')?.value || '';
                const selectedFecha = document.getElementById('fechaRegistroFilter')?.value || '';
                
                if (selectedExpediente && selectedFecha) {
                    try {
                        const filteredExpediente = filterExpedienteByFecha(selectedExpediente, selectedFecha);
                        fillExpedienteForm(filteredExpediente);
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error al cargar expediente: ' + error.message);
                    }
                } else {
                    alert('Seleccione expediente y fecha.');
                }
                
                return false;
            };
            return; // Salir si encontramos el botón
        }
        
        // Intenta adjuntar el evento a cualquier botón visible en la interfaz
        const visibleButtons = Array.from(document.querySelectorAll('button:not([style*="display: none"])')).filter(
            btn => btn.offsetParent !== null && getComputedStyle(btn).display !== 'none'
        );
        
        console.log('Botones visibles encontrados:', visibleButtons.length);
        
        if (visibleButtons.length > 0) {
            // Intentar encontrar un botón que parezca ser el de cargar registro
            const possibleLoadBtn = visibleButtons.find(btn => 
                btn.textContent.includes('Cargar') || 
                btn.innerHTML.includes('fa-download') || 
                btn.classList.contains('btn-success')
            );
            
            if (possibleLoadBtn) {
                console.log('Posible botón "Cargar Registro" encontrado:', possibleLoadBtn);
                possibleLoadBtn.addEventListener('click', function() {
                    console.log('Posible botón "Cargar Registro" clickeado');
                    
                    // Obtener cualquier expediente disponible
                    if (datosAPI && datosAPI.expedienteClientes && Object.keys(datosAPI.expedienteClientes).length > 0) {
                        const expediente = Object.values(datosAPI.expedienteClientes)[0];
                        console.log('Usando expediente disponible:', expediente);
                        fillExpedienteForm(expediente);
                    } else {
                        console.error('No hay datos de expedientes disponibles');
                        alert('No hay datos de expedientes disponibles para cargar.');
                    }
                });
            }
        }
    }
}); 
