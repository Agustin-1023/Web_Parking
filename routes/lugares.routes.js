import { Router } from 'express';
import {
	getLugares,
	crearLugar,
	generarLugaresMasivamente,
	getPisos
} from '../controladores/lugares.controller.js';
const router = Router();

router.get('/lugares', getLugares);
router.get('/pisos', getPisos);
router.post('/lugar', crearLugar);
router.post('/lugares/masivo', generarLugaresMasivamente);

export default router;
