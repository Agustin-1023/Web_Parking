import pool from '../db.js';

export const getPisos = async (req, res) => {
    const usuario_id = req.session.usuario_id;
    const { estacionamiento_id } = req.query; // Puede venir 'todos' o un ID numérico

    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

    try {
        let sql = `
            SELECT P.* FROM Piso P 
            INNER JOIN Estacionamiento E ON P.estacionamiento_id = E.estacionamiento_id 
            WHERE E.usuario_id = ? AND P.activo = 1
        `;
        const params = [usuario_id];
        if (estacionamiento_id && estacionamiento_id !== 'todos') {
            sql += " AND P.estacionamiento_id = ?";
            params.push(estacionamiento_id);
        }

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error en BD:", err);
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
export const updatePiso = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	const {id} = req.params;
	const { numero_piso, descripcion } = req.body;

	if (!usuario_id) return res.status(401).json({ message: "no autorizado" });
	try {
		const [result] = await pool.query(
	`
		update Piso P
		inner join Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id
		set P.numero_piso = ?, P.descripcion = ?
		where P.piso_id = ? and E.usuario_id = ?`,
		[numero_piso,descripcion,id,usuario_id]
		);
		if (result.affectedRows === 0 ) {
			return res.status(400).json({ message: "Piso no encontrado o no autorizado" });
		}
		res.json({ message: 'Piso actualizado correctamente' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};