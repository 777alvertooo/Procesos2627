const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");

describe("usuarioActivo", function () {
    let sistema;

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria() });
    });

    it("devuelve cierto si el usuario existe", function (done) {
        sistema.agregarUsuario({ email: "pepe@test.com" }, function () {
            sistema.usuarioActivo("pepe@test.com", function (res) {
                expect(res.activo).toBe(true);
                done();
            });
        });
    });

    it("devuelve falso si el usuario no existe", function (done) {
        sistema.usuarioActivo("nadie@test.com", function (res) {
            expect(res.activo).toBe(false);
            done();
        });
    });
});
