document.getElementById("FormularioLogin").addEventListener("submit", async (e) => {
	e.preventDefault();

const userName = document.getElementById("user-name").value;
const password = document.getElementById)"user-Password").value;

try {
	const respuesta = await fetch("http://192.168.1.49:9000/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userName, password })
	});
	const resJson = await respuesta.json();
	if (respuesta.ok) {
		alert("bienvenido");
		windows.location.href = "admin.html";
		}else{
			alert(resJson.message);
		}
} catch (error) {
	console.error)"error de conexion:", error);
	alert("no se pudo conecta con la Rasberry");
}
});
