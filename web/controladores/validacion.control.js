import pool from '../../db.js';
import bcrypt from 'bcryptjs';
async function login(req,res){
}
async function registro(req,res){
	const {nombre,userName,email,phone,password} = req.body;
	if (!nombre || !userName || !password || !email){
	res.status(400).send({status: "Error", message:"Los campos estan incompletos"})
	}else{
	}
	try {
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);
		const query = 'INSERT INTO Usuario (user_name, nombre_completo, email, telefono, password_hash) VALUES (?,?,?,?,?)';
		const valores = [userName,nombre,email,phone,passwordHash];
	await pool.query(query,valores);

	res.status(201).send({status: "ok", message: "!Usuario Guardado en BD"});
}catch(error){
	console.error("Error al insertar:", error);
	res.status(500).send({status: "Error", message: "No se pudo guardar el usuario"});
} 
}	

export const metodos = {
	login,
	registro
}
