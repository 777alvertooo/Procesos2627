const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { ServicioCorreoSilencio } = require("../logica/servicios/ServicioCorreo.js");

function crearSistemaPrueba(opciones) {
    opciones = opciones || {};
    let cad = opciones.cad || new CADMemoria();
    let correo = opciones.servicioCorreo || new ServicioCorreoSilencio();
    let sistema = new Sistema({
        cad: cad,
        rondasHash: opciones.rondasHash || 4,
        emailsAdmin: opciones.emailsAdmin || [],
        servicioCorreo: correo,
        urlBase: opciones.urlBase || "http://localhost:3000"
    });
    sistema._cadPrueba = cad;
    sistema._correoPrueba = correo;
    let registrarOriginal = sistema.registrarUsuario;
    sistema.registrarUsuario = function (datos, callback) {
        registrarOriginal(conConfirmacion(datos), callback);
    };
    return sistema;
}

function conConfirmacion(datos) {
    datos = Object.assign({}, datos);
    if (datos.confirmarPassword === undefined) {
        datos.confirmarPassword = datos.password;
    }
    return datos;
}

function registrarYConfirmar(sistema, datos, callback) {
    sistema.registrarUsuario(conConfirmacion(datos), function (res) {
        if (res.error) return callback(res);
        sistema._cadPrueba.buscarUsuario({ email: res.email }, function (err, usuario) {
            sistema.confirmarUsuario(usuario.tokenConfirmacion, function (confirmado) {
                if (confirmado.error) return callback(confirmado);
                callback(res);
            });
        });
    });
}

module.exports.crearSistemaPrueba = crearSistemaPrueba;
module.exports.registrarYConfirmar = registrarYConfirmar;
module.exports.conConfirmacion = conConfirmacion;
