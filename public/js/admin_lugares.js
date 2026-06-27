document.addEventListener('DOMContentLoaded', () => {
    cargarEstacionamientos();
    const tbody = document.getElementById('tbody-lugares');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-editar')) {
                const id = e.target.getAttribute('data-id');
                editarLugar(id);
            }
            if (e.target.classList.contains('btn-eliminar')) {
                const id = e.target.getAttribute('data-id');
                deletesoft(id);
            }
        });
    }
    document.getElementById('select-estacionamiento').addEventListener('change', (e) => {
        cargarPisos(e.target.value);
    });
    document.getElementById('select-piso').addEventListener('change', () => {
        cargarLugares();
    });
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
		const { value: formValues } = await Swal.fire({
			title: 'Editar Lugar',
			html:`
				<label>Codigo del lugar:</label>
				<input id="swal-codigo" class="swal2-input" value="${lugar.codigo_lugar}">
				<label>Tipo de lugar: </label>
				<input id="swal-tipo" class="swal2-input" value="${lugar.tipo_lugar}">
				`,
			focusConfirm: false,
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formValues)
			});
			if (updateResponse.ok) {
				Swal.fire('Exitoso, lugar actualizado','success');
				cargarLugares();
			} else {
				Swal.fire('Error','no se pudo actualizar','error');
			}
		}
	} catch (error) {
		console.error("error al editar",error);
		Swal.fire('Error','algo salio mal en los datos','error');
	}
}
	







