const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { TipoError } = require("../logica/enums/TipoError.js");
const { RolUsuario } = require("../logica/enums/RolUsuario.js");

describe("roles", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };
    let pepe = { email: "pepe@test.com", rol: "usuario" };

    beforeEach(function (done) {
        sistema = new Sistema({
            cad: new CADMemoria(),
            rondasHash: 4,
            emailsAdmin: ["admin@test.com"]
        });
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.registrarUsuario({ email: "luis@test.com", password: "clave5678" }, function () {
                sistema.registrarUsuario({ email: "admin@test.com", password: "claveAdmin1" }, function () {
                    done();
                });
            });
        });
    });

    it("asigna el rol de administrador al email configurado", function (done) {
        sistema.iniciarSesion("admin@test.com", "claveAdmin1", function (res) {
            expect(res.rol).toEqual(RolUsuario.ADMIN);
            done();
        });
    });

    it("un usuario normal no puede listar ni contar usuarios", function (done) {
        sistema.obtenerUsuarios(pepe, function (res) {
            expect(res.tipo).toEqual(TipoError.PROHIBIDO);
            sistema.numeroUsuarios(pepe, function (res) {
                expect(res.tipo).toEqual(TipoError.PROHIBIDO);
                done();
            });
        });
    });

    it("un usuario normal no puede consultar si otro está activo", function (done) {
        sistema.usuarioActivo(pepe, "luis@test.com", function (res) {
            expect(res.tipo).toEqual(TipoError.PROHIBIDO);
            done();
        });
    });

    it("un usuario normal no puede eliminar a otro", function (done) {
        sistema.eliminarUsuario(pepe, "luis@test.com", function (res) {
            expect(res.tipo).toEqual(TipoError.PROHIBIDO);
            sistema.usuarioActivo(admin, "luis@test.com", function (res) {
                expect(res.activo).toBe(true);
                done();
            });
        });
    });

    it("un usuario normal puede eliminar su propia cuenta", function (done) {
        sistema.eliminarUsuario(pepe, "pepe@test.com", function (res) {
            expect(res.email).toEqual("pepe@test.com");
            sistema.iniciarSesion("pepe@test.com", "clave1234", function (res) {
                expect(res.tipo).toEqual(TipoError.PROHIBIDO);
                done();
            });
        });
    });

    it("el administrador puede eliminar a cualquier usuario", function (done) {
        sistema.eliminarUsuario(admin, "luis@test.com", function (res) {
            expect(res.error).toBeUndefined();
            sistema.usuarioActivo(admin, "luis@test.com", function (res) {
                expect(res.activo).toBe(false);
                done();
            });
        });
    });
});
