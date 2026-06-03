import pool from '../db.js';
import bcrypt from 'bcryptjs';

async function registro(req,res){
	const {nombre,userName,email,phone,password} = req.body;
	//validacion basica de campos
	if (!nombre || !userName || !password || !email){
	res.status(400).send({status: "Error", message:"Los campos estan incompletos"})
	}
	try {
	//generacion de hashes
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);
	//insersion de datos en BD
		const query = 'INSERT INTO Usuario (user_name, nombre_completo, email, telefono, password_hash) VALUES (?,?,?,?,?)';
		const valores = [userName,nombre,email,phone,passwordHash];
	await pool.query(query,valores);

	res.status(201).send({
		status: "ok", 
		message: "!Usuario Guardado en BD",
		redirect:"/login"
	});
}catch(error){
	console.error("Error al insertar:", error);
	res.status(500).send({status: "Error", message: "No se pudo guardar el usuario"});
} 
}
async function login(req, res) {
	const { userName, password } = req.body;

	//validacion de campos
	if (!userName || !password) {
		return res.status(400).send({
			status: "Error",
			message: "Los campos estan incompletos" });
	}
	try {
	//busqueda usuario
		const [usuarios] = await pool.query('Select * from Usuario where user_name = ?', [userName]);

		if (usuarios.length === 0) {
			return res.status(400).send({
				status: 'Error',
				message: 'Error durante el login'
			})
		}
		const usuarioBD = usuarios[0];
	//comparacion de hashes
	const loginCorrecto = await bcrypt.compare(password, usuarioBD.password_hash);
	if (!loginCorrecto) {
		return res.status(400).send({
			status: "Error",
			message: "Error duarante el login" })
	}

	req.session.usuario_id = usuarioBD.usuario_id;
	//todo correcto
	res.status(200).send({
		status: "ok",
		message: "Usuario logueado",
		userName: usuarioBD.user_name,
		rol: usuarioBD.rol,
		redirect: usuarioBD.rol === 'pendiente' ? "/seleccion-rol.html" :"/admin"
	})
	}catch (error) {
		console.error("Error en login:", error);
		res.status(500).send({
			status: "Error",
			message: "Error interno del servidor" });
	}
}
async function actualizarRol (req,res) {
		const { user_name, nuevoRol } = req.body;
		
		try {
			//hace el update
			const [result] = await pool.query(
				'update Usuario set rol = ? where user_name = ?',
				[nuevoRol, user_name]
			);

			if (result.affectedRows > 0) {
				res.status(200).send({
					status: "ok",
					message: "Rol actualizado correctamente"
				});
			}else{
				res.status(404).send({
					status:"error",
					message: "Usuario no encontrado"
				});
			}
		} catch (error) {
			console.error("Error en DB:", error);
			res.status(500).send({
				status: "error",
				message: "Error interno del servidor"
			});
		}
}
//Listar estacionamientos

const obtenerEstacionamientos = async (req,res) => {
	console.log("sesion actual: ", req.session);
	const usuario_id = req.session.usuario_id;
	if (!usuario_id) { return res.status(400).json({ message: "usuario no identificado"});}
	try {
		//const query = `select e.estacionamiento_id, e.nombre, e.direccion, (select count(*) from Piso p where p.estacionamiento_id = e.estacionamiento_id) as cantidad_pisos from Estacionamiento e`		
	const [rows] = await pool.query(
		`select * from Estacionamiento where usuario_id = ? `,
			[usuario_id]);
		return res.json(rows);
	} catch (error) {
		console.error("Error en obtenerEstacionamientos: ", error);
		return res.status(500).json({ mensaje: "Error inrno al leer los estacionamientos"});
	}
};
// Creacion de estacionamientos

const crearEstacionamiento = async (req,res) => {
	const { nombre, direccion } = req.body;
	const usuario_id = req.session.usuario_id;
	if (!usuario_id) { return res.status(401).json({ message: "usuario no identificado"});}
	if(!nombre || !direccion) {
		return res.status(400).json({ mensaje: "Nombre y direccion son requeridos." });
	}
	try {
		const query = "INSERT INTO Estacionamiento (nombre, direccion, usuario_id) VALUES (?, ?, ?)";
		await pool.query(query, [nombre, direccion, usuario_id]);
		return res.status(201).json({mensaje: "Estacionamiento creado con exito"});
	} catch (error) {
		console.error("Error en crearEstacionamiento:",error);
		return res.status(500).json({mensaje: "Error al insertar en la Base de datos" });
	}
};

//Editar estaconamiento

const modificarEstacionamiento = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	if (!usuario_id) return res.status(401).json({ message: "No autorizado" });

	const {id} = req.params;
	const {nombre,direccion } = req.body;

	if (!nombre || !direccion ) {
		return res.status(400).json({ mensaje: " Campos incompletos."});
	}

	try {
		const [result] = await pool.query(
			"Update Estacionamiento Set nombre = ?, direccion= ? where estacionamiento_id = ? and usuario_id = ?",[nombre, direccion, id, usuario_id] );
		if (result || result.affectedRows === 0) {
			return res.status(404).json({ mensaje: "Estacionamiento no encontrado" });
		}

		return res.json({ mensaje: "Estacionamiento actualizado con exito"});
	} catch (error) {
		console.error("Error en modificar Estacionamiento: ", error);
		return res.status(500).json({ mensaje: "Error al actualizar la base de datos" });
	}
};

//eliminar estacionamientos --temporal--

const eliminarEstacionamiento = async (req,res) => {
	const usuario_id = req.session.usuario_id;
	if (!usuario_id) return res.status(401).json({ message: " No autorizado" });
	const {id} = req.params;
	try {
		const query = "update from Estacionamiento  set activo = 0 where estacionamiento_id =? and usuario_id = ?";
		const [result] = await pool.query(query, [id, usuario_id]);

		if (result.affectedRows ===0) {
			return res.status(404).json({ mensaje: "El estacionamiento ya no existe o no se encontro"});
		}

		return res.json({ mensaje: "Estacionamiento eliminado conrrectamente" });
	} catch (error) {
		console.error("Error en eliminar Estacionamiento: ", error);
		return res.status(500).json({
			mensaje: "No se puede eliminar. verifique que no tenga pisoso dependencias activas."
		});
	}
};


export const metodos = {login,	registro, actualizarRol, obtenerEstacionamientos, crearEstacionamiento, modificarEstacionamiento, eliminarEstacionamiento };


