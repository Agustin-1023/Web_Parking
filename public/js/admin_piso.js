const Toast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	timer:3000,
	timerProgressBar: true
});

document.addEventListener('DOMContentLoaded',() => {
	cargarPisos();
	async function cargarEstacionamientos() {
		try {
			const res = await fetch('/api/estacionamientos');
			const estacionamientos = await res.json(); 
			const select = document.getElementById('select-estacionamiento');

			select.innerHTML = '<option value="">Selecciona un estacionamiento...</option>';
			estacionamientos.forEach(est => {
				select.innerHTML += `<option value="${est.estacionamiento_id}">${est.nombre}</option>`;
			});
		} catch (err) {
			console.error("Error cargando estacionamientos:", err);
		}
	}
	cargarEstacionamientos();
	document.getElementById('button-create-bottom').addEventListener('click', () => {
		document.getElementById('form-container').style.display = 'block';
	});
	document.getElementById('btn-cancelar-piso').addEventListener('click',() => {
		document.getElementById('form-container').style.display = 'none';
	});

	document.getElementById('btn-guardar-piso').addEventListener('click', guardarPiso);
});

async function cargarPisos() {
	try {
		const res = await fetch('/api/pisos');
		const pisos = await res.json();
		const tbody = document.getElementById('tbody-pisos');
		
		tbody.innerHTML =pisos.map(piso => `
			<tr>
				<td>${piso.numero_piso}</td>
				<td>${piso.descripcion}</td>
				<td>
					<button class="btn-action delete" onclick="eliminarPiso(${piso.piso_id})">ELIMINAR</button>
				</td>
			</tr>
		`).join('');
	} catch (err) {
		console.error("Error cargando Pisos:", err );
	}
}
async function guardarPiso() {
    const select = document.getElementById('select-estacionamiento');
    const inputNum = document.getElementById('numeroPiso');
    const inputDesc = document.getElementById('descripcionPiso');

    if (!select || !inputNum || !inputDesc) {
        Swal.fire('Error', 'No se pudieron cargar los campos del formulario.', 'error');
        return;
    }

    const valorSeleccionado = select.options[select.selectedIndex].value;
	
    if (!valorSeleccionado || valorSeleccionado === "") {
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
            document.getElementById('form-container').style.display = 'none';
            inputNum.value = '';
            inputDesc.value = '';
            select.selectedIndex = 0;
            cargarPisos(); 
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
		confirmbuttonText: 'Si, eliminar',
		cancelarButtonText: 'Cancelar'
	});

	if (result.isConfirmed) {
		await fetch(`/api/pisos/delete/${id}`, { method: 'PUT' });
		cargarPisos();
		Toast.fire({icon: 'success', title: 'Piso dado de baja' });
	}
}
