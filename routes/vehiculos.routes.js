import { Router } from 'express';
import {
	getVehiculosPorUsuario,
	crearVehiculo,
	marcarVehiculoPrincipal,
	eliminarVehiculo
} from '../controladores/vehiculos.controller.js';

const router = Router();
router.get('/', getVehiculosPorUsuario);
router.post('/',crearVehiculo);
router.put('/:id/principal', marcarVehiculoPrincipal);
router.delete('/:id',eliminarVehiculo);

export default router;