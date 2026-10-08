const { ErrorSistema } = require("../errores/ErrorSistema.js");

function NumeroUsuarios(cad, autorizacion) {
    this.ejecutar = function (solicitante, callback) {
        let denegado = autorizacion.exigirAdmin(solicitante, "contar usuarios");
        if (denegado) return callback(denegado);
        cad.listarUsuarios(function (err, lista) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ num: lista.length });
        });
    };
}

module.exports.NumeroUsuarios = NumeroUsuarios;
