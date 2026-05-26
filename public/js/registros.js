document.getElementById('form-registro').addEventListener('submit', 
	async function(evento) {evento.preventDefault();
// Captura de datos
    const nombre = document.getElementById('nombre').value;
    const userName = document.getElementById('userName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const ObjetoUsuario = {
        nombre: nombre,
        userName: userName,
        email: email,
        phone: phone,
        password: password
    };
    // Peticion HTTP
    try {
        const respuesta = await fetch('http://192.168.1.49:9000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ObjetoUsuario)
        });
	const resJson = await respuesta.json();
        if (respuesta.ok) {
		alert('Usuario Registrado: ' + resJson.message);
		document.getElementById('form-registro').reset();
		window.location.href = 'index.html';
        } else {
         console.log("Error del servidor:", resJson);
		alert('Error al guardar'+ (resJson.message || "campos incompletos"));
        }
    } catch (error) {
        console.error('Error de conexion: ', error);
    }
});
