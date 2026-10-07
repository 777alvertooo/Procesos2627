const { EstadoUsuario } = require("../enums/EstadoUsuario.js");

const UsuarioMapper = {
    aPublico: function (usuario) {
        return {
            email: usuario.email,
            nick: usuario.nick,
            origen: usuario.origen,
            estado: usuario.estado,
            activo: usuario.estado === EstadoUsuario.ACTIVO
        };
    }
};

module.exports.UsuarioMapper = UsuarioMapper;
