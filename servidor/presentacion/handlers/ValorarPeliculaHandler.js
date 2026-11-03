const { RespuestaHttp } = require("../RespuestaHttp.js");

function ValorarPeliculaHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.valorarPelicula(request.usuario, request.body || {}, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ValorarPeliculaHandler = ValorarPeliculaHandler;
