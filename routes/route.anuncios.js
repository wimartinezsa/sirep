const express = require('express');
const route = express.Router();
const auth = require('../middlewares/middleware.auth');
const controller = require('../controllers/controller.anuncios.js');

route.get('/anuncios', auth.authRoute, controller.renderAnuncios);
route.get('/listarAnuncio/:id', auth.authToken, controller.listarAnuncio)
route.post('/listarAnuncios', auth.authToken, controller.listarAnuncios);
route.post('/crearAnuncio', auth.authToken, controller.crearAnuncio);
route.post('/actualizarAnuncio/:id', auth.authToken, controller.actualizarAnuncio)


module.exports = route;