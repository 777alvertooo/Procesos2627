const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function ObtenerUsuarios(cad, autorizacion) {
    this.ejecutar = function (solicitante, callback) {
        let denegado = autorizacion.exigirAdmin(solicitante, "listar usuarios");
        if (denegado) return callback(denegado);
        cad.listarUsuarios(function (err, lista) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ usuarios: lista.map(UsuarioMapper.aPublico) });
        });
    };
}

module.exports.ObtenerUsuarios = ObtenerUsuarios;
