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
		alert("Error de infraestructura: No se pudo conectar con el servicio de Rasberry pi.");
	}
} 
//creando o editando
async function procesarFormulario() {
	const nombre = document.getElementById("nombreEst").value.trim();
	const direccion = document.getElementById("direccionEst").value.trim();
	const formContainer = document.getElementById("form-container");
	if (!nombre || !direccion) {
		alert("Por favor, complete todos los campos obligatorios.");
		return;
	}

	const mode = formContainer.dataset.mode;

	if (mode ==="create") {
		await guardarNuevoEstacionamiento(nombre, direccion);
	} else if (mode === "edit") {
		const id = formContainer.dataset.editId;
		await guardarEdicionEstacionamiento(id, nombre, direccion);
	}
}

//insertando estacionamiento

async function guardarNuevoEstacionamiento(nombre,direccion) {
	try {
		const respuesta = await fetch("/api/estacionamientos", {
			method: "POST",
			headers: {"Content-Type" : "application/json" },
			body: JSON.stringify({nombre, direccion})
		});

		if (respuesta.ok) {
			alert("Estacionamiento registrado con exito.");
			document.getElementById("form-container").style.display ="none";
			listarEstacionamientos();
		} else {
			const errData = await respuesta.json();
			alert(`error al guardar: ${errData.mensaje || 'consulte los logs del servidor. '}`);
		}
	} catch (error) {
		console.error("Error en el POST:", error);
		alert("Error de red al intentar insertar el registro.");
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

//enviar datos a la apu

async function guardarEdicionEstacionamiento(id,nombre,direccion) {
	try {
		const respuesta = await fetch('/api/estacionamientos/' + id ,{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ nombre, direccion})
		});

		if (respuesta.ok) {
			alert("estacionamiento actualizado correctamente.");
			document.getElementById("form-container").style.display = "none";
			listarEstacionamientos();
		} else {
			alert("No se pudo Actualizar el estacionamiento.");
		}
	} catch (error) {
		console.error("Error en el PUT:", error);
	}
}
//Eliminar registro

async function eliminarParking(id) {
	if (confirm(`Esta seguro de eliminar el estacionamiento con ID ${id}?\n Esta accion es irreversible y afectara a los pisos y lugares vinculados.`)) {
		try {
			const respuesta = await fetch('/api/estacionamientos/' + id, {
				method: "DELETE"
			});

			if (respuesta.ok) {
				alert("Registro eliminado des sistema.");
				listarEstacionamientos();
			} else {
				alert("Error al eliminar. verifique las restricciones de llaves foraneas.");
			}
		} catch (error) {
			console.error("Error en el DELETE:", error);
		}
	}
}

// redireccion final

function verParking(id) {
	window.location.href = './admin_pisos.html?estacionamiento_id=' + id;
}
