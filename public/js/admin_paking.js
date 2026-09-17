document.addEventListener("DOMContentLoaded", () => {
	//Listar estacionamientos
	listarEstacionamientos();
	//obtencion de datos
	const btnCrearBottom = document.getElementById("button-create-bottom");
	const btnCancelar = document.getElementById("btn-cancelar-parking");
	const btnGuardar = document.getElementById("btn-guardar-parking");
	const formContainer = document.getElementById("form-container");

	if (btnCrearBottom && formContainer) {
		btnCrearBottom.addEventListener("click", () => {
			document.getElementById("nombreEst").value = "";
			document.getElementById("direccionEst").value = "";
			//comportamiento crear
			formContainer.dataset.mode = "create";
			formContainer.querySelector("h3").textContent = "Nuevo Estacionamiento";
			formContainer.style.display = "block";
			formContainer.scrollIntoView({ behavior: 'smooth' });
		});
	}
	if (btnCancelar && formContainer) {
		btnCancelar.addEventListener("click", () => {
			formContainer.style.display = "none";
		});
	}

	if (btnGuardar) {
		btnGuardar.addEventListener("click", procesarFormulario);
	}
});

//traer datos para la tabla

async function listarEstacionamientos() {
	try {
		const respuesta = await fetch("/api/estacionamientos");
		if (!respuesta.ok) throw new Error("Error en la respuesta del servidor");

		const datos = await respuesta.json();
		const tbody = document.querySelector(".reservations-table tbody");

		tbody.innerHTML = ""; 

		if (datos.length ===0) {
			tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;"> No hay estacionamientos registrados. </td></tr>';
			return;
		}

		datos.forEach(est => {
			const fila = document.createElement("tr");
			fila.innerHTML = ` 
				<td>${est.nombre}</td>
				<td>${est.direccion}</td>
				<td>${est.cantidad_pisos || 0}</td>
				<td>
					<button class="btn-action view" onclick="verParking(${est.estacionamiento_id})">VER</button>
					<button class="btn-action edit" onclick="prepararEdicion(${est.estacionamiento_id}, '${est.nombre}','${est.direccion}')">MODIFICAR</button>
					<button class="btn-action delete"
					onclick="eliminarParking(${est.estacionamiento_id})">ELIMINAR</button>
				</td>
				`;
				tbody.appendChild(fila);
		});

	} catch (error) {
		console.error("error al cargar estacionamientos:", error);
		Swal.fire({
			title: 'Error de servidor',
			text: 'No se pudo iniciar comunicacion con el servidor',
			icon: 'error',
			confirmButtonText: 'Cerrar'
		});
	}
} 
//creando o editando
async function procesarFormulario() {
	const nombre = document.getElementById("nombreEst").value.trim();
	const direccion = document.getElementById("direccionEst").value.trim();
	const barrio = document.getElementById("barrioEst").value.trim();
	const departamento = document.getElementById("departamentoEst").value.trim();
	const formContainer = document.getElementById("form-container");
	if (!nombre || !direccion) {
		Swal.fire({
			toast: true,
			position: 'top-end',
			icon: 'info',
			title: 'Faltan completar campos obligatorios de Nombre y Direccion',
			ShowConfirmButton: false,
			timer: 2000
		});
		return;
	}

	const mode = formContainer.dataset.mode;

	if (mode ==="create") {
		await guardarNuevoEstacionamiento(nombre, direccion, barrio, departamento);
	} else if (mode === "edit") {
		const id = formContainer.dataset.editId;
		await guardarEdicionEstacionamiento(id, nombre, direccion);
	}
}

//insertando estacionamiento

async function guardarNuevoEstacionamiento(nombre,direccion,barrio,departamento) {
	try {
		const respuesta = await fetch("/api/estacionamientos", {
			method: "POST",
			headers: {"Content-Type" : "application/json" },
			body: JSON.stringify({nombre, direccion,barrio,departamento})
		});

		if (respuesta.ok) {
			Swal.fire({
				title: 'Estacionamiento creado!',
				text: 'El estacionamiento fue creado correctaemnte',
				icon: 'success',
				confirmButtonText: 'Exitoso'
			});
			document.getElementById("form-container").style.display ="none";
			await listarEstacionamientos();
		} else {
			const errData = await respuesta.json();
			Swal.fire({
				title: 'Error al crear',
				text: 'Fallo al crear el estacionamiento',
				icon: 'error',
				confirmButtonText: 'Cerrar'
			});
		}
	} catch (error) {
		Swal.fire({
			title: 'Error al crear el estacionamiento.',
			text: 'No se pudo Iniciar la creacion del estacionamiento',
			icon: 'error',
			confirmButtonText: 'cerrar'
		});
	}
}

//formulario para editard datos
function prepararEdicion(id, nombre, direccion) {
	const formContainer = document.getElementById("form-container");

	formContainer.dataset.mode = "edit";
	formContainer.dataset.editId = id;
	formContainer.querySelector("h3").textContent = `Modificar Estacionamiento (ID: ${id})`;

	document.getElementById("nombreEst").value = nombre;
	document.getElementById("direccionEst").value = direccion;

	formContainer.style.display = "block";
	formContainer.scrollIntoView({ behavior: 'smooth' });
}

//enviar datos a la api

async function guardarEdicionEstacionamiento(id,nombre,direccion) {
	const confirmacion = await Swal.fire({
		title: 'Confirmar Modificar este estacionamiento?',
		text: 'El Estacionamiento se actualizara',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#dc3545',
		cancelButtonColor: '#6c757d',
		confirmButtonText: 'Si, Modificar',
		cancelButtonText: 'Cancelar'
	});
	try {
		const respuesta = await fetch('/api/estacionamientos/' + id ,{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ nombre, direccion})
		});

		if (respuesta.ok) {
			Swal.fire({
				icon: 'success',
				title: 'Desactivado!',
				text: 'El estacionamiento ha sido borrado con exito',
				timer: 2000,
				showConfirmButton: false
			});
			document.getElementById("form-container").style.display = "none";
			await listarEstacionamientos();
		} else {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: datos.message || 'No se pido eliminar el registro.'
			})
		}
	} catch (error) {
		console.error("Error en el PUT:", error);
	}
}

//Eliminar registro

async function eliminarParking(id) {
	const confirmacion = await Swal.fire({
		title: 'Confirmar eliminar este estacionamiento?',
		text: 'El registro pasara a estar inactivo en el sistema.',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#dc3545',
		cancelButtonColor: '#6c757d',
		confirmButtonText: 'Si, Eeliminar',
		cancelButtonText: 'Cancelar'
	});
	if (confirm(`Esta seguro de eliminar el estacionamiento con ID ${id}?\n Esta accion es 
		irreversible y afectara a los pisos y lugares vinculados.`)) {
		try {
			const respuesta = await fetch('/api/estacionamientos/' + id, {
				method: "DELETE"
			});

			if (respuesta.ok) {
				Swal.fire({
					icon: 'success',
					title: 'Desactivado!',
					text: 'El estacionamiento ha sido borrado con exito.',
					timer:2000,
					showConfirmButton: false
				});
				await listarEstacionamientos();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: datos.message || 'No se pudo eliminar el registro.'
				});
			}
		} catch (error) {
			Swal.fire({
				icon: 'error',
				title: 'Error de conexion',
				text: 'Ocurrio un fallo al comunicarse con el servidor'
			});
		}
	}
}

// redireccion final

function verParking(id) {
	window.location.href = './admin_pisos.html?estacionamiento_id=' + id;
}
