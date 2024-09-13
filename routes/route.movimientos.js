let express = require('express');
const controladorMovimiento = require('../controllers/controller.movimientos');
let routeMovimientos = express.Router();
let contMovimientos = require('../controllers/controller.movimientos');
const auth = require('../middlewares/middleware.auth');

routeMovimientos.get('/calendario-facturas', auth.authRoute, controladorMovimiento.renderCalendario);
routeMovimientos.post('/listar-fechas-facturas', auth.authToken, controller.listarFechas);
routeMovimientos.post('/listar-facturas', auth.authToken, controller.listarFacturas)

routeMovimientos.get('/venta', auth.authRoute, contMovimientos.renderMovimientos);
routeMovimientos.get('/listarMovimientos/:estado', auth.authToken,  contMovimientos.listarMovimientos);
routeMovimientos.post('/listarProductosPv', auth.authToken,  contMovimientos.listarProductos);
routeMovimientos.post('/obtenerProductoPrecio', auth.authToken,  contMovimientos.obtenerProductoPrecio);
routeMovimientos.post('/filtro', auth.authToken,  contMovimientos.filtro);
routeMovimientos.post('/genventa', auth.authToken,  contMovimientos.genVenta);
routeMovimientos.post('/agregarDetalle', auth.authToken,  contMovimientos.agregarDetalle);
routeMovimientos.post('/eliminarDetalle', auth.authToken,  contMovimientos.eliminarDetalle);
routeMovimientos.get('/listarProductosVenta', auth.authToken,  contMovimientos.listarProductosVenta);
routeMovimientos.post('/RechazarMovimiento', auth.authToken,  contMovimientos.RechazarMovimiento);

/* ==============segunda parte ===== */
routeMovimientos.get('/listarDetalle/:idmovimiento', auth.authToken,  contMovimientos.mostrarDetalle);
routeMovimientos.get('/factura/:idmovimiento', auth.authToken, contMovimientos.mostrarDetalle);
routeMovimientos.post('/obtenerDetalle', auth.authToken, contMovimientos.obtenerDetalle);
routeMovimientos.post('/editarDetalle', auth.authToken, contMovimientos.editarDetalle);
routeMovimientos.post('/FacturarMovimiento', auth.authToken,  contMovimientos.FacturarMovimiento);
routeMovimientos.post('/AnularMovimiento', auth.authToken,  contMovimientos.AnularMovimiento);
routeMovimientos.post('/FacturarDetalle', auth.authToken, contMovimientos.FacturarDetalle);
routeMovimientos.post('/EstadoAnulado', auth.authToken, contMovimientos.EstadoAnulado);
/* ======== */
routeMovimientos.post('/validarAdmin', auth.authToken,  contMovimientos.validarAdmin);

module.exports = routeMovimientos;