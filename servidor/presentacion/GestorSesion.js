const { SesionMiddleware } = require("./middlewares/SesionMiddleware.js");

const GestorSesion = {
    abrir: function (request, email, callback) {
        request.session.regenerate(function (err) {
            if (err) return callback(err);
            request.session.email = email;
            request.session.save(callback);
        });
    },
    cerrar: function (request, response, callback) {
        request.session.destroy(function () {
            response.clearCookie(SesionMiddleware.NOMBRE_COOKIE);
            callback();
        });
    },
    emailActual: function (request) {
        return request.session ? request.session.email : undefined;
    }
};

module.exports.GestorSesion = GestorSesion;
