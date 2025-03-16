// Servicio para manejar las llamadas a la API

const API_URL = 'https://script.google.com/macros/s/AKfycbxeU3BNj9_535JZWBZWnNZkzTgRu8T4ngJXWuolJndij_N0yCYbPUvOnkLLPI_pa2eoQw/exec';

export const fetchData = async () => {
  try {
    // Agregar timestamp para evitar caché
    const url = `${API_URL}?timestamp=${new Date().getTime()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    throw error;
  }
};

export const saveData = async (data) => {
  try {
    // Aquí implementaríamos la lógica para guardar datos
    // En una implementación real, esto haría un POST al backend
    console.log('Datos a guardar:', data);
    
    // Simulación de llamada exitosa
    return { success: true, message: 'Datos guardados correctamente' };
  } catch (error) {
    console.error('Error al guardar los datos:', error);
    throw error;
  }
};

// Para desarrollo/pruebas
export const getMockData = () => {
  return {
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
        "nombre-prospecto": "Ana Martinez",
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
        "nombre-prospecto": "Juan Pérez",
        "telefono": "3333333333",
        "email": "3q@d.com",
        "ubicacion": "San Pedro Garza García, Nuevo León",
        "canal": "instagram",
        "fecha-prospecto": "08/03/2025 12:00 a.m.",
        "contactado": true,
        "interesado": false,
        "motivo": "adadada",
        "numero-cliente": ""
      }
    },
    contactosClientes: {
      "1": { 
        "id": "CLI-123456", 
        "nombre": "Cliente 1",
        "telefono": "1234567890",
        "email": "cliente1@example.com",
        "ubicacion": "Monterrey, NL",
        "fechaAlta": "15/01/2023"
      },
      "2": { 
        "id": "CLI-234567", 
        "nombre": "Cliente 2",
        "telefono": "2345678901",
        "email": "cliente2@example.com",
        "ubicacion": "San Pedro, NL",
        "fechaAlta": "20/02/2023"
      },
      "3": { 
        "id": "CLI-345678", 
        "nombre": "Cliente 3",
        "telefono": "3456789012",
        "email": "cliente3@example.com",
        "ubicacion": "Guadalupe, NL",
        "fechaAlta": "10/03/2023"
      }
    },
    expedienteClientes: {
      "1": { 
        "id": "EXP-001", 
        "cliente": "Cliente 1",
        "tipo": "Contrato",
        "fechaApertura": "20/01/2023",
        "estado": "abierto"
      },
      "2": { 
        "id": "EXP-002", 
        "cliente": "Cliente 2",
        "tipo": "Servicio", 
        "fechaApertura": "25/02/2023",
        "estado": "cerrado"
      }
    }
  };
}; 