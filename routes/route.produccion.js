const express = require('express');
const ruta = express.Router();
const cont_produccion = require("../controllers/controller.produccion");
const auth = require('../middlewares/middleware.auth');

// RUTA DEL ROL UNIDAD PRODUCTIVA
ruta.get('/produccionUp', auth.authRoute, cont_produccion.produccionUp);
ruta.post('/RegistrarProduccion',  auth.authToken,cont_produccion.RegistrarProduccion);
ruta.post('/editarProduccion', auth.authToken, cont_produccion.editarProduccion);
ruta.get('/consultarProductosUp', auth.authToken, cont_produccion.consultarProductosUp);
ruta.get("/buscarProduccion/:idProduccion", auth.authToken, cont_produccion.buscarProduccion);
ruta.get("/Listar_Produccion_UP", auth.authToken, cont_produccion.Listar_Produccion_UP);


// RUTAS DE ROL ENCANGADO DE PRODUCCIÓN
ruta.get('/produccionConfirmar', auth.authRoute, auth.isProduccion,cont_produccion.produccionConfirmar);
ruta.get("/Listar_Produccion_Por_Confirmar", auth.authToken, auth.isProduccion, cont_produccion.Listar_Produccion_Por_Confirmar);
ruta.get("/Listar_Produccion_Por_Distribuir", auth.authToken, auth.isProduccion, cont_produccion.Listar_Produccion_Por_Distribuir);
ruta.get("/RechazarProduccion/:idProduccion", auth.authToken, auth.isProduccion, cont_produccion.RechazarProduccion);
ruta.post("/ConfirmarProduccion/:idProduccion", auth.authToken, auth.isProduccion, cont_produccion.ConfirmarProduccion);


ruta.post("/listarTodosPuntosVenta", auth.authToken, auth.isProduccion, cont_produccion.listarTodosPuntosVenta);




// RUTAS DEL ADMINISTRADOR
ruta.post("/Listar_Punto_Venta_Producto", auth.authToken, cont_produccion.Listar_Punto_Venta_Producto);
ruta.post("/Asignar_Inventario", auth.authToken, cont_produccion.Asignar_Inventario);

ruta.get('/produccionAdmin', auth.authRoute, cont_produccion.produccionAdmin);
ruta.get('/listarProduccionesConfirmadasAdmin', auth.authRoute, cont_produccion.listarProduccionesConfirmadasAdmin);

ruta.get('/consultarTodosProductos', auth.authRoute, cont_produccion.consultarTodosProductos);




module.exports = ruta;