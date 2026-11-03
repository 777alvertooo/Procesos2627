const { RespuestaHttp } = require("../RespuestaHttp.js");

function ActualizarPeliculaHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.actualizarPelicula(request.usuario, request.params.id, request.body || {}, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ActualizarPeliculaHandler = ActualizarPeliculaHandler;
