const express = require('express');
const ruta_reserva = express.Router();
const cont_reserva = require("../controllers/controller.reservas");
const auth = require('../middlewares/middleware.auth');

ruta_reserva.get('/historial-reservas', auth.authRoute, cont_reserva.Historial);
ruta_reserva.get('/Lista_Unidades_Reserva', auth.authToken, cont_reserva.Lista_Unidades_Reserva);
ruta_reserva.post("/Listar_Reservas_Pendientes", auth.authToken, cont_reserva.Listar_Reservas_Pendientes);
ruta_reserva.post("/Crear_Movimiento", auth.authToken, cont_reserva.Crear_Movimiento);
ruta_reserva.post("/Listar_Usuaios_Ficha", auth.authToken, cont_reserva.Listar_Usuaios_Ficha);
ruta_reserva.post("/Registrar_Detalle", auth.authToken, cont_reserva.Registrar_Detalle);
ruta_reserva.post("/Eliminar_Detalle", auth.authToken, cont_reserva.Eliminar_Detalle);

module.exports = ruta_reserva;