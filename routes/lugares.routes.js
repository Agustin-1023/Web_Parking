import { Router } from 'express';
import {
	getLugares,
	crearLugar,
	generarLugaresMasivamente,
} from '../controladores/lugares.controller.js';
const router = Router();

router.get('/lugares', getLugares);
router.post('/lugar', crearLugar);
router.post('/lugares/masivo', generarLugaresMasivamente);

export default router;
