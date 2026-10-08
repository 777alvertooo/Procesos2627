const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { TipoError } = require("../logica/enums/TipoError.js");

describe("eliminarUsuario", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria(), rondasHash: 4 });
    });

    it("elimina un usuario y deja de estar activo", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.eliminarUsuario(admin, "pepe@test.com", function (res) {
                expect(res.email).toEqual("pepe@test.com");
                sistema.usuarioActivo(admin, "pepe@test.com", function (res) {
                    expect(res.activo).toBe(false);
                    done();
                });
            });
        });
    });

    it("devuelve error al eliminar un usuario inexistente", function (done) {
        sistema.eliminarUsuario(admin, "nadie@test.com", function (res) {
            expect(res.tipo).toEqual(TipoError.NO_ENCONTRADO);
            done();
        });
    });

    it("no se puede eliminar dos veces el mismo usuario", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.eliminarUsuario(admin, "pepe@test.com", function () {
                sistema.eliminarUsuario(admin, "pepe@test.com", function (res) {
                    expect(res.tipo).toEqual(TipoError.NO_ENCONTRADO);
                    done();
                });
            });
        });
    });
});
