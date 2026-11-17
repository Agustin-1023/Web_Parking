const Toast = Swal.mixin({
	toast: true,
	position: "top-end",
	showConfirmButton: false,
	timer: 3000,
	timerProgressBar: true
});

let cacheReservas = []; // Caché local para consultar datos al editar o ver detalles

function obtenerFiltrosActuales() {
	const est = document.getElementById("select-estacionamiento-filtro").value || 'todos';
	const estado = document.getElementById("select-estado-filtro").value || 'todos';
	return { est, estado };
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

	// Botón CREAR (Abre el tablero superior en modo creación)
	btnCreate.addEventListener('click', () => {
		limpiarFormularioReserva();
		formContainer.dataset.mode = "create";
		formContainer.querySelector("h3").textContent = "Nueva Reserva";
		
		const filtros = obtenerFiltrosActuales();
		if (filtros.est !== 'todos') {
			selectEstForm.value = filtros.est;
			cargarLugaresPorEstacionamiento(filtros.est);
		}
		
		formContainer.style.display = 'block';
		formContainer.scrollIntoView({ behavior: 'smooth' });
	});

	// Botón CANCELAR del formulario
	btnCancelar.addEventListener('click', () => {
		limpiarFormularioReserva();
		formContainer.style.display = 'none';
	});

	// Botón GUARDAR unificado (procesa creación o edición)
	btnGuardar.addEventListener('click', procesarFormularioReserva);

	cargarEstacionamientos();
});

async function cargarEstacionamientos() {
	const selectFiltro = document.getElementById('select-estacionamiento-filtro');
	const selectForm = document.getElementById('select-estacionamiento');

	try {
		const res = await fetch('/api/estacionamientos');
		const data = await res.json();

		if (res.ok && Array.isArray(data)) {
			let opcionesFiltro = '<option value="todos">Todos los estacionamientos</option>';
			let opcionesForm = '<option value="">Selecciona un estacionamiento...</option>';

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
	selectLugar.innerHTML = `<option value="">Cargando lugares...</option>`;

	if (!estacionamiento_id) {
		selectLugar.innerHTML = `<option value="">Selecciona primero un estacionamiento...</option>`;
		return;
	}

	try {
		const res = await fetch(`/api/lugares?estacionamiento_id=${estacionamiento_id}`);
		const lugares = await res.json();

		if (res.ok && Array.isArray(lugares) && lugares.length > 0) {
			selectLugar.innerHTML = `<option value="cualquiera">Cualquiera (Selección automática)</option>`;
			lugares.forEach(l => {
				selectLugar.innerHTML += `<option value="${l.lugar_id}">Lugar #${l.numero || l.lugar_id}</option>`;
			});
		} else {
			selectLugar.innerHTML = `<option value="">No hay lugares disponibles</option>`;
		}
	} catch (err) {
		console.warn("No se pudo cargar los lugares individualmente.", err);
		selectLugar.innerHTML = `<option value="cualquiera">Cualquiera (Selección automática)</option>`;
	}
}

function aplicarFiltros() {
	const { est, estado } = obtenerFiltrosActuales();
	cargarReservas(est, estado);
}

// Cargar listado de reservas y aplicar diseño de botones idéntico a Estacionamientos
async function cargarReservas(estacionamiento_id = 'todos', estado = 'todos') {
	const tbody = document.getElementById('tbody-reservas');
	if (!tbody) return;

	try {
		const res = await fetch(`/api/reserva?estacionamiento_id=${estacionamiento_id}&estado=${estado}`);
		const reservas = await res.json();
		cacheReservas = Array.isArray(reservas) ? reservas : [];

		if (cacheReservas.length === 0) {
			tbody.innerHTML = `
				<tr>
					<td colspan="7" style="text-align: center; padding: 20px;">
						No se encontraron reservas registradas.
					</td>
				</tr>
			`;
			return;
		}

		tbody.innerHTML = cacheReservas.map(r => `
			<tr id="fila-reserva-${r.reserva_id}">
				<td><strong>${r.nombre || 'Est. ' + r.estacionamiento_id}</strong><br><small>Lugar #${r.numero || r.lugar_id}</small></td>
				<td>${r.patente_manual || '-'}</td>
				<td>${formatearFecha(r.fecha_ingreso)}</td>
				<td>${formatearFecha(r.fecha_salida)}</td>
				<td><small>${r.origen_reserva || 'manual'}</small></td>
				<td><span class="badge badge-${r.estado || 'activa'}">${r.estado || 'activa'}</span></td>
				<td>
					<button class="btn-action view" onclick="verDetalleReserva(${r.reserva_id})">VER</button>
					${r.estado !== 'cancelada' ? `
						<button class="btn-action edit" onclick="prepararEdicionReserva(${r.reserva_id})">MODIFICAR</button>
						<button class="btn-action delete" onclick="cancelarReserva(${r.reserva_id})">ELIMINAR</button>
					` : ''}
				</td>
			</tr>
		`).join('');
	} catch (err) {
		console.error("Error cargando reservas:", err);
	}
}

// Procesar Formulario (Detecta automáticamente si está creando o editando)
async function procesarFormularioReserva() {
	const formContainer = document.getElementById("form-container");
	const mode = formContainer.dataset.mode;

	const estacionamiento_id = document.getElementById('select-estacionamiento').value;
	const tipo_lugar = document.getElementById('select-tipo-lugar')?.value || 'Normal';
	const lugar_id = document.getElementById('select-lugar').value;
	const patente = document.getElementById('inputPatente').value.trim();
	const origen = document.getElementById('selectOrigen').value || 'admin';
	const fechaInicio = document.getElementById('inputFechaInicio').value;
	const fechaFin = document.getElementById('inputFechaFin').value;

	if (!estacionamiento_id || !fechaInicio || !fechaFin) {
		Swal.fire('Atención', "Por favor completa el estacionamiento y las fechas de entrada/salida", 'warning');
		return;
	}

	if (new Date(fechaFin) <= new Date(fechaInicio)) {
		Swal.fire('Atención', 'La fecha de salida debe ser posterior a la fecha de entrada', 'warning');
		return;
	}

	if (mode === "create") {
		const payload = {
			estacionamiento_id: parseInt(estacionamiento_id),
			tipo_lugar: tipo_lugar,
			lugar_id: lugar_id && lugar_id !== 'cualquiera' ? parseInt(lugar_id) : undefined,
			patente_manual: patente,
			origen_reserva: origen,
			fecha_ingreso: fechaInicio,
			fecha_salida: fechaFin
		};

		try {
			const res = await fetch('/api/reserva', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				Toast.fire({ icon: 'success', title: 'Reserva registrada con éxito' });
				formContainer.style.display = 'none';
				aplicarFiltros();
			} else {
				const errData = await res.json();
				Swal.fire('Error', errData.message || 'No se pudo crear reserva', 'error');
			}
		} catch (err) {
			console.error("Error guardando reserva:", err);
			Swal.fire('Error', 'Fallo de conexión con el servidor', 'error');
		}

	} else if (mode === "edit") {
		const id = formContainer.dataset.editId;
		const payload = {
			patente_manual: patente,
			fecha_ingreso: fechaInicio,
			fecha_salida: fechaFin
		};

		try {
			const res = await fetch(`/api/reserva/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				Toast.fire({ icon: 'success', title: 'Reserva actualizada con éxito' });
				formContainer.style.display = 'none';
				aplicarFiltros();
			} else {
				const errData = await res.json();
				Swal.fire('Error', errData.message || 'No se pudo actualizar la reserva', 'error');
			}
		} catch (err) {
			console.error("Error actualizando reserva:", err);
			Swal.fire('Error', 'Fallo de conexión con el servidor', 'error');
		}
	}
}

// Preparar el formulario superior con los datos de la reserva seleccionada (MODIFICAR)
async function prepararEdicionReserva(id) {
	const reserva = cacheReservas.find(r => r.reserva_id === id);
	if (!reserva) return;

	const formContainer = document.getElementById("form-container");
	formContainer.dataset.mode = "edit";
	formContainer.dataset.editId = id;
	formContainer.querySelector("h3").textContent = `Modificar Reserva (ID: ${id})`;

	// Cargar valores en los inputs
	const selectEst = document.getElementById("select-estacionamiento");
	selectEst.value = reserva.estacionamiento_id || '';
	
	await cargarLugaresPorEstacionamiento(reserva.estacionamiento_id);
	document.getElementById("select-lugar").value = reserva.lugar_id || '';

	document.getElementById("inputPatente").value = reserva.patente_manual || '';
	document.getElementById("selectOrigen").value = reserva.origen_reserva || 'admin';
	document.getElementById("inputFechaInicio").value = aFormatoInputDateTime(reserva.fecha_ingreso);
	document.getElementById("inputFechaFin").value = aFormatoInputDateTime(reserva.fecha_salida);

	formContainer.style.display = "block";
	formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Ver detalles en un popup flotante
function verDetalleReserva(id) {
	const reserva = cacheReservas.find(r => r.reserva_id === id);
	if (!reserva) return;

	Swal.fire({
		title: `Detalles de Reserva #${reserva.reserva_id}`,
		html: `
			<div style="text-align: left; font-size: 14px; line-height: 1.6;">
				<p><b>Estacionamiento:</b> ${reserva.nombre || reserva.estacionamiento_id}</p>
				<p><b>Lugar asignado:</b> #${reserva.numero || reserva.lugar_id}</p>
				<p><b>Matrícula / Patente:</b> ${reserva.patente_manual || '-'}</p>
				<p><b>Entrada:</b> ${formatearFecha(reserva.fecha_ingreso)}</p>
				<p><b>Salida:</b> ${formatearFecha(reserva.fecha_salida)}</p>
				<p><b>Origen:</b> ${reserva.origen_reserva || 'manual'}</p>
				<p><b>Estado:</b> ${reserva.estado || 'activa'}</p>
			</div>
		`,
		icon: 'info',
		confirmButtonText: 'Cerrar'
	});
}

// Cancelar / Eliminar reserva
async function cancelarReserva(id) {
	const result = await Swal.fire({
		title: '¿Cancelar esta reserva?',
		text: "La reserva pasará a estar inactiva/cancelada.",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#dc3545',
		cancelButtonColor: '#6c757d',
		confirmButtonText: 'Sí, cancelar',
		cancelButtonText: 'Volver'
	});

	if (result.isConfirmed) {
		try {
			const res = await fetch(`/api/reserva/cancelar/${id}`, { method: 'PUT' });
			if (res.ok) {
				Toast.fire({ icon: 'success', title: 'Reserva cancelada con éxito' });
				aplicarFiltros();
			} else {
				Swal.fire('Error', 'No se pudo cancelar la reserva', 'error');
			}
		} catch (err) {
			Swal.fire('Error', 'Error al comunicarse con el servidor', 'error');
		}
	}
}

function limpiarFormularioReserva() {
	document.getElementById('select-estacionamiento').value = '';
	document.getElementById('select-lugar').innerHTML = `<option value="">Selecciona primero un estacionamiento...</option>`;
	document.getElementById('inputPatente').value = '';
	document.getElementById('selectOrigen').value = 'admin';
	document.getElementById('inputFechaInicio').value = '';
	document.getElementById('inputFechaFin').value = '';
}

function formatearFecha(cadenaFecha) {
	if (!cadenaFecha) return '-';
	const f = new Date(cadenaFecha);
	if (isNaN(f.getTime())) return '-';
	return f.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' });
}

function aFormatoInputDateTime(cadenaFecha) {
	if (!cadenaFecha) return '';
	let limpio = cadenaFecha.replace('T', ' ').substring(0, 16);
	return limpio.replace(' ', 'T');
}