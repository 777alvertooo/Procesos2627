const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { identificador } = require("../servicios/Identificador.js");

function ValorarPelicula(cad, log) {
    this.ejecutar = function (solicitante, datos, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        datos = datos || {};
        let peliculaId = typeof datos.peliculaId === "string" ? datos.peliculaId.trim() : "";
        let puntuacion = Number(datos.puntuacion);
        let texto = typeof datos.texto === "string" ? datos.texto.trim() : "";
        if (!peliculaId) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta la película"));
        if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La puntuación debe ser un número del 1 al 5"));
        }
        if (!texto) return callback(new ErrorSistema(TipoError.VALIDACION, "Escribe un comentario"));
        if (texto.length > 500) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El comentario no puede superar los 500 caracteres"));
        }
        cad.buscarPelicula(peliculaId, function (err, pelicula) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!pelicula) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa película"));
            let valoracion = {
                id: identificador("val"),
                peliculaId: peliculaId,
                email: solicitante.email,
                nick: solicitante.nick || solicitante.email.split("@")[0],
                puntuacion: puntuacion,
                texto: texto,
                fecha: new Date().toISOString()
            };
            cad.insertarValoracion(valoracion, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                cad.quitarPendiente(solicitante.email, peliculaId, function (err, quitada) {
                    if (err) return callback(ErrorSistema.interno(err));
                    if (log) log.info("Valoración de " + solicitante.email + " sobre " + peliculaId + ": " + puntuacion);
                    callback({ ok: true, quitadaDePendientes: !!quitada });
                });
            });
        });
    };
}

module.exports.ValorarPelicula = ValorarPelicula;
