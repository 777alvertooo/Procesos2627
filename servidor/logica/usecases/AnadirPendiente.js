const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");

function AnadirPendiente(cad) {
    this.ejecutar = function (solicitante, peliculaId, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        peliculaId = typeof peliculaId === "string" ? peliculaId.trim() : "";
        if (!peliculaId) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta la película"));
        cad.buscarPelicula(peliculaId, function (err, pelicula) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!pelicula) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa película"));
            cad.buscarValoracion(solicitante.email, peliculaId, function (err, propia) {
                if (err) return callback(ErrorSistema.interno(err));
                if (propia) return callback(new ErrorSistema(TipoError.CONFLICTO, "Ya has visto esta película"));
                cad.anadirPendiente(solicitante.email, peliculaId, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    callback({ enLista: true });
                });
            });
        });
    };
}

module.exports.AnadirPendiente = AnadirPendiente;
