const express = require("express");
const { PaginaInicioHandler } = require("./handlers/PaginaInicioHandler.js");
const { AgregarUsuarioHandler } = require("./handlers/AgregarUsuarioHandler.js");
const { ObtenerUsuariosHandler } = require("./handlers/ObtenerUsuariosHandler.js");
const { NumeroUsuariosHandler } = require("./handlers/NumeroUsuariosHandler.js");
const { UsuarioActivoHandler } = require("./handlers/UsuarioActivoHandler.js");
const { EliminarUsuarioHandler } = require("./handlers/EliminarUsuarioHandler.js");
const { NoEncontradoHandler } = require("./handlers/NoEncontradoHandler.js");

function Rutas(sistema) {
    this.router = express.Router();

    this.router.get("/", new PaginaInicioHandler().manejar);
    this.router.get("/agregarUsuario/:email", new AgregarUsuarioHandler(sistema).manejar);
    this.router.get("/obtenerUsuarios", new ObtenerUsuariosHandler(sistema).manejar);
    this.router.get("/numeroUsuarios", new NumeroUsuariosHandler(sistema).manejar);
    this.router.get("/usuarioActivo/:email", new UsuarioActivoHandler(sistema).manejar);
    this.router.get("/eliminarUsuario/:email", new EliminarUsuarioHandler(sistema).manejar);
    this.router.use(new NoEncontradoHandler().manejar);
}

module.exports.Rutas = Rutas;
