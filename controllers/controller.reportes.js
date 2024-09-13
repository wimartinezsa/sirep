const query = require("../database/pool-conexion");
let controllerReportes = {};

/* ================= ROL ADMINISTRADOR================= */
controllerReportes.Vista_Reporte_Historial_Reservas = async (req, res) => {res.render('reportes/reporte-historial-reserva', {profile: req.session.user});}
controllerReportes.Vista_Reporte_Productos_Reservados = async (req, res) => {res.render('reportes/productos-reservadosPV', {profile: req.session.user});}
controllerReportes.Vista_Reporte_Productos_De_Baja = async (req, res) => {res.render('reportes/productos-de-baja', {profile: req.session.user});}
controllerReportes.Vista_Reporte_Productos_Autoconsumo = async (req, res) => {res.render('reportes/productos-de-autoconsumo', {profile: req.session.user});}
controllerReportes.vista_rep_val_admi = (req, res) =>{res.render('reportes/rep_val_admi', {profile: req.session.user});}
controllerReportes.vista_rep_produccion_admi = (req, res) =>{res.render('reportes/rep_produccion_admi', {profile: req.session.user});}
controllerReportes.vista_reporVent = (req, res) =>{res.render('reportes/reporVent', {profile: req.session.user});}
controllerReportes.vista_reporteAdmin = (req, res) =>{res.render('reportes/rep_admin', {profile: req.session.user});}
controllerReportes.vista_reporDPV = (req, res) =>{res.render('reportes/reporDPV_admi', {profile: req.session.user});}
controllerReportes.vista_Reporcanti= (req, res) =>{res.render('reportes/Reporcanti', {profile: req.session.user});}
controllerReportes.vista_reportHistorialProduccionUp  = (req, res) =>{res.render('reportes/reporteHistorialProduccionUp', {profile: req.session.user});}
controllerReportes.vista_Reporte_Pvent = (req, res) =>{res.render('reportes/reporte_Pvent', {profile: req.session.user}); }
controllerReportes.vista_Reporte_Productos_Facturados = (req, res) =>{
    res.render('reportes/productos-facturadosPV', {profile: req.session.user});
}

controllerReportes.vistaReporteProduccionProductosUp = async (req, res)=>{
    res.render('reportes/productos-produccionUp',{profile: req.session.user});
}


controllerReportes.vista_Reporte_Producto_Cargo = async (req, res)=>{
    try{
        let sql = `select distinct Codigo_pdto, producto from listamovimientos`;
        let pdtos = await query(sql);
        res.render('reportes/producto-cargo', {profile: req.session.user, pdtos});
    }
    catch(e){
        console.log("controller.reportes/vista_Reporte_Producto_Cargo Error: " + e);
    } 
}

/* ======================Consultar en la base de datos para generar el reporte============== */

controllerReportes.reporteProduccionProductosUp = async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let sesion_up = req.session.up;
        let session_rol=req.session.user.Rol;
        var sql_reporte_venta_punto ='';
       if(session_rol=='Admin' || session_rol=='Produccion'){
        sql_reporte_produccionUp =  `SELECT nomb_up, pup.producto,medidas, SUM(pup.Producido) AS cantidad, DATE_FORMAT(MIN(pup.fecha), "%Y-%m-%d") AS fecha_min, DATE_FORMAT(MAX(pup.fecha), "%Y-%m-%d") AS fecha_max
                                    FROM lista_produccion_up pup WHERE  pup.Estado='Confirmado' and  pup.fecha BETWEEN '${fechainicio}' AND '${fechafin}'  GROUP BY Codigo_pdto`;
       }
        else{
            sql_reporte_produccionUp =  `SELECT nomb_up, pup.producto,medidas, SUM(pup.Producido) AS cantidad, DATE_FORMAT(MIN(pup.fecha), "%Y-%m-%d") AS fecha_min, DATE_FORMAT(MAX(pup.fecha), "%Y-%m-%d") AS fecha_max
            FROM lista_produccion_up pup WHERE  pup.Estado='Confirmado' and  pup.codigo_up = '${sesion_up}' AND pup.fecha BETWEEN '${fechainicio}' AND '${fechafin}'  GROUP BY Codigo_pdto`;

        }
        
 

        let rows = await query(sql_reporte_produccionUp);
        res.json(rows)          
    }
    catch(e){
        console.log("controller.reportes/reporteProduccionProductosUp Error: " + e);
    } 
}

controllerReportes.Reporte_Historial_Reservas = async (req, res) => {
    try {
        let limite = req.body.limite;
        let punto_venta = req.session.pv;
        if(!limite) limite = 1000;
        let sql = `SELECT * FROM listamovimientos 
        WHERE id_punto_vent = '${punto_venta}'
        ORDER BY Fecha DESC LIMIT ${limite}`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log("controller.reportes/Reporte_Historial_Reservas Error: " + e);
    }
}

controllerReportes.reporte_reporteAdmin = async (req, res) =>{
    try{
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        var sql_reporte_venta_punto =  `SELECT m.up, SUM(m.cantidad) as cantidad, SUM(m.subtotal) as subtotal,  date_format(MIN(m.fecha), "%Y-%m-%d") as fecha_min, date_format(MAX(m.fecha), "%Y-%m-%d") as fecha_max FROM listamovimientos m where m.fecha between '${fechainicio}' and '${fechafin}' and m.Estado = 'Facturado' GROUP BY m.codigo_up`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows);
    }
    catch(e){
        console.log("controller.reportes/reporte_reporteAdmin Error: " + e);
    } 
}
/* ===================================================== */
controllerReportes.reporte_rep_val_admi = async (req, res) =>{
    try{
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        var sql_reporte_venta_punto =  `SELECT m.producto, SUM(m.cantidad) as cantidad, SUM(m.subtotal) as valor, date_format(MIN(m.fecha), "%Y-%m-%d") as fecha_min, date_format(MAX(m.fecha), "%Y-%m-%d") as fecha_max FROM listamovimientos m where m.fecha between '${fechainicio}' and '${fechafin}' and m.Estado = 'Facturado' GROUP BY Codigo_pdto`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows);
    }
    catch(e){
        console.log("controller.reportes/reporte_rep_val_admi Error: " + e);
    } 
}
/* ===================================================== */
controllerReportes.reporte_reporDPV = async (req, res) =>{
    try{
        var sql_reporte_venta_punto =  `SELECT m.punto, m.producto, m.stock FROM listamovimientos m GROUP BY m.Codigo_pdto, m.id_punto_vent;`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows);
    }
    catch(e){
        console.log("controller.reportes/reporte_reporDPV Error: " + e);
    } 
}
/* ===================================================== */
controllerReportes.reporte_rep_produccion_admi  = async (req, res) =>{
     try{   
        var sql_reporte_venta_punto =  `SELECT if(sum(up.Disponible) is null,0,sum(up.Disponible)) as stockcant, up.producto as 
        pdto_nombre, up.nomb_up as Nombre FROM lista_produccion_up up group by up.codigo_up, up.Codigo_pdto;`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows);
    }
    catch(e){
        console.log("controller.reportes/reporte_rep_produccion_admi Error: " + e);
    } 
}
/* ===================================================== */
controllerReportes.reporte_reporVent = async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        var sql_reporte_venta_punto =  `SELECT m.punto, SUM(m.subtotal) as subtotal FROM listamovimientos m where m.fecha between '${fechainicio}' and '${fechafin}' and m.Estado = 'Facturado' GROUP  BY id_punto_vent`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows);    
    }
    catch(e){
        console.log("controller.reportes/reporte_reporVent Error: " + e);
    } 
}
/* ===================================================== */
controllerReportes.Reporte_Reporcanti = async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        var sql_reporte_venta_punto =  `SELECT m.punto, m.producto, SUM(m.cantidad) as cantidad, SUM(m.subtotal) as subtotal, date_format(MIN(m.fecha), "%Y-%m-%d") as fecha_min, date_format(MAX(m.fecha), "%Y-%m-%d") as fecha_max FROM listamovimientos m where m.fecha between '${fechainicio}' and '${fechafin}' and m.Estado = 'Facturado' GROUP BY m.punto, Codigo_pdto, m.producto;` ;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows);
    }
    catch(e){
        console.log("controller.reportes/Reporte_Reporcanti Error: " + e);
    } 
}
/*======================= ROL UNIDADES PRODUCTIVAS=======================*/
controllerReportes.reporte_reportUp =  async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let unidadproductiva = req.session.up;
        let session_rol=req.session.user.Rol;
        var sql_reporte_venta_punto ='';
       if(session_rol=='Admin' || session_rol=='Produccion'){
        sql_reporte_venta_punto =  `SELECT nomb_up,DATE_FORMAT(fecha,"%d-%m-%Y") as fecha,Codigo_pdto, producto as pdto_nombre,medidas, Producido as cantidpdto,observacion FROM lista_produccion_up WHERE 
                                    Estado='Confirmado' and fecha between '${fechainicio}' and '${fechafin}'`; 
       }else{
        sql_reporte_venta_punto =  `SELECT nomb_up,DATE_FORMAT(fecha,"%d-%m-%Y") as fecha,Codigo_pdto, producto as pdto_nombre,medidas, Producido as cantidpdto,observacion FROM lista_produccion_up WHERE 
                                    codigo_up = '${unidadproductiva}' and Estado='Confirmado' and fecha between '${fechainicio}' and '${fechafin}'`;
       }
       let rows = await query(sql_reporte_venta_punto);
        res.json(rows);
    }
    catch(e){
        console.log("controller.reportes/reporte_reportUp Error: " + e);
    } 
}
/*======================= ROL PUNTO VENTA=======================*/
controllerReportes.reporte_Reporte_Pvent = async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        var sesion = req.session.pv;
        var sql_reporte_venta_punto =  `SELECT m.producto, sum(m.cantidad) as cantidad, 
            SUM(m.subtotal) as subtotal, date_format(MIN(m.fecha), "%Y-%m-%d") as fecha_min, 
            date_format(MAX(m.fecha), "%Y-%m-%d") as fecha_max 
            FROM listamovimientos m where id_punto_vent = '${sesion}' and m.fecha 
            between '${fechainicio}' and '${fechafin}' and 
            m.Estado = 'Facturado' GROUP BY Codigo_pdto`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows)          
    }
    catch(e){
        console.log("controller.reportes/reporte_Reporte_Pvent Error: " + e);
    } 
}

/*======================= ROL PUNTO VENTA=======================*/
controllerReportes.reporte_Productos_Facturados = async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let sesion = req.session.user.pv;
        
        var sql_reporte_venta_punto =  `SELECT m.producto, sum(m.cantidad) as cantidad, SUM(m.subtotal) as subtotal, date_format(MIN(m.fecha), "%Y-%m-%d") as fecha_min, date_format(MAX(m.fecha), "%Y-%m-%d") as fecha_max FROM listamovimientos m where id_punto_vent = '${sesion}' and m.fecha between '${fechainicio}' and '${fechafin}' and m.Estado = 'Facturado' GROUP BY Codigo_pdto`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows)          
    }
    catch(e){
        console.log("controller.reportes/reporte_Productos_Facturados Error: " + e);
    } 
}





controllerReportes.reporte_Productos_Facturados_UP = async (req, res) =>{
    try{   
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let sesion = req.session.up;
        
        var sql_reporte_venta_punto =  `SELECT m.producto, sum(m.cantidad) as cantidad, SUM(m.subtotal) as subtotal, date_format(MIN(m.fecha), "%Y-%m-%d") as fecha_min, date_format(MAX(m.fecha), "%Y-%m-%d") as fecha_max FROM listamovimientos m where codigo_up = '${sesion}' and m.fecha between '${fechainicio}' and '${fechafin}' and m.Estado = 'Facturado' GROUP BY Codigo_pdto`;
        let rows = await query(sql_reporte_venta_punto);
        res.json(rows)          
    }
    catch(e){
        console.log("controller.reportes/reporte_Productos_Facturados_UP Error: " + e);
    } 
}

controllerReportes.Reporte_Producto_Cargo = async (req, res)=>{
    try{
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let producto = req.body.producto;
            
        var sql_reporte_venta_punto =  `SELECT 
            cargo, 
            count(*) as count ,
            sum(subtotal) as total
        FROM listamovimientos
        WHERE fecha between '${fechainicio}' and '${fechafin}' 
        and Codigo_pdto = ${producto} and Estado = 'Facturado'
        group by cargo`;
        let rows = await query(sql_reporte_venta_punto);
        return res.json(rows);
    } catch(e){
        console.log("controller.reportes/Reporte_Producto_Cargo Error: " + e);
    }
}

controllerReportes.Reporte_Productos_Reservados = async (req, res)=>{
    try{
        let sql = `SELECT up, producto, 
        SUM(cantidad) as cantidad FROM listamovimientos WHERE Estado = 'Reservado' 
        GROUP BY codigo_up, Codigo_pdto`;
        let rows = await query(sql);
        return res.json(rows);
    } catch(e) {
        console.log("controller.reportes/Reporte_Productos_Reservados Error: " + e);
    }
}

controllerReportes.Reporte_Productos_De_Baja = async (req, res)=>{
    try{
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let sql = `SELECT * FROM produccion2.listamovimientos where Estado = 'Baja'
        and Fecha_detalle between '${fechainicio}' and '${fechafin}'`;
        let rows = await query(sql);
        return res.json(rows);
    } catch(e) {
        console.log("controller.reportes/Reporte_Productos_De_Baja Error: " + e);
    }
}

controllerReportes.Reporte_Productos_Autoconsumo = async (req, res)=>{
    try{
        let fechainicio = req.body.fechastart;
        let fechafin = req.body.fechaend;
        let sql = `SELECT * FROM produccion2.listamovimientos where Estado = 'Autoconsumo'
        and Fecha_detalle between '${fechainicio}' and '${fechafin}'`;
        let rows = await query(sql);
        return res.json(rows);
    } catch(e) {
        console.log("controller.reportes/Reporte_Productos_Autoconsumo Error: " + e);
    }
}

/* ===================================================== */
module.exports = controllerReportes;