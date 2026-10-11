require("dotenv").config({ quiet: true });
const express = require("express");
const { MongoStore } = require("connect-mongo");
const { Sistema } = require("./servidor/logica/modelo.js");
const { CAD } = require("./servidor/datos/cad.js");
const { CADMemoria } = require("./servidor/datos/cadMemoria.js");
const { Rutas } = require("./servidor/presentacion/Rutas.js");
const { SesionMiddleware } = require("./servidor/presentacion/middlewares/SesionMiddleware.js");
const { Log } = require("./servidor/log/Log.js");
const { ServicioCorreo } = require("./servidor/logica/servicios/ServicioCorreo.js");
const { ClienteGoogle } = require("./servidor/logica/servicios/ClienteGoogle.js");

const PORT = process.env.PORT || 3000;
const NOMBRE_BD = process.env.MONGO_DB || "procesos2627";
const URL_BASE = (process.env.URL_BASE || ("http://localhost:" + PORT)).replace(/\/$/, "");

const log = new Log(process.env.LOG_FICHERO || "logs/actividad.log");
const cad = process.env.MONGO_URI ? new CAD() : new CADMemoria();
const servicioCorreo = new ServicioCorreo({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM
});
const clienteGoogle = new ClienteGoogle({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    urlBase: URL_BASE
});

const app = express();
app.set("trust proxy", 1);
app.use("/cliente", express.static(__dirname + "/cliente"));

if (!process.env.MONGO_URI) {
    log.aviso("MONGO_URI no definida, se usan datos en memoria (no persisten tras reiniciar)");
}
if (!process.env.SMTP_HOST) {
    log.aviso("SMTP no configurado: el registro local no podrá enviar el email de confirmación");
}
if (!clienteGoogle.estaConfigurado()) {
    log.aviso("Google OAuth no configurado: faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET");
}

cad.conectar(process.env.MONGO_URI, NOMBRE_BD, function (err) {
    if (err) {
        log.error("No se pudo conectar a MongoDB: " + err.message);
        process.exit(1);
    }
    if (process.env.MONGO_URI) log.info("Conectado a MongoDB");

    let store = cad.cliente
        ? MongoStore.create({ client: cad.cliente, dbName: NOMBRE_BD })
        : undefined;
    app.use(new SesionMiddleware({ store: store, log: log }).manejar);

    let sistema = new Sistema({
        cad: cad,
        log: log,
        emailsAdmin: (process.env.ADMIN_EMAIL || "").split(","),
        servicioCorreo: servicioCorreo,
        urlBase: URL_BASE
    });
    app.use(new Rutas(sistema, log, clienteGoogle).router);

    app.listen(PORT, () => {
        log.info("App está escuchando en el puerto " + PORT);
        console.log("Ctrl+C para salir");
    });
});
