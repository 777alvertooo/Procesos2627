const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { PeliculaMapper } = require("../mappers/PeliculaMapper.js");

function ListarPeliculas(cad) {
    this.ejecutar = function (solicitante, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        cad.listarPeliculas(function (err, peliculas) {
            if (err) return callback(ErrorSistema.interno(err));
            cad.listarPendientes(solicitante.email, function (err, marcas) {
                if (err) return callback(ErrorSistema.interno(err));
                cad.listarValoracionesUsuario(solicitante.email, function (err, valoraciones) {
                    if (err) return callback(ErrorSistema.interno(err));
                    let vistas = {};
                    valoraciones.forEach(function (valoracion) { vistas[valoracion.peliculaId] = true; });
                    callback({
                        peliculas: peliculas.map(PeliculaMapper.aPublica),
                        idsPendientes: marcas.map(function (marca) { return marca.peliculaId; })
                            .filter(function (id) { return !vistas[id]; }),
                        idsVistas: Object.keys(vistas)
                    });
                });
            });
        });
    };
}

module.exports.ListarPeliculas = ListarPeliculas;
