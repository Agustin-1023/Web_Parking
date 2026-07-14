import 'dotenv/config';
import express from "express";
import cors from "cors";
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import { metodos as validacion } from "./controladores/validacion.control.js";
import pisoRoutes from './routes/piso.routes.js'; 
import lugaresRoutes from './routes/lugares.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "192.168.1.49:9000",
    credentials: true
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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/pisos', pisoRoutes);
app.use('/api', lugaresRoutes);

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.post("/register", (req, res) => res.sendFile(path.join(__dirname, "Registros.html")));

app.get("/admin", (req, res) => {
    if (!req.session.usuario_id) {
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, 'public', 'admin_paking.html'));
});

app.post("/api/register", (req, res) => validacion.registro(req, res));
app.post("/api/login", (req, res) => validacion.login(req, res));
app.put("/api/actualizar-rol", (req, res) => validacion.actualizarRol(req, res));
app.get("/api/estacionamientos", (req, res) => validacion.obtenerEstacionamientos(req, res));
app.post("/api/estacionamientos", (req, res) => validacion.crearEstacionamiento(req, res));
app.put("/api/estacionamientos/:id", (req, res) => validacion.modificarEstacionamiento(req, res));
app.delete("/api/Estacionamientos/:id", (req, res) => validacion.eliminarEstacionamiento(req, res));
app.post("/api/crearPiso", (req,res) => validacion.crearPiso(req, res));

export default app;