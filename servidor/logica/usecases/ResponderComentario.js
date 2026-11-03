const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { identificador } = require("../servicios/Identificador.js");

function ResponderComentario(cad, log) {
    this.ejecutar = function (solicitante, datos, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        datos = datos || {};
        let valoracionId = typeof datos.valoracionId === "string" ? datos.valoracionId.trim() : "";
        let texto = typeof datos.texto === "string" ? datos.texto.trim() : "";
        if (!valoracionId) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta el comentario"));
        if (!texto) return callback(new ErrorSistema(TipoError.VALIDACION, "Escribe una respuesta"));
        if (texto.length > 500) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La respuesta no puede superar los 500 caracteres"));
        }
        cad.buscarValoracionPorId(valoracionId, function (err, valoracion) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!valoracion) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe ese comentario"));
            cad.buscarValoracion(solicitante.email, valoracion.peliculaId, function (err, propia) {
                if (err) return callback(ErrorSistema.interno(err));
                if (!propia) {
                    return callback(new ErrorSistema(TipoError.PROHIBIDO, "Valora la película antes de participar en los comentarios"));
                }
                let respuesta = {
                    id: identificador("res"),
                    valoracionId: valoracion.id,
                    email: solicitante.email,
                    nick: solicitante.nick || solicitante.email.split("@")[0],
                    texto: texto,
                    fecha: new Date().toISOString()
                };
                cad.insertarRespuesta(respuesta, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    if (log) log.info("Respuesta de " + solicitante.email + " al comentario " + valoracion.id);
                    callback({ ok: true });
                });
            });
        });
    };
}

module.exports.ResponderComentario = ResponderComentario;
