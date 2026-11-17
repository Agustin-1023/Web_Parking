import express from 'express';
import {
	getParkingsDisponibles,
	reservarPorParking,
	getMisReservas,
	cancelarReserva
} from '../controladores/cliente.controller.js';
const router = express.Router();
router.get('/parkings-disponibles', getParkingsDisponibles);
router.post('/cliente/reservar-por-parking',reservarPorParking);
router.get('/cliente/mis-reservas', getMisReservas);
router.put('/cliente/reservas/:id/cancelar',cancelarReserva);
export default router;