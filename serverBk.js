const express = require('express')
//import express from "express";
const app = express()
const mysql = require('mysql2')
const myconn = require('express-myconnection')
const cors = require('cors')
//fix dirname
//import path from 'path';
//import {fileURLToPath} from 'url';
//const _dirname = path.dirname(fileURLToPath(import.meta.url));

const routes = require('./routes.js')
app.set('port' , process.env.PORT || 9000)
app.use(cors());
app.use(express.json());
const dbOptions = {
	host: '10.10.0.5',
	port: 3306,
	user: 'root',
	password: 'db_test123',
	database: 'parking'
}


// middlewares
app.use(myconn(mysql, dbOptions, 'single'))


// rutas a usar 
app.get('/2', (req, res)=>{
	res.send('Welcome to my J-API')
})

app.get('/', (req, res)=>{
	res.sendFile(path.dirnam + "/web/Web_Parking/Registros.html")
})

app.use('/api/adduser', routes)
// server corriendo
app.listen(app.get('port'), ()=>{
	console.log('server running on port', app.get('port'))
})

