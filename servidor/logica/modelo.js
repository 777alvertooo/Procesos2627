const { RegistrarUsuario } = require("./usecases/RegistrarUsuario.js");
const { ConfirmarUsuario } = require("./usecases/ConfirmarUsuario.js");
const { IniciarSesion } = require("./usecases/IniciarSesion.js");
const { AutenticarGoogle } = require("./usecases/AutenticarGoogle.js");
const { SolicitarRestablecerClave } = require("./usecases/SolicitarRestablecerClave.js");
const { RestablecerClave } = require("./usecases/RestablecerClave.js");
const { ObtenerUsuario } = require("./usecases/ObtenerUsuario.js");
const { ObtenerUsuarios } = require("./usecases/ObtenerUsuarios.js");
const { NumeroUsuarios } = require("./usecases/NumeroUsuarios.js");
const { UsuarioActivo } = require("./usecases/UsuarioActivo.js");
const { EliminarUsuario } = require("./usecases/EliminarUsuario.js");
const { ActualizarPerfil } = require("./usecases/ActualizarPerfil.js");
const { ActualizarUsuario } = require("./usecases/ActualizarUsuario.js");
const { ListarPeliculas } = require("./usecases/ListarPeliculas.js");
const { ObtenerPelicula } = require("./usecases/ObtenerPelicula.js");
const { ListarPendientes } = require("./usecases/ListarPendientes.js");
const { AnadirPendiente } = require("./usecases/AnadirPendiente.js");
const { QuitarPendiente } = require("./usecases/QuitarPendiente.js");
const { ValorarPelicula } = require("./usecases/ValorarPelicula.js");
const { ResponderComentario } = require("./usecases/ResponderComentario.js");
const { ReaccionarComentario } = require("./usecases/ReaccionarComentario.js");
const { CrearPelicula } = require("./usecases/CrearPelicula.js");
const { ActualizarPelicula } = require("./usecases/ActualizarPelicula.js");
const { EliminarPelicula } = require("./usecases/EliminarPelicula.js");
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
    let solicitarRestablecerClave = new SolicitarRestablecerClave(cad, servicioToken, servicioCorreo, opcionesCaso);
    let restablecerClave = new RestablecerClave(cad, servicioHash, opcionesCaso);
    let obtenerUsuario = new ObtenerUsuario(cad);
    let obtenerUsuarios = new ObtenerUsuarios(cad, autorizacion);
    let numeroUsuarios = new NumeroUsuarios(cad, autorizacion);
    let usuarioActivo = new UsuarioActivo(cad, autorizacion);
    let eliminarUsuario = new EliminarUsuario(cad, autorizacion, log);
    let actualizarPerfil = new ActualizarPerfil(cad, servicioHash, opcionesCaso);
    let actualizarUsuario = new ActualizarUsuario(cad, servicioHash, autorizacion, opcionesCaso);
    let listarPeliculas = new ListarPeliculas(cad);
    let obtenerPelicula = new ObtenerPelicula(cad);
    let listarPendientes = new ListarPendientes(cad);
    let anadirPendiente = new AnadirPendiente(cad);
    let quitarPendiente = new QuitarPendiente(cad);
    let valorarPelicula = new ValorarPelicula(cad, log);
    let responderComentario = new ResponderComentario(cad, log);
    let reaccionarComentario = new ReaccionarComentario(cad, log);
    let crearPelicula = new CrearPelicula(cad, autorizacion, log);
    let actualizarPelicula = new ActualizarPelicula(cad, autorizacion, log);
    let eliminarPelicula = new EliminarPelicula(cad, autorizacion, log);

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

    this.solicitarRestablecerClave = function (email, callback) {
        solicitarRestablecerClave.ejecutar(email, callback);
    };

    this.restablecerClave = function (datos, callback) {
        restablecerClave.ejecutar(datos, callback);
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

    this.actualizarPerfil = function (solicitante, datos, callback) {
        actualizarPerfil.ejecutar(solicitante, datos, callback);
    };

    this.actualizarUsuario = function (solicitante, email, datos, callback) {
        actualizarUsuario.ejecutar(solicitante, email, datos, callback);
    };

    this.listarPeliculas = function (solicitante, callback) {
        listarPeliculas.ejecutar(solicitante, callback);
    };

    this.obtenerPelicula = function (solicitante, id, callback) {
        obtenerPelicula.ejecutar(solicitante, id, callback);
    };

    this.listarPendientes = function (solicitante, callback) {
        listarPendientes.ejecutar(solicitante, callback);
    };

    this.anadirPendiente = function (solicitante, peliculaId, callback) {
        anadirPendiente.ejecutar(solicitante, peliculaId, callback);
    };

    this.quitarPendiente = function (solicitante, peliculaId, callback) {
        quitarPendiente.ejecutar(solicitante, peliculaId, callback);
    };

    this.valorarPelicula = function (solicitante, datos, callback) {
        valorarPelicula.ejecutar(solicitante, datos, callback);
    };

    this.responderComentario = function (solicitante, datos, callback) {
        responderComentario.ejecutar(solicitante, datos, callback);
    };

    this.reaccionarComentario = function (solicitante, datos, callback) {
        reaccionarComentario.ejecutar(solicitante, datos, callback);
    };

    this.crearPelicula = function (solicitante, datos, callback) {
        crearPelicula.ejecutar(solicitante, datos, callback);
    };

    this.actualizarPelicula = function (solicitante, id, datos, callback) {
        actualizarPelicula.ejecutar(solicitante, id, datos, callback);
    };

    this.eliminarPelicula = function (solicitante, id, callback) {
        eliminarPelicula.ejecutar(solicitante, id, callback);
    };
}

module.exports.Sistema = Sistema;
