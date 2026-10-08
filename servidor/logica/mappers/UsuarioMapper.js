const { EstadoUsuario } = require("../enums/EstadoUsuario.js");

const UsuarioMapper = {
    aPublico: function (usuario) {
        return {
            email: usuario.email,
            nick: usuario.nick,
            rol: usuario.rol,
            origen: usuario.origen,
            estado: usuario.estado,
            activo: usuario.estado === EstadoUsuario.ACTIVO
        };
    }
};

module.exports.UsuarioMapper = UsuarioMapper;
