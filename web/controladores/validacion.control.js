import pool from '../../db.js';
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
	//todo correcto
	res.status(200).send({
		status: "ok",
		message: "Usuario logueado",
		redirect: "/admin"
	})
	}catch (error) {
		console.error("Error en login:", error);
		res.status(500).send({
			status: "Error",
			message: "Error interno del servidor" });
	}
}
export const metodos = {login,	registro};
