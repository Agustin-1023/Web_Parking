import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

jest.setTimeout(20000);

describe('Seguridad de Rutas (middleware)', () => {
	test('GET /api/pisos deberia devolver 401 si el usuario no esta logueado', async () => {
		//envio de peticion sin cookie
		const response = await request(app).get('/api/pisos');
		//rechazo
		expect(response.statusCode).toBe(401);
	});

	test('POST /api/pisos deberia devolver 401 si no hay sesion activa', async () => {
		const response = await request(app)
		.post('/api/pisos')
		.send({ numero: "Piso 5" });
	expect(response.statusCode).toBe(401);
	});
	test('POST /api/login deberia devolver un 200 si el logra iniciar sesion', async () => {
		const response = await request(app)
		.post('/api/login')
		.send({
			userName: "agustin",
			password: "sosa"
		})
		expect(response.statusCode).toBe(200);
	});
});
