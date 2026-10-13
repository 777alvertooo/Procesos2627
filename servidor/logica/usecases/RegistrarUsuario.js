const { Usuario } = require("../entities/Usuario.js");
const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { RolUsuario } = require("../enums/RolUsuario.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { OrigenUsuario } = require("../enums/OrigenUsuario.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { ValidadorClave } = require("../validaciones/ValidadorClave.js");

function RegistrarUsuario(cad, servicioHash, servicioToken, servicioCorreo, opciones) {
    opciones = opciones || {};
    let emailsAdmin = opciones.emailsAdmin || [];
    let urlBase = (opciones.urlBase || "http://localhost:3000").replace(/\/$/, "");
    let log = opciones.log;

    this.ejecutar = function (datos, callback) {
        datos = datos || {};
        let email = ValidadorEmail.normalizar(datos.email);
        if (!ValidadorEmail.esValido(email)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El email no es válido"));
        }
        if (!ValidadorClave.esValida(datos.password)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La contraseña debe tener al menos " + ValidadorClave.LONGITUD_MINIMA + " caracteres"));
        }
        if (datos.confirmarPassword !== datos.password) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "Las contraseñas no coinciden"));
        }
        cad.buscarUsuario({ email: email }, function (err, existente) {
            if (err) return callback(ErrorSistema.interno(err));
            if (existente && existente.estado !== EstadoUsuario.ELIMINADO) {
                log.aviso("Registro rechazado, email en uso: " + email);
                return callback(new ErrorSistema(TipoError.CONFLICTO, "El email ya está registrado"));
            }
            servicioHash.cifrar(datos.password, function (err, hash) {
                if (err) return callback(ErrorSistema.interno(err));
                let rol = emailsAdmin.indexOf(email) !== -1 ? RolUsuario.ADMIN : RolUsuario.USUARIO;
                let token = servicioToken.generar();
                let usuario = new Usuario({
                    email: email,
                    nick: datos.nick,
                    clave: hash,
                    rol: rol,
                    origen: OrigenUsuario.LOCAL,
                    estado: EstadoUsuario.PENDIENTE,
                    tokenConfirmacion: token
                });
                let guardar = existente ? cad.actualizarUsuario.bind(cad) : cad.insertarUsuario.bind(cad);
                guardar(usuario, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    let enlace = urlBase + "/confirmarUsuario/" + token;
                    let texto = "Hola " + usuario.nick + ",\n\n"
                        + "Confirma tu cuenta abriendo este enlace:\n" + enlace + "\n\n"
                        + "Hasta que no confirmes el email no podrás iniciar sesión.";
                    servicioCorreo.enviar(email, "Confirma tu cuenta en Procesos 26-27", texto, function (err) {
                        if (err) {
                            log.error("No se pudo enviar el email de confirmación a " + email + ": " + err.message);
                            return callback(new ErrorSistema(TipoError.INTERNO, "Cuenta creada, pero no se pudo enviar el email de confirmación"));
                        }
                        log.info("Usuario registrado pendiente de confirmación: " + email + " (" + rol + ")");
                        callback({
                            email: email,
                            pendiente: true,
                            mensaje: "Te hemos enviado un email de confirmación. Revisa tu bandeja."
                        });
                    });
                });
            });
        });
    };
}

module.exports.RegistrarUsuario = RegistrarUsuario;
