const express = require('express')
const mysql = require('mysql')
const myconn = require('express-myconnection')

const routes = require('./routes')

//conexion con la BD
const app = express()
app.set('port', process.env.port || 9000)
const dbOptions = {
	host: 'localhost',
	port: 3306,
	user:'root',
	password: '1234',
	database: 'Estacionamiento'
}

app.use(myconn(mysql, dbOptions, 'single'))

//rutas
app.get('/', (req, res)=>{
	res.send('Welcome to my API')
})
app.use('/api', routes)

//server running
app.listen(app.get('port'), ()=>{
	console.log('server running on port ', app.get('port'))
})

