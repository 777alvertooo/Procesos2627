const { RespuestaHttp } = require("../RespuestaHttp.js");

function CrearPeliculaHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.crearPelicula(request.usuario, request.body || {}, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.CrearPeliculaHandler = CrearPeliculaHandler;
