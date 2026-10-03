const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

function UsuarioActivo(cad) {
    this.ejecutar = function (email, callback) {
        email = ValidadorEmail.normalizar(email);
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ email: email, activo: !!usuario && usuario.estado === EstadoUsuario.ACTIVO });
        });
    };
}

module.exports.UsuarioActivo = UsuarioActivo;
