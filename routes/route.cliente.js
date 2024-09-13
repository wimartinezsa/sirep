let express = require('express');
let route = express.Router();

let controller = require('../controllers/controller.clientes');
/* ===MIDDLEWARE */
let auth = require('../middlewares/middleware.auth');

route.get('/registro-clientes', auth.authRoute, controller.renderRegistroCliente);
route.get('/Listar_Usuarios', auth.authToken, auth.isPv, controller.Listar_Usuarios);
route.post('/registro', auth.authToken, auth.isPv, controller.RegistroCliente);
route.post('/buscar', auth.authToken, auth.isPv, controller.buscar );
route.post('/actualizar/:id', auth.authToken, auth.isPv, controller.actualizar);
module.exports = route;