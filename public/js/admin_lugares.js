document.addEventListener('DOMContentLoaded', () => {
	cargarEstacionamientos();
	document.getElementById('select-estacionamiento').addEventListener('change', () => {
		cargarPisos();
		cargarLugares();
	});
	document.getElementById('btn-guardar-lugar').addEventListener('click', guardarLugar);
});
async function cargarEstacionamientos() {
	try {
		const response = await fetch('/api/estacionamientos');
		const ests = await response.json();
		if (!Array.isArray(ests)) return console.error("Error en datos de estacionamientos: " , ests);

		const select = document.getElementById('select-estacionamiento');

		select.innerHTML = '<option value="">Seleccione un estacionamiento...</option>';
		ests.forEach(est => {
			const option = document.createElement('option');
			option.value = est.estacionamiento_id;
			option.textContent = est.nombre;
			select.appendChild(option);
		});
	} catch (error) {
		console.error("Error cargando estacionamientos:", error);
	}
}
async function cargarPisos() {
	const estacionamiento_id = document.getElementById('select-estacionamiento').value;
	const selectPiso = document.getElementById('select-piso');
	selectPiso.innerHTML = '<option value="">Selecciona un piso ...</option>';
	if (!estacionamiento_id) return;

	try {
		const response = await fetch(`/api/pisos?estacionamiento_id=${estacionamiento_id}`);
		const pisos = await response.json();

		if (!Array.isArray(pisos)) return console.error("Error en datos de pisos:",pisos);

		pisos.forEach(piso => {
			const option = document.createElement('option');
			option.value = piso.piso_id;
			option.textContent = piso.nombre_piso || `Piso ${piso.piso_id}`;
			selectPiso.appendChild(option);
		});
	} catch (error) {
		console.log("Error cargando pisos:", error);
	}
}

async function cargarLugares() {
	const estacionamiento_id = document.getElementById('select-estacionamiento').value;
	if (!estacionamiento_id) {
		document.getElementById('tbody-lugares').innerHTML = '';
		return;
	}
	try {
		const response = await fetch(`/api/lugares?estacionamiento_id=${estacionamiento_id}`);
		if (!response.ok) {
			const errorData = await response.json();
			console.error("error del servidor:", errorData.message);
			return;
		}

		const lugares = await response.json();

		if (!Array.isArray(lugares)) return console.error("Error en datos de lugares:", lugares);

		const tbody = document.getElementById('tbody-lugares');
		tbody.innerHTML = '';

		lugares.forEach(lugar => {
			const row = `<tr>
				<td>${lugar.piso_id}</td>
				<td>${lugar.codigo_lugar}</td>
				<td>${lugar.tipo_lugar}</td>
				<td>${lugar.estado}</td>
				<td>
					<button class="btn-action delete" onclick="eliminarLugar(${lugar.lugar_id})">Eliminar</button>
				</td>
				</tr>`;
			tbody.innerHTML += row;
		});
	} catch (error) {
		console.error("Error cargando lugares: " , error);
	}
}

async function guardarLugar() {
	const modo = document.getElementById('select-modo').value;
	const piso_id = document.getElementById('select-piso').value;

	if (!piso_id) return alert("selecciona un piso primero");

	if (modo === 'manual') {
		const data = {
		piso_id: piso_id,
		codigo_lugar: document.getElementById('codigo-lugar').value,
		tipo_lugar: document.getElementById('tipo-lugar').value,
		estado: 'Disponible'
	};
	enviarDatos('/api/lugar','POST', data);
} else {
	const data = {
		piso_id: piso_id,
		prefijo: document.getElementById('prefijo').value,
		inicio: document.getElementById('inicio').value,
		cantidad: document.getElementById('cantidad').value,
		tipo_lugar: 'Normal'
	};
	enviarDatos('/api/lugares/masivo', 'POST', data);
	}
}
async function enviarDatos(url, method, body) {

	const Toast = Swal.mixin({
		toast:true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		didOpen: (toast) => {
			toast.addEventListener('mouseenter', Swal.stopTimer)
			toast.addEventListener('mouseleave', Swal.resumeTimer)
		}
	});

	try { 
		const response = await fetch(url, {
			method: method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (response.ok) {
			Toast.fire({
				icon:'success',
				title:'Operacion realizada con exito'
			});
			cargarLugares();
		} else {
			Toast.fire({
				icon: 'error',
				title: 'Ocurrio un error al guardar'
			});
		}
	} catch (error) {
		console.error("Error:" , error);
		Toast.fire({
			icon: 'error',
			title: 'Error de conexion con el servidor'
		});
	}
}

