const { RespuestaHttp } = require("../RespuestaHttp.js");

function EliminarPeliculaHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.eliminarPelicula(request.usuario, request.params.id, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.EliminarPeliculaHandler = EliminarPeliculaHandler;
