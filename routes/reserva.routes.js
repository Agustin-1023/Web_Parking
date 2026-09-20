import { Router } from 'express';
import { getReservas, crearReserva, cancelarReserva } from '../controladores/reserva.controller.js';

const router = Router();
router.get('/', getReservas);
router.post('/', crearReserva);
router.put('/cancelar/:id', cancelarReserva);

export default router;