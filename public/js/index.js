document.getElementById("FormularioLogin").addEventListener("submit", async (e) => {
	e.preventDefault();

const userName = document.getElementById("user-name").value;
const password = document.getElementById("user-Password").value;

try {
	const respuesta = await fetch("/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userName, password })
	});
	const resJson = await respuesta.json();
	if (respuesta.ok) {
		localStorage.setItem("rol", resJson.rol);
		localStorage.setItem("usuario",resJson.userName);

		alert("bienvenido");
		if (resJson.redirect){
			window.location.href = resJson.redirect;
		} else {
			window.location.href = "admin_paking.html";
			}
		} else {
			alert(resJson.message);
		}
} catch (error) {
	console.error("error de conexion:", error);
	alert("no se pudo conecta con la Rasberry");
}
});
