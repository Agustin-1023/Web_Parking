import 'dotenv/config';
import express from "express";
import cors from "cors";
// necesario para _dirname
import path from 'path';
import {fileURLToPath} from 'url';
const _dirname = path.dirname(fileURLToPath(import.meta.url));
import { metodos as validacion } from "./controladores/validacion.control.js";
import pisoRoutes from './routes/piso.routes.js'; 
//server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.set("port", 9000);
app.listen(app.get("port"), ()=> {
	console.log("Servidor corriendo en el puerto",app.get(`port`));
});
//config
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
//rutas
app.get("/",(req,res)=> res.sendFile(_dirname + "/index.html"))
app.post("/register", (req,res)=> res.sendFile(_dirname + "/Registros.html"))
app.post("/api/register", validacion.registro);
app.post("/api/login", validacion.login);
app.put("/api/actualizar-rol",validacion.actualizarRol);

app.get("/api/estacionamientos",validacion.obtenerEstacionamientos);

app.post("/api/estacionamientos",validacion.crearEstacionamiento);
app.put("/api/estacionamientos/:id",validacion.modificarEstacionamiento);
app.delete("/api/Estacionamientos/:id",validacion.eliminarEstacionamiento);
app.use('/api/pisos', pisoRoutes);
