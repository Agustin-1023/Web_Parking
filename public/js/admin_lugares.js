document.addEventListener('DOMContentLoaded', () => {
    cargarEstacionamientos();
    const tbody = document.getElementById('tbody-lugares');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            const id = e.target.getAttribute('data-id');

            if (e.target.classList.contains('btn-editar')) activarEdicion(fila, id);
            if (e.target.classList.contains('btn-eliminar')) deletesoft(id);
            if (e.target.classList.contains('btn-guardar')) guardarEdicion(fila, id);
            if (e.target.classList.contains('btn-cancelar')) cargarLugares();
        });
    }
    document.getElementById('select-estacionamiento').addEventListener('change', (e) => cargarPisos(e.target.value));
    document.getElementById('select-piso').addEventListener('change', () => cargarLugares());
    document.getElementById('btn-guardar-lugar').addEventListener('click', manejarGuardado);
});

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
                <td class="acciones">
                    <button class="btn btn-editar" data-id="${lugar.lugar_id}">Editar</button>
                    <button class="btn btn-eliminar" data-id="${lugar.lugar_id}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar lugares:", error);
    }
}
function activarEdicion(fila,id) {
    const celdas = fila.children;
    const codigoActual = celdas[1].innerText;
    const tipoActual = celdas[2].innerText;
    const estiloInput = "padding: 6px; border: 1px solid #ced4da; border-radius: 4px; width: 100%; box-sizing: border-box;";
    celdas[1].innerHTML = `<input type="text" id="edit-codigo" value="${codigoActual}" class="form-control" style="${estiloInput}">`;
    celdas[2].innerHTML = `
        <select id="edit-tipo" class="form-control" style="${estiloInput}">
            <option value="Normal" ${tipoActual === 'Normal' ? 'selected' : ''}>Normal</option>
            <option value="Discapacitados" ${tipoActual === 'Discapacitadors' ? 'selected' : ''}>Discapacitados</option>
            <option value="Electrico" ${tipoActual === 'Electrico' ? 'selected' : ''}>Electrico</option>
        </select>`;
    celdas[4].innerHTML = `
        <button class="btn btn-success btn-guardar" data-id="${id}" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Guardar</button>
        <button class="btn btn-secondary btn-cancelar" style="background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Cancelar</button>
    `;
}

async function guardarEdicion(fila, id){
    const data = {
        codigo_lugar: document.getElementById('edit-codigo').value,
        tipo_lugar: document.getElementById('edit-tipo').value
    };
    try {
        const response = await fetch(`/api/lugar/${id}`,{
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (response.ok) {
            Swal.fire('Exito', 'Lugar actualizado', 'success');
            cargarLugares();
        } else {
            Swal.fire('Error', 'No se pudo actualizar','oerror');
        }
    } catch (error) {
        Swal.fire('Error','hubo un problema con la conexion','error');
    }
}
async function deletesoft(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Este lugar quedará como 'Inactivo'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar'
    });
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/lugar/${id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'soft-delete' })
            });
            if (response.ok) {
                Swal.fire('Desactivado', 'El lugar ha sido marcado como inactivo', 'success');
                cargarLugares();
            }
        } catch (error) {
            console.error("Error al desactivar:", error);
        }
    }
}

function manejarGuardado() {
    const contenedorMasivo = document.getElementById('contenedor-masivo');
    if (contenedorMasivo && contenedorMasivo.style.display !== 'none') {
        guardarLugarMasivo();
    } else {
        guardarLugarIndividual();
    }
}

async function guardarLugarIndividual() {
    const data = {
        piso_id: document.getElementById('select-piso').value,
        codigo_lugar: document.getElementById('codigo-lugar').value,
        tipo_lugar: document.getElementById('tipo-lugar').value,    
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

async function editarLugar(id) {
    try {
        const response = await fetch(`/api/lugar/${id}`);
        const lugar = await response.json();

        const tipos = ['Normal', 'Discapacitados', 'Electrico'];

        const opciones = tipos.map(t =>
            `<option value="${t}" ${lugar.tipo_lugar === t ? 'selected' : ''}>${t}</option>`
        ).join('');

        const { value: formValues } = await Swal.fire({
            title: 'Editar Lugar',
            html:`
                <div style="text-align: left;">
                    <label style="font-weight: bold;">Codigo del lugar:</label>
                    <input id="swal-codigo" class="swal2-input" style="padding: 10px; border: 1px solid #ccc;border-radius: 4px; flex: 2;" value="${lugar.codigo_lugar}">
                    <label style="font-weight: bold;"> Tipo de lugar:</label>
                    <select id="swal-tipo" class="swal2-select" style="display: block; width: 100%; margin-top: 5px;">
                ${opciones}
                    </select>
                </div>
                `,
            focusConfirm: false,
            confirmButtonText: 'Guardar cambios',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    codigo_lugar: document.getElementById('swal-codigo').value,
                    tipo_lugar: document.getElementById('swal-tipo').value
                }
            }
        });
        if (formValues) {
            const updateResponse = await fetch(`/api/lugar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(formValues)
            });
            if (updateResponse.ok) {
                Swal.fire('Aceptado', 'Lugar actualizado correctamente.', 'success');
                cargarLugares();
            } else {
                Swal.fire('Error', 'No se pudo actualizar', 'error');
            }
        }
    } catch (error) {
        console.error("Error al editar:", error);
        Swal.fire('Error', 'algo salio mal', 'error');
    }
}