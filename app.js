// --- script.js (Versión Corregida y Robustecida con IndexedDB) ---

// Nombre y versión de nuestra base de datos
const DB_NAME = 'PanaderiaDB';
const DB_VERSION = 1; // Recuerda: aumenta este número (ej: 2) si necesitas forzar la recreación de la estructura de la DB.
const STORE_CLIENTES = 'clientes';
const STORE_PLANTILLAS = 'plantillas';

let db; // Variable global para la instancia de la base de datos

// Variables del DOM (Declaradas con 'let' para ser asignadas DENTRO de DOMContentLoaded)
let clienteForm;
let clientesList;
let repartoList;
let saveBtn;


// --- 1. Inicialización de la Base de Datos ---

/**
 * Abre la base de datos o la crea si no existe.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = function(event) {
            console.error("Error al abrir IndexedDB:", event.target.errorCode, event.target.error);
            reject('Error al iniciar la base de datos.');
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log('Base de datos abierta con éxito.');
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            console.log('Creando/Actualizando estructura de DB...');
            
            if (!db.objectStoreNames.contains(STORE_CLIENTES)) {
                db.createObjectStore(STORE_CLIENTES, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORE_PLANTILLAS)) {
                db.createObjectStore(STORE_PLANTILLAS, { keyPath: 'clienteId' });
            }
        };
    });
}

// --- 2. Funciones CRUD (Crear, Leer, Actualizar, Borrar) para Clientes ---

function putCliente(cliente) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CLIENTES], 'readwrite');
        const store = transaction.objectStore(STORE_CLIENTES);
        
        const request = store.put(cliente);

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllClientes() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CLIENTES], 'readonly');
        const store = transaction.objectStore(STORE_CLIENTES);
        
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function deleteCliente(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CLIENTES, STORE_PLANTILLAS], 'readwrite');
        const clienteStore = transaction.objectStore(STORE_CLIENTES);
        const plantillaStore = transaction.objectStore(STORE_PLANTILLAS);
        
        // Eliminamos el cliente y su plantilla asociada
        clienteStore.delete(id);
        plantillaStore.delete(id);
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = (event) => reject(event.target.error);
    });
}

// --- 3. Funciones CRUD para Plantillas ---

function putPlantilla(plantilla) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_PLANTILLAS], 'readwrite');
        const store = transaction.objectStore(STORE_PLANTILLAS);
        
        const request = store.put(plantilla);

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllPlantillas() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_PLANTILLAS], 'readonly');
        const store = transaction.objectStore(STORE_PLANTILLAS);
        
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}


// --- 4. Lógica de UI (renderClientes, bajaCliente, etc.) ---

async function renderClientes() {
    try {
        const clientes = await getAllClientes();
        clientesList.innerHTML = ''; 

        if (clientes.length === 0) {
            clientesList.innerHTML = '<li>Aún no hay clientes registrados.</li>';
            return;
        }

        clientes.forEach(cliente => {
            const li = document.createElement('li');
            
            // Reemplaza esta línea con tu código HTML para mostrar el cliente y los botones:
            li.innerHTML = `
                <strong>${cliente.nombre}</strong> (${cliente.celular}) <br>
                Dir: ${cliente.direccion} - Saldo: $${cliente.saldo.toFixed(2)}
                <div style="margin-top: 5px;">
                    <button onclick="editarCliente('${cliente.id}')">Editar</button>
                    <button onclick="bajaCliente('${cliente.id}')">Eliminar</button>
                    <button onclick="mostrarPlantilla('${cliente.id}', '${cliente.nombre}')">Plantilla Pedido</button>
                </div>
            `;
            clientesList.appendChild(li);
        });
        
    } catch (error) {
        clientesList.innerHTML = '<li>Error al cargar la base de datos.</li>';
        console.error("Error en renderClientes:", error);
    }
}

function editarCliente(id) {
    // Implementación de la función editarCliente (usa getAllClientes para buscar el cliente)
}

async function bajaCliente(id) {
    if (confirm('¿Estás seguro de que quieres eliminar a este cliente?')) {
        try {
            await deleteCliente(id);
            renderClientes();
            alert('Cliente eliminado.');
        } catch (error) {
            alert('Error al eliminar el cliente.');
            console.error(error);
        }
    }
}

async function mostrarPlantilla(clienteId, nombre) {
    // Implementación de la función mostrarPlantilla (usa getAllPlantillas y putPlantilla)
}

async function generarRepartoDesdePlantillas() {
    // Implementación de la función generarRepartoDesdePlantillas (usa getAllClientes y getAllPlantillas)
}

// --- 5. Inicialización (Punto de entrada de la aplicación) ---
document.addEventListener('DOMContentLoaded', async () => {
    // A. ASIGNAR VARIABLES DEL DOM (CORRECCIÓN CRÍTICA)
    // Esto se ejecuta SOLO cuando el HTML está completamente cargado.
    clienteForm = document.getElementById('cliente-form');
    clientesList = document.getElementById('clientes-list');
    repartoList = document.getElementById('reparto-list');
    saveBtn = document.getElementById('save-btn');
    
    // B. ASIGNAR EVENT LISTENER (CORRECCIÓN CRÍTICA)
    // Ahora que clienteForm está definido, podemos asignarle el listener.
    clienteForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const id = document.getElementById('cliente-id').value || Date.now().toString(); 
        const nombre = document.getElementById('nombre').value;
        const direccion = document.getElementById('direccion').value;
        const celular = document.getElementById('celular').value;
        const saldo = parseFloat(document.getElementById('saldo').value) || 0;
        
        const nuevoCliente = { id, nombre, direccion, celular, saldo };
        
        try {
            await putCliente(nuevoCliente);
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


    // C. INICIAR LA BASE DE DATOS Y LA APLICACIÓN
    try {
        await openDB(); // Abrimos la base de datos primero
        renderClientes();
        // Puedes agregar aquí la lógica para vincular el botón "Generar Reparto"
        // document.getElementById('generar-reparto-btn').onclick = generarRepartoDesdePlantillas;
        generarRepartoDesdePlantillas();
    } catch (error) {
        console.error('La aplicación no pudo iniciar correctamente. Revisar la configuración de IndexedDB.', error);
    }
});
