const { RutaVista } = require("../../cliente/presentacion/utilidades/RutaVista.js");

describe("RutaVista", function () {
    it("construye el hash de una ficha", function () {
        expect(RutaVista.hashFicha("stranger-things")).toEqual("#pelicula/stranger-things");
        expect(RutaVista.hashFicha("a/b")).toEqual("#pelicula/a%2Fb");
        expect(RutaVista.hashFicha("")).toEqual("");
    });

    it("lee el id de la ficha desde el hash", function () {
        expect(RutaVista.leerFicha("#pelicula/stranger-things")).toEqual("stranger-things");
        expect(RutaVista.leerFicha("pelicula/stranger-things")).toEqual("stranger-things");
        expect(RutaVista.leerFicha("#pelicula/a%2Fb")).toEqual("a/b");
        expect(RutaVista.leerFicha("#inicio")).toEqual(null);
        expect(RutaVista.leerFicha("")).toEqual(null);
        expect(RutaVista.leerFicha(undefined)).toEqual(null);
    });
});
