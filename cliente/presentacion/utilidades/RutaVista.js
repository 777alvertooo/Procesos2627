var RutaVista = {
    hashFicha: function (id) {
        if (!id) return "";
        return "#pelicula/" + encodeURIComponent(String(id));
    },

    leerFicha: function (hash) {
        let valor = String(hash || "");
        if (valor.charAt(0) === "#") valor = valor.slice(1);
        if (!valor) return null;
        let partes = valor.split("/");
        if (partes[0] !== "pelicula" || !partes[1]) return null;
        try {
            return decodeURIComponent(partes[1]);
        } catch (error) {
            return partes[1];
        }
    },

    marcarFicha: function (id) {
        if (typeof window === "undefined" || !window.history || !window.history.replaceState) return;
        let hash = this.hashFicha(id);
        if (!hash) return this.limpiarFicha();
        if (window.location.hash === hash) return;
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search + hash);
    },

    limpiarFicha: function () {
        if (typeof window === "undefined" || !window.history || !window.history.replaceState) return;
        if (!this.leerFicha(window.location.hash)) return;
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
};

if (typeof module !== "undefined" && module.exports) {
    module.exports.RutaVista = RutaVista;
}
