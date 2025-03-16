import React, { Component, useState, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Prospects from './components/Prospects';
import Clients from './components/Clients';
import Records from './components/Records';
import Toast from './components/Toast';
import Spinner from './components/Spinner';
import MotivoModal from './components/modals/MotivoModal';
import ClienteModal from './components/modals/ClienteModal';
import { fetchData } from './services/api';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appData: {
        prospecto: {},
        contactosClientes: {},
        expedienteClientes: {}
      },
      loading: true,
      activeScreen: 'home',
      toastConfig: {
        message: '',
        type: 'default',
        show: false
      },
      unattendedCount: 0,
      motivoModal: {
        show: false,
        motivo: '',
        onSave: null
      },
      clienteModal: {
        show: false,
        prospecto: null,
        onSave: null
      },
      sidebarOpen: false
    };
  }

  // Método para cambiar la pantalla
  changeScreen = (screen) => {
    this.setState({ 
      activeScreen: screen,
      sidebarOpen: false
    });
  }

  // Mostrar toast
  showToast = (message, type = 'default') => {
    this.setState({
      toastConfig: {
        message,
        type,
        show: true
      }
    });
    
    setTimeout(() => {
      this.setState(prevState => ({
        toastConfig: {
          ...prevState.toastConfig,
          show: false
        }
      }));
    }, 5000);
  };

  // Toggle sidebar
  toggleSidebar = () => {
    this.setState(prevState => ({
      sidebarOpen: !prevState.sidebarOpen
    }));
  };

  // Carga de datos
  loadData = async () => {
    console.log("Iniciando carga de datos");
    try {
      // Activar el spinner explícitamente y esperar a que se renderice
      this.setState({ loading: true }, () => {
        console.log("Spinner activado");
        
        // Forzar que el spinner sea visible por un tiempo mínimo
        setTimeout(async () => {
          try {
            const data = await fetchData();
            console.log("Datos recibidos:", data);
            
            this.setState({
              appData: data,
              unattendedCount: Object.values(data.prospecto || {}).filter(
                p => !p.contactado
              ).length
            });
          } catch (error) {
            console.error('Error al cargar datos:', error);
            this.showToast('Error al cargar datos. Inténtelo de nuevo más tarde.', 'error');
          } finally {
            // Desactivar el spinner después de un tiempo para que sea visible
            setTimeout(() => {
              this.setState({ loading: false });
              console.log("Spinner desactivado");
            }, 500);
          }
        }, 500); // Tiempo mínimo que el spinner estará visible
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      this.setState({ loading: false });
    }
  };

  componentDidMount() {
    // Cargar datos al montar el componente
    this.loadData();
    
    // Configurar intervalo para recarga periódica
    this.interval = setInterval(() => {
      this.loadData();
    }, 300000); // 5 minutos
  }

  componentWillUnmount() {
    // Limpiar intervalo al desmontar
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const { 
      appData, 
      loading, 
      activeScreen, 
      toastConfig, 
      unattendedCount,
      motivoModal,
      clienteModal,
      sidebarOpen
    } = this.state;

    return (
      <Router basename="/mainreact">
        <div className="app-container">
          <Sidebar 
            activeScreen={activeScreen} 
            changeScreen={this.changeScreen}
            unattendedCount={unattendedCount}
            isOpen={sidebarOpen}
            toggleSidebar={this.toggleSidebar}
          />
          
          <main className="content-area">
            {activeScreen === 'home' && (
              <Dashboard 
                prospectos={appData.prospecto} 
                clientes={appData.contactosClientes}
                expedientes={appData.expedienteClientes}
                refreshData={this.loadData}
              />
            )}
            
            {activeScreen === 'prospects' && (
              <Prospects 
                prospectos={appData.prospecto} 
                refreshData={this.loadData}
                showToast={this.showToast}
                openMotivoModal={(motivo, onSave) => 
                  this.setState({ motivoModal: { show: true, motivo, onSave }})
                }
                openClienteModal={(prospecto, onSave) => 
                  this.setState({ clienteModal: { show: true, prospecto, onSave }})
                }
              />
            )}
            
            {activeScreen === 'clients' && (
              <Clients 
                clientes={appData.contactosClientes}
                showToast={this.showToast}
              />
            )}
            
            {activeScreen === 'records' && (
              <Records 
                expedientes={appData.expedienteClientes}
                showToast={this.showToast}
              />
            )}
          </main>
          
          {/* Modales */}
          <MotivoModal 
            show={motivoModal.show}
            motivo={motivoModal.motivo}
            onSave={motivoModal.onSave}
            onClose={() => this.setState({ 
              motivoModal: {...motivoModal, show: false}
            })}
          />
          
          <ClienteModal 
            show={clienteModal.show}
            prospecto={clienteModal.prospecto}
            onSave={clienteModal.onSave}
            onClose={() => this.setState({ 
              clienteModal: {...clienteModal, show: false}
            })}
          />

          {/* Toast y Spinner */}
          <Toast 
            message={toastConfig.message} 
            type={toastConfig.type} 
            show={toastConfig.show} 
            onClose={() => this.setState({ 
              toastConfig: {...toastConfig, show: false}
            })}
          />
          
          <Spinner show={loading} />
        </div>
      </Router>
    );
  }
}

// Función de navegación global para links en toast
window.navigateToProspects = () => {
  try {
    const rootElement = document.getElementById('root');
    const appInstance = rootElement._reactRootContainer._internalRoot.current.child.stateNode;
    
    if (appInstance && typeof appInstance.changeScreen === 'function') {
      appInstance.changeScreen('prospects');
    } else {
      window.location.hash = '#prospects';
    }
  } catch (e) {
    console.error("Error al navegar:", e);
  }
};

window.navigateToClients = () => {
  try {
    const rootElement = document.getElementById('root');
    const appInstance = rootElement._reactRootContainer._internalRoot.current.child.stateNode;
    
    if (appInstance && typeof appInstance.changeScreen === 'function') {
      appInstance.changeScreen('clients');
    } else {
      window.location.hash = '#clients';
    }
  } catch (e) {
    console.error("Error al navegar:", e);
  }
};

window.navigateToRecords = () => {
  try {
    const rootElement = document.getElementById('root');
    const appInstance = rootElement._reactRootContainer._internalRoot.current.child.stateNode;
    
    if (appInstance && typeof appInstance.changeScreen === 'function') {
      appInstance.changeScreen('records');
    } else {
      window.location.hash = '#records';
    }
  } catch (e) {
    console.error("Error al navegar:", e);
  }
};

export default App; 