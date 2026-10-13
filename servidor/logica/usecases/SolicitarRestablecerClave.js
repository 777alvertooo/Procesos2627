const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

const MENSAJE_OK = "Te hemos enviado un email con instrucciones para restablecer la contraseña.";

function SolicitarRestablecerClave(cad, servicioToken, servicioCorreo, opciones) {
    opciones = opciones || {};
    let urlBase = (opciones.urlBase || "http://localhost:3000").replace(/\/$/, "");
    let log = opciones.log;

    this.ejecutar = function (email, callback) {
        email = ValidadorEmail.normalizar(email);
        if (!ValidadorEmail.esValido(email)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El email no es válido"));
        }
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado === EstadoUsuario.ELIMINADO) {
                log.aviso("Restablecer clave rechazado, email no registrado: " + email);
                return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No hay ninguna cuenta registrada con ese email"));
            }
            if (!usuario.clave) {
                log.aviso("Restablecer clave rechazado, cuenta sin contraseña local: " + email);
                return callback(new ErrorSistema(TipoError.PROHIBIDO, "Esta cuenta inicia sesión con Google y no tiene contraseña local"));
            }
            let token = servicioToken.generar();
            usuario.tokenRestablecer = token;
            usuario.fechaTokenRestablecer = new Date();
            cad.actualizarUsuario(usuario, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                let enlace = urlBase + "/?restablecer=" + token;
                let texto = "Hola " + (usuario.nick || email) + ",\n\n"
                    + "Has pedido restablecer tu contraseña. Abre este enlace:\n" + enlace + "\n\n"
                    + "Si no has sido tú, ignora este mensaje.";
                servicioCorreo.enviar(email, "Restablece tu contraseña en Procesos 26-27", texto, function (err) {
                    if (err) {
                        log.error("No se pudo enviar el email de restablecer a " + email + ": " + err.message);
                        return callback(new ErrorSistema(TipoError.INTERNO, "No se pudo enviar el email de restablecimiento"));
                    }
                    log.info("Email de restablecer contraseña enviado a " + email);
                    callback({ mensaje: MENSAJE_OK });
                });
            });
        });
    };
}

module.exports.SolicitarRestablecerClave = SolicitarRestablecerClave;
module.exports.MENSAJE_OK = MENSAJE_OK;
