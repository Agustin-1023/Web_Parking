import db from '../db.js';

export const getVehiculosPorUsuario = async (req, res) => {
	const { user_name } = req.query;

	if (!user_name) {
		return res.status(400).json({message: 'El nombre de usuario es obligatorio.'});
	}
	try {
		const [rows] = await db.query(
			`select v.vehiculo_id, v.matricula, v.marca, v.modelo, v.color, v.es_principal, v.estado
			from Vehiculo v
			inner join Usuario u on v.usuario_id = u.usuario_id
			where u.user_name = ? and v.estado = 'ACTIVO'
			order by v.es_principal desc, v.vehiculo_id desc
		`, [user_name]
		);
		res.status(200).json(rows);
	} catch (error) {
		console.error('Error al obtener vehiculos: ', error);
		res.status(500).json({message: 'Error interno al consultar los vehiculos.'});
	}
};
export const crearVehiculo = async (req, res) => {
	const { user_name, matricula, marca, modelo, color, es_principal } = req.body;

	if (!user_name || !matricula) {
		return res.status(400).json({ message: 'El usuario y la matricula son obligatiorios.'});
	}

	const connection = await db.getConnection();

	try {
		await connection.beginTransaction();
		const [users] = await connection.query(
			'select usuario_id from Usuario where user_name = ?',
			[user_name]
		);

		if (users.length === 0 ) {
			await connection.rollback();
			return res.status(404).json({ message: 'Usuario no encontrado.'});
		}
		const usuario_id = users[0].usuario_id;
		const matriculaNormalizada = matricula.trim().toUpperCase();
		const [existentes] = await connection.query(
			`
				select vehiculo_id from Vehiculo
				where usuario_id = ? and matricula = ? and estado = 'ACTIVO'
			`,[usuario_id, matriculaNormalizada]
		);
		if (existentes.length > 0) {
			await connection.rollback();
			return res.status(409).json({ message: 'Ya tienes un vehiculo activo registrado con esa matricula.'});
		}
		if (es_principal) {
			await connection.query(
				'update Vehiculo set es_principal = 0 where usuario_id = ?',
				[usuario_id]
			);
		}
		await connection.query(
		`insert into Vehiculo (usuario_id, matricula, marca, modelo, color, es_principal, estado) values
		(?, ?, ?, ?, ?, ?, 'ACTIVO')
		`,[ usuario_id,
			matriculaNormalizada,
			marca ? marca.trim() : null,
			modelo ? modelo.trim() : null,
			color ? color.trim() : null,
			es_principal ? 1 : 0]
		);
		await connection.commit();
		res.status(201).json({ success: true, message: 'Vehiculo registrado correctamente.'});
	} catch (error) {
		await connection.rollback();
		console.error('Error al registrar vehiculo: ', error);
		res.status(500).json({message: 'Error interno al guardar el vehiculo.'});
	} finally {
		connection.release();
	}
};

export const marcarVehiculoPrincipal = async (req, res) => {
	const { id } = req.params;
	const { user_name } = req.body;

	const connection = await db.getConnection();
	try{
		await connection.beginTransaction();
		const [users] = await connection.query(
		`select usuario_id from Usuario where user_name = ?`,
		[user_name]
		);

		if (users.length === 0) {
			await connection.rollback();
			return res.status(404).json({ message: 'Usuario no encontrado.'});
		}
		const usuario_id = users[0].usuario_id;

		await connection.query(
			'update Vehiculo set es_principal = 0 where usuario_id = ?',
			[usuario_id]
		);
		const [result] = await connection.query(
		`update Vehiculo set es_principal = 1 where vehiculo_id = ? and usuario_id = ? and estado = 'ACTIVO'`,
		[id, usuario_id]
		);
		if (result.affectedRows === 0) {
			await connection.rollback();
			return res.status(404).json({ message: 'vehiculo no encontrado o inactivo.'});
		}
		await connection.commit();
		res.status(200).json({ success: true, message: 'Vehiculo principal actualizado.'});
	} catch (error) {
		await connection.rollback();
		console.error('Error al actualizar vehiculo principal:', error);
		res.status(500).json({ message: 'Error interno al actualizar.'});	
	} finally {
		connection.release();
	}
};

export const eliminarVehiculo = async (req,res) => {
	const { id } = req.params;

	try {
		const [result] = await db.query(
		`update Vehiculo set estado = 'INACTIVO', es_principal = 0 where vehiculo_id = ?`,
		[id]
		);
		if (result.affectedRows === 0 ) {
			return res.status(400).json({ message: 'vehiculo no encontrado.'});
		}
		res.status(200).json({ success: true, message: 'Vehiculo eliminado de la lista Activa.'});
	} catch (error) {
		console.error('Error al deshabilitar vehiculo: ', error);
		res.status(500).json({ message: 'Error interno al eliminar el vehiculo.'});
	}
};
