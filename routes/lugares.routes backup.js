import { Router } from 'express';
import { pool } from '../bd.jd';
import { deletesoft } from '../controladores/lugares.controller.js';
import {actualizarLugar } from '../controladores/lugares.controller.js';
import {
	getLugares,
	crearLugar,
	generarLugarMasivo,
} from '../controladores/lugares.controller.js';
const router = Router();
router.put('/lugar/:id', actualizarLugar);
router.get('/lugares', getLugares);
router.post('/lugar', crearLugar);
router.post('/lugares/masivo', generarLugarMasivo);
router.delete('/lugar/:id', deletesoft);

router.get('/lugar/:id', async (req,res) => {
	const { id } = req.params;
	try {
		const [row] = await pool.query('select * from Lugar where lugar_id = ?', [id]);

		if (rows.legth > 0) {
			res.json(rows[0]);
		} else {
			res.status(404).json({ message: "Lugar no encontrado" });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
export default router;

