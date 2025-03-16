// Variables globales para paginación
let currentPage = 1;
let entriesPerPage = 10;
let filteredProspectos = [];
let allProspectos = [];

// Función para mostrar el spinner de carga
function showSpinner() {
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) spinner.classList.add('active');
}

// Función mejorada para ocultar el spinner
function hideSpinner() {
    // Usar setTimeout para asegurar que se ejecuta después del ciclo actual de eventos
    setTimeout(() => {
        const spinner = document.querySelector('.spinner-overlay');
        if (spinner) {
            spinner.style.display = 'none'; // Forzar ocultamiento con estilo
            spinner.classList.remove('active'); // También remover la clase
            console.log('Spinner ocultado forzosamente');
        }
    }, 0);
}

// Función para mostrar notificaciones toast - versión corregida
function showToastNotification(message, type = 'default') {
    const toast = document.querySelector('.toast-notification');
    if (!toast) return;
    
    const iconElement = toast.querySelector('.toast-icon');
    const messageElement = toast.querySelector('.toast-message');
    const closeBtn = toast.querySelector('.toast-close');
    
    if (!messageElement) return;
    
    // Configurar el mensaje y el tipo
    messageElement.textContent = message;
    
    // Configurar el tipo (color e icono)
    toast.className = 'toast-notification';
    if (type) toast.classList.add(type);
    
    // Configurar icono si existe
    if (iconElement) {
        iconElement.className = 'toast-icon fas';
        switch (type) {
            case 'success':
                iconElement.classList.add('fa-check-circle');
                break;
            case 'error':
                iconElement.classList.add('fa-exclamation-circle');
                break;
            case 'info':
                iconElement.classList.add('fa-info-circle');
                break;
            default:
                iconElement.classList.add('fa-bell');
        }
    }
    
    // Configurar el botón de cierre
    if (closeBtn) {
        // Remover cualquier evento anterior para evitar duplicados
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        
        // Obtener la referencia actualizada
        const newCloseBtn = toast.querySelector('.toast-close');
        
        // Configurar el nuevo evento de clic
        newCloseBtn.addEventListener('click', function() {
            toast.classList.remove('show');
        });
    }
    
    // Mostrar el toast
    toast.classList.add('show');
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos DOM
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const screenTitle = document.getElementById('screen-title');
    const sections = document.querySelectorAll('.screen-section');
    
    // Ocultar spinner que pueda estar visible desde antes
    hideSpinner();
    
    // Mostrar spinner inicial
    showSpinner();
    
    // Inicialización de la pantalla de inicio
    initHomeScreen();
    
    // Cargar datos - la función fetchDatos manejará el spinner
    console.log('Iniciando carga de datos...');
    fetchDatos()
        .then(() => {
            console.log('Datos cargados correctamente');
            // No ocultamos el spinner aquí, lo maneja calcularIndicadores
        })
        .catch(error => {
            console.error('Error en carga inicial:', error);
            hideSpinner(); // Ocultar spinner en caso de error
        });
    
    // Navegación entre secciones (simplificada)
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el ID de la sección a mostrar
            const screenId = this.dataset.screen;
            
            // Cambiar la sección activa
            changeScreenSection(screenId);
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Si la pantalla es home, actualizar los indicadores
            if (screenId === 'home' && window.appData) {
                calcularIndicadoresSinSpinner();
            }
        });
    });
    
    // Evento para el botón de actualizar (simplificado)
    const refreshBtn = document.getElementById('refreshProspects');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showSpinner();
            fetchDatos()
                .then(() => {
                    showToastNotification('Datos actualizados correctamente', 'success');
                })
                .catch(() => {
                    showToastNotification('Error al actualizar datos', 'error');
                })
                .finally(() => {
                    // Asegurar que el spinner se oculta
                    setTimeout(hideSpinner, 500);
                });
        });
    }
    
    // Configurar el evento para el badge de notificaciones
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Animación de rebote para el badge
            const thisBadge = this.querySelector('.notification-badge');
            if (thisBadge) {
                thisBadge.classList.add('bounce');
                setTimeout(() => thisBadge.classList.remove('bounce'), 1000);
                
                // Obtener el número de prospectos sin atender
                const count = parseInt(thisBadge.textContent) || 0;
                
                // Mostrar toast con el hipervínculo
                showProspectosToast(count);
            }
        });
    }
});

// Función para inicializar la pantalla de inicio
function initHomeScreen() {
    // Crear contenedor de métricas
    const metricsContainer = document.querySelector('.metrics-container');
    if (!metricsContainer) return;
    
    // Limpiar contenedor de métricas
    metricsContainer.innerHTML = '';
    
    // Datos de métricas (sin valores predeterminados y sin ventas totales)
    const metricsData = [
        { title: 'Prospectos Totales', value: '', icon: 'fa-user-plus', color: 'purple', id: 'prospectos-totales' },
        { title: 'Clientes Activos', value: '', icon: 'fa-users', color: 'blue', id: 'clientes-activos' },
        { title: 'Expedientes Abiertos', value: '', icon: 'fa-folder-open', color: 'orange', id: 'expedientes-abiertos' }
    ];
    
    // Generar tarjetas de métricas
    metricsData.forEach(metric => {
        const metricCard = document.createElement('div');
        metricCard.className = `metric-card ${metric.color}`;
        metricCard.id = metric.id;
        metricCard.innerHTML = `
            <div class="metric-icon">
                <i class="fas ${metric.icon}"></i>
            </div>
            <div class="metric-info">
                <h3>${metric.title}</h3>
                <div class="metric-value">
                    ${metric.value}
                </div>
            </div>
        `;
        metricsContainer.appendChild(metricCard);
    });
    
    // Remover sección de actividades recientes si existe
    const actividadesRecientes = document.querySelector('.recent-activities');
    if (actividadesRecientes) {
        actividadesRecientes.remove();
    }
    
    // Remover información de usuario admin si existe
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.remove();
    }
}

// Función para cambiar la sección visible
function changeScreenSection(sectionId) {
    // Actualizar título
    const screenTitle = document.getElementById('screen-title');
    if (screenTitle) {
        screenTitle.textContent = getScreenTitle(sectionId);
    }
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.screen-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Cerrar sidebar en móvil
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth <= 992) {
        sidebar.classList.remove('open');
    }
}

// Obtener el título de cada pantalla
function getScreenTitle(screenId) {
    const titles = {
        'home': 'Dashboard',
        'prospects': 'Prospectos',
        'clients': 'Clientes',
        'records': 'Expedientes de Clientes'
    };
    
    return titles[screenId] || 'Dashboard';
}

// Función para configurar eventos de tabla y paginación
function setupTableAndPaginationEvents() {
    // Evento para el buscador
    const searchInput = document.getElementById('prospectsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            if (window.appData && window.appData.prospecto) {
                // Filtrar los prospectos según el término de búsqueda
                applySearchFilter(searchTerm);
            }
        });
    }
    
    // Eventos para selector de entradas por página
    const pageSizeSelector = document.getElementById('pageSize');
    if (pageSizeSelector) {
        pageSizeSelector.addEventListener('change', function() {
            entriesPerPage = parseInt(this.value);
            currentPage = 1; // Resetear a la primera página
            renderTablePage();
            updatePaginationControls();
        });
    }
    
    // Evento delegado para botones de motivo (se aplicará a botones creados dinámicamente)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-motivo') || e.target.closest('.btn-motivo')) {
            const btn = e.target.classList.contains('btn-motivo') ? e.target : e.target.closest('.btn-motivo');
            openMotivoModal(btn);
        }
    });
}

// Función para aplicar filtro de búsqueda
function applySearchFilter(searchTerm) {
    if (!searchTerm) {
        filteredProspectos = [...allProspectos];
    } else {
        filteredProspectos = allProspectos.filter(prospecto => {
            // Buscar en todas las propiedades del objeto
            return Object.entries(prospecto).some(([key, value]) => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchTerm);
            });
        });
    }
    
    // Resetear a la primera página cuando se realiza una búsqueda
    currentPage = 1;
    renderTablePage();
    updatePaginationControls();
}

// Función para renderizar la tabla de prospectos
function renderProspectosTable(prospectos) {
    // Verificar si existe la tabla
    const tableBody = document.querySelector('#prospectsTable tbody');
    if (!tableBody) return;
    
    // Limpiar tabla
    tableBody.innerHTML = '';
    
    // Si no hay prospectos, mostrar mensaje
    if (!prospectos || Object.keys(prospectos).length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="12" class="empty-message">No hay prospectos disponibles</td>
        `;
        tableBody.appendChild(row);
        
        // Actualizar información de paginación
        updatePaginationInfo(0, 0, 0);
        return;
    }
    
    // Convertir objeto de prospectos a array
    const prospectosArray = Object.values(prospectos);
    
    // Ordenar por fecha descendente (más reciente primero)
    prospectosArray.sort((a, b) => {
        const dateA = new Date(a['fecha-prospecto']);
        const dateB = new Date(b['fecha-prospecto']);
        return dateB - dateA;
    });
    
    // Guardar array global de todos los prospectos
    allProspectos = [...prospectosArray];
    filteredProspectos = [...prospectosArray];
    
    // Renderizar la tabla paginada
    renderTablePage();
    
    // Crear controles de paginación si no existen
    createPaginationControls();
    
    // Actualizar controles de paginación
    updatePaginationControls();
}

// Función para renderizar una página de la tabla
function renderTablePage() {
    const tableBody = document.querySelector('#prospectsTable tbody');
    if (!tableBody) return;
    
    // Limpiar tabla
    tableBody.innerHTML = '';
    
    // Calcular índices de inicio y fin para la página actual
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    
    // Obtener los prospectos para la página actual
    const pageProspectos = filteredProspectos.slice(startIndex, endIndex);
    
    // Si no hay prospectos en esta página, mostrar mensaje
    if (pageProspectos.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="12" class="empty-message">No se encontraron prospectos</td>
        `;
        tableBody.appendChild(row);
        
        // Actualizar información de paginación
        updatePaginationInfo(0, 0, 0);
        return;
    }
    
    // Renderizar filas
    pageProspectos.forEach(prospecto => {
        const row = document.createElement('tr');
        
        // Convertir fecha a formato localizado si es necesario
        let fechaFormateada = prospecto['fecha-prospecto'];
        
        // Generar HTML para la fila
        row.innerHTML = `
            <td style="display: none;">${prospecto['id-prospecto']}</td>
            <td class="check-column">
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="convert-checkbox" ${prospecto['numero-cliente'] ? 'disabled' : ''}>
                </div>
            </td>
            <td>${prospecto['nombre-prospecto']}</td>
            <td><input type="tel" value="${prospecto['telefono']}" pattern="[0-9]*"></td>
            <td><input type="email" value="${prospecto['email']}"></td>
            <td>${prospecto['ubicacion']}</td>
            <td>
                <select>
                    <option value="instagram" ${prospecto['canal'] === 'instagram' ? 'selected' : ''}>Instagram</option>
                    <option value="facebook" ${prospecto['canal'] === 'facebook' ? 'selected' : ''}>Facebook</option>
                    <option value="twitter" ${prospecto['canal'] === 'twitter' ? 'selected' : ''}>Twitter</option>
                    <option value="whatsapp" ${prospecto['canal'] === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                    <option value="web" ${prospecto['canal'] === 'web' ? 'selected' : ''}>Web</option>
                    <option value="referido" ${prospecto['canal'] === 'referido' ? 'selected' : ''}>Referido</option>
                    <option value="otro" ${prospecto['canal'] === 'otro' ? 'selected' : ''}>Otro</option>
                </select>
            </td>
            <td><input type="datetime-local" value="${formatDateForInput(fechaFormateada)}"></td>
            <td class="check-column">
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="contactado-check" ${prospecto['contactado'] ? 'checked' : ''}>
                </div>
            </td>
            <td class="check-column">
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="interesado-check" ${prospecto['interesado'] ? 'checked' : ''}>
                </div>
            </td>
            <td class="text-center">
                <button class="btn-motivo" data-motivo="${prospecto['motivo'] || ''}">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
            <td class="cliente-cell">${prospecto['numero-cliente'] || ''}</td>
        `;
        
        // Añadir la fila a la tabla
        tableBody.appendChild(row);
        
        // Configurar eventos de la fila
        setupRowEvents(row, prospecto);
    });
    
    // Actualizar información de paginación
    updatePaginationInfo(startIndex + 1, Math.min(endIndex, filteredProspectos.length), filteredProspectos.length);
}

// Función para dar formato a la fecha para los inputs datetime-local
function formatDateForInput(dateStr) {
    // Este código convertirá formatos como "10/03/2025 08:49 p.m." a formato para datetime-local
    if (!dateStr) return '';
    
    try {
        // Intentar extraer fecha y hora del formato "DD/MM/YYYY HH:MM:SS"
        const parts = dateStr.split(' ');
        if (parts.length < 2) return '';
        
        // Extraer fecha
        const dateParts = parts[0].split('/');
        if (dateParts.length !== 3) return '';
        
        // Formato MM/DD/YYYY para crear objeto Date
        const dateObj = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]} ${parts[1]} ${parts[2] || ''}`);
        
        if (isNaN(dateObj.getTime())) return '';
        
        // Formato YYYY-MM-DDTHH:MM requerido por datetime-local
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
}

// Función para configurar eventos de las filas
function setupRowEvents(row, prospecto) {
    // Configurar botón para ver motivo
    const btnMotivo = row.querySelector('.btn-motivo');
    if (btnMotivo) {
        btnMotivo.addEventListener('click', function() {
            openMotivoModal(this);
        });
    }
    
    // Marcar cambios en los inputs
    const inputs = row.querySelectorAll('input:not([type="checkbox"]), select');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            row.classList.add('modified');
            this.classList.add('changed');
        });
    });
    
    // Configurar checkboxes
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            row.classList.add('modified');
            this.parentElement.classList.add('changed');
        });
    });
}

// Función para crear controles de paginación
function createPaginationControls() {
    // Verificar si el contenedor de paginación ya existe
    let paginationContainer = document.querySelector('.pagination-container');
    
    if (!paginationContainer) {
        // Crear contenedor de paginación
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        
        // HTML para el contenedor de paginación
        paginationContainer.innerHTML = `
            <div class="pagination-info">
                Mostrando <span id="startIndex">0</span> a <span id="endIndex">0</span> de <span id="totalEntries">0</span> registros
            </div>
            <div class="pagination-length">
                <label>Mostrar 
                    <select id="pageSize">
                        <option value="10" selected>10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    registros
                </label>
            </div>
            <div class="pagination-controls">
                <button id="firstPage" class="pagination-btn" disabled>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button id="prevPage" class="pagination-btn" disabled>
                    <i class="fas fa-angle-left"></i>
                </button>
                <div class="pagination-numbers" id="pageNumbers"></div>
                <button id="nextPage" class="pagination-btn">
                    <i class="fas fa-angle-right"></i>
                </button>
                <button id="lastPage" class="pagination-btn">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;
        
        // Insertar después de la tabla
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(paginationContainer, tableContainer.nextSibling);
        }
        
        // Configurar eventos de los botones de paginación
        const firstPageBtn = document.getElementById('firstPage');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');
        const lastPageBtn = document.getElementById('lastPage');
        const pageSizeSelector = document.getElementById('pageSize');
        
        if (firstPageBtn) {
            firstPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage = 1;
                    renderTablePage();
                    updatePaginationControls();
                }
            });
        }
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderTablePage();
                    updatePaginationControls();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(filteredProspectos.length / entriesPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTablePage();
                    updatePaginationControls();
                }
            });
        }
        
        if (lastPageBtn) {
            lastPageBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(filteredProspectos.length / entriesPerPage);
                if (currentPage < totalPages) {
                    currentPage = totalPages;
                    renderTablePage();
                    updatePaginationControls();
                }
            });
        }
        
        if (pageSizeSelector) {
            pageSizeSelector.addEventListener('change', function() {
                entriesPerPage = parseInt(this.value);
                currentPage = 1;
                renderTablePage();
                updatePaginationControls();
            });
        }
    }
}

// Función para actualizar controles de paginación
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredProspectos.length / entriesPerPage);
    
    // Actualizar estado de los botones de navegación
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');
    
    if (firstPageBtn) firstPageBtn.disabled = currentPage <= 1;
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
    if (lastPageBtn) lastPageBtn.disabled = currentPage >= totalPages;
    
    // Actualizar números de página
    const pageNumbersContainer = document.getElementById('pageNumbers');
    if (pageNumbersContainer) {
        pageNumbersContainer.innerHTML = '';
        
        // Determinar qué números de página mostrar
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Ajustar si estamos cerca del final
        if (endPage - startPage < 4 && startPage > 1) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Crear botones de número de página
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number';
            pageBtn.textContent = i;
            
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            
            pageBtn.addEventListener('click', function() {
                currentPage = i;
                renderTablePage();
                updatePaginationControls();
            });
            
            pageNumbersContainer.appendChild(pageBtn);
        }
    }
}

// Función para actualizar la información de paginación
function updatePaginationInfo(start, end, total) {
    const startIndexEl = document.getElementById('startIndex');
    const endIndexEl = document.getElementById('endIndex');
    const totalEntriesEl = document.getElementById('totalEntries');
    
    if (startIndexEl) startIndexEl.textContent = start;
    if (endIndexEl) endIndexEl.textContent = end;
    if (totalEntriesEl) totalEntriesEl.textContent = total;
}

// Función para abrir el modal de motivo
function openMotivoModal(btn) {
    const modal = document.getElementById('motivoModal');
    if (!modal) return;
    
    const textarea = document.getElementById('motivoText');
    const guardarBtn = document.getElementById('guardarMotivo');
    const cancelarBtn = document.getElementById('cancelarMotivo');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Obtener motivo actual
    const motivo = btn.dataset.motivo || '';
    
    // Establecer valor en el textarea
    textarea.value = motivo;
    
    // Mostrar modal
    modal.classList.add('show');
    
    // Enfocar el textarea
    setTimeout(() => textarea.focus(), 100);
    
    // Configurar botón de guardar
    guardarBtn.onclick = function() {
        // Actualizar botón con nuevo motivo
        const nuevoMotivo = textarea.value.trim();
        btn.dataset.motivo = nuevoMotivo;
        
        // Marcar fila como modificada
        const row = btn.closest('tr');
        if (row) {
            row.classList.add('modified');
            btn.classList.add('changed');
        }
        
        // Cerrar modal
        modal.classList.remove('show');
        
        // Mostrar notificación
        showToastNotification('Motivo actualizado correctamente', 'success');
    };
    
    // Configurar botones para cerrar
    cancelarBtn.onclick = closeBtn.onclick = function() {
        modal.classList.remove('show');
    };
    
    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };
}

// Función para abrir modal de generación de cliente
function openClienteModal(row) {
    const modal = document.getElementById('clienteModal');
    if (!modal || !row) return;
    
    // Obtener datos del prospecto
    const id = row.dataset.id;
    const nombre = row.cells[2].textContent.trim();
    const telefono = row.querySelector('input[data-field="telefono"]').value;
    const email = row.querySelector('input[data-field="email"]').value;
    const ubicacion = row.cells[5].textContent.trim();
    const canal = row.querySelector('select[data-field="canal"]').value;
    const fecha = row.querySelector('input[data-field="fecha-prospecto"]').value;
    const motivo = row.querySelector('.btn-motivo').dataset.motivo || '';
    
    // Llenar formulario
    document.getElementById('cliente-id').value = id;
    document.getElementById('cliente-nombre').value = nombre;
    document.getElementById('cliente-telefono').value = telefono;
    document.getElementById('cliente-email').value = email;
    document.getElementById('cliente-ubicacion').value = ubicacion;
    document.getElementById('cliente-canal').value = canal;
    document.getElementById('cliente-fecha').value = fecha;
    document.getElementById('cliente-motivo').value = motivo;
    
    // Configurar botones
    const guardarBtn = document.getElementById('guardarCliente');
    const cancelarBtn = document.getElementById('cancelarCliente');
    const closeBtn = modal.querySelector('.modal-close');
    
    guardarBtn.onclick = function() {
        // Cerrar modal
        modal.classList.remove('show');
        
        // Mostrar mensaje de éxito
        showToastNotification('Cliente generado correctamente', 'success');
        
        // Generar número de cliente y actualizar fila
        const clienteCell = row.querySelector('.cliente-cell');
        if (clienteCell) {
            clienteCell.textContent = generateClientNumber();
            
            // Actualizar UI
            row.classList.add('modified');
            row.querySelector('.convert-checkbox').disabled = true;
        }
    };
    
    // Configurar botones para cerrar
    cancelarBtn.onclick = closeBtn.onclick = function() {
        modal.classList.remove('show');
    };
    
    // Mostrar modal
    modal.classList.add('show');
    
    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };
}

// Función para generar un número de cliente
function generateClientNumber() {
    // Generar un número aleatorio con prefijo CLI
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `CLI-${randomNum}`;
}

// Función para calcular indicadores sin mostrar spinner
function calcularIndicadoresSinSpinner() {
    if (window.appData) {
        calcularIndicadores(window.appData);
    }
}

// Función para calcular y actualizar indicadores - con retraso para asegurar actualización visual
function calcularIndicadores(data, hideSpinnerAfter = true) {
    try {
        console.log('Calculando indicadores...');
        
        // Actualizar indicador de Prospectos Totales
        const totalProspectos = Object.keys(data.prospecto || {}).length;
        actualizarIndicador('prospectos-totales', totalProspectos.toString());
        
        // Actualizar indicador de Clientes Activos
        const totalClientes = Object.keys(data.contactosClientes || {}).length;
        actualizarIndicador('clientes-activos', totalClientes.toString());
        
        // Actualizar indicador de Expedientes Abiertos
        const totalExpedientes = Object.keys(data.expedienteClientes || {}).length;
        actualizarIndicador('expedientes-abiertos', totalExpedientes.toString());
        
        console.log('Indicadores actualizados correctamente');
        
        // Ocultar spinner solo si se solicita - con retraso para permitir actualización visual
        if (hideSpinnerAfter) {
            // Retrasar el ocultamiento del spinner para dar tiempo a que el DOM se actualice
            setTimeout(() => {
                console.log('Ocultando spinner después de actualizar indicadores');
                hideSpinner();
            }, 800); // Retraso de 800ms para asegurar actualización visual
        }
    } catch (error) {
        console.error('Error al calcular indicadores:', error);
        if (hideSpinnerAfter) {
            hideSpinner();
        }
    }
}

// Función auxiliar para actualizar un indicador específico
function actualizarIndicador(id, valor) {
    const indicador = document.getElementById(id);
    if (indicador) {
        const valorElement = indicador.querySelector('.metric-value');
        if (valorElement) {
            valorElement.textContent = valor;
        }
    }
}

// Función para obtener datos del servidor - eliminando la notificación automática
function fetchDatos() {
    // Mostrar spinner durante la carga
    showSpinner();
    
    // Forzar que el spinner se oculte después de 15 segundos sin importar qué
    const forceHideTimeout = setTimeout(() => {
        console.log('Forzando ocultamiento del spinner después de timeout');
        hideSpinner();
    }, 15000);
    
    // Crear URL con timestamp para evitar caché
    const url = 'https://script.google.com/macros/s/AKfycbxeU3BNj9_535JZWBZWnNZkzTgRu8T4ngJXWuolJndij_N0yCYbPUvOnkLLPI_pa2eoQw/exec?timestamp=' + new Date().getTime();
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            // Limpiar el temporizador de seguridad
            clearTimeout(forceHideTimeout);
            
            console.log('Datos obtenidos:', data);
            
            // Guardar los datos en una variable global para usarlos después
            window.appData = data;
            
            // Calcular indicadores pero NO ocultar el spinner todavía
            calcularIndicadores(data, true); // Cambiado a true para que la función maneje el ocultamiento con retraso
            
            // Configurar notificaciones (solo actualizar badge, sin mostrar toast automático)
            if (data.prospecto) {
                const prospectosSinAtender = Object.values(data.prospecto).filter(p => 
                    !p.contactado && !p['numero-cliente']);
                
                // Actualizar badge con número de prospectos sin atender
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    const count = prospectosSinAtender.length;
                    badge.textContent = count.toString();
                    badge.style.display = count === 0 ? 'none' : 'flex';
                    
                    // Eliminar la activación automática del toast
                    // La notificación solo se mostrará al hacer clic en el badge
                }
            }
            
            // Ya no ocultamos el spinner aquí, lo hará calcularIndicadores con retraso
            
            return data;
        })
        .catch(error => {
            // Limpiar el temporizador de seguridad
            clearTimeout(forceHideTimeout);
            
            console.error('Error al obtener los datos:', error);
            showToastNotification('Error al cargar los datos', 'error');
            
            // Forzar ocultamiento del spinner
            hideSpinner();
            
            return { prospecto: {}, contactosClientes: {}, expedienteClientes: {} };
        });
}

// Función alternativa con datos de prueba (uso temporal)
function fetchDatosPrueba() {
    // Mostrar spinner durante la carga
    showSpinner();
    
    return new Promise((resolve) => {
        // Simular retraso de red
        setTimeout(() => {
            // Datos de ejemplo
            const data = {
                prospecto: {
                    "1": {
                        "id-prospecto": "1",
                        "nombre-prospecto": "Carlos Dominguez",
                        "telefono": "8888888888",
                        "email": "f@gmail.com",
                        "ubicacion": "Monterrey, Nuevo León",
                        "canal": "instagram",
                        "fecha-prospecto": "10/03/2025 08:49 p.m.",
                        "contactado": true,
                        "interesado": false,
                        "motivo": "",
                        "numero-cliente": ""
                    },
                    "2": {
                        "id-prospecto": "2",
                        "nombre-prospecto": "aa af",
                        "telefono": "5555555555",
                        "email": "5555@of.com",
                        "ubicacion": "San Pedro Garza García, Nuevo León",
                        "canal": "twitter",
                        "fecha-prospecto": "08/03/2025 02:49 p.m.",
                        "contactado": true,
                        "interesado": false,
                        "motivo": "",
                        "numero-cliente": ""
                    },
                    "3": {
                        "id-prospecto": "3",
                        "nombre-prospecto": "a a",
                        "telefono": "3333333333",
                        "email": "3q@d.com",
                        "ubicacion": "San Pedro Garza García, Nuevo León",
                        "canal": "instagram",
                        "fecha-prospecto": "08/03/2025 12:00 a.m.",
                        "contactado": true,
                        "interesado": false,
                        "motivo": "adadada",
                        "numero-cliente": ""
                    },
                    "4": {
                        "id-prospecto": "4",
                        "nombre-prospecto": "da ada",
                        "telefono": "4444444444",
                        "email": "dd@gl.com",
                        "ubicacion": "San Pedro Garza García, Nuevo León",
                        "canal": "instagram",
                        "fecha-prospecto": "08/03/2025 12:00 a.m.",
                        "contactado": true,
                        "interesado": false,
                        "motivo": "",
                        "numero-cliente": ""
                    },
                    "5": {
                        "id-prospecto": "5",
                        "nombre-prospecto": "ad a",
                        "telefono": "2222222222",
                        "email": "d@g.com",
                        "ubicacion": "San José de Gracia, Aguascalientes",
                        "canal": "instagram",
                        "fecha-prospecto": "08/03/2025 12:00 a.m.",
                        "contactado": true,
                        "interesado": false,
                        "motivo": "",
                        "numero-cliente": ""
                    }
                },
                contactosClientes: {
                    "1": { "id": "1", "nombre": "Cliente 1" },
                    "2": { "id": "2", "nombre": "Cliente 2" },
                    "3": { "id": "3", "nombre": "Cliente 3" }
                },
                expedienteClientes: {
                    "1": { "id": "1", "cliente": "Cliente 1" },
                    "2": { "id": "2", "cliente": "Cliente 2" }
                }
            };
            
            console.log('Datos de prueba cargados');
            
            // Calcular indicadores
            calcularIndicadores(data);
            
            // Verificar si estamos en la sección de prospectos para actualizar la tabla
            const currentSection = document.querySelector('.screen-section.active');
            if (currentSection && currentSection.id === 'prospects-section') {
                renderProspectosTable(data.prospecto);
            }
            
            // Guardar los datos en una variable global
            window.appData = data;
            
            // Ocultar spinner
            hideSpinner();
            
            // Resolver la promesa
            resolve(data);
        }, 1000); // Simular 1 segundo de carga
    });
}

// Función para mostrar toast de prospectos sin atender - versión corregida
function showProspectosToast(cantidad) {
    const message = `Tienes <b>${cantidad}</b> <a href="#" onclick="navigateToProspects()" class="toast-link">prospectos</a> sin atender`;
    
    // Obtener el toast
    const toast = document.querySelector('.toast-notification');
    if (!toast) return;
    
    const iconElement = toast.querySelector('.toast-icon');
    const messageElement = toast.querySelector('.toast-message');
    const closeBtn = toast.querySelector('.toast-close');
    
    if (!messageElement) return;
    
    // Configurar el mensaje con HTML
    messageElement.innerHTML = message;
    
    // Configurar el tipo
    toast.className = 'toast-notification info';
    
    // Configurar icono
    if (iconElement) {
        iconElement.className = 'toast-icon fas fa-info-circle';
    }
    
    // Configurar el botón de cierre
    if (closeBtn) {
        // Remover cualquier evento anterior para evitar duplicados
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        
        // Obtener la referencia actualizada
        const newCloseBtn = toast.querySelector('.toast-close');
        
        // Configurar el nuevo evento de clic
        newCloseBtn.addEventListener('click', function() {
            toast.classList.remove('show');
        });
    }
    
    // Mostrar el toast
    toast.classList.add('show');
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Función para navegar a la pestaña de prospectos
function navigateToProspects() {
    // Encontrar y hacer clic en el enlace de navegación de prospectos
    const prospectsNavItem = document.querySelector('.nav-item[data-screen="prospects"]');
    if (prospectsNavItem) {
        prospectsNavItem.click();
    }
}

// Añadir la función al objeto window para acceso global desde HTML
window.navigateToProspects = navigateToProspects;