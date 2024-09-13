const express = require('express');
const ruta_inventario = express.Router();
const controlador_inventario = require("../controllers/controller.inventario");
const auth = require('../middlewares/middleware.auth');

/* ============== */
ruta_inventario.get("/dar-baja", auth.authRoute, auth.isAdmin, controlador_inventario.render_dar_baja);
ruta_inventario.post('/movimiento-especial', auth.authRoute, auth.isAdmin, controlador_inventario.movimientoEspecial);
ruta_inventario.post('/detalle-especial', auth.authRoute, auth.isAdmin, controlador_inventario.detalleEspecial);
ruta_inventario.get("/Listar_Productos_Stock", auth.authToken, auth.isAdmin, controlador_inventario.Listar_Productos_Stock);
ruta_inventario.post("/Registrar_inventario", auth.authToken, auth.isAdmin, controlador_inventario.registrarInventario);
ruta_inventario.post("/Listar_Distribucion", auth.authToken , controlador_inventario.Listar_Distribucion);

module.exports = ruta_inventario;