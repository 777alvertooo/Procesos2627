const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");

describe("numeroUsuarios", function () {
    let sistema;

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria(), rondasHash: 4 });
    });

    it("inicialmente no hay usuarios", function (done) {
        sistema.numeroUsuarios(function (res) {
            expect(res.num).toEqual(0);
            done();
        });
    });

    it("cuenta los usuarios registrados", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.registrarUsuario({ email: "luis@test.com", password: "clave5678" }, function () {
                sistema.numeroUsuarios(function (res) {
                    expect(res.num).toEqual(2);
                    done();
                });
            });
        });
    });
});
