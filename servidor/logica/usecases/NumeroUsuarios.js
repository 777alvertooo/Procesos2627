const { ErrorSistema } = require("../errores/ErrorSistema.js");

function NumeroUsuarios(cad) {
    this.ejecutar = function (callback) {
        cad.listarUsuarios(function (err, lista) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ num: lista.length });
        });
    };
}

module.exports.NumeroUsuarios = NumeroUsuarios;
