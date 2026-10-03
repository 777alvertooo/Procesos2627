const { EstadoUsuario } = require("../enums/EstadoUsuario.js");

function Usuario(datos) {
    this.email = datos.email;
    this.nick = datos.nick || datos.email.split("@")[0];
    this.estado = EstadoUsuario.ACTIVO;
    this.fechaAlta = new Date();
}

module.exports.Usuario = Usuario;
