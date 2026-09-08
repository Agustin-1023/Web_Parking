import pool from '../db.js';

export const getEstacionamientos = async (req,res) => {

	const usuario_id = req.session.usuario_id;

	if(!usuario_id) return res.status(401).json({ message: " No autorizado" });

	try { 
		const [row] = await pool.query(
			'select * from Estacionamiento where usuario_id = ? and activo= 1', [usuario_id]);
		res.json(rows);
	} catch (error) {
		res.status(500).json({ message: "Error al obtener estacionamientos", error: error.message });
	}
};
export const deleteEstacionamiento = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	const {id} = req.params;

	if (!usuario_id) return res.status(401).json({ message: "No autorizado"});

	try {
		const [result] = await pool.query( 'update Estacionamiento set activo = 0 WHERE estacionamiento_id = ? and usuario_id = ? and activo= 1',
			[id,usuario_id]
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "Estacionamiento no encontrado o ya deshabilitado"});
		}
		res.json({ message: "Estacionamiento eliminado correctamente"});
	} catch (error) {
		res.status(500).json({message: "Error al eliminar el estacionamiento",error: error.message});
	}
};