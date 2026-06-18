import { Router } from 'express';
import { deletesoft } from '../controladores/lugares.controller.js';
import {
	getLugares,
	crearLugar,
	generarLugaresMasivamente,
} from '../controladores/lugares.controller.js';
const router = Router();

router.get('/lugares', getLugares);
router.post('/lugar', crearLugar);
router.post('/lugares/masivo', generarLugaresMasivamente);
router.delete('/lugar/:id', deletesoft);
export default router;
