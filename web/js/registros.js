document.getElementById('FormularioRegistro').addEventListener('submit', 
	async function(evento) {evento.preventDefault();



// Captura de datos
    const nombre = document.getElementById('name').value;
    const userName = document.getElementById('user-name').value;
    const email = document.getElementById('E-mail').value;
    const phone = document.getElementById('Celular').value;
    const password = document.getElementById('Password').value;

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
	const resJson ) await res.json();

        if (respuesta.ok) {
		alert('Usuario Registrado: ' + resJson.message);
		document.getElementById('FormularioRegistro').reset();
		window.location.href = 'index.html';
            alert('Usuario Registrado: ' + resultado.message);
            document.getElementById('FormularioRegistro').reset();
        } else {
            alert('Error al guardar'+ resJson.message);
        }
    } catch (error) {
        console.error('Error de conexion: ', error);
    }
});
