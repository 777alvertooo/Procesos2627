function ListaPendientes(selector) {
    this.mostrar = function (pendientes, alPuntuar, alQuitar) {
        let cadena = '<div class="lista-pendientes">';
        cadena = cadena + '<h1 class="titulo-vista">Pendientes de ver</h1>';
        if (!pendientes.length) {
            cadena = cadena + '<p class="texto-vista">Todavía no tienes títulos en la lista. Márcalos con el marcador del cartel.</p>';
            cadena = cadena + "</div>";
            $(selector).html(cadena);
            return;
        }
        cadena = cadena + '<div class="rejilla-pendientes">';
        pendientes.forEach(function (pelicula) {
            cadena = cadena + '<article class="tarjeta-pendiente">';
            cadena = cadena + '<img src="' + Html.escapar(pelicula.cartel) + '" alt="Cartel de ' + Html.escapar(pelicula.titulo) + '">';
            cadena = cadena + "<div>";
            cadena = cadena + "<h2>" + Html.escapar(pelicula.titulo) + "</h2>";
            cadena = cadena + '<p class="donde-ver">' + Html.escapar(pelicula.dondeVer) + "</p>";
            cadena = cadena + '<div class="acciones-pendiente">';
            cadena = cadena + '<button type="button" class="btn btn-oliva btn-sm btn-puntuar" data-id="' + Html.escapar(pelicula.id) + '">Puntuar</button>';
            cadena = cadena + '<button type="button" class="btn-papelera" data-id="' + Html.escapar(pelicula.id) + '" aria-label="Quitar de la lista">';
            cadena = cadena + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h5v2H4V5h4l1-2zm-1 6h2v10H8V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9zM7 21h10l1-12H6l1 12z"></path></svg>';
            cadena = cadena + "</button></div></div></article>";
        });
        cadena = cadena + "</div></div>";
        $(selector).html(cadena);
        $(".btn-puntuar").on("click", function () { alPuntuar($(this).attr("data-id")); });
        $(".btn-papelera").on("click", function () { alQuitar($(this).attr("data-id")); });
    };
}
