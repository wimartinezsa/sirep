let express = require('express');
let route = express.Router();
let controller = require('../controllers/controller.gastronomia');
let authMiddleware = require('../middlewares/middleware.auth');

route.get('/gastronomia', controller.renderLogin);
route.get('/gastronomia-admin', controller.renderAdmin);
route.get('/gastronomia/listar',  authMiddleware.authToken, controller.ListarGastronomia)
route.post('/gastronomia/login', controller.Login);

module.exports = route;