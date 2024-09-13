const express = require('express');
const route = express.Router();
const auth = require('../middlewares/middleware.auth');
const contViews = require('../controllers/controller.views');
const cont_reserva = require("../controllers/controller.reservas");


route.get('/', contViews.renderIndex);
route.get('/forgot-password', contViews.renderForgotPassword);
route.get('/admin', auth.authRoute, cont_reserva.Abrir_Frm_Reserva);
route.get('/perfil', auth.authRoute, contViews.perfil);
route.get('/manuales', auth.authRoute, contViews.ayuda);
route.post("/ListarTodosProductos", auth.authRoute, cont_reserva.Listar_Todos_Productos);


module.exports = route;