function ClienteRest() {
    this.peticion = function (tipo, url, datos, exito, fallo) {
        $.ajax({
            type: tipo,
            url: url,
            data: datos ? JSON.stringify(datos) : undefined,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                if (exito) exito(data);
            },
            error: function (xhr) {
                let mensaje = xhr.responseJSON && xhr.responseJSON.error
                    ? xhr.responseJSON.error
                    : "No se pudo conectar con el servidor";
                console.log("Error " + xhr.status + " en " + url + ": " + mensaje);
                if (fallo) fallo(mensaje, xhr.status);
            }
        });
    };

    this.registrarUsuario = function (nick, email, password, exito, fallo) {
        this.peticion("POST", "/registrarUsuario", { nick: nick, email: email, password: password }, exito, fallo);
    };

    this.iniciarSesion = function (email, password, exito, fallo) {
        this.peticion("POST", "/iniciarSesion", { email: email, password: password }, exito, fallo);
    };

    this.usuarioSesion = function (exito, fallo) {
        this.peticion("GET", "/usuarioSesion", undefined, function (data) {
            exito(data.usuario);
        }, fallo);
    };

    this.cerrarSesion = function (exito, fallo) {
        this.peticion("POST", "/cerrarSesion", undefined, exito, fallo);
    };

    this.obtenerUsuarios = function (exito, fallo) {
        this.peticion("GET", "/obtenerUsuarios", undefined, function (data) {
            exito(data.usuarios);
        }, fallo);
    };

    this.numeroUsuarios = function (exito, fallo) {
        this.peticion("GET", "/numeroUsuarios", undefined, function (data) {
            exito(data.num);
        }, fallo);
    };

    this.usuarioActivo = function (email, exito, fallo) {
        this.peticion("GET", "/usuarioActivo/" + encodeURIComponent(email), undefined, exito, fallo);
    };

    this.eliminarUsuario = function (email, exito, fallo) {
        this.peticion("DELETE", "/eliminarUsuario/" + encodeURIComponent(email), undefined, exito, fallo);
    };
}
