const Toast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	timer:3000,
	timerProgressBar: true
});

document.addEventListener('DOMContentLoaded',() => {
	const selectEstacionamiento = document.getElementById('select-estacionamiento');
	const tbody = document.getElementById('tbody-pisos');
	const btnCreate = document.getElementById('button-create-bottom');
	const btnCancelar = document.getElementById('btn-cancelar-piso');
	const btnGuardar = document.getElementById('btn-guardar-piso');
	const formContainer = document.getElementById('form-container');

	tbody.addEventListener('click', (e) => {
		if (e.target.classList.contains('edit')) {
			const btn= e.target;
			activarEdicion(btn, btn.dataset.id, btn.dataset.num, btn.dataset.desc);
		}
	});
	selectEstacionamiento.addEventListener('change', (e) => {
		cargarPisos(e.target.value);
	});
	btnCreate.addEventListener('click', () => {
		formContainer.style.display = 'block';
	});
	btnCancelar.addEventListener('click', () => {
		formContainer.style.display = 'none';
	});
	btnGuardar.addEventListener('click', guardarPiso);
	cargarEstacionamientos();
});

async function cargarEstacionamientos() {
  const selectEstacionamiento = document.getElementById('select-estacionamiento');
    try {
        const res = await fetch('/api/estacionamientos');
        const data = await res.json();

        if (res.ok && Array.isArray(data)){
        	selectEstacionamiento.innerHTML = '<option value="todos"> Todos los estacionamientos</option>';
        	data.forEach(est => {
        		const option = document.createElement('option');
        		option.value = est.estacionamiento_id;
        		option.textContent = est.nombre;
        		selectEstacionamiento.appendChild(option);
        	});
        	cargarPisos('todos');
        }
    } catch (err) {
        console.error("Error al cargar pisos:", err);
    }
}
async function cargarPisos(idEstacionamiento = 'todos') {
	const tbody = document.getElementById ('tbody-pisos');
	try {
		const res = await fetch(`/api/pisos?estacionamiento_id=${idEstacionamiento}`);
		const pisos = await res.json();
		tbody.innerHTML = Array.isArray(pisos) && pisos.length > 0
		? pisos.map(piso => `
				<tr id="fila-${piso.piso_id}">
					<td>${piso.numero_piso}</td>
					<td>${piso.descripcion}</td>
					<td>
						<button class="btn-action edit"
							data-id="${piso.piso_id}"
							data-num="${piso.numero_piso}"
							data-desc="${piso.descripcion}">Editar</button>
						<button class="btn-action delete" onclick="eliminarPiso(${piso.piso_id})">Eliminar</button>
					</td>
				</tr>
		`).join('')
		: '<tr><td colspan="3">No se encontraron pisos.</td></tr>';
	}catch (err) {
		console.error("Error cargando Pisos:", err );
	}
}

function activarEdicion(btn,id,num,desc) {
	const fila = btn.closest('tr');
	fila.innerHTML = `
		<td>
			<input type="number" id="edit-num-${id}" class="swal2-input" style="padding: 10px; border: 1px solid #ccc;border-radius: 4px; flex: 2;"value="${num}">
		</td>
		<td>
			<input type="text" id="edit-desc-${id}" class="swal2-input" style="padding: 10px; border: 1px solid #ccc;border-radius: 4px; flex: 2;"value="${desc}">
		</td>
		<td>
			<button class="btn btn-success btn-guardar" onclick="guardarEdicion(${id})">Guardar</button>
        	<button class="btn btn-secondary btn-cancelar" onclick="cargarPisos('todos')">Cancelar</button>
		</td>
	`;
}
async function guardarEdicion(id) {
	const nuevoNum = document.getElementById(`edit-num-${id}`).value;
	const nuevaDesc = document.getElementById(`edit-desc-${id}`).value;
	try {
		const res = await fetch(`/api/pisos/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ numero_piso: nuevoNum, descripcion: nuevaDesc })
		});
		if (res.ok) {
			Toast.fire({ icon: 'success', title: 'Piso actualizado' });
			cargarPisos('todos');
		} else {
			Swal.fire('Error', 'No se pudo actualizar', 'error');
		}
	} catch (err) {
		console.error("Error al guardar:", err);
	}
}
async function guardarPiso() {
    const select = document.getElementById('select-estacionamiento');
    const inputNum = document.getElementById('numeroPiso');
    const inputDesc = document.getElementById('descripcionPiso');
    const formContainer = document.getElementById('form-container');
    const valorSeleccionado = select.value;

    if (!valorSeleccionado || valorSeleccionado === "todos") {
        Swal.fire('Error', 'Debes seleccionar un estacionamiento válido', 'warning');
        return;
    }

    if (!inputNum.value || !inputDesc.value) {
        Swal.fire('Error', 'Completa el número y la descripción del piso', 'warning');
        return;
    }

    const data = {
        numero_piso: inputNum.value,
        descripcion: inputDesc.value,
        estacionamiento_id: parseInt(valorSeleccionado)
    };
    try {
        const res = await fetch('/api/pisos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            Toast.fire({ icon: 'success', title: 'Piso creado correctamente' });
            formContainer.style.display = 'none';
            inputNum.value = '';
            inputDesc.value = '';
            cargarPisos(valorSeleccionado); 
        } else {
            const errorData = await res.json();
            Swal.fire('Error', errorData.message || 'No se pudo guardar el piso', 'error');
        }
    } catch (err) {
        console.error("Error al guardar:", err);
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    }
}

async function eliminarPiso(id) {
	const result = await Swal.fire({
		title: 'Estas seguro?',
		text: "El piso dejara de estar disponible en el sistema.",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#211A60',
		cancelButtonColor: '#dc3545',
		confirmButtonText: 'Si, eliminar',
		cancelButtonText: 'Cancelar'
	});

	if (result.isConfirmed) {
		await fetch(`/api/pisos/delete/${id}`, { method: 'PUT' });
		cargarPisos('todos');
		Toast.fire({icon: 'success', title: 'Piso dado de baja' });
	}
}
