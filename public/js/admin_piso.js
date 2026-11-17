const Toast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	timer: 3000,
	timerProgressBar: true
});

document.addEventListener('DOMContentLoaded', () => {
	const selectFiltro = document.getElementById('select-estacionamiento-filtro');
	const selectEstacionamiento = document.getElementById('select-estacionamiento');
	const tbody = document.getElementById('tbody-pisos');
	const btnCreate = document.getElementById('button-create-top');
	const btnCancelar = document.getElementById('btn-cancelar-piso');
	const btnGuardar = document.getElementById('btn-guardar-piso');
	const formContainer = document.getElementById('form-container');

	if (selectFiltro) {
		selectFiltro.addEventListener('change', (e) => {
			listarPisosPorEstacionamiento(e.target.value);
		});
	}

	if (tbody) {
		tbody.addEventListener('click', (e) => {
			if (e.target.classList.contains('edit')) {
				const btn = e.target;
				activarEdicion(btn, btn.dataset.id, btn.dataset.num, btn.dataset.desc);
			}
		});
	}

	if (btnCreate) {
		btnCreate.addEventListener('click', () => {
			const filtroVal = selectFiltro ? selectFiltro.value : '';
			if (filtroVal && filtroVal !== 'todos') {
				selectEstacionamiento.value = filtroVal;
			}
			formContainer.style.display = 'block';
		});
	}

	if (btnCancelar) {
		btnCancelar.addEventListener('click', () => {
			formContainer.style.display = 'none';
		});
	}

	if (btnGuardar) {
		btnGuardar.addEventListener('click', guardarPiso);
	}

	cargarEstacionamientos();
});

async function cargarEstacionamientos() {
	const selectEstacionamiento = document.getElementById('select-estacionamiento');
	const selectFiltro = document.getElementById('select-estacionamiento-filtro');

	try {
		const res = await fetch('/api/estacionamientos');
		const data = await res.json();

		if (res.ok && Array.isArray(data)) {
			let opcionesHtml = '<option value="todos">Todos los estacionamientos</option>';

			data.forEach(est => {
				opcionesHtml += `<option value="${est.estacionamiento_id || est.idEstacionamiento}">${est.nombre || est.descripcion}</option>`;
			});

			if (selectEstacionamiento) selectEstacionamiento.innerHTML = opcionesHtml;
			if (selectFiltro) selectFiltro.innerHTML = opcionesHtml;
			
			listarPisosPorEstacionamiento('todos');
		}
	} catch (err) {
		console.error("Error al cargar estacionamientos:", err);
	}
}

async function listarPisosPorEstacionamiento(estacionamiento_id = 'todos') {
	const tbody = document.getElementById('tbody-pisos');
	if (!tbody) return;

	if (!estacionamiento_id || estacionamiento_id === "") {
		tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Selecciona un estacionamiento.</td></tr>`;
		return;
	}

	try {
		const res = await fetch(`/api/pisos?estacionamiento_id=${estacionamiento_id}`);
		const pisos = await res.json();

		if (!Array.isArray(pisos) || pisos.length === 0) {
			tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay pisos registrados para este estacionamiento.</td></tr>`;
			return;
		}

		tbody.innerHTML = pisos.map(piso => `
			<tr id="fila-${piso.piso_id}">
				<!-- 1. Columna Estacionamiento -->
				<td><strong>${piso.estacionamiento_nombre || 'Est. ' + piso.estacionamiento_id}</strong></td>
				<!-- 2. Columna Número -->
				<td>${piso.numero_piso}</td>
				<!-- 3. Columna Descripción -->
				<td>${piso.descripcion || '-'}</td>
				<!-- 4. Columna Acciones con botones independientes -->
				<td>
					<button class="btn-action edit"
						data-id="${piso.piso_id}"
						data-num="${piso.numero_piso}"
						data-desc="${piso.descripcion}">Editar</button>
					<button class="btn-action delete" onclick="eliminarPiso(${piso.piso_id})">Eliminar</button>
				</td>
			</tr>
		`).join('');
	} catch (err) {
		console.error("Error cargando pisos:", err);
	}
}

function activarEdicion(btn, id, num, desc) {
	const fila = btn.closest('tr');
	// Mantenemos las 4 columnas intactas durante la edición
	const estacionamientoTexto = fila.cells[0].innerText;
	
	fila.innerHTML = `
		<td><strong>${estacionamientoTexto}</strong></td>
		<td>
			<input type="number" id="edit-num-${id}" class="swal2-input" style="padding: 5px; border: 1px solid #ccc; border-radius: 4px; width: 90%; margin: 0;" value="${num}">
		</td>
		<td>
			<input type="text" id="edit-desc-${id}" class="swal2-input" style="padding: 5px; border: 1px solid #ccc; border-radius: 4px; width: 90%; margin: 0;" value="${desc}">
		</td>
		<td>
			<button class="btn btn-success btn-guardar" onclick="guardarEdicion(${id})" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
			<button class="btn btn-secondary btn-cancelar" onclick="listarPisosPorEstacionamiento('todos')" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
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
			listarPisosPorEstacionamiento('todos');
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
			listarPisosPorEstacionamiento(valorSeleccionado); 
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
		title: '¿Estás seguro?',
		text: "El piso dejará de estar disponible en el sistema.",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#211A60',
		cancelButtonColor: '#dc3545',
		confirmButtonText: 'Sí, eliminar',
		cancelButtonText: 'Cancelar'
	});

	if (result.isConfirmed) {
		await fetch(`/api/pisos/delete/${id}`, { method: 'PUT' });
		listarPisosPorEstacionamiento('todos');
		Toast.fire({ icon: 'success', title: 'Piso dado de baja' });
	}
}