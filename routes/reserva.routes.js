import { Router } from 'express';
import { getReservas, crearReserva, cancelarReserva,actualizarReserva } from '../controladores/reserva.controller.js';

const router = Router();
router.get('/', getReservas);
router.post('/', crearReserva);
router.put('/cancelar/:id', cancelarReserva);
router.put('/:id', actualizarReserva);

export default router;