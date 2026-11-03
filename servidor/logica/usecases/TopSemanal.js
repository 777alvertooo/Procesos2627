const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { PeliculaMapper } = require("../mappers/PeliculaMapper.js");

const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;
const TOP = 5;

function TopSemanal(cad, opciones) {
    opciones = opciones || {};

    this.ejecutar = function (solicitante, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        let ahora = opciones.ahora ? opciones.ahora() : new Date();
        let desde = new Date(ahora.getTime() - SEMANA_MS).toISOString();
        cad.listarPeliculas(function (err, peliculas) {
            if (err) return callback(ErrorSistema.interno(err));
            cad.listarValoracionesDesde(desde, function (err, valoraciones) {
                if (err) return callback(ErrorSistema.interno(err));
                let medias = mediasDe(valoraciones);
                callback({
                    peliculas: elegir(peliculas, medias, "pelicula"),
                    series: elegir(peliculas, medias, "serie")
                });
            });
        });
    };
}

function mediasDe(valoraciones) {
    let acumulado = {};
    (valoraciones || []).forEach(function (valoracion) {
        let puntos = Number(valoracion.puntuacion);
        if (!valoracion.peliculaId || !puntos) return;
        if (!acumulado[valoracion.peliculaId]) acumulado[valoracion.peliculaId] = { suma: 0, cuenta: 0 };
        acumulado[valoracion.peliculaId].suma = acumulado[valoracion.peliculaId].suma + puntos;
        acumulado[valoracion.peliculaId].cuenta = acumulado[valoracion.peliculaId].cuenta + 1;
    });
    let medias = {};
    Object.keys(acumulado).forEach(function (id) {
        medias[id] = {
            media: acumulado[id].suma / acumulado[id].cuenta,
            cuenta: acumulado[id].cuenta
        };
    });
    return medias;
}

function elegir(peliculas, medias, medio) {
    let lista = (peliculas || []).filter(function (pelicula) {
        let esSerie = pelicula.medio === "serie";
        return medio === "serie" ? esSerie : !esSerie;
    });
    lista.sort(function (a, b) {
        let ma = medias[a.id];
        let mb = medias[b.id];
        if (!!ma !== !!mb) return ma ? -1 : 1;
        if (ma && mb) {
            if (mb.media !== ma.media) return mb.media - ma.media;
            if (mb.cuenta !== ma.cuenta) return mb.cuenta - ma.cuenta;
        }
        return (a.orden || 0) - (b.orden || 0);
    });
    return lista.slice(0, TOP).map(function (pelicula, indice) {
        let publica = PeliculaMapper.aPublica(pelicula);
        publica.puesto = indice + 1;
        return publica;
    });
}

module.exports.TopSemanal = TopSemanal;
