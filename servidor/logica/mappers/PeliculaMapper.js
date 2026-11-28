const PeliculaMapper = {
    aPublica: function (pelicula, media) {
        // media (opcional): { suma, cuenta } de las valoraciones del título.
        // Solo el catálogo la pasa; el resto de vistas no añade la valoración.
        let publica = {
            id: pelicula.id,
            titulo: pelicula.titulo,
            sinopsis: pelicula.sinopsis,
            cartel: pelicula.cartel,
            dondeVer: pelicula.dondeVer,
            cines: (pelicula.cines || []).slice(),
            tipo: pelicula.tipo,
            medio: pelicula.medio === "serie" ? "serie" : "pelicula",
            temporadas: (pelicula.temporadas || []).map(function (temporada) {
                return { numero: temporada.numero, capitulos: temporada.capitulos };
            }),
            trailerUrl: "https://www.youtube.com/watch?v=" + pelicula.trailerId,
            trailerEmbed: "https://www.youtube.com/embed/" + pelicula.trailerId,
            generos: (pelicula.generos || []).slice()
        };
        if (media) {
            publica.valoracionMedia = media.cuenta ? Math.round((media.suma / media.cuenta) * 10) / 10 : null;
            publica.numValoraciones = media.cuenta || 0;
        }
        return publica;
    }
};

module.exports.PeliculaMapper = PeliculaMapper;
