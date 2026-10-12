const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("eliminarUsuario", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = crearSistemaPrueba();
    });

    it("elimina un usuario y deja de estar activo", function (done) {
        registrarYConfirmar(sistema, { email: "pepe@test.com", password: "clave1234" }, function () {
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
        registrarYConfirmar(sistema, { email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.eliminarUsuario(admin, "pepe@test.com", function () {
                sistema.eliminarUsuario(admin, "pepe@test.com", function (res) {
                    expect(res.tipo).toEqual(TipoError.NO_ENCONTRADO);
                    done();
                });
            });
        });
    });
});
