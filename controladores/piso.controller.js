import pool from '../db.js';

export const getPisos = async (req,res) => {
	try {
		const [rows] = await pool.query('select * from Piso where activo = 1');
		res.json(rows);
	} catch (err) { res.status(500).json({ error: err.message }); }
};

export const crearPiso = async (req,res) => {
	const { estacionamiento_id, numero_piso, descripcion } = req.body;
	try {
		await pool.query(
			'insert into Piso (estacionamiento_id, numero_piso, descripcion, activo) values (?, ?, ?, 1)',
			[estacionamiento_id, numero_piso, descripcion]
		);
		res.status(201).json({ message: 'Piso creado' });
	} catch (err) { res.status(500).json({error: err.message }); }
};

export const softDeletePiso = async (req,res) => {
	const {id } = req.params;
	try {
		await pool.query('update Piso set activo = 0 where piso_id = ?', [id]);
		res.json({ message: 'Piso eliminado logicamente' });
	} catch (err) { res.status(500).json({ error: err.message }); }
};
