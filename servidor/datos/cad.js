const { MongoClient } = require("mongodb");

function CAD() {
    this.cliente = undefined;
    this.usuarios = undefined;

    this.conectar = function (uri, nombreBD, callback) {
        let cad = this;
        this.cliente = new MongoClient(uri);
        this.cliente.connect()
            .then(function () {
                cad.usuarios = cad.cliente.db(nombreBD).collection("usuarios");
                return cad.usuarios.createIndex({ email: 1 }, { unique: true });
            })
            .then(function () { callback(); })
            .catch(callback);
    };

    this.buscarUsuario = function (criterio, callback) {
        this.usuarios.findOne(criterio, { projection: { _id: 0 } })
            .then(function (usuario) { callback(undefined, usuario || undefined); })
            .catch(callback);
    };

    this.insertarUsuario = function (usuario, callback) {
        this.usuarios.insertOne(limpiar(usuario))
            .then(function () { callback(); })
            .catch(callback);
    };

    this.actualizarUsuario = function (usuario, callback) {
        this.usuarios.replaceOne({ email: usuario.email }, limpiar(usuario))
            .then(function () { callback(); })
            .catch(callback);
    };

    this.listarUsuarios = function (callback) {
        this.usuarios.find({}, { projection: { _id: 0 } }).sort({ fechaAlta: 1 }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.cerrar = function () {
        if (this.cliente) return this.cliente.close();
    };
}

function limpiar(usuario) {
    let copia = {};
    Object.keys(usuario).forEach(function (clave) {
        if (usuario[clave] !== undefined && clave !== "_id" && typeof usuario[clave] !== "function") {
            copia[clave] = usuario[clave];
        }
    });
    return copia;
}

module.exports.CAD = CAD;
