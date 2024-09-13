const express = require('express');
const ruta_up = express.Router();
const controlador_unidadesprodcutivas = require("../controllers/controller.unidadesproductivas");
const auth = require('../middlewares/middleware.auth');

ruta_up.get("/unidades-productivas", auth.authRoute, controlador_unidadesprodcutivas.Vista);
ruta_up.post("/RegistrarUnidadProductiva", auth.authToken, auth.isAdmin, controlador_unidadesprodcutivas.RegistrarUnidadProductiva);
ruta_up.get("/Lista_unidadesproductivas",  auth.authToken, auth.isAdmin, controlador_unidadesprodcutivas.ListaUnidadesProductivas);
ruta_up.post("/Buscar_UP",  auth.authToken, auth.isAdmin, controlador_unidadesprodcutivas.Buscarunidadproductiva);
ruta_up.post("/Actualizar_up",  auth.authToken, auth.isAdmin, controlador_unidadesprodcutivas.ActualizarUnidadProductiva)

module.exports = ruta_up;