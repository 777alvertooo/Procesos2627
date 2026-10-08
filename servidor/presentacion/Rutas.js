const express = require("express");
const { HaIniciadoSesion } = require("./middlewares/HaIniciadoSesion.js");
const { PaginaInicioHandler } = require("./handlers/PaginaInicioHandler.js");
const { RegistrarUsuarioHandler } = require("./handlers/RegistrarUsuarioHandler.js");
const { IniciarSesionHandler } = require("./handlers/IniciarSesionHandler.js");
const { UsuarioSesionHandler } = require("./handlers/UsuarioSesionHandler.js");
const { CerrarSesionHandler } = require("./handlers/CerrarSesionHandler.js");
const { ObtenerUsuariosHandler } = require("./handlers/ObtenerUsuariosHandler.js");
const { NumeroUsuariosHandler } = require("./handlers/NumeroUsuariosHandler.js");
const { UsuarioActivoHandler } = require("./handlers/UsuarioActivoHandler.js");
const { EliminarUsuarioHandler } = require("./handlers/EliminarUsuarioHandler.js");
const { NoEncontradoHandler } = require("./handlers/NoEncontradoHandler.js");
const { ErrorPeticionHandler } = require("./handlers/ErrorPeticionHandler.js");

function Rutas(sistema, log) {
    let haIniciado = new HaIniciadoSesion(sistema).manejar;
    this.router = express.Router();
    this.router.use(express.json());

    this.router.get("/", new PaginaInicioHandler().manejar);
    this.router.post("/registrarUsuario", new RegistrarUsuarioHandler(sistema).manejar);
    this.router.post("/iniciarSesion", new IniciarSesionHandler(sistema).manejar);
    this.router.get("/usuarioSesion", new UsuarioSesionHandler(sistema).manejar);
    this.router.post("/cerrarSesion", new CerrarSesionHandler().manejar);

    this.router.get("/obtenerUsuarios", haIniciado, new ObtenerUsuariosHandler(sistema).manejar);
    this.router.get("/numeroUsuarios", haIniciado, new NumeroUsuariosHandler(sistema).manejar);
    this.router.get("/usuarioActivo/:email", haIniciado, new UsuarioActivoHandler(sistema).manejar);
    this.router.delete("/eliminarUsuario/:email", haIniciado, new EliminarUsuarioHandler(sistema).manejar);

    this.router.use(new NoEncontradoHandler().manejar);
    this.router.use(new ErrorPeticionHandler().manejar);
}

module.exports.Rutas = Rutas;
