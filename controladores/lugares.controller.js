import pool from '../db.js';

export const getLugares = async (req, res) => {
    const usuario_id = req.session.usuario_id;
    const { piso_id } = req.query;

    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });
    
    if (!piso_id) {
        return res.status(400).json({ message: "ID de Piso requerido" });
    }

    try {
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

export const crearLugar = async (req, res) => {
    const usuario_id = req.session.usuario_id;    
    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

    try { 
        const { piso_id, codigo_lugar, tipo_lugar, estado } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO Lugar (piso_id, codigo_lugar, tipo_lugar, estado, activo) VALUES (?, ?, ?, ?, 1)',
            [piso_id, codigo_lugar, tipo_lugar, estado || 'Disponible']
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: "Lugar creado exitosamente" 
        });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el lugar", error: error.message });
    }
};

export const generarLugarMasivo = async (req, res) => {
    const usuario_id = req.session.usuario_id;
    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

    const { piso_id, cantidad, tipo_lugar } = req.body;

    try {
        for (let i = 1; i <= cantidad; i++) {
            const codigo = `L-${i}`;
            await pool.query(
                'INSERT INTO Lugar (piso_id, codigo_lugar, tipo_lugar, estado, activo) VALUES (?, ?, ?, "Disponible", 1)',
                [piso_id, codigo, tipo_lugar]
            );
        }
        res.status(201).json({ message: "Lugares creados masivamente con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al generar lugares masivos", error: error.message });
    }
};

export const deletesoft = async (req, res) => {
    const usuario_id = req.session.usuario_id;
    const { id } = req.params;

    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

    try {
        const [result] = await pool.query(
            'UPDATE Lugar set activo = 0 WHERE lugar_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Lugar no encontrado" });
        }

        res.status(200).json({ message: "Lugar eliminado correctamente" });
    } catch (error) {
        console.error("Error en deletesoft:", error);
        res.status(500).json({ message: "Error interno", error: error.message });
    }
};

export const actualizarLugar = async (req, res) => {
    const { id } = req.params;
    const { codigo_lugar, tipo_lugar } = req.body;    
    try { 
        await pool.query(
            'UPDATE Lugar SET codigo_lugar = ?, tipo_lugar = ? WHERE lugar_id = ?',
            [codigo_lugar, tipo_lugar, id]
        );
        res.json({ message: "Lugar Actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar", error: error.message });
    }
};

export const getLugarById = async (req, res) => {
    const usuario_id = req.session.usuario_id;
    if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

    const { id } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT L.* FROM Lugar L
            INNER JOIN Piso P ON L.piso_id = P.piso_id
            INNER JOIN Estacionamiento E ON P.estacionamiento_id = E.estacionamiento_id
            WHERE L.lugar_id = ? AND E.usuario_id = ? AND L.activo = 1`,
            [id, usuario_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Lugar no encontrado o sin permisos" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el lugar", error: error.message });
    }
};