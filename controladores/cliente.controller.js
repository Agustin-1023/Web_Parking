import pool from '../db.js';

export const getParkingsDisponibles = async (req,res) => {
	try {
		const sql = `
			select e.estacionamiento_id as id_parking, e.nombre as nombre_parking, count(l.lugar_id) as lugares_libres
			from Estacionamiento e
			join Piso p on e.estacionamiento_id = p.estacionamiento_id
			join Lugar l on p.piso_id = l.piso_id
			where l.estado = 'disponible' and p.activo = 1 and e.activo= 1
			group by e.estacionamiento_id, e.nombre
			having lugares_libres > 0 ;
		`;
		const [rows] = await pool.query(sql);
		res.json(rows);
	} catch (err) {
		console.error("Error al obtener parkings disponibles:", err);
		res.status(500).json({error: err.message});
	}
};
export const reservarPorParking = async (req,res) => {
	const {user_name, id_parking} = req.body;

	if (!user_name || !id_parking) {
		return res.status(400).json({ message: "faltan datos obligatorios."});
	}

	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const [lugares] = await connection.query(
		`select l.* from Lugar l
		join Piso p on l.piso_id = p.piso_id
		where p.estacionamiento_id = ? and l.estado = 'disponible' and p.activo = 1
		limit 1 for update`, 
		[id_parking]
		);

		if (lugares.length === 0 ) {
			await connection.rollback();
			connection.release();
			return res.status(400).json({ message: "Lo sentimos, ya no quedan lugares libres en este estacionamiento."});
		}
		const lugarAsignado = lugares[0];
		const [resultReserva] = await connection.query(
		`insert into Reserva (user_name, lugar_id, estado, fecha_ingreso) values (?,?, 'Activa', NOW())`,
		[user_name,lugarAsignado.lugar_id]
		);
		await connection.query(
		`update Lugar set estado = 'ocupado' where lugar_id = ?`,
		[lugarAsignado.lugar_id] 
		);
		await connection.commit();
		connection.release();
		res.status(200).json({messge: "Reserva creada con exito", id_reserva: resultReserva.insertId});

	} catch (err) {
		await connection.rollback();
		connection.release();
		console.error("Error al crear la reserva:", err);
		res.status(500).json({ error: err.message});
	}
};
export const getMisReservas = async (req, res) => {
	const { user_name } = req.query;
	try {
		const query = `
			select r.reserva_id as id_reserva, r.estado_reserva, r.fecha_ingreso, r.fecha_salida,
			p.numero_piso, l.codigo_lugar, l.tipo_lugar, e.nombre as nombre_parking
			from Reserva r
			join Usuario u on r.usuario_id = u.usuario_id
			join Lugar l on r.lugar_id = l.lugar_id
			join Piso p on l.piso_id = p.piso_id
			join Estacionamiento e on p.estacionamiento_id = e.estacionamiento_id
			where u.user_name = ?
			order by r.fecha_ingreso desc;
		`;
		const [rows] = await pool.query(query, [ user_name]);
		res.json(rows);
	} catch (err) {
		console.error("Error al obtener reservas del cliente:", err);
		res.status(500).json({error: err.message});
	}
};
export const cancelarReserva = async (req, res) => {
	const { id} = req.params;
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const [resevas] = await connection.query(` select * from Reserva where reserva_id = ?`, [id]);
		if (resevas.length === 0) {
			await connection.rollback();
			connection.release();
			return res.status(404).json({ message: "Reserva no encontrada"});
		}
		const reservar = reservas[0];
		await connection.query(
		`update Reserva set estado = 'Cancelada', fecha_salida = now() where reserva_id= ?`,
		[id]
		);
		await connection.query(
		`update Lugar set estado = 'disponible' where lugar_id = ?`,
		[reservar.lugar_id]
		);
		await connection.commit();
		connection.release();
		res.json({ message: 'Reserva cancelada correctamente y lugar liberado'});

	} catch(err) {
		await connection.rollback();
		connection.release();
		res.status(500).json({error: err.message});
	}
};