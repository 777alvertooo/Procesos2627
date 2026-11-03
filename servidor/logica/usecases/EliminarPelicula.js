const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");

function EliminarPelicula(cad, autorizacion, log) {
    this.ejecutar = function (solicitante, id, callback) {
        let denegado = exigirSesion(solicitante) || autorizacion.exigirAdmin(solicitante, "borrar una película");
        if (denegado) return callback(denegado);
        id = typeof id === "string" ? id.trim() : "";
        if (!id) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta la película"));
        cad.buscarPelicula(id, function (err, existente) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!existente) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa película"));
            cad.eliminarPelicula(id, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                if (log) log.info("Película borrada por " + solicitante.email + ": " + id);
                callback({ ok: true });
            });
        });
    };
}

module.exports.EliminarPelicula = EliminarPelicula;
