import 'dotenv/config';
import express from "express";
import cors from "cors";
// necesario para _dirname
import session from 'express-session';

import path from 'path';
import {fileURLToPath} from 'url';
const _dirname = path.dirname(fileURLToPath(import.meta.url));
import { metodos as validacion } from "./controladores/validacion.control.js";
import pisoRoutes from './routes/piso.routes.js'; 
import lugaresRoutes from './routes/lugares.routes.js';
//server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
//MIDDLEWARES

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors({
	origin: "192.168.1.49:9000",
	credentials:true
}));
app.use(session({
	secret: 'labiastin',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 60 * 24
	}
}));
//archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));
//rutas api

app.use('/api/pisos', pisoRoutes);
app.use('/api',lugaresRoutes);
//rutas de vistas (paginas)

app.get("/",(req,res)=> res.sendFile(_dirname + "/index.html"))
app.post("/register", (req,res)=> res.sendFile(_dirname + "/Registros.html"))

app.get("/admin", (req,res) => {
	if (!req.session.usuario_id) {
		return res.redirect("/");
	}
	res.sendFile(path.join(__dirname, 'public', 'admin_paking.html'));
});

//rutas
app.post("/api/register", validacion.registro);
app.post("/api/login", validacion.login);
app.put("/api/actualizar-rol",validacion.actualizarRol);
app.get("/api/estacionamientos",validacion.obtenerEstacionamientos);
app.post("/api/estacionamientos",validacion.crearEstacionamiento);
app.put("/api/estacionamientos/:id",validacion.modificarEstacionamiento);
app.delete("/api/Estacionamientos/:id",validacion.eliminarEstacionamiento);

//inicio de servidor
app.set("port", 9000);
app.listen(app.get("port"), () => {
	console.log("servidorcorriendo en el port", app.get("port"));
});
