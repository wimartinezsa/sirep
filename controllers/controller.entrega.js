const query = require('../database/pool-conexion') 
controller = {}

/**
 * @returns {render} Renderiza la vista de entrega del producto
 */
controller.viewEntrega = (req, res)=> {res.render('venta/entrega-producto', {profile: req.session.user})}
/**
 * @returns {render} Renderiza la vista de entrega del producto
 */
controller.viewCalendario = (req, res)=> {res.render('venta/calendario-entrega', {profile: req.session.user})}

/**
 * 
 * @returns {JSON} Retorna JSON con las fechas de las entregas
 */
controller.listarFechas = async (req, res)=> {
    try {
        var IdUP = req.session.user.up_id; 
        let estadoEntregado = req.body.entregado;
        let sql = `SELECT 
            (Fecha_entrega_detalle) AS fecha_entrega,
            count(*) as Entregas 
        FROM listamovimientos 
        where codigo_up = ${IdUP}
        and Estado = 'Facturado'
        and Estado_mov = 'Facturado'
        and	Entregado = '${estadoEntregado}' 
        group by Fecha_entrega_detalle`;
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log('controller.entrega/listarFechasEntrega Error: '+e);
    }
}



/**
 * Cambia el estado del detalle a entregado / entrega-producto.ejs
 * @param {Number|String} id_detalle ID del detalle
 * @returns {JSON} Retorna JSON con estado del detalle
 */
controller.entregar = async(req, res) => {
    try{
        let id_detalle = req.body.id_detalle;
        let sql = `UPDATE detalle SET Entregado = 'Entregado' WHERE id_detalle = ${id_detalle} and Estado = 'Facturado'`;
        await query(sql);
        return res.json({  
            titulo : "Entrega exitosa",
            icono: "success",
            mensaje : "El producto fue entregado de forma exitosa",
            timer : 1000
        });
    } catch(e) {
        console.log('controller.entrega/entregar Error: '+e);
    }
}

/**
 * Función que cambia el estado de detalle a no entregado / entrega-producto.ejs
 * @param {Number|Stirng} id_detalle Id del detalle 
 * @returns {JSON} Retorna JSON con estado del detalle
 */
controller.productoNoEntregado = async (req, res) => {
    let id_detalle = req.params.id_detalle;
    if(!id_detalle) return res.json({status: 'error', message: 'El id del detalle es requerido'})
    try{
        let sql = `UPDATE detalle SET Entregado = 'No Reclamado' WHERE id_detalle = '${id_detalle}' and Estado = 'Facturado'`;
        await query(sql);
        return res.json({  
            titulo : "No Reclamado",
            icono: "success",
            mensaje : "El producto fue declarado como no reclamado",
            timer : 1500
        });
    } catch(e) {
        console.log('controller.entrega/productoNoEntregado Error: '+e);
    }
}

/**
 * Lista las entregas de la identificación enviada / entrega-producto.ejs
 * @param {Number|String} identificacion
 * @returns {JSON} Retorna JSON con los detalles
 */
controller.listarEntregas = async (req, res) => {
    try{     
        var identificacion = req.body.identificacion;
        var IdUP = req.session.user.up_id; //SESION DE USUARIO
        var sql =  `SELECT d.id_detalle, per.identificacion, per.Nombres, per.Ficha, per.Foto,
        p.Nombre as producto, d.cantidad, (d.cantidad * d.valor) as valor, d.Entregado as Estado, 
        d.fecha, ca.nombre_cargo
        FROM movimientos m 
        JOIN detalle d on d.fk_Id_movimiento = m.Id_movimiento 
        JOIN personas per on per.identificacion = d.Persona 
        JOIN cargo ca on ca.idcargo = per.Cargo 
        JOIN inventario i on i.id_inventario = d.fk_id_inventario JOIN productos p on 
        p.Codigo_pdto = i.fk_codigo_pdto 
        where p.fk_codigo_up = ${IdUP}
        and m.Estado = 'Facturado' and d.Estado = 'Facturado' and d.Entregado = 'No entregado'
        and per.identificacion = '${identificacion}'
        and DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = CURDATE()`;  
        let rows = await query(sql);
        return res.json(rows);
    }
    catch(e){
        console.log('controller.entrega/listarEntregas Error: '+e);
    }
}

/**
 * Lista los productos pendientes por entregar de la up de la sesión / entrega-producto.ejs
 * @returns {JSON} Retorna JSON con los detalles
 */
controller.listarPorEntregar = async (req, res) => {
    var IdUP = req.session.user.up_id; //SESION DE USUARIO
    var { fecha, entregado } = req.body; 
    var fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = CURDATE()`;
    if(fecha) fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = '${fecha}'`;
    if(!entregado) entregado = 'No entregado';
    let sql = `SELECT d.id_detalle, per.identificacion, per.Nombres, per.Ficha, per.Foto,
        p.Nombre as producto, d.cantidad, (d.cantidad * d.valor) as valor, d.Entregado as Estado, 
        d.fecha_entrega as fecha, ca.nombre_cargo
        FROM movimientos m 
            JOIN detalle d on d.fk_Id_movimiento = m.Id_movimiento 
            JOIN personas per on per.identificacion = d.Persona 
            JOIN cargo ca on ca.idcargo = per.Cargo 
            JOIN inventario i on i.id_inventario = d.fk_id_inventario JOIN productos p on 
        p.Codigo_pdto = i.fk_codigo_pdto where p.fk_codigo_up = ${IdUP}
        and m.Estado = 'Facturado' and d.Estado = 'Facturado' and d.Entregado = '${entregado}'
        and ${fecha_condicion}`;
    try {
        let rows = await query(sql);
        return res.json(rows);
    } catch(e){
        console.log('controller.entrega/listarPorEntregar Error: '+e);
    }
}

/**
 * Retorna la cantidad pendiente por entregar en el punto de venta / entrega-producto.ejs
 * @returns {JSON} Retorna JSON con la cantidad
 */
controller.cantidadPendiente = async (req, res) => {
    var IdUP = req.session.user.up_id; //SESION DE USUARIO
    let sql = `SELECT SUM(cantidad) as cantidad FROM listamovimientos lm
    JOIN movimientos m on lm.Id_movimiento = m.Id_movimiento 
    WHERE codigo_up = '${IdUP}' and 
    m.Estado = 'Facturado' and lm.Estado = 'Facturado' 
    and lm.Entregado = 'No Entregado'
    and lm.Fecha_entrega_detalle = CURDATE()`;
    try {
        let rows = await query(sql);
        return res.json(rows);
    } catch (e) {
        console.log('controller.entrega/cantidadPendiente Error: '+e);
    }
}

/**
 * Lista los detalles no reclamados de la unidad productiva de la sesión / entrega-producto.ejs
 * @returns {JSON} Retorna JSON con los detalles
 */
controller.listarNoReclamado = async (req, res) => {
    var IdUP = req.session.user.up_id; //SESION DE USUARIO
    var fecha = req.body.fecha; 
    var fecha_condicion = 'DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = CURDATE()';
    if(fecha) fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = '${fecha}'`;
    let sql = `SELECT d.id_detalle, per.identificacion, per.Nombres, per.Ficha, 
    p.Nombre as producto, d.cantidad, (d.cantidad * d.valor) as valor, 
    d.Entregado as Estado, d.fecha, DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d")
        FROM movimientos m 
        JOIN detalle d on d.fk_Id_movimiento = m.Id_movimiento 
        JOIN personas per on per.identificacion = d.Persona 
        JOIN inventario i on i.id_inventario = d.fk_id_inventario JOIN productos p on 
    p.Codigo_pdto = i.fk_codigo_pdto where p.fk_codigo_up = ${IdUP}
    and m.Estado = 'Facturado' and d.Estado = 'Facturado' and d.Entregado = 'No reclamado'
    and ${fecha_condicion}`;
    try {
        let rows = await query(sql);
        return res.json(rows);
    } catch(e){
        console.log('controller.entrega/listarNoReclamado Error: '+e);
    }
}

/**
 * Lista los productos reclamados de la unidad productiva / entrega-producto.ejs
 * @returns {JSON} Retorna JSON con los detalles reclamados
 */
controller.listarReclamados = async (req, res) => {
    var IdUP = req.session.user.up_id; //SESION DE USUARIO
    var fecha = req.body.fecha;
    var fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = CURDATE()`;
    if(fecha) fecha_condicion = `DATE_FORMAT(d.fecha_entrega, "%Y-%m-%d") = '${fecha}'`;
    let sql = `SELECT d.id_detalle, per.identificacion, per.Nombres, per.Ficha, 
    p.Nombre as producto, d.cantidad, (d.cantidad * d.valor) as valor, d.Entregado as Estado,  d.fecha FROM movimientos m 
        JOIN detalle d on d.fk_Id_movimiento = m.Id_movimiento 
        JOIN personas per on per.identificacion = d.Persona 
        JOIN inventario i on i.id_inventario = d.fk_id_inventario JOIN productos p on 
    p.Codigo_pdto = i.fk_codigo_pdto where p.fk_codigo_up = ${IdUP}
    and m.Estado = 'Facturado' and d.Estado = 'Facturado' and d.Entregado = 'Entregado'
    and ${fecha_condicion}`;
    try {
        let rows = await query(sql);
        return res.json(rows);
    } catch(e){
        console.log('controller.entrega/listarReclamados Error: '+e);
    }
}

module.exports = controller;