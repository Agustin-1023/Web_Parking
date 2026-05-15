async function seleccionRol(rol) {
	
	// obtener datos
	const userName = localStorage.getItem("usuario");
	//verificar tener datos del usuario
	if (!userName) {
		alert("Sesion expirada. Por Favor, Iniciar sesion de nuevo.");
		window.location.href = "/index.html";
		return;
	}
	
	try {
	//llamamos a la api
		const respuesta = await fetch("/api/actualizar-rol", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				user_name: userName,
				nuevoRol: rol
			})
		});

		if (respuesta.ok) {
			//actualiza el rol
			localStorage.setItem("rol",rol);

			//redirecciona
			if (rol === 'boss') {
				window.location.href = "/admin_paking.html";
			} else {
				window.location.href = "/cliente_view.html";
			}
		} else {
			alert("Error al actualizar el rol: " + resJson.message);
		}
	} catch (error) {
		console.error("Error de conexion con la Rasberry:", error);
		alert("No se pudo conectar con el servidor.");
	}
}
//linea para que el onclick funcione correctamente
window.seleccionRol = seleccionRol;


