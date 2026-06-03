import pool from '../db.js';

export const getPisos = async (req, res) => {
	
	const usuario_id = req.session.usuario_id;
	if (!usuario_id) return res.status(401).json({ message: "No autorizado" });
	
	try {
		const [rows] = await pool.query(`
		select P.* from Piso P
		inner join Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id where E.usuario_id = ? and P.activo = 1`, [usuario_id]);
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
export const crearPiso = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

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
	const usuario_id = res.session.usuario_id;
	if(!usuario_id) return res.status(401).json({ message: "No autorizado"});

	const {id } = req.params;

	try {
	const [result] = await pool.query(`
	update Piso P inner join Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id set p.activo = 0 where P.activo = 0 where P.piso_id = ? and E.usuario_id = ?
		`, [id,usuario_id]);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "Piso no encontrado o no tiene permisos" });
		}

		res.json({ message: 'Piso eliminado logicamente' });
	} catch (err) { res.status(500).json({ error: err.message }); }
};
