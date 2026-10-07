const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { TipoError } = require("../logica/enums/TipoError.js");

describe("obtenerUsuario", function () {
    let sistema;

    beforeEach(function (done) {
        sistema = new Sistema({ cad: new CADMemoria(), rondasHash: 4 });
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            done();
        });
    });

    it("devuelve los datos públicos de un usuario activo", function (done) {
        sistema.obtenerUsuario("pepe@test.com", function (res) {
            expect(res.email).toEqual("pepe@test.com");
            expect(res.clave).toBeUndefined();
            done();
        });
    });

    it("da error si el usuario no existe", function (done) {
        sistema.obtenerUsuario("nadie@test.com", function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("da error si el usuario ha sido eliminado", function (done) {
        sistema.eliminarUsuario("pepe@test.com", function () {
            sistema.obtenerUsuario("pepe@test.com", function (res) {
                expect(res.tipo).toEqual(TipoError.CREDENCIALES);
                done();
            });
        });
    });
});
