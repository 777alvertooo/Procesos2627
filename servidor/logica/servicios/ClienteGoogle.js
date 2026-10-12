function ClienteGoogle(opciones) {
    opciones = opciones || {};
    let clientId = opciones.clientId;
    let clientSecret = opciones.clientSecret;
    let urlBase = (opciones.urlBase || "http://localhost:3000").replace(/\/$/, "");
    let redirectUri = urlBase + "/auth/google/callback";

    this.estaConfigurado = function () {
        return !!(clientId && clientSecret);
    };

    this.urlAutorizacion = function () {
        let params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "online",
            prompt: "select_account"
        });
        return "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
    };

    this.obtenerPerfil = function (codigo, callback) {
        if (!codigo) {
            return callback(new Error("Falta el código de autorización de Google"));
        }
        let cuerpo = new URLSearchParams({
            code: codigo,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
        });
        fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: cuerpo.toString()
        }).then(function (respuesta) {
            return respuesta.json().then(function (datos) {
                if (!respuesta.ok || !datos.access_token) {
                    throw new Error(datos.error_description || datos.error || "No se pudo obtener el token de Google");
                }
                return datos.access_token;
            });
        }).then(function (accessToken) {
            return fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: "Bearer " + accessToken }
            }).then(function (respuesta) {
                return respuesta.json().then(function (perfil) {
                    if (!respuesta.ok || !perfil.email) {
                        throw new Error(perfil.error || "No se pudo obtener el perfil de Google");
                    }
                    return {
                        email: perfil.email,
                        nick: perfil.name || perfil.given_name || perfil.email.split("@")[0]
                    };
                });
            });
        }).then(function (perfil) {
            callback(undefined, perfil);
        }).catch(function (err) {
            callback(err);
        });
    };
}

module.exports.ClienteGoogle = ClienteGoogle;
