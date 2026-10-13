const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");
const { MENSAJE_OK } = require("../logica/usecases/SolicitarRestablecerClave.js");

describe("restablecerClave", function () {
    let sistema, cad, correo;

    beforeEach(function (done) {
        sistema = crearSistemaPrueba();
        cad = sistema._cadPrueba;
        correo = sistema._correoPrueba;
        registrarYConfirmar(sistema, { email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            done();
        });
    });

    it("envía un email con el enlace de restablecimiento", function (done) {
        sistema.solicitarRestablecerClave("pepe@test.com", function (res) {
            expect(res.mensaje).toEqual(MENSAJE_OK);
            expect(correo.enviados.length).toEqual(2);
            expect(cad.usuarios["pepe@test.com"].tokenRestablecer).toBeDefined();
            done();
        });
    });

    it("rechaza un email que no está registrado", function (done) {
        sistema.solicitarRestablecerClave("nadie@test.com", function (res) {
            expect(res.tipo).toEqual(TipoError.NO_ENCONTRADO);
            expect(correo.enviados.length).toEqual(1);
            done();
        });
    });

    it("rechaza una cuenta que solo usa Google", function (done) {
        sistema.autenticarGoogle({ email: "pepe@gmail.com", nick: "Pepe" }, function () {
            sistema.solicitarRestablecerClave("pepe@gmail.com", function (res) {
                expect(res.tipo).toEqual(TipoError.PROHIBIDO);
                done();
            });
        });
    });

    it("cambia la contraseña con un token válido", function (done) {
        sistema.solicitarRestablecerClave("pepe@test.com", function () {
            let token = cad.usuarios["pepe@test.com"].tokenRestablecer;
            sistema.restablecerClave({
                token: token,
                password: "nuevaClave9",
                confirmarPassword: "nuevaClave9"
            }, function (res) {
                expect(res.error).toBeUndefined();
                expect(cad.usuarios["pepe@test.com"].tokenRestablecer).toBeUndefined();
                sistema.iniciarSesion("pepe@test.com", "nuevaClave9", function (login) {
                    expect(login.error).toBeUndefined();
                    expect(login.email).toEqual("pepe@test.com");
                    done();
                });
            });
        });
    });

    it("rechaza un token inválido", function (done) {
        sistema.restablecerClave({
            token: "token-falso",
            password: "nuevaClave9",
            confirmarPassword: "nuevaClave9"
        }, function (res) {
            expect(res.tipo).toEqual(TipoError.NO_ENCONTRADO);
            done();
        });
    });

    it("rechaza si las contraseñas no coinciden", function (done) {
        sistema.solicitarRestablecerClave("pepe@test.com", function () {
            let token = cad.usuarios["pepe@test.com"].tokenRestablecer;
            sistema.restablecerClave({
                token: token,
                password: "nuevaClave9",
                confirmarPassword: "otraClave9"
            }, function (res) {
                expect(res.tipo).toEqual(TipoError.VALIDACION);
                done();
            });
        });
    });
});
