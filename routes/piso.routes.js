import express from 'express';
import { getPisos, crearPiso, softDeletePiso } from '../controladores/piso.controller.js';

const router = express.Router();

router.get('/', getPisos);
router.post('/', crearPiso);
router.put('/delete/:id', softDeletePiso);

export default router;
