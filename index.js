const express = require("express");
const { Sistema } = require("./servidor/logica/modelo.js");
const { CADMemoria } = require("./servidor/datos/cadMemoria.js");
const { Rutas } = require("./servidor/presentacion/Rutas.js");
const { SesionMiddleware } = require("./servidor/presentacion/middlewares/SesionMiddleware.js");

const PORT = process.env.PORT || 3000;

const app = express();
app.set("trust proxy", 1);
app.use("/cliente", express.static(__dirname + "/cliente"));
app.use(new SesionMiddleware().manejar);

let sistema = new Sistema({ cad: new CADMemoria() });
app.use(new Rutas(sistema).router);

app.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log("Ctrl+C para salir");
});
