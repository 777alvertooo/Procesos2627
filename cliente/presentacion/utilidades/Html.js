const Html = {
    escapar: function (texto) {
        return $("<div>").text(texto === undefined || texto === null ? "" : String(texto)).html();
    }
};
