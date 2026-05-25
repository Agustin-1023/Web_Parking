import mysql from 'mysql2/promise';
const pool = mysql.createPool({
	host:'10.10.0.5',
	user: 'root',
	password: 'db_test123',
	server: '10.10.0.5',
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

