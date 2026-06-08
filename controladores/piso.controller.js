import pool from '../db.js';

export const getPisos = async (req, res) => {
console.log("query params recibidos: ", req.query);
	console.log("!!estoy en GETPISOS!!");
	const usuario_id = req.session.usuario_id;
	const { estacionamiento_id} = req.query;

console.log("usuario ID en session: ",usuario_id);
	if (!usuario_id) {
		
console.log("error: usuario no autorizado ");
		return res.status(401).json({ message: "No autorizado" });
	}	
	try {
		const sql = "Select P.* FROM Piso P INNER JOIN Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id where E.usuario_id = ? and P.estacionamiento_id = ? and P.activo = 1";
		const [rows] = await pool.query(sql , [usuario_id, estacionamiento_id]);
		res.json(rows);
	} catch (err) {
		console.error("error en BD:");

		console.error("cdoigo:", err.code);
		console.error("message:", err.sqlMessage);
		console.error("error SQL deteallado: ", err.sql);
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
	const usuario_id = req.session.usuario_id;
	if(!usuario_id) return res.status(401).json({ message: "No autorizado"});

	const {id } = req.params;

	try {
	const [result] = await pool.query(`
	update Piso P 
	inner join Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id 
	set p.activo = 0 
	where P.piso_id = ? and E.usuario_id = ?
		`, [id,usuario_id]);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "Piso no encontrado o no tiene permisos" });
		}

		res.json({ message: 'Piso eliminado logicamente' });
	} catch (err) { res.status(500).json({ error: err.message }); }
};
