import pool from '../db.js';

export const getLugares = async (req, res) => {
    const usuario_id = req.session.usuario_id;
    // Cambiamos a esperar piso_id
    const { piso_id } = req.query;

    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });
    
    if (!piso_id) {
        return res.status(400).json({ message: "ID de Piso requerido" });
    }

    try {
        // Query corregida: Filtra por usuario_id y piso_id para mayor seguridad
        const [rows] = await pool.query(`
            SELECT L.* FROM Lugar L
            INNER JOIN Piso P ON L.piso_id = P.piso_id
            INNER JOIN Estacionamiento E ON P.estacionamiento_id = E.estacionamiento_id
            WHERE E.usuario_id = ? AND L.piso_id = ? AND L.activo = 1`, 
            [usuario_id, piso_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener lugares", error: error.message });
    }
};
export const crearLugar = async (req,res) => {

	const usuario_id = req.session.usuario_id;	
	if (!usuario_id) return res.status(401).json({ message: " No autorizado"});
	try{ 
		const { piso_id, codigo_lugar, tipo_lugar, estado } = req.body;

		if (!piso_id || !codigo_lugar || !tipo_lugar) {
			return res.status(400).json({ message: "Datos incompletos" });
		}

		await pool.query(
			'insert into Lugar (piso_id, codigo_lugar, tipo_lugar, estado) values (?, ?, ?, ?)',
			[piso_id,codigo_lugar, tipo_lugar, estado || 'Disponible']
		);

		res.status(201).json({ message: " Lugar creado exitosamente" });
	} catch (error) {
		if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
			return res.status(400).json({ message: "El tipo de lugar seleccionado no es valido." });
		}
		res.status(500).json({ message: "Error al crear lugar", error: error.message});
	}
};

export const generarLugaresMasivamente = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	const { piso_id, prefijo, inicio,cantidad,tipo_lugar } = req.body;

	if (!usuario_id) return res.status(401).json({ message: "No autorizado" });
	try {
		const queries = [];
		const numInicio = parseInt(inicio);
		const numCantidad = parseInt(cantidad);

		for (let i=0; i< numCantidad; i++) {
			const numeroActual = numInicio + i;
			const codigo = `${prefijo}${numeroActual}`;

			queries.push(
				pool.query(
					'insert into Lugar (piso_id,codigo_lugar,tipo_lugar,estado) values (?, ?, ?, ?)',
					[piso_id,codigo,tipo_lugar, 'Disponible']
				)
			);
		}

		await Promise.all(queries);
		res.status(201).json({ message: `se generarion ${numCantidad} lugares corectamente`});
	} catch (error) {
		res.status(500).json({ message: "Error en insercion masiva",error: error.message });
	}
};

export const getPisos = async (req,res) => {

	const usuario_id = req.session.usuario_id;
	const {estacionamiento_id } = req.query;

	if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

	if (!estacionamiento_id) {
		return res.status(400).json({ message: "ID de estacionamiento requerido" });
	}

	try {
		const [rows] = await pool.query(
			`select P.piso_id, P.descripcion, P.numero_piso 
			from Piso P
			inner join Estacionamiento E on P.estacionamiento_id = E.estacionamiento_id
			where E.usuario_id = ? and P.estacionamiento_id = ?`,
				[usuario_id, estacionamiento_id]
		);
		res.json(rows);
	} catch (error) {
		res.status(500).json({ message: "Error al cargar pisos", error: error.message });
	}
};

export const deletesoft = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	const { id } = req.params;

	if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

	try {
		const [result] = await pool.query(
			'update Lugar set activo = 0 where lugar_id=?',
			[id]
		);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "Lugar no encontrado" });
		}

		res.status(200).json({ message: "Lugar eliminado correctamente"});
	} catch (error) {
		console.error("Error en deletesoft:",error);
		res.status(500).json({ message: "error interno", error: error.message });
	}
};
