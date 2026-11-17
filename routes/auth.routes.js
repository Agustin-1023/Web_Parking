import { Router } from 'express';
import { cerrarSesion } from '../controladores/validacion.control.js';

const router = Router();

router.post('/logout', cerrarSesion);

export default router;