const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

function UsuarioActivo(cad, autorizacion) {
    this.ejecutar = function (solicitante, email, callback) {
        let denegado = autorizacion.exigirAdmin(solicitante, "consultar si un usuario está activo");
        if (denegado) return callback(denegado);
        email = ValidadorEmail.normalizar(email);
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({ email: email, activo: !!usuario && usuario.estado === EstadoUsuario.ACTIVO });
        });
    };
}

module.exports.UsuarioActivo = UsuarioActivo;
