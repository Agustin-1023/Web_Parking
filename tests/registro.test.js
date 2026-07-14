import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import pool from '../db.js';

jest.setTimeout(15000);

describe('Pruebas de endpoint de registro de Usuario', () => {
	let agent;

	const testUser = { 
		nombre: "Agustin Pruebas",
		userName: "agustin_test",
		email: "agustintest@correo.com",
		phone: "099123456",
		password: "passwordsegura123" 
	};
	beforeAll(() => {
		agent = request.agent(app);
	});

	afterAll(async () => {
		try {
			await pool.query(
				'delete from Usuario where user_name = ? or email = ?',
				[testUser.userName, testUser.email]
			);
		} catch (error) {
			console.error("Error limpiando el usuario de prueba:", error);
		} finally {
			await pool.end();
		}
	});
	test('Deberia registrar un usuario exitoso', async () => {
		const response = await agent
			.post('/api/register')
			.send(testUser);
		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			status: "ok",
			message: "!Usuario Guardado en BD",
			redirect: "/login"
		});
	});
	test ('deberia fallar con 400 si faltan campos', async () => {
		const response = await agent
		.post('/api/register')
		.send({
			nombre: testUser.nombre,
			userName: "otro_usuario",
			email: "otro_correo@corre.com"
		});
		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			status: "Error",
			message: "Los campos estan incompletos"
		});
	});
	test('Deberia fallar con 500 al intentar registrar el mismo userName ya existente', async () =>{
		const response = await agent
			.post('/api/register')
			.send(testUser);

		expect(response.statusCode).toBe(500);
		expect(response.body).toEqual({
			status: "Error",
			message: "No se pudo guardar el usuario"
		});
	});
});