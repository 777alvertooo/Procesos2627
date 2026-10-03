function CADMemoria() {
    this.usuarios = {};

    this.conectar = function (uri, nombreBD, callback) {
        callback();
    };

    this.buscarUsuario = function (criterio, callback) {
        let usuarios = this.usuarios;
        let encontrado = Object.keys(usuarios).map(function (email) { return usuarios[email]; })
            .find(function (usuario) {
                return Object.keys(criterio).every(function (clave) { return usuario[clave] === criterio[clave]; });
            });
        callback(undefined, encontrado ? Object.assign({}, encontrado) : undefined);
    };

    this.insertarUsuario = function (usuario, callback) {
        if (this.usuarios[usuario.email]) {
            return callback(new Error("Email duplicado: " + usuario.email));
        }
        this.usuarios[usuario.email] = Object.assign({}, usuario);
        callback();
    };

    this.actualizarUsuario = function (usuario, callback) {
        this.usuarios[usuario.email] = Object.assign({}, usuario);
        callback();
    };

    this.listarUsuarios = function (callback) {
        let usuarios = this.usuarios;
        callback(undefined, Object.keys(usuarios).map(function (email) { return Object.assign({}, usuarios[email]); }));
    };

    this.cerrar = function () {};
}

module.exports.CADMemoria = CADMemoria;
