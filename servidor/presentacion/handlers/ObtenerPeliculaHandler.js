const { RespuestaHttp } = require("../RespuestaHttp.js");

function ObtenerPeliculaHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.obtenerPelicula(request.usuario, request.params.id, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ObtenerPeliculaHandler = ObtenerPeliculaHandler;
