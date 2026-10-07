const bcrypt = require("bcryptjs");

function ServicioHash(rondas) {
    let rondasHash = rondas || 10;

    this.cifrar = function (clave, callback) {
        bcrypt.hash(clave, rondasHash, callback);
    };

    this.comparar = function (clave, hash, callback) {
        bcrypt.compare(clave, hash, callback);
    };
}

module.exports.ServicioHash = ServicioHash;
