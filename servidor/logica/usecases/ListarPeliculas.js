const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { PeliculaMapper } = require("../mappers/PeliculaMapper.js");
const { leerFiltros, aplicarFiltros, opcionesFiltro } = require("../servicios/FiltroCatalogo.js");

function ListarPeliculas(cad) {
    // filtros es opcional: ejecutar(solicitante, callback) sigue funcionando.
    this.ejecutar = function (solicitante, filtros, callback) {
        if (typeof filtros === "function") {
            callback = filtros;
            filtros = undefined;
        }
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        let leidos = leerFiltros(filtros);
        if (leidos.error) return callback(leidos.error);
        cad.listarPeliculas(function (err, peliculas) {
            if (err) return callback(ErrorSistema.interno(err));
            cad.mediasValoracion(function (err, medias) {
                if (err) return callback(ErrorSistema.interno(err));
                let porPelicula = {};
                medias.forEach(function (fila) { porPelicula[fila.peliculaId] = fila; });
                let publicas = peliculas.map(function (pelicula) {
                    return PeliculaMapper.aPublica(pelicula, porPelicula[pelicula.id] || { suma: 0, cuenta: 0 });
                });
                cad.listarPendientes(solicitante.email, function (err, marcas) {
                    if (err) return callback(ErrorSistema.interno(err));
                    cad.listarValoracionesUsuario(solicitante.email, function (err, valoraciones) {
                        if (err) return callback(ErrorSistema.interno(err));
                        let vistas = {};
                        valoraciones.forEach(function (valoracion) { vistas[valoracion.peliculaId] = true; });
                        callback({
                            peliculas: aplicarFiltros(publicas, leidos.filtros),
                            filtros: leidos.filtros,
                            opcionesFiltro: opcionesFiltro(publicas),
                            idsPendientes: marcas.map(function (marca) { return marca.peliculaId; })
                                .filter(function (id) { return !vistas[id]; }),
                            idsVistas: Object.keys(vistas)
                        });
                    });
                });
            });
        });
    };
}

module.exports.ListarPeliculas = ListarPeliculas;
