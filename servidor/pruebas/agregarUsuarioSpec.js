const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { TipoError } = require("../logica/enums/TipoError.js");

describe("agregarUsuario", function () {
    let sistema;

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria() });
    });

    it("agrega un usuario nuevo", function (done) {
        sistema.agregarUsuario({ email: "pepe@test.com", nick: "pepe" }, function (res) {
            expect(res.email).toEqual("pepe@test.com");
            sistema.numeroUsuarios(function (res) {
                expect(res.num).toEqual(1);
                done();
            });
        });
    });

    it("rechaza un email ya existente", function (done) {
        sistema.agregarUsuario({ email: "pepe@test.com" }, function () {
            sistema.agregarUsuario({ email: "PEPE@test.com" }, function (res) {
                expect(res.tipo).toEqual(TipoError.CONFLICTO);
                sistema.numeroUsuarios(function (res) {
                    expect(res.num).toEqual(1);
                    done();
                });
            });
        });
    });

    it("rechaza un email no válido", function (done) {
        sistema.agregarUsuario({ email: "noesemail" }, function (res) {
            expect(res.tipo).toEqual(TipoError.VALIDACION);
            done();
        });
    });
});
