const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");

describe("numeroUsuarios", function () {
    let sistema;

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria() });
    });

    it("inicialmente no hay usuarios", function (done) {
        sistema.numeroUsuarios(function (res) {
            expect(res.num).toEqual(0);
            done();
        });
    });

    it("cuenta los usuarios agregados", function (done) {
        sistema.agregarUsuario({ email: "pepe@test.com" }, function () {
            sistema.agregarUsuario({ email: "luis@test.com" }, function () {
                sistema.numeroUsuarios(function (res) {
                    expect(res.num).toEqual(2);
                    done();
                });
            });
        });
    });
});
