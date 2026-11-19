import pool from '../db.js';

export const getParkingsDisponibles = async (req, res) => {
	try {
		const sql = `
			select e.estacionamiento_id as id_parking, e.nombre as nombre_parking, count(l.lugar_id) as lugares_libres
			from Estacionamiento e
			join Piso p on e.estacionamiento_id = p.estacionamiento_id
			join Lugar l on p.piso_id = l.piso_id
			where l.estado = 'disponible' and p.activo = 1 and e.activo = 1
			group by e.estacionamiento_id, e.nombre
			having lugares_libres > 0;
		`;
		const [rows] = await pool.query(sql);
		res.json(rows);
	} catch (err) {
		console.error("Error al obtener parkings disponibles:", err);
		res.status(500).json({ error: err.message });
	}
};

export const reservarPorParking = async (req, res) => {
	const { user_name, id_parking, fecha_ingreso } = req.body;

	if (!user_name || !id_parking) {
		return res.status(400).json({ message: "Faltan datos obligatorios." });
	}

	const connection = await pool.getConnection();
	try {
		// Buscamos el usuario
		const [users] = await connection.query('select usuario_id from Usuario where user_name = ?', [user_name]);
		if (users.length === 0) {
			connection.release();
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		const usuario_id = users[0].usuario_id;
		const fecha = fecha_ingreso || new Date();

		await connection.beginTransaction();

		// Buscamos un lugar disponible bloqueándolo para concurrencia segura
		const [lugares] = await connection.query(
			`select l.* from Lugar l
			join Piso p on l.piso_id = p.piso_id
			where p.estacionamiento_id = ? and l.estado = 'disponible' and p.activo = 1
			limit 1 for update`, 
			[id_parking]
		);

		if (lugares.length === 0) {
			await connection.rollback();
			connection.release();
			return res.status(400).json({ message: "Lo sentimos, ya no quedan lugares libres en este estacionamiento." });
		}

		const lugarAsignado = lugares[0];

		// Insertamos la reserva usando la columna y formato correcto
		const query = `
			insert into Reserva (usuario_id, lugar_id, estado_reserva, fecha_ingreso)
			values (?, ?, 'Activa', ?)
		`;
		const [resultReserva] = await connection.query(query, [usuario_id, lugarAsignado.lugar_id, fecha]);

		// Actualizamos el estado del lugar a ocupado
		await connection.query(
			`update Lugar set estado = 'ocupado' where lugar_id = ?`,
			[lugarAsignado.lugar_id] 
		);

		await connection.commit();
		connection.release();

		// Respuesta única de éxito
		return res.status(200).json({ 
			success: true, 
			message: "Reserva creada con éxito", 
			id_reserva: resultReserva.insertId 
		});

	} catch (err) {
		await connection.rollback();
		connection.release();
		console.error("Error al crear la reserva:", err);
		return res.status(500).json({ error: err.message });
	}
};

export const getMisReservas = async (req, res) => {
	const { user_name } = req.query;
	try {
		const query = `
			select r.reserva_id as id_reserva, r.estado_reserva as estado, r.fecha_ingreso, r.fecha_salida,
			p.numero_piso, l.codigo_lugar, l.tipo_lugar, e.nombre as nombre_parking
			from Reserva r
			join Usuario u on r.usuario_id = u.usuario_id
			join Lugar l on r.lugar_id = l.lugar_id
			join Piso p on l.piso_id = p.piso_id
			join Estacionamiento e on p.estacionamiento_id = e.estacionamiento_id
			where u.user_name = ?
			order by r.fecha_ingreso desc;
		`;
		const [rows] = await pool.query(query, [user_name]);
		res.json(rows);
	} catch (err) {
		console.error("Error al obtener reservas del cliente:", err);
		res.status(500).json({ error: err.message });
	}
};

export const cancelarReserva = async (req, res) => {
	const { id } = req.params;
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		
		const [reservas] = await connection.query(`select * from Reserva where reserva_id = ?`, [id]);
		if (reservas.length === 0) {
			await connection.rollback();
			connection.release();
			return res.status(404).json({ message: "Reserva no encontrada" });
		}
		
		const reserva = reservas[0];
		
		// Actualizamos utilizando la columna correcta: 'estado_reserva'
		await connection.query(
			`update Reserva set estado_reserva = 'Cancelada', fecha_salida = now() where reserva_id = ?`,
			[id]
		);
		
		await connection.query(
			`update Lugar set estado = 'disponible' where lugar_id = ?`,
			[reserva.lugar_id]
		);
		
		await connection.commit();
		connection.release();
		
		return res.json({ message: 'Reserva cancelada correctamente y lugar liberado' });

	} catch (err) {
		await connection.rollback();
		connection.release();
		console.error("Error al cancelar la reserva:", err);
		return res.status(500).json({ error: err.message });
	}
};