import db from '../db.js';

export const getReservas = async (req, res) => {
	const { estacionamiento_id, estado } = req.query;

	try {
		const usuario_id = req.user?.usuario_id || req.session?.usuario_id;
		let query = `
			SELECT 
				R.reserva_id,
				R.lugar_id,
				R.fecha_ingreso,
				R.fecha_salida,
				R.estado_reserva AS estado,
				R.patente_manual,
				R.origen_reserva,
				L.codigo_lugar,
				E.estacionamiento_id,
				E.nombre AS nombre_estacionamiento
			FROM Reserva R
			INNER JOIN Lugar L ON R.lugar_id = L.lugar_id
			INNER JOIN Piso P ON L.piso_id = P.piso_id
			INNER JOIN Estacionamiento E ON P.estacionamiento_id = E.estacionamiento_id
			WHERE E.usuario_id = ?
		`;
		const queryParams = [usuario_id];

		if (estacionamiento_id && estacionamiento_id !== 'todos') {
			query += ` and E.estacionamiento_id = ?`;
			queryParams.push(estacionamiento_id);
		}
		if (estado && estado !== 'todos') {
			query += ` and R.estado_reserva = ?`;
			queryParams.push(estado);
		}
		query += ` order by R.fecha_ingreso desc`;

		const [reservas] = await db.query(query, queryParams);
		res.json(reservas);
	} catch (error) {
		console.error('Error al obtener reservas:', error);
		res.status(500).json({ message: 'Error interno del servidor al obtener reservas.' });
	}
};

export const crearReserva = async (req, res) => {
	const {estacionamiento_id,tipo_lugar, lugar_id, patente_manual, origen_reserva, fecha_inicio, fecha_fin } = req.body;

	if (!estacionamiento_id || !fecha_inicio || !fecha_fin) {
		return res.status(400).json({ message: 'lugar y fechas no estan' });
	}
	try {
		const usuario_id = req.user?.usuario_id || req.session?.usuario_id;
		
		const origenValido = ['cliente', 'admin'].includes(origen_reserva?.toLowerCase())
		? origen_reserva.toLowerCase()
		:'admin';
		let lugarAsignadoId = lugar_id;

		if (!lugarAsignadoId) {
			let queryBuscarLugar = `
				select L.lugar_id 
				from Lugar L
				inner join Piso P on L.piso_id = P.piso_id
				where P.estacionamiento_id = ?
			`;
			const paramsBuscar = [estacionamiento_id];

			if (tipo_lugar) {
				queryBuscarLugar += ` and L.tipo_lugar = ?`;
				paramsBuscar.push(tipo_lugar);
			}
			queryBuscarLugar += `
				and L.lugar_id not in (
				select R.lugar_id
				from Reserva R
					where R.estado_reserva = 'Activa'
					and ((R.fecha_ingreso <= ? and R.fecha_salida >= ?)
					or (R.fecha_ingreso <= ? and R.fecha_salida >= ?)
					or (? <= R.fecha_ingreso and ? >= R.fecha_salida))
				) limit 1
			`;
			paramsBuscar.push(fecha_inicio,fecha_inicio,fecha_fin,fecha_fin,fecha_inicio,fecha_fin);
			const [lugaresDisponibles] = await db.query(queryBuscarLugar, paramsBuscar);

			if (lugaresDisponibles.length === 0 ) {
				return res.status(400).json({ message: "no hay lugares disponibles en ese rango de horarios."});
			}
			lugarAsignadoId = lugaresDisponibles[0].lugar_id;
		} else {
		const checkQuery = `
			select reserva_id from Reserva
			where lugar_id = ? 
				and estado_reserva = 'Activa' 
				and ((fecha_ingreso <= ? and fecha_salida >= ?) or (fecha_ingreso <= ? and fecha_salida >= ?) or (? <= fecha_ingreso and ? >= fecha_salida))
		`;
		const [solapados] = await db.query(checkQuery, [
			lugar_id, fecha_inicio, fecha_inicio, fecha_fin, fecha_fin, fecha_inicio, fecha_fin
		]);
		if (solapados.length > 0) {
			return res.status(400).json({ message: 'El lugar ya se encuentra reservado en ese rango de horarios.' });
		}
	}
		const insertQuery = `
			insert into Reserva (lugar_id, usuario_id, fecha_ingreso, fecha_salida, estado_reserva, patente_manual, origen_reserva)
			values (?, ?, ?, ?, 'Activa', ?, ?)
		`;
		const [result] = await db.query(insertQuery, [
			lugarAsignadoId, usuario_id, fecha_inicio, fecha_fin, patente_manual || null, origen_reserva || 'Manual'
		]);
		res.status(201).json({
			message: 'Reserva creada con exito',
			reserva_id: result.insertId
		});
	} catch (error) {
		console.error('Error al crear reserva:', error);
		res.status(500).json({ message: 'Error interno del servidor al crear la reserva.' });
	}
};

export const cancelarReserva = async (req, res) => {
	const { id } = req.params;

	try {
		const usuario_id = req.user?.usuario_id || req.user?.id || req.session?.usuario_id;

		const updateQuery = `
			Update Reserva R
			inner join Lugar L on R.lugar_id = L.lugar_id
			inner join Piso P on L.piso_id = P.piso_id
			inner join Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id
			set R.estado_reserva = 'Cancelada'
			where R.reserva_id = ? and E.usuario_id = ?
		`;
		
		const [result] = await db.query(updateQuery, [id, usuario_id]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: 'Reserva no encontrada.' });
		}
		res.json({ message: 'reserva cancelada correctamente' });
	} catch (error) {
		console.error('Error al cancelar la reserva:', error);
		res.status(500).json({ message: 'Error interno del servidor al cancelar reseva.' });
	}
};