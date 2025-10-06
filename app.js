// --- script.js (Versión Final y Funcional) ---

// Nombre y versión de nuestra base de datos
const DB_NAME = 'PanaderiaDB';
const DB_VERSION = 1; // IMPORTANTE: Aumenta este número si cambias la estructura de los Object Stores.
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
                // KeyPath es 'clienteId' porque lo usaremos para almacenar el pedido recurrente del cliente
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
        
        clienteStore.delete(id);
        plantillaStore.delete(id); // Elimina la plantilla asociada
        
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


// --- 4. Lógica de UI (renderClientes, bajaCliente, editarCliente, etc.) ---

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
            
            // HTML para mostrar el cliente y los botones
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

/**
 * Prepara el formulario para editar un cliente. (FUNCIÓN ARREGLADA)
 * @param {string} id - ID del cliente a editar.
 */
async function editarCliente(id) {
    try {
        const clientes = await getAllClientes();
        const cliente = clientes.find(c => c.id === id);
        
        if (cliente) {
            // CRÍTICO: Rellenar el campo oculto y los campos visibles
            document.getElementById('cliente-id').value = cliente.id; 
            document.getElementById('nombre').value = cliente.nombre;
            document.getElementById('direccion').value = cliente.direccion;
            document.getElementById('celular').value = cliente.celular;
            document.getElementById('saldo').value = cliente.saldo;
            
            // Actualizar el botón (usa la variable global 'saveBtn')
            saveBtn.textContent = 'Actualizar Cliente';
            
            document.getElementById('cliente-form-section').scrollIntoView({ behavior: 'smooth' });
            console.log(`Cliente con ID ${id} cargado para edición.`);
        } else {
            alert('Error: Cliente no encontrado para edición.');
        }
    } catch (error) {
        console.error('Error al intentar cargar datos para edición:', error);
    }
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

/**
 * Muestra un prompt para configurar el pedido estándar (plantilla) de un cliente. (FUNCIÓN IMPLEMENTADA)
 */
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

/**
 * Genera la lista de reparto usando las plantillas guardadas. (FUNCIÓN IMPLEMENTADA)
 */
async function generarRepartoDesdePlantillas() {
    try {
        const clientes = await getAllClientes();
        const plantillasArr = await getAllPlantillas();
        repartoList.innerHTML = ''; // Limpiar la lista de reparto
        
        if (clientes.length === 0) {
            repartoList.innerHTML = '<li>No puedes generar un reparto sin clientes.</li>';
            return;
        }

        // Convertimos el array de plantillas a un objeto para fácil acceso (key=clienteId, value=cantidad)
        const plantillas = plantillasArr.reduce((acc, p) => {
            acc[p.clienteId] = p.cantidad;
            return acc;
        }, {});
        
        let totalPan = 0;
        
        clientes.forEach(cliente => {
            const cantidad = plantillas[cliente.id] || 0; 
            totalPan += cantidad;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${cliente.nombre}</strong> - ${cliente.direccion}
                <br>
                <input type="number" value="${cantidad}" onchange="actualizarPedidoReparto(this.value, '${cliente.id}')" style="width: 80px;"> unidades de pan.
            `;
            repartoList.appendChild(li);
        });
        
        // Mostrar el total
        const totalLi = document.createElement('li');
        totalLi.style.fontWeight = 'bold';
        totalLi.innerHTML = `<h3>TOTAL DE PAN A PREPARAR: ${totalPan} unidades</h3>`;
        repartoList.prepend(totalLi);

    } catch (error) {
        repartoList.innerHTML = '<li>Error al generar el reparto.</li>';
        console.error('Error en generarRepartoDesdePlantillas:', error);
    }
}

// Función auxiliar para el evento 'onchange' en la lista de reparto (no guarda, solo simula)
function actualizarPedidoReparto(nuevaCantidad, clienteId) {
    console.log(`Pedido del cliente ${clienteId} actualizado a ${nuevaCantidad} para el reparto actual. (Este cambio no se guarda en la plantilla)`);
    // Para que el TOTAL se actualice, se necesitaría re-ejecutar generarRepartoDesdePlantillas()
}


// --- 5. Inicialización (Punto de entrada de la aplicación) ---
document.addEventListener('DOMContentLoaded', async () => {
    // A. ASIGNAR VARIABLES DEL DOM (CRÍTICO)
    clienteForm = document.getElementById('cliente-form');
    clientesList = document.getElementById('clientes-list');
    repartoList = document.getElementById('reparto-list');
    saveBtn = document.getElementById('save-btn');
    
    // B. ASIGNAR EVENT LISTENER (CRÍTICO)
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
        // Vinculamos el botón de generar reparto (si lo tienes en el HTML)
        const generarRepartoBtn = document.querySelector('#reparto-section button');
        if (generarRepartoBtn) {
            generarRepartoBtn.onclick = generarRepartoDesdePlantillas;
        }
        generarRepartoDesdePlantillas();
    } catch (error) {
        console.error('La aplicación no pudo iniciar correctamente. Revisar la configuración de IndexedDB.', error);
    }
});


