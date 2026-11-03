const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { PeliculaMapper } = require("../mappers/PeliculaMapper.js");

function ListarPendientes(cad) {
    this.ejecutar = function (solicitante, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        cad.listarPendientes(solicitante.email, function (err, marcas) {
            if (err) return callback(ErrorSistema.interno(err));
            cad.listarPeliculas(function (err, peliculas) {
                if (err) return callback(ErrorSistema.interno(err));
                cad.listarValoracionesUsuario(solicitante.email, function (err, valoraciones) {
                    if (err) return callback(ErrorSistema.interno(err));
                    let porId = {};
                    peliculas.forEach(function (pelicula) { porId[pelicula.id] = pelicula; });
                    let vistas = {};
                    valoraciones.forEach(function (valoracion) { vistas[valoracion.peliculaId] = true; });
                    let pendientes = [];
                    marcas.forEach(function (marca) {
                        let pelicula = porId[marca.peliculaId];
                        if (!pelicula || vistas[pelicula.id]) return;
                        let publica = PeliculaMapper.aPublica(pelicula);
                        publica.yaValorada = false;
                        pendientes.push(publica);
                    });
                    callback({ pendientes: pendientes });
                });
            });
        });
    };
}

module.exports.ListarPendientes = ListarPendientes;
