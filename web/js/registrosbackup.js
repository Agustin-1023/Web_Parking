document.getElementById('FormularioRegistro').addEventListener('submit', 
	async function(evento) {evento.preventDefault();


//captura dde datos
const nombre = document.getElementById('Name').value;
const userName = document.getElementById('user-name').value;
const EMail = document.getElementById('E-mail').value;
const phone = document.getElementById('Celular').value;
const password = document.getElementById('Password').value;

//creacion del objeto
const ObjetoUsuario = {
	nombre: nombre,
	userName: userName,
	EMail: EMail,
	phone: phone,
	password: password
};

// peticion http

try {
	const respuesta = await fetch('http:10.10.0.5:9000/adduser', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body:JSON.stringify(ObjetoUsuario)
	});
if (respuesta.ok){
	const resultado = await respuesta.json();
	alert('Usuario Registrado: ' + resultado.message);
	document.getElementById('FormularioRegistro').reset();
}else{
	alert('Error al guardar');
}
} catch (error){
	console.error('error de conexion: ' , error);
}
};
