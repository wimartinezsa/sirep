const express = require('express');
const ruta_productos = express.Router();
const controlador_productos = require("../controllers/controller.productos");
let auth = require('../middlewares/middleware.auth');

ruta_productos.get("/productos",  auth.authRoute, controlador_productos.Vista);
ruta_productos.get("/Listar_Productos", auth.authToken, auth.isAdmin, controlador_productos.ListaProductos);
ruta_productos.post("/Registrar_pdto",  auth.authToken, auth.isAdmin, controlador_productos.CargarImagen,controlador_productos.RegistrarProductos);
ruta_productos.post("/Buscar_pdto",  auth.authToken, auth.isAdmin, controlador_productos.buscarpdto);
ruta_productos.post("/Actual_pdto",  auth.authToken, auth.isAdmin, controlador_productos.CargarImagen,controlador_productos.Actualizarproductos);
ruta_productos.post("/Listar_precios",  auth.authToken, auth.isAdmin, controlador_productos.ListarPrecios);
ruta_productos.post("/Registrar_precio",  auth.authToken, auth.isAdmin, controlador_productos.RegistrarPrecios);
ruta_productos.post("/buscar_sale",  auth.authToken, auth.isAdmin, controlador_productos.BuscarPrecio);

module.exports = ruta_productos;