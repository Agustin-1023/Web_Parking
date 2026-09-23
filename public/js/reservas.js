const Toast = Swal.mixin({
	Toast: true,
	position: "top-end",
	showConfirmButton:false,
	timer: 3000,
	timerProgressBar: true
});

function obtenerFiltrosActuales() {
	const est = document.getElementById("select-estacionamiento-filtro").value || 'todos';
	const estado = document.getElementById("select-estado-filtro").value || 'todos';
	return { est, estado};
} 

document.addEventListener("DOMContentLoaded", () => {
	const selectEstFiltro = document.getElementById("select-estacionamiento-filtro");
	const selectEstadoFiltro = document.getElementById("select-estado-filtro");
	const selectEstForm = document.getElementById("select-estacionamiento");
	const btnCreate = document.getElementById("button-create-top");
	const btnCancelar = document.getElementById("btn-cancelar-reserva");
	const btnGuardar = document.getElementById("btn-guardar-reserva");
	const formContainer = document.getElementById("form-container");

	selectEstFiltro.addEventListener('change', aplicarFiltros);
	selectEstadoFiltro.addEventListener('change', aplicarFiltros);

	selectEstForm.addEventListener('change', (e) => {
		cargarLugaresPorEstacionamiento(e.target.value);
	});

	btnCreate.addEventListener('click', () => {
		limpiarFormularioReserva();
		const filtros = obtenerFiltrosActuales();
		if(filtros.est !== 'todos') {
			selectEstForm.value = filtros.est;
			cargarLugaresPorEstacionamiento(filtros.est);
		}
		formContainer.style.display = 'block';
	});

	btnCancelar.addEventListener('click', () => {
		limpiarFormularioReserva();
		formContainer.style.display = 'none';
	});

	btnGuardar.addEventListener('click', guardarReserva);

	cargarEstacionamientos();
});

async function cargarEstacionamientos() {
	const selectFiltro = document.getElementById('select-estacionamiento-filtro');
	const selectForm = document.getElementById('select-estacionamiento');

	try {
		const res = await fetch('/api/estacionamientos');
		const data = await res.json();

		if (res.ok && Array.isArray(data)) {
			let opcionesFiltro = '<option value="todos"> Todos los estacionamientos</option>';
			let opcionesForm = '<option value=""> Selecciona un estacionamiento...</option>';

			data.forEach(est => {
				opcionesFiltro += `<option value="${est.estacionamiento_id}">${est.nombre}</option>`;
				opcionesForm += `<option value="${est.estacionamiento_id}">${est.nombre}</option>`;
			});
			if (selectFiltro) selectFiltro.innerHTML = opcionesFiltro;
			if (selectForm) selectForm.innerHTML = opcionesForm;
			cargarReservas();
		}
	} catch (err) {
		console.error("Error al cargar estacionamientos", err);
	}
}
 
async function cargarLugaresPorEstacionamiento(estacionamiento_id) {
	const selectLugar = document.getElementById('select-lugar');
	selectLugar.innerHTML = `<option value="">Cargar lugares..</option>`;

	if (!estacionamiento_id) {
		selectLugar.innerHTML = `<option value=""> Selecciona primero un estacionamiento ...</option>`;
		return;
	}

	try {
		const res = await fetch(`/api/lugares?estacionamiento_id=${estacionamiento_id}`);
		const lugares = await res.json();

		if (res.ok && Array.isArray(lugares) && lugares.length > 0) {
			selectLugar.innerHTML = `<option value=">Selecciona un lugar ...</option>`;
			lugares.forEach(l => {
				selectLugar.innerHTML += `<option value="${l.lugar_id}">Lugar #${l.numero || l.lugar_id}</option>`;
			});
		} else {
			selectLugar.innerHTML = `<option value=""> No hay lugares disponibles</option>`;
		}
	} catch (err) {
		console.warn("No se pudo cargar los lugares individualmente, se usara asignacion automatica.", err);
		selectLugar.innerHTML = `<option value="">Error al cargar lugares</option>`;
	}
}

function aplicarFiltros() {
	const { est, estado } = obtenerFiltrosActuales();
	cargarReservas(est, estado);
}

async function cargarReservas(estacionamiento_id = 'todos', estado = 'todos') {
	const tbody = document.getElementById('tbody-reservas');
	if (!tbody) return;

	try {
		const res = await fetch(`/api/reserva?estacionamiento_id=${estacionamiento_id}&estado=${estado}`);
		const reservas = await res.json();

		if (!Array.isArray(reservas) || reservas.length === 0){
			tbody.innerHTML =`
				<tr>
					<td colspan= "7" style="text-align: center; padding: 20px;">
						No se encontraron reservas registradas.
					</td>
				</tr>
			`;
			return;
		}
		tbody.innerHTML = Array.isArray(reservas) && reservas.length >0
			? reservas.map(r => `
				<tr id="fila-reserva-${r.reserva_id}">
					<td><strong>${r.nombre || 'Est. ' + e.estacionamiento_id}</strong><br><small>Lugar #${r.numero || r.lugar_id}</small></td>
					<td>${r.patente_manual || '-'}</td>
					<td>${formatearFecha(r.fecha_inicio)}</td>
					<td>${formatearFecha(r.fecha_fin)}</td>
					<td><small>${r.origen_reserva || 'manual'}</small></td>
					<td><span class="badge badge-${r.estado || 'activa'}">${r.estado || 'activa'}</span></td>
					<td>
						${r.estado !== 'cancelada' ? `<button class="btn-action btn-secondary" onclick="cancelarReserva(${r.reserva_id})">Cancelar</button>` : '_'} 
					</td>
				</tr>
			`).join('')
			: '<tr><td colspan="7">No se encontraron reservas registradas.</td></tr>';
	} catch (err) {
		console.error("Error cargando reservas:", err);
	}
}

async function guardarReserva() {
	const estacionamiento_id = document.getElementById('select-estacionamiento').value;
	const tipo_lugar = document.getElementById('select-tipo-lugar')?.value || '';
	const patente = document.getElementById('inputPatente').value.trim();
	const origen = document.getElementById('selectOrigen').value || 'manul';
	const fechaInicio = document.getElementById('inputFechaInicio').value;
	const fechaFin = document.getElementById('inputFechaFin').value;

	if (!estacionamiento_id || !tipo_lugar || !fechaInicio || !fechaFin) {
		Swal.fire('Atencion', "Por favor completa el estacionamiento, Lugar, y las fechas de entrada/Salida", 'warning');
		return;
	}
	const payload = {
		estacionamiento_id: parseInt(estacionamiento_id),
		tipo_lugar: tipo_lugar,
		patente_manual: patente,
		origen_reserva: origen,
		fecha_inicio: fechaInicio,
		fecha_fin: fechaFin
	};

	try {
		const res = await fetch('/api/reserva', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify(payload)
		});

		if (res.ok) {
			Toast.fire({ icon: 'success', title: 'Reserva registrada con exito'});
			limpiarFormularioReserva();
			document.getElementById('form-container').style.display = 'none';
			aplicarFiltros();
		} else {
			const errData = await res.json();
			Swal.fire('Error', errData.message || 'No se pudo crear reserva', 'error');
		}
	} catch (err){
		console.error("Error gurdando reserva:", err);
		Swal.fire('Error','Fallo de conexion con el servidor','error');
	}

}

async function cancelarReserva(id) {
	const result = await Swal.fire({
		title: 'Cancelar Reserva?',
		text: "La reserva pasara a estar inactiva/cancelada.",
		icon: 'warning',
		showCancelarButton: true,
		confirmButtonColor: '#dc3545',
		cancelButtonColor: '#6c757d',
		confirmButtonText: 'Si, cancelar',
		cancelarButtontext: 'Volver'
	});

	if(result.isConfirmed) {
		try {
			const res = await fetch(`/api/reserva/cancelar/${id}`, {method: 'PUT'});
			if (res.ok) {
				Toast.fire({ icon: 'success', title: 'Reserva cancelada'});
				aplicarFiltros();
			} else {
				Swal.fire('Error', 'No se pudo cancelar la reserva', 'error');
			}
		} catch (err) {
			Swal.fire('Error', 'Error al comunicar con el servidor', 'error');
		}
	}
}

function limpiarFormularioReserva() {
	document.getElementById('select-estacionamiento').value = '';
	document.getElementById('select-lugar').innerHTML = `<option value="">Selecciona primero un estacionamiento...</option>`;
	document.getElementById('inputPatente').value = '';
	document.getElementById('selectOrigen').value = 'manual';
	document.getElementById('inputFechaInicio').value = '';
	document.getElementById('inputFechaFin').value = '';
}

function formatearFecha(cadenaFecha) {
	if(!cadenaFecha) return '-';
	const f = new Date(cadenaFecha);
	return f.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short'});
}