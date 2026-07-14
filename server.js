import app from './app.js';

app.set("port", 9000);

app.listen(app.get("port"), () => {
	console.log("servidor corriendo en el puerto", app.get("port"));
});

