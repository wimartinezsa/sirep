const express = require('express');
const routeReportes = express.Router();
const controlador_reportes = require("../controllers/controller.reportes");
let auth = require('../middlewares/middleware.auth');
/* =========================== ROL ADMINISTRADOR=========================== */
routeReportes.get('/rep_admin', auth.authRoute, controlador_reportes.vista_reporteAdmin); /* Vista principal */
routeReportes.post('/Reporte_rep_admin',controlador_reportes.reporte_reporteAdmin);
/*  */
routeReportes.get('/rep_val_admi', auth.authRoute, controlador_reportes.vista_rep_val_admi); /* Vista principal */
routeReportes.post('/Reporte_rep_val_admi',controlador_reportes.reporte_rep_val_admi);
/*  */
routeReportes.get('/reporDPV', auth.authRoute, controlador_reportes.vista_reporDPV); /* Vista principal */
routeReportes.post('/Reporte_reporDPV',controlador_reportes.reporte_reporDPV)
/*  */
routeReportes.get('/rep_produccion_admi', auth.authRoute, controlador_reportes.vista_rep_produccion_admi);/* Vista principal */
routeReportes.post('/Reporte_rep_produccion_admi',controlador_reportes.reporte_rep_produccion_admi);
/*  */
routeReportes.get('/reporVent', auth.authRoute, controlador_reportes.vista_reporVent);/* Vista principal */
routeReportes.post('/Reporte_reporVent',controlador_reportes.reporte_reporVent);
/*  */
routeReportes.get('/Reporcanti', auth.authRoute, controlador_reportes.vista_Reporcanti);/* Vista principal */
routeReportes.post('/Reporte_Reporcanti',controlador_reportes.Reporte_Reporcanti);

/* ===========================REPORTES DEL ROL UNIDADES PRODUCTIVAS=========================== */
routeReportes.get('/reporteHistorialProduccionUP', auth.authRoute, controlador_reportes.vista_reportHistorialProduccionUp);/* Vista principal */
routeReportes.post('/Reporte_reportUp',controlador_reportes.reporte_reportUp);
routeReportes.get('/ProduccionProductos',auth.authRoute,controlador_reportes.vistaReporteProduccionProductosUp);
routeReportes.post('/ProduccionProductosUp',auth.authRoute,controlador_reportes.reporteProduccionProductosUp);


/* =========================== ROL PUNTO VENTA=========================== */
routeReportes.get('/Reporte_Pvent', auth.authRoute, controlador_reportes.vista_Reporte_Pvent);/* Vista principal */
routeReportes.post('/Reporte_Reporte_Pvent',controlador_reportes.reporte_Reporte_Pvent);
/* =========================== PRODUCTOS FACTURADOS =========================== */
routeReportes.get('/productos-facturados', auth.authRoute, controlador_reportes.vista_Reporte_Productos_Facturados);/* Vista principal */
routeReportes.post('/productos-facturados-up', auth.authRoute, controlador_reportes.reporte_Productos_Facturados_UP);/* Vista principal */
/*  */
routeReportes.get('/producto-cargo', auth.authRoute, controlador_reportes.vista_Reporte_Producto_Cargo);/* Vista principal */
routeReportes.post('/producto-cargo', auth.authRoute, controlador_reportes.Reporte_Producto_Cargo);/* Vista principal */
/*  */
routeReportes.get('/reporte-historial-reservas', auth.authRoute, controlador_reportes.Vista_Reporte_Historial_Reservas);
routeReportes.post('/Reporte-historial-reservas', controlador_reportes.Reporte_Historial_Reservas);

routeReportes.get('/productos-reservados', auth.authRoute, controlador_reportes.Vista_Reporte_Productos_Reservados);
routeReportes.get('/reporte-productos-reservados', controlador_reportes.Reporte_Productos_Reservados);

routeReportes.get('/productos-de-baja', auth.authRoute, controlador_reportes.Vista_Reporte_Productos_De_Baja);
routeReportes.post('/reporte-productos-de-baja', controlador_reportes.Reporte_Productos_De_Baja);

routeReportes.get('/productos-autoconsumo', auth.authRoute, controlador_reportes.Vista_Reporte_Productos_Autoconsumo);
routeReportes.post('/reporte-productos-autoconsumo', controlador_reportes.Reporte_Productos_Autoconsumo);

module.exports = routeReportes;