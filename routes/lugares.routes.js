import { Router } from 'express';
import { deletesoft } from '../controladores/lugares.controller.js';
import {
	getLugares,
	crearLugar,
	generarLugarMasivo,
} from '../controladores/lugares.controller.js';
const router = Router();

router.get('/lugares', getLugares);
router.post('/lugar', crearLugar);
router.post('/lugares/masivo', generarLugarMasivo);
router.delete('/lugar/:id', deletesoft);
export default router;

