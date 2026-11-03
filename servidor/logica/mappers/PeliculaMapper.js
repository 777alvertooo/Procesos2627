const PeliculaMapper = {
    aPublica: function (pelicula) {
        return {
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
            trailerEmbed: "https://www.youtube.com/embed/" + pelicula.trailerId
        };
    }
};

module.exports.PeliculaMapper = PeliculaMapper;
