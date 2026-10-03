const express = require("express");
const { Sistema } = require("./servidor/logica/modelo.js");
const { CADMemoria } = require("./servidor/datos/cadMemoria.js");
const { Rutas } = require("./servidor/presentacion/Rutas.js");

const PORT = process.env.PORT || 3000;

const app = express();
app.use("/cliente", express.static(__dirname + "/cliente"));

let sistema = new Sistema({ cad: new CADMemoria() });
app.use(new Rutas(sistema).router);

app.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log("Ctrl+C para salir");
});
