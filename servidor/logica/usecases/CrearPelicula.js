const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { prepararPelicula, slugDe } = require("../servicios/DatosPelicula.js");

function CrearPelicula(cad, autorizacion, log) {
    this.ejecutar = function (solicitante, datos, callback) {
        let denegado = exigirSesion(solicitante) || autorizacion.exigirAdmin(solicitante, "crear una película");
        if (denegado) return callback(denegado);
        let preparado = prepararPelicula(datos);
        if (preparado.error) return callback(preparado.error);
        let pelicula = preparado.pelicula;
        ocuparId(cad, slugDe(pelicula.titulo), 1, function (err, id) {
            if (err) return callback(ErrorSistema.interno(err));
            cad.listarPeliculas(function (err, lista) {
                if (err) return callback(ErrorSistema.interno(err));
                let orden = 1;
                lista.forEach(function (existente) {
                    if (existente.orden >= orden) orden = existente.orden + 1;
                });
                pelicula.id = id;
                pelicula.orden = orden;
                cad.insertarPelicula(pelicula, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    if (log) log.info("Película creada por " + solicitante.email + ": " + id);
                    callback({ ok: true, id: id });
                });
            });
        });
    };
}

function ocuparId(cad, base, intento, callback) {
    let id = intento === 1 ? base : base + "-" + intento;
    cad.buscarPelicula(id, function (err, existente) {
        if (err) return callback(err);
        if (!existente) return callback(undefined, id);
        if (intento >= 30) return callback(undefined, base + "-" + Date.now().toString(36));
        ocuparId(cad, base, intento + 1, callback);
    });
}

module.exports.CrearPelicula = CrearPelicula;
