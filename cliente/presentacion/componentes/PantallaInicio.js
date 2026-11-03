function PantallaInicio(selector) {
    this.mostrar = function (datos, alAbrir) {
        datos = datos || {};
        let cadena = '<div class="pantalla-inicio">';
        cadena = cadena + '<h1 class="titulo-inicio">Descubre nuevas películas y series</h1>';
        cadena = cadena + seccion("Top 5 películas semanal", datos.peliculas);
        cadena = cadena + seccion("Top 5 series semanal", datos.series);
        cadena = cadena + "</div>";
        $(selector).html(cadena);
        $(selector).find(".top-cartel").on("click", function () {
            alAbrir($(this).attr("data-id"));
        });
    };

    function seccion(titulo, lista) {
        let cadena = '<section class="bloque-top">';
        cadena = cadena + '<h2 class="titulo-top">' + Html.escapar(titulo) + ":</h2>";
        cadena = cadena + '<div class="fila-top">';
        (lista || []).forEach(function (tituloItem) {
            cadena = cadena + '<button type="button" class="top-cartel" data-id="' + Html.escapar(tituloItem.id) + '">';
            cadena = cadena + '<img src="' + Html.escapar(tituloItem.cartel) + '" alt="Cartel de ' + Html.escapar(tituloItem.titulo) + '">';
            cadena = cadena + '<span class="puesto-top">Top ' + tituloItem.puesto + "</span>";
            cadena = cadena + "</button>";
        });
        cadena = cadena + "</div></section>";
        return cadena;
    }
}
