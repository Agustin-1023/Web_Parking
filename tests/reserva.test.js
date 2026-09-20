import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import pool from '../db.js';

jest.setTimeout(15000);

describe('Pruebas de endpoints de Reservas (/api/reserva)', () => {
	let agent;
	let createdReservaId;

	const adminCredentials = {
        userName: 'agustin',
   	    password: 'sosa'
            
	};

	const testReserva = {
		lugar_id: 1,
		patente_manual: "TEST999",
		origen_reserva: "admin",
		fecha_inicio: "2026-10-10 10:00:00",
		fecha_fin: "2026-10-10 12:00:00"
	};
	beforeAll(async () => {
		agent = request.agent(app);
		await agent 
			.post('/api/login')
			.send(adminCredentials);
	});
	afterAll(async () => {
		try {
			await pool.query(
				'delete from Reserva Where patente_manual=?',
				[testReserva.patente_manual]
			);
		} catch (error) {
			console.error("Error al limpiar reservas de prueba", error);
		} finally {
			await pool.end();
		}
	});
	test('Deberia crear una reserva exitosamente', async () => {
		const response = await agent 
			.post('/api/reserva')
			.send(testReserva);
		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty('message', 'Reserva creada con exito');
		expect(response.body).toHaveProperty('reserva_id');
		createdReservaId = response.body.reserva_id;
	});

	test('deberia fallar con 400 si falta campo', async () => {
		const response = await agent
			.post('/api/reserva')
			.send({
				lugar_id: 1
			});
		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			message: "lugar y fechas no estan"
		});
	});
	test('listado de reservas(status:200)',async () => {
		const response = await agent
			.get('/api/reserva');
		expect(response.statusCode).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});
	test('deberia cancelar la reserva creada exitosa', async () => {
		expect(createdReservaId).toBeDefined();
		const response = await agent 
			.put(`/api/reserva/cancelar/${createdReservaId}`);
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			message: "reserva cancelada correctamente"
		});
	});
	test('deberia fallar con 404 la canselar reserva inexistente', async () => {
		const response = await agent
			.put('/api/reserva/cancelar/99999');
		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual({
		message: 'Reserva no encontrada.'
		});
	});
});