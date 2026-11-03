const { MongoClient } = require("mongodb");
const { CATALOGO_PELICULAS } = require("./catalogoPeliculas.js");
const { CATALOGO_SERIES } = require("./catalogoSeries.js");
const { CATALOGO_PELICULAS_EXTRA, CATALOGO_SERIES_EXTRA } = require("./catalogoAmpliacion.js");

function CAD() {
    this.cliente = undefined;
    this.usuarios = undefined;
    this.peliculas = undefined;
    this.pendientes = undefined;
    this.valoraciones = undefined;
    this.respuestas = undefined;
    this.reacciones = undefined;

    this.conectar = function (uri, nombreBD, callback) {
        let cad = this;
        this.cliente = new MongoClient(uri);
        this.cliente.connect()
            .then(function () {
                let db = cad.cliente.db(nombreBD);
                cad.usuarios = db.collection("usuarios");
                cad.peliculas = db.collection("peliculas");
                cad.pendientes = db.collection("pendientes");
                cad.valoraciones = db.collection("valoraciones");
                cad.respuestas = db.collection("respuestas");
                cad.reacciones = db.collection("reacciones");
                return cad.usuarios.createIndex({ email: 1 }, { unique: true });
            })
            .then(function () { return cad.peliculas.createIndex({ id: 1 }, { unique: true }); })
            .then(function () { return cad.pendientes.createIndex({ email: 1, peliculaId: 1 }, { unique: true }); })
            .then(function () { return cad.valoraciones.createIndex({ id: 1 }, { unique: true }); })
            .then(function () {
                return cad.valoraciones.dropIndex("email_1_peliculaId_1").catch(function () {});
            })
            .then(function () { return cad.valoraciones.createIndex({ email: 1, peliculaId: 1 }); })
            .then(function () { return sembrarPeliculas(cad.peliculas); })
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

    this.actualizarUsuario = function (usuario, callback, emailAnterior) {
        let filtro = { email: emailAnterior || usuario.email };
        this.usuarios.replaceOne(filtro, limpiar(usuario))
            .then(function () { callback(); })
            .catch(callback);
    };

    this.listarUsuarios = function (callback) {
        this.usuarios.find({}, { projection: { _id: 0 } }).sort({ fechaAlta: 1 }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.listarPeliculas = function (callback) {
        this.peliculas.find({}, { projection: { _id: 0 } }).sort({ orden: 1 }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.buscarPelicula = function (id, callback) {
        this.peliculas.findOne({ id: id }, { projection: { _id: 0 } })
            .then(function (pelicula) { callback(undefined, pelicula || undefined); })
            .catch(callback);
    };

    this.insertarPelicula = function (pelicula, callback) {
        this.peliculas.insertOne(limpiar(pelicula))
            .then(function () { callback(); })
            .catch(callback);
    };

    this.actualizarPelicula = function (pelicula, callback) {
        let datos = limpiar(pelicula);
        delete datos.id;
        delete datos.orden;
        this.peliculas.updateOne({ id: pelicula.id }, { $set: datos })
            .then(function (resultado) {
                if (!resultado.matchedCount) return callback(new Error("Película ausente"));
                callback();
            })
            .catch(callback);
    };

    this.eliminarPelicula = function (id, callback) {
        let cad = this;
        this.valoraciones.find({ peliculaId: id }, { projection: { _id: 0, id: 1 } }).toArray()
            .then(function (valoraciones) {
                let idsValoracion = valoraciones.map(function (valoracion) { return valoracion.id; });
                return cad.respuestas.find({ valoracionId: { $in: idsValoracion } }, { projection: { _id: 0, id: 1 } }).toArray()
                    .then(function (respuestas) {
                        let idsComentario = idsValoracion.concat(respuestas.map(function (respuesta) { return respuesta.id; }));
                        return cad.reacciones.deleteMany({ comentarioId: { $in: idsComentario } });
                    })
                    .then(function () { return cad.respuestas.deleteMany({ valoracionId: { $in: idsValoracion } }); })
                    .then(function () { return cad.valoraciones.deleteMany({ peliculaId: id }); })
                    .then(function () { return cad.pendientes.deleteMany({ peliculaId: id }); })
                    .then(function () { return cad.peliculas.deleteOne({ id: id }); });
            })
            .then(function () { callback(); })
            .catch(callback);
    };

    this.listarPendientes = function (email, callback) {
        this.pendientes.find({ email: email }, { projection: { _id: 0 } }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.anadirPendiente = function (email, peliculaId, callback) {
        this.pendientes.updateOne(
            { email: email, peliculaId: peliculaId },
            { $set: { email: email, peliculaId: peliculaId } },
            { upsert: true }
        ).then(function () { callback(); }).catch(callback);
    };

    this.quitarPendiente = function (email, peliculaId, callback) {
        this.pendientes.deleteOne({ email: email, peliculaId: peliculaId })
            .then(function (resultado) { callback(undefined, resultado.deletedCount > 0); })
            .catch(callback);
    };

    this.buscarValoracion = function (email, peliculaId, callback) {
        this.valoraciones.findOne({ email: email, peliculaId: peliculaId }, { projection: { _id: 0 } })
            .then(function (valoracion) { callback(undefined, valoracion || undefined); })
            .catch(callback);
    };

    this.buscarValoracionPorId = function (id, callback) {
        this.valoraciones.findOne({ id: id }, { projection: { _id: 0 } })
            .then(function (valoracion) { callback(undefined, valoracion || undefined); })
            .catch(callback);
    };

    this.insertarValoracion = function (valoracion, callback) {
        this.valoraciones.insertOne(limpiar(valoracion))
            .then(function () { callback(); })
            .catch(callback);
    };

    this.listarValoraciones = function (peliculaId, callback) {
        this.valoraciones.find({ peliculaId: peliculaId }, { projection: { _id: 0 } }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.listarValoracionesUsuario = function (email, callback) {
        this.valoraciones.find({ email: email }, { projection: { _id: 0 } }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.insertarRespuesta = function (respuesta, callback) {
        this.respuestas.insertOne(limpiar(respuesta))
            .then(function () { callback(); })
            .catch(callback);
    };

    this.buscarRespuestaPorId = function (id, callback) {
        this.respuestas.findOne({ id: id }, { projection: { _id: 0 } })
            .then(function (respuesta) { callback(undefined, respuesta || undefined); })
            .catch(callback);
    };

    this.listarRespuestas = function (valoracionIds, callback) {
        this.respuestas.find({ valoracionId: { $in: valoracionIds } }, { projection: { _id: 0 } }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.buscarReaccion = function (comentarioId, email, callback) {
        this.reacciones.findOne({ comentarioId: comentarioId, email: email }, { projection: { _id: 0 } })
            .then(function (reaccion) { callback(undefined, reaccion || undefined); })
            .catch(callback);
    };

    this.guardarReaccion = function (comentarioId, email, tipo, callback) {
        let filtro = { comentarioId: comentarioId, email: email };
        let accion = tipo
            ? this.reacciones.updateOne(filtro, { $set: { comentarioId: comentarioId, email: email, tipo: tipo } }, { upsert: true })
            : this.reacciones.deleteOne(filtro);
        accion.then(function () { callback(); }).catch(callback);
    };

    this.listarReacciones = function (comentarioIds, callback) {
        this.reacciones.find({ comentarioId: { $in: comentarioIds } }, { projection: { _id: 0 } }).toArray()
            .then(function (lista) { callback(undefined, lista); })
            .catch(callback);
    };

    this.cerrar = function () {
        if (this.cliente) return this.cliente.close();
    };
}

function sembrarPeliculas(coleccion) {
    let cadena = Promise.resolve();
    CATALOGO_PELICULAS.concat(CATALOGO_SERIES, CATALOGO_PELICULAS_EXTRA, CATALOGO_SERIES_EXTRA).forEach(function (pelicula) {
        cadena = cadena.then(function () {
            let copia = Object.assign({}, pelicula);
            copia.cines = (pelicula.cines || []).slice();
            let sinopsis = copia.sinopsis;
            let temporadas = (copia.temporadas || []).map(function (temporada) {
                return { numero: temporada.numero, capitulos: temporada.capitulos };
            });
            delete copia.sinopsis;
            delete copia.temporadas;
            let cambios = { sinopsis: sinopsis };
            if (copia.medio === "serie") cambios.temporadas = temporadas;
            return coleccion.updateOne(
                { id: copia.id },
                { $setOnInsert: copia, $set: cambios },
                { upsert: true }
            );
        });
    });
    return cadena;
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
