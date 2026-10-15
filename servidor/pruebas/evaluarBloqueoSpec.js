const { EvaluadorBloqueo } = require("../logica/servicios/EvaluadorBloqueo.js");

describe("EvaluadorBloqueo", function () {
    let evaluador;

    beforeEach(function () {
        evaluador = new EvaluadorBloqueo();
    });

    it("variante4: bloquea con 5 fallos en menos de 15 minutos", function () {
        let res = evaluador.evaluar([
            "2026-03-02T10:04:00Z",
            "2026-03-02T10:00:00Z",
            "2026-03-02T10:01:00Z",
            "2026-03-02T10:03:00Z",
            "2026-03-02T10:02:00Z"
        ], "2026-03-02T10:10:00Z");

        expect(res.bloqueado).toBe(true);
        expect(res.hasta).toEqual("2026-03-02T10:19:00Z");
    });

    it("variante4: rechaza una fecha no válida", function () {
        expect(function () {
            evaluador.evaluar(["2026-03-02T10:00:00Z"], "no-es-una-fecha");
        }).toThrow();
    });

    it("variante4: no bloquea si hay menos de 5 fallos", function () {
        let res = evaluador.evaluar([
            "2026-03-02T10:00:00Z",
            "2026-03-02T10:01:00Z",
            "2026-03-02T10:02:00Z",
            "2026-03-02T10:03:00Z"
        ], "2026-03-02T10:10:00Z");

        expect(res.bloqueado).toBe(false);
        expect(res.hasta).toBe(null);
    });

    it("variante4: no bloquea si el bloqueo ya ha expirado", function () {
        let res = evaluador.evaluar([
            "2026-03-02T10:00:00Z",
            "2026-03-02T10:01:00Z",
            "2026-03-02T10:02:00Z",
            "2026-03-02T10:03:00Z",
            "2026-03-02T10:04:00Z"
        ], "2026-03-02T10:20:00Z");

        expect(res.bloqueado).toBe(false);
        expect(res.hasta).toBe(null);
    });
});
