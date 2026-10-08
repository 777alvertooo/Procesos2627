const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");

describe("usuarioActivo", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria(), rondasHash: 4 });
    });

    it("devuelve cierto si el usuario existe", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.usuarioActivo(admin, "pepe@test.com", function (res) {
                expect(res.activo).toBe(true);
                done();
            });
        });
    });

    it("devuelve falso si el usuario no existe", function (done) {
        sistema.usuarioActivo(admin, "nadie@test.com", function (res) {
            expect(res.activo).toBe(false);
            done();
        });
    });
});
