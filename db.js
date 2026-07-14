import mysql from 'mysql2/promise';
const pool = mysql.createPool({
	host:'10.10.0.5',
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: 'parking',
	waitForConnections:true,
	connectionLimit: 10,
	queueLimit:0
	});

export default pool;

