const express = require("express");
const { HaIniciadoSesion } = require("./middlewares/HaIniciadoSesion.js");
const { PaginaInicioHandler } = require("./handlers/PaginaInicioHandler.js");
const { RegistrarUsuarioHandler } = require("./handlers/RegistrarUsuarioHandler.js");
const { ConfirmarUsuarioHandler } = require("./handlers/ConfirmarUsuarioHandler.js");
const { IniciarSesionHandler } = require("./handlers/IniciarSesionHandler.js");
const { IniciarGoogleHandler } = require("./handlers/IniciarGoogleHandler.js");
const { CallbackGoogleHandler } = require("./handlers/CallbackGoogleHandler.js");
const { SolicitarRestablecerClaveHandler } = require("./handlers/SolicitarRestablecerClaveHandler.js");
const { RestablecerClaveHandler } = require("./handlers/RestablecerClaveHandler.js");
const { UsuarioSesionHandler } = require("./handlers/UsuarioSesionHandler.js");
const { CerrarSesionHandler } = require("./handlers/CerrarSesionHandler.js");
const { ObtenerUsuariosHandler } = require("./handlers/ObtenerUsuariosHandler.js");
const { NumeroUsuariosHandler } = require("./handlers/NumeroUsuariosHandler.js");
const { UsuarioActivoHandler } = require("./handlers/UsuarioActivoHandler.js");
const { EliminarUsuarioHandler } = require("./handlers/EliminarUsuarioHandler.js");
const { ActualizarPerfilHandler } = require("./handlers/ActualizarPerfilHandler.js");
const { ActualizarUsuarioHandler } = require("./handlers/ActualizarUsuarioHandler.js");
const { BloqueoPruebaHandler } = require("./handlers/BloqueoPruebaHandler.js");
const { ListarPeliculasHandler } = require("./handlers/ListarPeliculasHandler.js");
const { TopSemanalHandler } = require("./handlers/TopSemanalHandler.js");
const { ObtenerPeliculaHandler } = require("./handlers/ObtenerPeliculaHandler.js");
const { ListarPendientesHandler } = require("./handlers/ListarPendientesHandler.js");
const { AnadirPendienteHandler } = require("./handlers/AnadirPendienteHandler.js");
const { QuitarPendienteHandler } = require("./handlers/QuitarPendienteHandler.js");
const { ValorarPeliculaHandler } = require("./handlers/ValorarPeliculaHandler.js");
const { ResponderComentarioHandler } = require("./handlers/ResponderComentarioHandler.js");
const { ReaccionarComentarioHandler } = require("./handlers/ReaccionarComentarioHandler.js");
const { CrearPeliculaHandler } = require("./handlers/CrearPeliculaHandler.js");
const { ActualizarPeliculaHandler } = require("./handlers/ActualizarPeliculaHandler.js");
const { EliminarPeliculaHandler } = require("./handlers/EliminarPeliculaHandler.js");
const { CrearSesionMatchHandler, UnirseSesionMatchHandler, ObtenerSesionMatchHandler, ElegirMatchHandler, ReiniciarSesionMatchHandler, CerrarSesionMatchHandler } = require("./handlers/SesionMatchHandler.js");
const { NoEncontradoHandler } = require("./handlers/NoEncontradoHandler.js");
const { ErrorPeticionHandler } = require("./handlers/ErrorPeticionHandler.js");

function Rutas(sistema, log, clienteGoogle) {
    let haIniciado = new HaIniciadoSesion(sistema).manejar;
    this.router = express.Router();
    this.router.use(express.json());

    this.router.post("/api/prueba/bloqueo", new BloqueoPruebaHandler().manejar);
    this.router.get("/", new PaginaInicioHandler().manejar);
    this.router.post("/registrarUsuario", new RegistrarUsuarioHandler(sistema).manejar);
    this.router.get("/confirmarUsuario/:token", new ConfirmarUsuarioHandler(sistema, log).manejar);
    this.router.post("/iniciarSesion", new IniciarSesionHandler(sistema).manejar);
    this.router.get("/auth/google", new IniciarGoogleHandler(clienteGoogle).manejar);
    this.router.get("/auth/google/callback", new CallbackGoogleHandler(sistema, clienteGoogle, log).manejar);
    this.router.post("/solicitarRestablecerClave", new SolicitarRestablecerClaveHandler(sistema).manejar);
    this.router.post("/restablecerClave", new RestablecerClaveHandler(sistema).manejar);
    this.router.get("/usuarioSesion", new UsuarioSesionHandler(sistema).manejar);
    this.router.post("/cerrarSesion", new CerrarSesionHandler().manejar);

    this.router.get("/obtenerUsuarios", haIniciado, new ObtenerUsuariosHandler(sistema).manejar);
    this.router.get("/numeroUsuarios", haIniciado, new NumeroUsuariosHandler(sistema).manejar);
    this.router.get("/usuarioActivo/:email", haIniciado, new UsuarioActivoHandler(sistema).manejar);
    this.router.delete("/eliminarUsuario/:email", haIniciado, new EliminarUsuarioHandler(sistema).manejar);
    this.router.put("/actualizarPerfil", haIniciado, new ActualizarPerfilHandler(sistema).manejar);
    this.router.put("/actualizarUsuario/:email", haIniciado, new ActualizarUsuarioHandler(sistema).manejar);

    this.router.get("/obtenerPeliculas", haIniciado, new ListarPeliculasHandler(sistema).manejar);
    this.router.get("/obtenerTopSemanal", haIniciado, new TopSemanalHandler(sistema).manejar);
    this.router.get("/obtenerPelicula/:id", haIniciado, new ObtenerPeliculaHandler(sistema).manejar);
    this.router.get("/obtenerPendientes", haIniciado, new ListarPendientesHandler(sistema).manejar);
    this.router.post("/anadirPendiente", haIniciado, new AnadirPendienteHandler(sistema).manejar);
    this.router.delete("/quitarPendiente/:id", haIniciado, new QuitarPendienteHandler(sistema).manejar);
    this.router.post("/valorarPelicula", haIniciado, new ValorarPeliculaHandler(sistema).manejar);
    this.router.post("/responderComentario", haIniciado, new ResponderComentarioHandler(sistema).manejar);
    this.router.post("/reaccionarComentario", haIniciado, new ReaccionarComentarioHandler(sistema).manejar);
    this.router.post("/crearPelicula", haIniciado, new CrearPeliculaHandler(sistema).manejar);
    this.router.put("/actualizarPelicula/:id", haIniciado, new ActualizarPeliculaHandler(sistema).manejar);
    this.router.delete("/eliminarPelicula/:id", haIniciado, new EliminarPeliculaHandler(sistema).manejar);

    this.router.post("/crearSesionMatch", haIniciado, new CrearSesionMatchHandler(sistema).manejar);
    this.router.post("/unirseSesionMatch", haIniciado, new UnirseSesionMatchHandler(sistema).manejar);
    this.router.get("/obtenerSesionMatch/:codigo", haIniciado, new ObtenerSesionMatchHandler(sistema).manejar);
    this.router.post("/elegirMatch", haIniciado, new ElegirMatchHandler(sistema).manejar);
    this.router.post("/reiniciarSesionMatch", haIniciado, new ReiniciarSesionMatchHandler(sistema).manejar);
    this.router.post("/cerrarSesionMatch", haIniciado, new CerrarSesionMatchHandler(sistema).manejar);

    this.router.use(new NoEncontradoHandler().manejar);
    this.router.use(new ErrorPeticionHandler().manejar);
}

module.exports.Rutas = Rutas;
