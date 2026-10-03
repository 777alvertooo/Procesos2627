const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function ObtenerUsuarios(cad) {
    this.ejecutar = function (callback) {
        cad.listarUsuarios(function (err, lista) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ usuarios: lista.map(UsuarioMapper.aPublico) });
        });
    };
}

module.exports.ObtenerUsuarios = ObtenerUsuarios;
