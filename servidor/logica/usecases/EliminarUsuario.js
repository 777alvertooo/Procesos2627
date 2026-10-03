const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

function EliminarUsuario(cad) {
    this.ejecutar = function (email, callback) {
        email = ValidadorEmail.normalizar(email);
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado === EstadoUsuario.ELIMINADO) {
                return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "El usuario no existe"));
            }
            usuario.estado = EstadoUsuario.ELIMINADO;
            usuario.fechaBaja = new Date();
            cad.actualizarUsuario(usuario, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                callback({ email: email });
            });
        });
    };
}

module.exports.EliminarUsuario = EliminarUsuario;
