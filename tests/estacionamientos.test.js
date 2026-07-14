import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import pool from '../db.js';

jest.setTimeout(15000);

describe('Pruebas de creacion', () => {
    let agent;
    let testEstacionamientoId;
    let testPisoId;

    beforeAll(async () => {
        agent = request.agent(app);
        await agent.post('/api/login')
            .send({
                userName: 'agustin',
                password: 'sosa'
            });
    });

    afterAll(async () => {
        try {
            if (testPisoId){
                await pool.query('delete from Lugar where piso_id = ?', [testPisoId]);
            }
            if (testEstacionamientoId){
                await pool.query('delete from Piso where estacionamiento_id = ?', [testEstacionamientoId]);
                await pool.query('delete from Estacionamiento where estacionamiento_id = ?', [testEstacionamientoId]);
            }
            console.log("datos de prueba de estacionamiento eliminados");
        } catch (error) {
            console.error("error al limpiar la BD", error);
        }finally {
            await pool.end();
        } 
    });

    test('crear estacionamiento exitoso', async () => {
        const response = await agent.post('/api/estacionamientos')
            .send({
                nombre: 'parking test',
                direccion: 'calle test 123'
            });
        expect(response.statusCode).toBe(201);
        testEstacionamientoId = response.body.id; 
    });

    test('crear piso exitoso', async () => {
        const response = await agent.post('/api/pisos')
            .send({
                estacionamiento_id: testEstacionamientoId,
                numero_piso: '1',
                descripcion: 'Piso test',
                cantidad: 10
            });
        expect(response.statusCode).toBe(201);

        testPisoId = response.body.id;
    });

    test('crear lugar exitoso', async () => {
        const response = await agent.post('/api/lugares') 
            .send({ 
                piso_id: testPisoId,
                codigo_lugar: 'test-${Date.now()}',
                tipo_lugar: 'Electrico',
                estado: 'Disponible'
            });
        if(response.statusCode != 201) {
            console.log("mensaje de error del 404:", response.body);
        }
        expect(response.statusCode).toBe(201);
    });
});