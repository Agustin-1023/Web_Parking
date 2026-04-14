const express = require('express')
const routes = express.Router()

//ruta pra insertar usuario

routes.post('/api/adduser', (req,res)=> {
	const { nombre, userName, Email, phone, password } = req.body;
	console.log("Datos recibidos: ", nombre, Email, phone);
if (!nombre || !Email || !password) {
	return res.status(400).json({ error: "Fasltan cambpos obligatorios" })
;}

const sql = "INSERT INTO Usuario (user_name, nombre_completo, email, telefono, password_hash) VALUES (?, ?, ?, ?, ?);"
conn.query(sql,[userName, nombre, Email, phone, password], (err,result) => {
	if(err) {
		console.error("error en la BD: ", err);
		return res.status(500).json({ error: "error al guardar el usuario" });
	}	
res.status(201).json({
	message: "Usuario creado exitosamente",
	id_generado: result.insertId
});
});
//});


res.json({
	status: 'success',
	message: 'informacion recibida correctamente en el servidor'
	});


routes.get('/', (req, res)=>{
	req.getConnection((err, conn)=>{
		if(err) return res.send(err)
		conn.query('SELECT * FROM Admin', (err, rows)=>{
			if(err) return res.send(err)
			res.json(rows)
		})
	})	
})
})
module.exports = routes;
