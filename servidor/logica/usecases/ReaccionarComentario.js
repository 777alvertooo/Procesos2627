const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");

function ReaccionarComentario(cad, log) {
    this.ejecutar = function (solicitante, datos, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        datos = datos || {};
        let comentarioId = typeof datos.comentarioId === "string" ? datos.comentarioId.trim() : "";
        let tipo = datos.tipo;
        if (!comentarioId) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta el comentario"));
        if (tipo !== "like" && tipo !== "dislike") {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La reacción debe ser like o dislike"));
        }
        localizar(cad, comentarioId, function (err, peliculaId) {
            if (err) return callback(err.tipo ? err : ErrorSistema.interno(err));
            if (!peliculaId) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe ese comentario"));
            cad.buscarValoracion(solicitante.email, peliculaId, function (err, propia) {
                if (err) return callback(ErrorSistema.interno(err));
                if (!propia) {
                    return callback(new ErrorSistema(TipoError.PROHIBIDO, "Valora la película antes de participar en los comentarios"));
                }
                cad.buscarReaccion(comentarioId, solicitante.email, function (err, actual) {
                    if (err) return callback(ErrorSistema.interno(err));
                    let siguiente = actual && actual.tipo === tipo ? null : tipo;
                    cad.guardarReaccion(comentarioId, solicitante.email, siguiente, function (err) {
                        if (err) return callback(ErrorSistema.interno(err));
                        if (log) log.info("Reacción de " + solicitante.email + " en " + comentarioId + ": " + (siguiente || "ninguna"));
                        callback({ ok: true, miReaccion: siguiente });
                    });
                });
            });
        });
    };
}

function localizar(cad, comentarioId, callback) {
    cad.buscarValoracionPorId(comentarioId, function (err, valoracion) {
        if (err) return callback(err);
        if (valoracion) return callback(undefined, valoracion.peliculaId);
        cad.buscarRespuestaPorId(comentarioId, function (err, respuesta) {
            if (err) return callback(err);
            if (!respuesta) return callback(undefined, undefined);
            cad.buscarValoracionPorId(respuesta.valoracionId, function (err, padre) {
                if (err) return callback(err);
                callback(undefined, padre ? padre.peliculaId : undefined);
            });
        });
    });
}

module.exports.ReaccionarComentario = ReaccionarComentario;
