import mysql from 'mysql2/promise';
const pool = mysql.createPool({
	host:'10.10.10.15',
	user: 'usuario',
	password: 'password',
	server: '10.10.10.15',
	database: 'parking',
	waitForConnections:true,
	connectionLimit: 10,
	queueLimit:0
	});

pool.getConnection()
	.then(connection => {
		console.log("conectado a mysql");
		connection.release();
	})
		.catch(err => {
		console.error("fallo al conectar con mysql:",err.message);
	});

export default pool;

