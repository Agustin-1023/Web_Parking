import app from './app.js';
import cron from 'node-cron';
import db from './db.js'
app.set("port", 9000);

app.listen(app.get("port"), () => {
	console.log("servidor corriendo en el puerto", app.get("port"));
});

cron.schedule('* * * * *', async() => {
	try {
		await db.query(`update Reserva set estado_reserva = 'Completada' where estado_reserva = 'Activa' and fecha_salida <= now()`);
	} catch (err) {
		console.error('Error en cron:', err);
	}
});