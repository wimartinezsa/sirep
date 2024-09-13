const express = require('express');
const ruta_puntoventa = express.Router();
const controlador_puntoventa = require("../controllers/controller.puntoventa");
let auth = require('../middlewares/middleware.auth');

ruta_puntoventa.get("/punto-venta", auth.authRoute, controlador_puntoventa.Vista);
ruta_puntoventa.post("/Registrar_PuntoVenta", auth.authToken, auth.isAdmin, controlador_puntoventa.RegistrarPunto);
ruta_puntoventa.get("/Lista_Punto_Venta", auth.authToken, auth.isAdmin, controlador_puntoventa.ListaPuntoventa);
ruta_puntoventa.get("/ListarEncargadoPV", auth.authToken, auth.isAdmin, controlador_puntoventa.ListarEncargadoPV);
ruta_puntoventa.post("/Buscar_punvnt", auth.authToken, auth.isAdmin, controlador_puntoventa.Buscarpuntv);
ruta_puntoventa.post("/Actualizar_punvnt", auth.authToken, auth.isAdmin, controlador_puntoventa.Actualformpuntv);

module.exports = ruta_puntoventa;