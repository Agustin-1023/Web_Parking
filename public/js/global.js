
async function EjecutarCerrarSesion(e) {
	e.preventDefault();
	const resultado = await Swal.fire({
		title: 'Cerrar sesion?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#dc3545',
		cancelButtonColor: '#6c757d',
		confirmButtonText: 'Si, salir',
		cancelButtonText: 'Cancelar'
	});
	if (resultado.isConfirmed) {
		try {
			const respuesta = await fetch('/api/logout', { method: 'POST'});
			if (respuesta.ok) {
				window.location.href = './index.html';
			} else {
				Swal.fire('Error', 'No se pudo cerrar la sesion', 'error');
			}
		} catch (error) {
			console.error('Error de red al cerrar sesion: ', error);
			Swal.fire('Error','Fallo de conexion con el servidor','error');
		}
	}
}