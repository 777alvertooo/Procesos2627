const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("obtenerUsuario", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function (done) {
        sistema = crearSistemaPrueba();
        registrarYConfirmar(sistema, { email: "pepe@test.com", password: "clave1234" }, function () {
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
        sistema.eliminarUsuario(admin, "pepe@test.com", function () {
            sistema.obtenerUsuario("pepe@test.com", function (res) {
                expect(res.tipo).toEqual(TipoError.CREDENCIALES);
                done();
            });
        });
    });

    it("da error si el usuario aún no ha confirmado el email", function (done) {
        sistema.registrarUsuario({ email: "nuevo@test.com", password: "clave1234" }, function () {
            sistema.obtenerUsuario("nuevo@test.com", function (res) {
                expect(res.tipo).toEqual(TipoError.CREDENCIALES);
                done();
            });
        });
    });
});
