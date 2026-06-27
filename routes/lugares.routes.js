import { Router } from 'express';

import {
	getLugares,
	crearLugar,
	generarLugarMasivo,
	deletesoft,
	actualizarLugar,
	getLugarById
} from '../controladores/lugares.controller.js';
const router = Router();
router.get('/lugares', getLugares);
router.post('/lugar', crearLugar);
router.post('/lugares/masivo', generarLugarMasivo);
router.delete('/lugar/:id', deletesoft);
router.put('/lugar/:id', actualizarLugar);

router.get('/lugar/:id', getLugarById);

export default router;