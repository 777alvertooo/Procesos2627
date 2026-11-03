const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { prepararPelicula } = require("../servicios/DatosPelicula.js");

function ActualizarPelicula(cad, autorizacion, log) {
    this.ejecutar = function (solicitante, id, datos, callback) {
        let denegado = exigirSesion(solicitante) || autorizacion.exigirAdmin(solicitante, "editar una película");
        if (denegado) return callback(denegado);
        id = typeof id === "string" ? id.trim() : "";
        if (!id) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta la película"));
        let preparado = prepararPelicula(datos);
        if (preparado.error) return callback(preparado.error);
        cad.buscarPelicula(id, function (err, existente) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!existente) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa película"));
            let pelicula = preparado.pelicula;
            pelicula.id = id;
            pelicula.orden = existente.orden;
            cad.actualizarPelicula(pelicula, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                if (log) log.info("Película editada por " + solicitante.email + ": " + id);
                callback({ ok: true, id: id });
            });
        });
    };
}

module.exports.ActualizarPelicula = ActualizarPelicula;
