let express = require('express');
let route = express.Router();

let controller = require('../controllers/controller.entrega');
/* ===MIDDLEWARE */
let auth = require('../middlewares/middleware.auth');

route.get('/entregar-producto', auth.authRoute, controller.viewEntrega);
route.get('/calendario-entrega', auth.authRoute, controller.viewCalendario);
route.post('/listar-fechas', auth.authToken, controller.listarFechas)
route.post('/listar-no-entregados', auth.authToken, auth.isLiderUP, controller.listarPorEntregar);
route.post('/listar-no-reclamados', auth.authToken, auth.isLiderUP, controller.listarNoReclamado);
route.post('/listar-reclamados', auth.authToken, auth.isLiderUP, controller.listarReclamados);
route.get('/cantidad-pendiente', auth.authToken, auth.isLiderUP, controller.cantidadPendiente);
route.post('/entrega', auth.authToken, auth.isLiderUP, controller.listarEntregas);
route.post('/entregar-producto', auth.authToken,  controller.entregar);
route.post('/producto-no-entregado/:id_detalle', auth.authToken, controller.productoNoEntregado)

module.exports = route;