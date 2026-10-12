const { RegistrarUsuario } = require("./usecases/RegistrarUsuario.js");
const { ConfirmarUsuario } = require("./usecases/ConfirmarUsuario.js");
const { IniciarSesion } = require("./usecases/IniciarSesion.js");
const { AutenticarGoogle } = require("./usecases/AutenticarGoogle.js");
const { ObtenerUsuario } = require("./usecases/ObtenerUsuario.js");
const { ObtenerUsuarios } = require("./usecases/ObtenerUsuarios.js");
const { NumeroUsuarios } = require("./usecases/NumeroUsuarios.js");
const { UsuarioActivo } = require("./usecases/UsuarioActivo.js");
const { EliminarUsuario } = require("./usecases/EliminarUsuario.js");
const { ServicioHash } = require("./servicios/ServicioHash.js");
const { ServicioToken } = require("./servicios/ServicioToken.js");
const { ServicioCorreoSilencio } = require("./servicios/ServicioCorreo.js");
const { Autorizacion } = require("./autorizacion/Autorizacion.js");
const { LogSilencio } = require("../log/Log.js");

function Sistema(opciones) {
    opciones = opciones || {};
    let cad = opciones.cad;
    let log = opciones.log || new LogSilencio();
    let emailsAdmin = (opciones.emailsAdmin || []).map(function (email) {
        return String(email).trim().toLowerCase();
    });
    let servicioHash = new ServicioHash(opciones.rondasHash);
    let servicioToken = new ServicioToken();
    let servicioCorreo = opciones.servicioCorreo || new ServicioCorreoSilencio();
    let autorizacion = new Autorizacion(log);
    let opcionesCaso = {
        emailsAdmin: emailsAdmin,
        log: log,
        urlBase: opciones.urlBase
    };

    let registrarUsuario = new RegistrarUsuario(cad, servicioHash, servicioToken, servicioCorreo, opcionesCaso);
    let confirmarUsuario = new ConfirmarUsuario(cad, opcionesCaso);
    let iniciarSesion = new IniciarSesion(cad, servicioHash, opcionesCaso);
    let autenticarGoogle = new AutenticarGoogle(cad, opcionesCaso);
    let obtenerUsuario = new ObtenerUsuario(cad);
    let obtenerUsuarios = new ObtenerUsuarios(cad, autorizacion);
    let numeroUsuarios = new NumeroUsuarios(cad, autorizacion);
    let usuarioActivo = new UsuarioActivo(cad, autorizacion);
    let eliminarUsuario = new EliminarUsuario(cad, autorizacion, log);

    this.registrarUsuario = function (datos, callback) {
        registrarUsuario.ejecutar(datos, callback);
    };

    this.confirmarUsuario = function (token, callback) {
        confirmarUsuario.ejecutar(token, callback);
    };

    this.iniciarSesion = function (email, clave, callback) {
        iniciarSesion.ejecutar(email, clave, callback);
    };

    this.autenticarGoogle = function (perfil, callback) {
        autenticarGoogle.ejecutar(perfil, callback);
    };

    this.obtenerUsuario = function (email, callback) {
        obtenerUsuario.ejecutar(email, callback);
    };

    this.obtenerUsuarios = function (solicitante, callback) {
        obtenerUsuarios.ejecutar(solicitante, callback);
    };

    this.numeroUsuarios = function (solicitante, callback) {
        numeroUsuarios.ejecutar(solicitante, callback);
    };

    this.usuarioActivo = function (solicitante, email, callback) {
        usuarioActivo.ejecutar(solicitante, email, callback);
    };

    this.eliminarUsuario = function (solicitante, email, callback) {
        eliminarUsuario.ejecutar(solicitante, email, callback);
    };
}

module.exports.Sistema = Sistema;
