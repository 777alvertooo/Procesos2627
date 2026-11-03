const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");

function QuitarPendiente(cad) {
    this.ejecutar = function (solicitante, peliculaId, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        peliculaId = typeof peliculaId === "string" ? peliculaId.trim() : "";
        if (!peliculaId) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta la película"));
        cad.quitarPendiente(solicitante.email, peliculaId, function (err) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ enLista: false });
        });
    };
}

module.exports.QuitarPendiente = QuitarPendiente;
