const { AgregarUsuario } = require("./usecases/AgregarUsuario.js");
const { ObtenerUsuarios } = require("./usecases/ObtenerUsuarios.js");
const { NumeroUsuarios } = require("./usecases/NumeroUsuarios.js");
const { UsuarioActivo } = require("./usecases/UsuarioActivo.js");
const { EliminarUsuario } = require("./usecases/EliminarUsuario.js");

function Sistema(opciones) {
    opciones = opciones || {};
    let cad = opciones.cad;

    let agregarUsuario = new AgregarUsuario(cad);
    let obtenerUsuarios = new ObtenerUsuarios(cad);
    let numeroUsuarios = new NumeroUsuarios(cad);
    let usuarioActivo = new UsuarioActivo(cad);
    let eliminarUsuario = new EliminarUsuario(cad);

    this.agregarUsuario = function (datos, callback) {
        agregarUsuario.ejecutar(datos, callback);
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
