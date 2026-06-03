import pool from '../db.js';

export const getEstacionamientos = async (req,res) => {

	const usuario_id = req.session.usuario_id;

	if(!usuario_id) return res.status(401).json({ message: " No autorizado" });

	try { 
		const [row] = await pool.query('select * from Estacionamiento where usuario_id = ?', [usuario_id]);
		res.json(rows);
	} catch (error) {
		res.status(500).json({ message: "Error al obtener estacionamientos", error: error.message });
	}
};
