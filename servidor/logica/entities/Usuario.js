const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { OrigenUsuario } = require("../enums/OrigenUsuario.js");

function Usuario(datos) {
    this.email = datos.email;
    this.nick = datos.nick || datos.email.split("@")[0];
    this.clave = datos.clave;
    this.origen = datos.origen || OrigenUsuario.LOCAL;
    this.estado = EstadoUsuario.ACTIVO;
    this.fechaAlta = new Date();
}

module.exports.Usuario = Usuario;
