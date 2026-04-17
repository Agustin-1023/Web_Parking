import express from "express";
import cors from "cors";
// necesario para _dirname
import path from 'path';
import {fileURLToPath} from 'url';
const _dirname = path.dirname(fileURLToPath(import.meta.url));
import { metodos as validacion } from "./controladores/validacion.control.js";


//server
const app = express();
app.use(cors());
app.set("port", 9000);
app.listen(app.get("port"));
console.log("Servidor corriendo en el puerto",app.get("port"));
//config
app.use(express.static(_dirname + "/"));
app.use(express.json());

//rutas
app.get("/",(req,res)=> res.sendFile(_dirname + "/index.html"))
app.post("/register", (req,res)=> res.sendFile(_dirname + "/Registros.html"))
app.post("/api/register", validacion.registro);
app.post("/api/login", validacion.login);
