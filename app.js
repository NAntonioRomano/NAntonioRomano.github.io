// --- script.js (Versión Robustecida con IndexedDB) ---

// Nombre y versión de nuestra base de datos
const DB_NAME = 'PanaderiaDB';
const DB_VERSION = 1;
const STORE_CLIENTES = 'clientes';
const STORE_PLANTILLAS = 'plantillas';

let db; // Variable global para la instancia de la base de datos

// --- 1. Inicialización de la Base de Datos ---

/**
 * Abre la base de datos o la crea si no existe.
 * Esta es la parte más crítica para la robustez.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = function(event) {
            console.error("Error al abrir IndexedDB:", event.target.errorCode);
            reject('Error al iniciar la base de datos.');
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log('Base de datos abierta con éxito.');
            resolve(db);
        };

        // Este evento solo se dispara si se crea la DB por primera vez
        // o si se actualiza la versión (DB_VERSION).
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            console.log('Actualizando estructura de DB...');
            
            // Creación del almacén de clientes (keyPath es la clave única)
            if (!db.objectStoreNames.contains(STORE_CLIENTES)) {
                db.createObjectStore(STORE_CLIENTES, { keyPath: 'id' });
            }

            // Creación del almacén de plantillas (keyPath es el ID del cliente)
            if (!db.objectStoreNames.contains(STORE_PLANTILLAS)) {
                db.createObjectStore(STORE_PLANTILLAS, { keyPath: 'clienteId' });
            }
        };
    });
}

// --- 2. Funciones CRUD (Crear, Leer, Actualizar, Borrar) para Clientes ---

/**
 * Agrega o actualiza un cliente.
 * @param {Object} cliente - Objeto cliente con sus datos.
 */
function putCliente(cliente) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CLIENTES], 'readwrite');
        const store = transaction.objectStore(STORE_CLIENTES);
        
        const request = store.put(cliente); // put() inserta o actualiza si la clave (id) ya existe.

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Obtiene la lista completa de clientes.
 * @returns {Array} Lista de clientes.
 */
function getAllClientes() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CLIENTES], 'readonly');
        const store = transaction.objectStore(STORE_CLIENTES);
        
        const request = store.getAll(); // Obtiene todos los objetos en el almacén.

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Elimina un cliente.
 */
function deleteCliente(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CLIENTES, STORE_PLANTILLAS], 'readwrite');
        const clienteStore = transaction.objectStore(STORE_CLIENTES);
        const plantillaStore = transaction.objectStore(STORE_PLANTILLAS);
        
        // Eliminamos el cliente y su plantilla asociada
        clienteStore.delete(id);
        plantillaStore.delete(id); // El keyPath de plantilla es 'clienteId'
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = (event) => reject(event.target.error);
    });
}

// --- 3. Funciones CRUD para Plantillas ---

/**
 * Agrega o actualiza una plantilla.
 */
function putPlantilla(plantilla) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_PLANTILLAS], 'readwrite');
        const store = transaction.objectStore(STORE_PLANTILLAS);
        
        const request = store.put(plantilla);

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Obtiene todas las plantillas.
 */
function getAllPlantillas() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_PLANTILLAS], 'readonly');
        const store = transaction.objectStore(STORE_PLANTILLAS);
        
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// --- Modificación de la Lógica Existente ---

// La lógica principal ahora usa las funciones async de IndexedDB (con async/await para mayor limpieza).

clienteForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    // ... (Captura de datos del formulario igual que antes)
    const id = document.getElementById('cliente-id').value || Date.now().toString(); 
    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const celular = document.getElementById('celular').value;
    const saldo = parseFloat(document.getElementById('saldo').value) || 0;
    
    const nuevoCliente = { id, nombre, direccion, celular, saldo };
    
    try {
        await putCliente(nuevoCliente); // Usa la función robusta
        renderClientes();
        clienteForm.reset(); 
        document.getElementById('cliente-id').value = ''; 
        saveBtn.textContent = 'Guardar Cliente';
        alert('Cliente guardado/actualizado con éxito.');
    } catch (error) {
        alert('Hubo un error al guardar el cliente.');
        console.error(error);
    }
});

async function renderClientes() {
    try {
        const clientes = await getAllClientes(); // Obtiene clientes de IndexedDB
        clientesList.innerHTML = ''; 

        if (clientes.length === 0) {
            clientesList.innerHTML = '<li>Aún no hay clientes registrados.</li>';
            return;
        }
        // ... (El resto del código de renderización es similar, usando los botones)
        clientes.forEach(cliente => {
            // ... (Creación del <li> y botones) ...
            // EJEMPLO DE CÓDIGO HTML A GENERAR:
            // li.innerHTML = `... <button onclick="editarCliente('${cliente.id}')">Editar</button> ...`;
        });
        
    } catch (error) {
        clientesList.innerHTML = '<li>Error al cargar la base de datos.</li>';
    }
}

async function bajaCliente(id) {
    if (confirm('¿Estás seguro de que quieres eliminar a este cliente?')) {
        try {
            await deleteCliente(id); // Llama a la función que borra cliente y plantilla
            renderClientes();
            alert('Cliente eliminado.');
        } catch (error) {
            alert('Error al eliminar el cliente.');
            console.error(error);
        }
    }
}

async function mostrarPlantilla(clienteId, nombre) {
    // 1. Obtener todas las plantillas
    const plantillasArr = await getAllPlantillas();
    // 2. Buscar la plantilla específica del cliente
    const plantillaExistente = plantillasArr.find(p => p.clienteId === clienteId);
    const pedidoActual = plantillaExistente ? plantillaExistente.cantidad : 0;
    
    const nuevoPedido = prompt(`Establecer plantilla de pedido para ${nombre}.
    Pedido actual: ${pedidoActual} unidades.
    Ingresa la cantidad estándar de pan francés:`, pedidoActual);

    if (nuevoPedido !== null) {
        const cantidad = parseInt(nuevoPedido);
        if (!isNaN(cantidad) && cantidad >= 0) {
            const nuevaPlantilla = { clienteId, cantidad };
            await putPlantilla(nuevaPlantilla); // Guardar/Actualizar plantilla
            alert(`Plantilla de ${nombre} guardada: ${cantidad} unidades.`);
        } else {
            alert('Por favor, ingresa un número válido.');
        }
    }
}

async function generarRepartoDesdePlantillas() {
    // Implementación similar, pero usando getAllClientes() y getAllPlantillas()
    // para obtener los datos de IndexedDB.
    try {
        const clientes = await getAllClientes();
        const plantillasArr = await getAllPlantillas();
        // Convertimos el array de plantillas a un objeto para fácil acceso
        const plantillas = plantillasArr.reduce((acc, p) => {
            acc[p.clienteId] = p.cantidad;
            return acc;
        }, {});
        
        // ... (El resto del código para listar el reparto es el mismo)
        // ... (Se utiliza: const cantidad = plantillas[cliente.id] || 0; )
        
    } catch (error) {
        repartoList.innerHTML = '<li>Error al generar el reparto.</li>';
    }
}

// --- Inicialización con la base de datos ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await openDB(); // Abrimos la base de datos primero
        renderClientes();
        generarRepartoDesdePlantillas();
    } catch (error) {
        console.error('La aplicación no pudo iniciar correctamente.');
    }
});