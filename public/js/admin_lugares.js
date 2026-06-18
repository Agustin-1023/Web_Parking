document.addEventListener('DOMContentLoaded', () => {
    cargarEstacionamientos();

    // Eventos de cambios en selects
    document.getElementById('select-estacionamiento').addEventListener('change', (e) => {
        cargarPisos(e.target.value);
    });

    document.getElementById('select-piso').addEventListener('change', () => {
        cargarLugares();
    });

    // Delegación de eventos para botones de la tabla (Eliminar)
    document.getElementById('tbody-lugares').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) {
            deletesoft(e.target.getAttribute('data-id'));
        }
    });

    // Evento del botón Guardar
    document.getElementById('btn-guardar-lugar').addEventListener('click', manejarGuardado);
});

// --- FUNCIONES DE CARGA ---

async function cargarEstacionamientos() {
    try {
        const response = await fetch('/api/estacionamientos');
        const data = await response.json();
        const select = document.getElementById('select-estacionamiento');
        select.innerHTML = '<option value="">Seleccione estacionamiento...</option>';
        data.forEach(est => {
            select.innerHTML += `<option value="${est.estacionamiento_id}">${est.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar estacionamientos", error);
    }
}

async function cargarPisos(estacionamientoId) {
    if (!estacionamientoId) return;
    try {
        const response = await fetch(`/api/pisos?estacionamiento_id=${estacionamientoId}`);
        const data = await response.json();
        const select = document.getElementById('select-piso');
        select.innerHTML = `<option value="">Selecciona un piso...</option>`;
        data.forEach(piso => {
            select.innerHTML += `<option value="${piso.piso_id}">Piso ${piso.numero_piso}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar pisos", error);
    }
}

async function cargarLugares() {
    const pisoId = document.getElementById('select-piso').value;
    if (!pisoId) return;

    try {
        const response = await fetch(`/api/lugares?piso_id=${pisoId}`);
        if (!response.ok) throw new Error('Error al obtener lugares');
        
        const lugares = await response.json();
        const tbody = document.getElementById('tbody-lugares');
        tbody.innerHTML = '';

        lugares.forEach(lugar => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${lugar.piso_id}</td>
                <td>${lugar.codigo_lugar}</td>
                <td>${lugar.tipo_lugar}</td>
                <td>${lugar.estado == 1 ? 'Activo' : 'Inactivo'}</td>
                <td><button class="btn-eliminar" data-id="${lugar.lugar_id}" style="color: red; cursor: pointer;">Eliminar</button></td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar lugares:", error);
    }
}

// --- LÓGICA DE GUARDADO (Individual vs Masivo) ---

function manejarGuardado() {
    const contenedorMasivo = document.getElementById('contenedor-masivo');
    // Si el contenedor masivo está visible (display block/flex), guarda masivo
    if (contenedorMasivo && contenedorMasivo.style.display !== 'none') {
        guardarLugarMasivo();
    } else {
        guardarLugarIndividual();
    }
}

async function guardarLugarIndividual() {
    const data = {
        piso_id: document.getElementById('select-piso').value,
        codigo_lugar: document.getElementById('codigo-lugar').value, // Asegúrate de tener este ID en HTML
        tipo_lugar: document.getElementById('tipo-lugar').value,     // Asegúrate de tener este ID en HTML
        estado: 1
    };

    try {
        const response = await fetch('/api/lugar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            Swal.fire('Éxito', 'Lugar guardado', 'success');
            cargarLugares();
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function guardarLugarMasivo() {
	const tipoLugarSeleccionado = document.getElementById('tipo-lugar-masivo').value;

    const data = {
        piso_id: document.getElementById('select-piso').value,
        prefijo: document.getElementById('prefijo').value,
        inicio: parseInt(document.getElementById('inicio').value),
        cantidad: parseInt(document.getElementById('cantidad').value),
   	tipo_lugar: tipoLugarSeleccionado
    };

    try {
        const response = await fetch('/api/lugares/masivo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (response.ok) {
            Swal.fire('¡Éxito!', 'Inserción masiva completada', 'success');
            cargarLugares();
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error("Error masivo:", error);
    }
}

// --- ELIMINACIÓN ---

async function deletesoft(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/lugar/${id}`, { method: 'DELETE' });
            if (response.ok) {
                Swal.fire('Eliminado', '', 'success');
                cargarLugares();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}
