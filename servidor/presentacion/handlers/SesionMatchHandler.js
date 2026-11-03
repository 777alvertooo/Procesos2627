const { RespuestaHttp } = require("../RespuestaHttp.js");

function CrearSesionMatchHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.crearSesionMatch(request.usuario, request.body || {}, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

function UnirseSesionMatchHandler(sistema) {
    this.manejar = function (request, response) {
        let codigo = request.body && request.body.codigo;
        sistema.unirseSesionMatch(request.usuario, codigo, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

function ObtenerSesionMatchHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.obtenerSesionMatch(request.usuario, request.params.codigo, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

function ElegirMatchHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        sistema.elegirMatch(request.usuario, cuerpo.codigo, cuerpo.peliculaId, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

function ReiniciarSesionMatchHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        sistema.reiniciarSesionMatch(request.usuario, cuerpo.codigo, !!cuerpo.repetir, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

function CerrarSesionMatchHandler(sistema) {
    this.manejar = function (request, response) {
        let codigo = request.body && request.body.codigo;
        sistema.cerrarSesionMatch(request.usuario, codigo, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.CrearSesionMatchHandler = CrearSesionMatchHandler;
module.exports.UnirseSesionMatchHandler = UnirseSesionMatchHandler;
module.exports.ObtenerSesionMatchHandler = ObtenerSesionMatchHandler;
module.exports.ElegirMatchHandler = ElegirMatchHandler;
module.exports.ReiniciarSesionMatchHandler = ReiniciarSesionMatchHandler;
module.exports.CerrarSesionMatchHandler = CerrarSesionMatchHandler;
