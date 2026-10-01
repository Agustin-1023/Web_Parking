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
// Función auxiliar para normalizar fechas al formato 'YYYY-MM-DD HH:mm:ss'
const normalizarFechaSQL = (fechaStr) => {
    if (!fechaStr) return null;
    let limpia = String(fechaStr).replace('T', ' ').replace('Z', '');
    if (limpia.includes('.')) {
        limpia = limpia.split('.')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(limpia)) {
        limpia += ':00';
    }
    return limpia;
};

export const crearReserva = async (req, res) => {
    const { 
        estacionamiento_id, 
        tipo_lugar, 
        lugar_id, 
        patente_manual, 
        origen_reserva, 
        fecha_ingreso, 
        fecha_salida 
    } = req.body;

    if (!estacionamiento_id || !fecha_ingreso || !fecha_salida) {
        return res.status(400).json({ message: 'Estacionamiento y fechas son obligatorios.' });
    }

    try {
        const usuario_id = req.user?.usuario_id || req.session?.usuario_id;
        
        const fInicio = normalizarFechaSQL(fecha_ingreso);
        const fSalida = normalizarFechaSQL(fecha_salida);

        const origenValido = ['cliente', 'admin'].includes(origen_reserva?.toLowerCase())
            ? origen_reserva.toLowerCase()
            : 'admin';

        const lugarIdNum = Number(lugar_id);
        const autoAsignar = !lugar_id || 
                            lugar_id === 'cualquiera' || 
                            lugar_id === 'todos' || 
                            lugar_id === '' || 
                            isNaN(lugarIdNum) || 
                            lugarIdNum <= 0;

        let lugarAsignadoId = null;

        if (autoAsignar) {

            let queryBuscarLugar = `
                SELECT L.lugar_id 
                FROM Lugar L
                INNER JOIN Piso P ON L.piso_id = P.piso_id
                WHERE P.estacionamiento_id = ?
            `;
            const paramsBuscar = [estacionamiento_id];

            if (tipo_lugar && tipo_lugar !== 'todos' && tipo_lugar !== 'cualquiera') {
                queryBuscarLugar += ` AND L.tipo_lugar = ?`;
                paramsBuscar.push(tipo_lugar);
            }
            queryBuscarLugar += `
                AND NOT EXISTS (
                    SELECT 1 
                    FROM Reserva R
                    WHERE R.lugar_id = L.lugar_id
                      AND LOWER(R.estado_reserva) = 'activa'
                      AND REPLACE(R.fecha_ingreso, 'T', ' ') < ? 
                      AND REPLACE(R.fecha_salida, 'T', ' ') > ?
                ) 
                LIMIT 1
            `;
            paramsBuscar.push(fSalida, fInicio);

            const [lugaresDisponibles] = await db.query(queryBuscarLugar, paramsBuscar);

            if (lugaresDisponibles.length === 0) {
                return res.status(400).json({ message: "No hay lugares disponibles en ese rango de horarios." });
            }

            lugarAsignadoId = lugaresDisponibles[0].lugar_id;

        } else {
            lugarAsignadoId = lugarIdNum;

            const checkQuery = `
                SELECT reserva_id 
                FROM Reserva
                WHERE lugar_id = ? 
                  AND LOWER(estado_reserva) = 'activa' 
                  AND REPLACE(fecha_ingreso, 'T', ' ') < ? 
                  AND REPLACE(fecha_salida, 'T', ' ') > ?
            `;
            
            const [solapados] = await db.query(checkQuery, [lugarAsignadoId, fSalida, fInicio]);

            if (solapados.length > 0) {
                return res.status(400).json({ message: 'El lugar seleccionado ya se encuentra reservado en ese rango de horarios.' });
            }
        }

        const insertQuery = `
            INSERT INTO Reserva (lugar_id, usuario_id, fecha_ingreso, fecha_salida, estado_reserva, patente_manual, origen_reserva)
            VALUES (?, ?, ?, ?, 'Activa', ?, ?)
        `;
        
        const [result] = await db.query(insertQuery, [
            lugarAsignadoId, 
            usuario_id, 
            fInicio, 
            fSalida, 
            patente_manual || null, 
            origenValido
        ]);

        return res.status(201).json({
            message: 'Reserva creada con éxito',
            reserva_id: result.insertId,
            lugar_id: lugarAsignadoId
        });

    } catch (error) {
        console.error('Error al crear reserva:', error);
        return res.status(500).json({ message: 'Error interno del servidor al crear la reserva.' });
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