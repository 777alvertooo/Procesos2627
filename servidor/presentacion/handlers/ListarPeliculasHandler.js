const { RespuestaHttp } = require("../RespuestaHttp.js");

function ListarPeliculasHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.listarPeliculas(request.usuario, request.query, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ListarPeliculasHandler = ListarPeliculasHandler;
