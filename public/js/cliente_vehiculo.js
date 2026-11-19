document.addEventListener("DOMContentLoaded", () => {
	const userName = localStorage.getItem("usuario") || "clientesss";

	const userDisplay = document.getElementById("user-display-name");
	const nombreUsuario = document.getElementById("nombre-usuario");
	if (userDisplay) userDisplay.textContent = userName;
	if (nombreUsuario) nombreUsuario.textContent = userName;

	cargarVehiculos(userName);

	const btnAgregar = document.getElementById("btn-agregar-vehiculo");

	if (btnAgregar) {
		btnAgregar.addEventListener("click", () => abrirModalCrearVehiculo(userName));
		
	}
});

async function cargarVehiculos(userName) {
	try {
		const response = await fetch(`/api/cliente/vehiculos?user_name=${encodeURIComponent(userName)}`);
		if (!response.ok) throw new Error("Error al obtener los vehiculos del servidor.");

		const vehiculos = await response.json();
		renderizarTabla(vehiculos);
	} catch (error) {
		console.error("error: ", error);
		Swal.fire("error", "No se pudieron cargar los vehiculos.", "Error");
	}
}

function renderizarTabla(vehiculos) {
	const tbody = document.getElementById("tabla-vehiculos-body");
	if (!tbody) return;

	tbody.innerHTML = "";

	if (!vehiculos || vehiculos.length === 0 ) {
		tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #777; padding: 20px;"> No tienes vehiculos registrados. </td></tr>`;
		return;
	}

	vehiculos.forEach(v => {
		const tr = document.createElement("tr");
		const estadoBadge = v.estado === 'ACTIVO'
			? `<span style="color: green; font-weight: bold;">ACTIVO</span>`
			: `<span style="color: gray;">INACTIVO</span>`;

		const principalBadge = v.es_principal
			? `<span style="color: #d4af37; font-weight: bold;"> Principal</span>`
			: `-`;

		tr.innerHTML = `
			<td>${v.matricula}</td>
			<td>${v.marca || '-'}</td>
			<td>${v.modelo || '-'}</td>
			<td>${estadoBadge}</td>
			<td>${principalBadge}</td>
		`;
		tbody.appendChild(tr);
	});
}

async function abrirModalCrearVehiculo(userName) {
	const { value: formValues} = await Swal.fire({
		title: 'Registrar Nuevo Vehiculo',
		html:
			'<input id="swal-matricula" class="swal2-input" placeholder="Matricula / patente (Ej: ABC-1234)">' +
			'<input id="swal-marca" class="swal2-input" placeholder="Marca (Ej: Toyota)">' +
			'<input id="swal-modelo" class="swal2-input" placeholder="Modelo (Ej: Corolla)">' +
			'<input id="swal-color" class="swal2-input" placeholder="Color (Ej: Gris)">' +
			'<div style="margin-top: 15px; text-align: left; padding: 0 20px;">' +
			'	<label><input type="checkbox" id="swal-principal"> Marcar como vehiculo principal</label>' +
			'</div>',
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: 'Guardar vehiculo',
		cancelButtontext: 'Cancelar',
		preConfirm: () => {
			const matricula = document.getElementById('swal-matricula').value.trim();
			const marca = document.getElementById('swal-marca').value.trim();
			const modelo = document.getElementById('swal-modelo').value.trim();
			const color = document.getElementById('swal-color').value.trim();
			const es_principal = document.getElementById('swal-principal').checked ? 1 : 0;

			if (!matricula) {
				Swal.showValidationMessage('La matricula es obligatoria');
				return false;
			}
			return { user_name: userName, matricula, marca, modelo, color, es_principal };
		}
	});
	if (formValues) {
		try {
			const response = await fetch('/api/cliente/vehiculos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json'},
				body: JSON.stringify(formValues)
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Error al registrar el vehiculo");

			Swal.fire('Exito!', 'vehiculo registrado correctamente', 'success');
			cargarVehiculos(userName);
		} catch (error) {
			Swal.fire('Error', error.message, 'error');
		}
	}
}