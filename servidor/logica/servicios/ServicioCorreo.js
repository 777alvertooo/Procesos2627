const nodemailer = require("nodemailer");

function ServicioCorreo(opciones) {
    opciones = opciones || {};
    let transportador = opciones.transportador;

    if (!transportador && opciones.host && opciones.user && opciones.pass) {
        transportador = nodemailer.createTransport({
            host: opciones.host,
            port: Number(opciones.port) || 587,
            secure: false,
            auth: { user: opciones.user, pass: opciones.pass }
        });
    }

    this.enviar = function (destino, asunto, texto, callback) {
        if (!transportador) {
            return callback(new Error("Servicio de correo no configurado"));
        }
        transportador.sendMail({
            from: opciones.from || opciones.user,
            to: destino,
            subject: asunto,
            text: texto
        }, function (err) {
            callback(err);
        });
    };
}

function ServicioCorreoSilencio() {
    this.enviados = [];

    this.enviar = function (destino, asunto, texto, callback) {
        this.enviados.push({ destino: destino, asunto: asunto, texto: texto });
        callback();
    };
}

module.exports.ServicioCorreo = ServicioCorreo;
module.exports.ServicioCorreoSilencio = ServicioCorreoSilencio;
