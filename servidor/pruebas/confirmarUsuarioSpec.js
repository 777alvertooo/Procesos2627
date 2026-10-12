const { TipoError } = require("../logica/enums/TipoError.js");
const { EstadoUsuario } = require("../logica/enums/EstadoUsuario.js");
const { crearSistemaPrueba } = require("./ayudas.js");

describe("confirmarUsuario", function () {
    let sistema, cad;

    beforeEach(function (done) {
        sistema = crearSistemaPrueba();
        cad = sistema._cadPrueba;
        sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            done();
        });
    });

    it("activa la cuenta con el token del email", function (done) {
        let token = cad.usuarios["pepe@test.com"].tokenConfirmacion;
        sistema.confirmarUsuario(token, function (res) {
            expect(res.error).toBeUndefined();
            expect(res.email).toEqual("pepe@test.com");
            expect(res.estado).toEqual(EstadoUsuario.ACTIVO);
            expect(cad.usuarios["pepe@test.com"].tokenConfirmacion).toBeUndefined();
            sistema.iniciarSesion("pepe@test.com", "clave1234", function (login) {
                expect(login.error).toBeUndefined();
                done();
            });
        });
    });

    it("rechaza un token inexistente", function (done) {
        sistema.confirmarUsuario("token-falso", function (res) {
            expect(res.tipo).toEqual(TipoError.NO_ENCONTRADO);
            done();
        });
    });
});
