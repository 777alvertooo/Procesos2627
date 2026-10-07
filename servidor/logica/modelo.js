const { RegistrarUsuario } = require("./usecases/RegistrarUsuario.js");
const { IniciarSesion } = require("./usecases/IniciarSesion.js");
const { ObtenerUsuario } = require("./usecases/ObtenerUsuario.js");
const { ObtenerUsuarios } = require("./usecases/ObtenerUsuarios.js");
const { NumeroUsuarios } = require("./usecases/NumeroUsuarios.js");
const { UsuarioActivo } = require("./usecases/UsuarioActivo.js");
const { EliminarUsuario } = require("./usecases/EliminarUsuario.js");
const { ServicioHash } = require("./servicios/ServicioHash.js");

function Sistema(opciones) {
    opciones = opciones || {};
    let cad = opciones.cad;
    let servicioHash = new ServicioHash(opciones.rondasHash);

    let registrarUsuario = new RegistrarUsuario(cad, servicioHash);
    let iniciarSesion = new IniciarSesion(cad, servicioHash);
    let obtenerUsuario = new ObtenerUsuario(cad);
    let obtenerUsuarios = new ObtenerUsuarios(cad);
    let numeroUsuarios = new NumeroUsuarios(cad);
    let usuarioActivo = new UsuarioActivo(cad);
    let eliminarUsuario = new EliminarUsuario(cad);

    this.registrarUsuario = function (datos, callback) {
        registrarUsuario.ejecutar(datos, callback);
    };

    this.iniciarSesion = function (email, clave, callback) {
        iniciarSesion.ejecutar(email, clave, callback);
    };

    this.obtenerUsuario = function (email, callback) {
        obtenerUsuario.ejecutar(email, callback);
    };

    this.obtenerUsuarios = function (callback) {
        obtenerUsuarios.ejecutar(callback);
    };

    this.numeroUsuarios = function (callback) {
        numeroUsuarios.ejecutar(callback);
    };

    this.usuarioActivo = function (email, callback) {
        usuarioActivo.ejecutar(email, callback);
    };

    this.eliminarUsuario = function (email, callback) {
        eliminarUsuario.ejecutar(email, callback);
    };
}

module.exports.Sistema = Sistema;
